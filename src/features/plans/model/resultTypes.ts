import type { FieldPolygon } from '@/features/fields/model/types';

export type FieldRecommendation = {
  fieldId: string;
  fieldName: string;
  recommendedCrop: string;
  predictedYield: number;
  predictedMarginPerHa: number;
  color: string;
  area: number;
  geometry: FieldPolygon;
};

export type AiSummaryType = 'margin' | 'rotation' | 'risk' | 'distribution' | 'confidence';
export type AiSummarySeverity = 'positive' | 'warning' | 'neutral';

export type AiSummaryCard = {
  id: string;
  type: AiSummaryType;
  title: string;
  description: string;
  severity: AiSummarySeverity;
};

export type AiSummary = {
  planId: string;
  cards: AiSummaryCard[];
  generatedAt: string;
};

export type PlanResult = {
  planId: string;
  planName: string;
  status: 'completed';
  kpis: {
    predictedMarginPerHa: number;
    totalArea: number;
    fieldsCount: number;
  };
  fieldRecommendations: FieldRecommendation[];
};
