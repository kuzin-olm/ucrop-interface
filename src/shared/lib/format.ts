export function formatYield(value: number): string {
  return `${value.toLocaleString('ru-RU', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} т/га`;
}

export function formatSowingWindow(start: string, end: string): string {
  return `${start} – ${end}`;
}

export function formatHa(value: number): string {
  return value.toLocaleString('ru-RU', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

export function formatArea(value: number): string {
  return `${formatHa(value)} га`;
}

export function formatPh(value: number): string {
  return value.toLocaleString('ru-RU', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatClock(iso: string): string {
  return new Date(iso).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  if (minutes === 0) return `${rest} сек`;
  return `${minutes} мин ${String(rest).padStart(2, '0')} сек`;
}

export function formatMoney(value: number): string {
  return `${value.toLocaleString('ru-RU')} ₽`;
}

export function formatSignedPerHa(value: number): string {
  const amount = Math.round(Math.abs(value)).toLocaleString('ru-RU');
  return `${value >= 0 ? '+' : '−'}${amount} ₽/га`;
}
