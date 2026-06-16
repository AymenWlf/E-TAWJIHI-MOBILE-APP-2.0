import { useEffect, useMemo, useState } from 'react';

import type { AppLocale } from '@/constants/i18n';
import {
  formatPromotionDisplayDate,
  formatPromotionTimeRemaining,
  resolveExplicitPromotionDeadline,
} from '@/utils/platformServicePromotionDeadline';

export type PlatformServicePromotionCountdownUi = {
  displayText: string;
  timeRemaining: string;
  targetDate: Date;
};

export function usePlatformServicePromotionCountdown(
  promotionDeadlineAt: string | null | undefined,
  hasPromotionalPrice: boolean,
  locale: AppLocale,
  compact = true,
): PlatformServicePromotionCountdownUi | null {
  const [now, setNow] = useState(() => new Date());

  const base = useMemo(
    () => resolveExplicitPromotionDeadline(promotionDeadlineAt, hasPromotionalPrice, now),
    [promotionDeadlineAt, hasPromotionalPrice, now],
  );

  useEffect(() => {
    if (!base) return;
    const ms = base.targetDate.getTime() - Date.now();
    if (ms <= 0) return;
    const intervalMs = ms < 86_400_000 ? 1000 : 60_000;
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [base?.targetDate.getTime()]);

  return useMemo(() => {
    if (!base) return null;
    const timeRemaining = formatPromotionTimeRemaining(now, base.targetDate, locale, compact);
    if (!timeRemaining) return null;
    return {
      targetDate: base.targetDate,
      displayText: formatPromotionDisplayDate(base.targetDate, locale),
      timeRemaining,
    };
  }, [base, compact, locale, now]);
}
