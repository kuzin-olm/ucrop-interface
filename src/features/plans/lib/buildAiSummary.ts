import { formatArea, formatSignedPerHa } from '@/shared/lib/format';
import { cropMarginBase } from './cropPalette';
import type { AiSummary, AiSummaryCard, PlanResult } from '../model/resultTypes';

const MARGIN_BENCHMARK = 24_000;

function cropShares(result: PlanResult): Array<{ crop: string; area: number; share: number }> {
  const total = result.kpis.totalArea || 1;
  const byCrop = new Map<string, number>();
  result.fieldRecommendations.forEach((item) => {
    byCrop.set(item.recommendedCrop, (byCrop.get(item.recommendedCrop) ?? 0) + item.area);
  });
  return Array.from(byCrop.entries())
    .map(([crop, area]) => ({ crop, area, share: area / total }))
    .sort((left, right) => right.share - left.share);
}

function buildMarginCard(result: PlanResult): AiSummaryCard {
  const margin = result.kpis.predictedMarginPerHa;
  const delta = Math.round(((margin - MARGIN_BENCHMARK) / MARGIN_BENCHMARK) * 100);
  if (margin >= MARGIN_BENCHMARK) {
    return {
      id: 'margin',
      type: 'margin',
      severity: 'positive',
      title: 'Высокий потенциал доходности',
      description: `Прогнозная маржа ${formatSignedPerHa(margin)} — на ${delta}% выше ориентира ${formatSignedPerHa(MARGIN_BENCHMARK)}.`,
    };
  }
  return {
    id: 'margin',
    type: 'margin',
    severity: 'warning',
    title: 'Маржа ниже ориентира',
    description: `План даёт ${formatSignedPerHa(margin)} против ориентира ${formatSignedPerHa(MARGIN_BENCHMARK)}. Имеет смысл пересмотреть набор культур.`,
  };
}

function buildRotationCard(result: PlanResult): AiSummaryCard | null {
  const shares = cropShares(result);
  if (shares.length < 2) {
    return {
      id: 'rotation',
      type: 'rotation',
      severity: 'warning',
      title: 'Узкий набор культур',
      description: `В плане только ${shares[0]?.crop ?? 'одна культура'}. Севооборот почти не диверсифицирован.`,
    };
  }
  const names = shares.map((item) => item.crop).join(', ');
  return {
    id: 'rotation',
    type: 'rotation',
    severity: 'positive',
    title: 'Сбалансированный севооборот',
    description: `Рекомендовано ${shares.length} культур: ${names}. Это снижает зависимость от одной позиции.`,
  };
}

function buildDistributionCard(result: PlanResult): AiSummaryCard | null {
  const shares = cropShares(result);
  const top = shares[0];
  if (!top) return null;
  const percent = Math.round(top.share * 100);
  if (top.share >= 0.6) {
    return {
      id: 'distribution',
      type: 'distribution',
      severity: 'warning',
      title: 'Концентрация площади',
      description: `${top.crop} занимает ${percent}% площади (${formatArea(top.area)}). Сбой по этой культуре ударит по всему плану.`,
    };
  }
  return {
    id: 'distribution',
    type: 'distribution',
    severity: 'positive',
    title: 'Хорошее распределение',
    description: `Крупнейшая культура — ${top.crop} (${percent}% площади). Остальная площадь распределена между другими позициями.`,
  };
}

function buildRiskCard(result: PlanResult): AiSummaryCard | null {
  if (result.fieldRecommendations.length === 0) return null;
  const weakest = [...result.fieldRecommendations].sort(
    (left, right) => left.predictedMarginPerHa - right.predictedMarginPerHa,
  )[0];
  const average = result.kpis.predictedMarginPerHa;
  if (weakest.predictedMarginPerHa >= average * 0.85) return null;

  const baseline = cropMarginBase(weakest.recommendedCrop);
  return {
    id: 'risk',
    type: 'risk',
    severity: 'warning',
    title: 'Слабое поле в плане',
    description: `${weakest.fieldName} (${weakest.recommendedCrop}) даёт ${formatSignedPerHa(weakest.predictedMarginPerHa)} при средней ${formatSignedPerHa(average)} и ориентире культуры ${formatSignedPerHa(baseline)}.`,
  };
}

export function buildAiSummary(result: PlanResult): AiSummary {
  const cards = [
    buildMarginCard(result),
    buildRotationCard(result),
    buildDistributionCard(result),
    buildRiskCard(result),
  ].filter((card): card is AiSummaryCard => Boolean(card));

  if (cards.length < 2) {
    cards.push({
      id: 'confidence',
      type: 'confidence',
      severity: 'neutral',
      title: 'Достаточно данных для оценки',
      description: `Сводка построена по ${result.kpis.fieldsCount} полям и ${formatArea(result.kpis.totalArea)} площади.`,
    });
  }

  return {
    planId: result.planId,
    generatedAt: new Date().toISOString(),
    cards: cards.slice(0, 4),
  };
}
