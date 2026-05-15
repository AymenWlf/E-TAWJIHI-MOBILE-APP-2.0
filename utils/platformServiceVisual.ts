import { brand } from '@/theme/tokens';

export const DEFAULT_PLATFORM_SERVICE_ICON = 'briefcase';
export const DEFAULT_PLATFORM_SERVICE_COLOR = brand.primary;

export function platformServiceBrandColorOrDefault(c?: string | null): string {
  const s = (c ?? '').trim();
  if (s && /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(s)) return s;
  return DEFAULT_PLATFORM_SERVICE_COLOR;
}

export function platformServiceBrandIconOrDefault(i?: string | null): string {
  const s = (i ?? '').trim();
  if (s && /^[a-z0-9][a-z0-9_-]*$/i.test(s)) return s.slice(0, 48);
  return DEFAULT_PLATFORM_SERVICE_ICON;
}
