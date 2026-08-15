const NAMED_COLORS: Record<string, string> = {
  Пшеница: '#C6A15B',
  Ячмень: '#8D6E3C',
  Кукуруза: '#E4B429',
  Овёс: '#A1887F',
  Подсолнечник: '#E07A1F',
  Рапс: '#7CB342',
  Соя: '#558B2F',
  Горох: '#43A047',
  Нут: '#6D4C41',
};

const FALLBACK = ['#2E7D32', '#1565C0', '#EF6C00', '#6A1B9A', '#00838F', '#C62828'];

export function cropColor(name: string, index = 0): string {
  return NAMED_COLORS[name] ?? FALLBACK[index % FALLBACK.length];
}

export function cropYieldBase(name: string): number {
  const table: Record<string, number> = {
    Пшеница: 4.2,
    Ячмень: 3.8,
    Кукуруза: 6.5,
    Овёс: 2.9,
    Подсолнечник: 2.4,
    Рапс: 2.1,
    Соя: 2.2,
    Горох: 2.8,
    Нут: 1.8,
  };
  return table[name] ?? 3.0;
}

export function cropMarginBase(name: string): number {
  const table: Record<string, number> = {
    Пшеница: 24_800,
    Ячмень: 18_600,
    Кукуруза: 32_400,
    Овёс: 12_200,
    Подсолнечник: 28_450,
    Рапс: 26_100,
    Соя: 29_800,
    Горох: 21_400,
    Нут: 19_700,
  };
  return table[name] ?? 20_000;
}
