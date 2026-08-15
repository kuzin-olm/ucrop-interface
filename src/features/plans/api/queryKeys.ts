export const planKeys = {
  all: (seasonId: string) => ['plans', seasonId] as const,
  result: (planId: string) => ['plan-result', planId] as const,
  aiSummary: (planId: string) => ['plan-ai-summary', planId] as const,
};
