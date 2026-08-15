import { formatPh } from '@/shared/lib/format';
import type { Field } from '../model/types';

export function formatIndicators(indicators: Field['indicators']): string {
  return `pH ${formatPh(indicators.ph)}  N ${indicators.n} P ${indicators.p} K ${indicators.k}`;
}
