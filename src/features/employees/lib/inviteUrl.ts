import { publicUrl } from '@/shared/lib/publicUrl';

export const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function createInviteToken(): string {
  return crypto.randomUUID();
}

export function inviteExpiresAt(from = Date.now()): string {
  return new Date(from + INVITE_TTL_MS).toISOString();
}

export function buildInviteUrl(token: string): string {
  const path = publicUrl(`invite/${token}`);
  if (typeof window === 'undefined') return path;
  return new URL(path, window.location.origin).href;
}
