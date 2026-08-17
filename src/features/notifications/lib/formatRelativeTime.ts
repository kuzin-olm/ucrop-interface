export function formatNotificationTime(iso: string, now = Date.now()): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return 'давно';

  const diff = Math.max(0, now - then);
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return '1м';
  if (diff < 7.5 * minute) return '5м';
  if (diff < 20 * minute) return '10м';
  if (diff < 45 * minute) return '30м';
  if (diff < day) return '1ч';

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  if (then >= startOfYesterday.getTime() && then < startOfToday.getTime()) return 'вчера';
  return 'давно';
}
