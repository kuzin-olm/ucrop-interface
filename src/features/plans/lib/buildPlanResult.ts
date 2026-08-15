import type { Field } from '@/features/fields/model/types';
import type { CalculationPlan } from '../model/types';
import type { FieldRecommendation, PlanResult } from '../model/resultTypes';
import { cropColor, cropMarginBase, cropYieldBase } from './cropPalette';

function hash(value: string): number {
  let total = 0;
  for (let index = 0; index < value.length; index += 1) {
    total = (total * 31 + value.charCodeAt(index)) >>> 0;
  }
  return total;
}

function vary(base: number, seed: string, spread: number): number {
  const unit = (hash(seed) % 1000) / 1000 - 0.5;
  return base * (1 + unit * spread);
}

export function buildPlanResult(plan: CalculationPlan, fields: Field[]): PlanResult {
  const crops = plan.crops.length > 0 ? plan.crops : ['Пшеница'];
  const selected = plan.fieldIds
    .map((id) => fields.find((field) => field.id === id))
    .filter((field): field is Field => Boolean(field));

  const recommendations: FieldRecommendation[] = selected.map((field, index) => {
    const crop = crops[hash(`${plan.id}:${field.id}`) % crops.length];
    return {
      fieldId: field.id,
      fieldName: field.name,
      recommendedCrop: crop,
      predictedYield: Number(vary(cropYieldBase(crop), `${plan.id}-y-${field.id}`, 0.16).toFixed(1)),
      predictedMarginPerHa: Math.round(vary(cropMarginBase(crop), `${plan.id}-m-${field.id}`, 0.18)),
      color: cropColor(crop, index),
      area: field.area,
      geometry: field.geometry,
    };
  });

  const totalArea = recommendations.reduce((sum, item) => sum + item.area, 0);
  const predictedMarginPerHa =
    totalArea === 0
      ? 0
      : Math.round(
          recommendations.reduce((sum, item) => sum + item.predictedMarginPerHa * item.area, 0) / totalArea,
        );

  return {
    planId: plan.id,
    planName: plan.name,
    status: 'completed',
    kpis: {
      predictedMarginPerHa,
      totalArea: totalArea || plan.totalArea,
      fieldsCount: recommendations.length || plan.fieldsCount,
    },
    fieldRecommendations: recommendations,
  };
}
