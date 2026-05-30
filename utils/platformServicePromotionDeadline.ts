export type PromotionDeadlineSource = 'custom' | 'wednesday_saturday';

export type ResolvedPromotionDeadline = {
  targetDate: Date;
  displayText: string;
  timeRemaining: string;
  source: PromotionDeadlineSource;
  isActive: boolean;
};

function endOfLocalDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function parseDateOnlyInput(raw: string | null | undefined): Date | null {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (!s) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, d] = s.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    return Number.isNaN(dt.getTime()) ? null : dt;
  }
  const dt = new Date(s);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function formatTimeRemaining(now: Date, target: Date): string {
  const ms = target.getTime() - now.getTime();
  if (ms <= 0) return '';
  const hoursRemaining = Math.ceil(ms / (1000 * 60 * 60));
  const daysRemaining = Math.floor(hoursRemaining / 24);
  const hours = hoursRemaining % 24;
  if (daysRemaining > 0) {
    if (hours > 0) {
      return `${daysRemaining} jour${daysRemaining > 1 ? 's' : ''} et ${hours} heure${hours > 1 ? 's' : ''} restante${hours > 1 ? 's' : ''}`;
    }
    return `${daysRemaining} jour${daysRemaining > 1 ? 's' : ''} restant${daysRemaining > 1 ? 's' : ''}`;
  }
  return `${hoursRemaining} heure${hoursRemaining > 1 ? 's' : ''} restante${hoursRemaining > 1 ? 's' : ''}`;
}

export function computeWednesdaySaturdayPromoDeadline(now = new Date()): ResolvedPromotionDeadline {
  const currentDay = now.getDay();
  let targetDate: Date;
  let displayText: string;

  if (currentDay === 1) {
    targetDate = new Date(now);
    targetDate.setDate(now.getDate() + 2);
    targetDate = endOfLocalDay(targetDate);
    displayText = `Mercredi ${targetDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`;
  } else if (currentDay === 3) {
    targetDate = endOfLocalDay(now);
    displayText = "Aujourd'hui";
  } else if (currentDay === 4) {
    targetDate = new Date(now);
    targetDate.setDate(now.getDate() + 2);
    targetDate = endOfLocalDay(targetDate);
    displayText = `Samedi ${targetDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`;
  } else if (currentDay === 6) {
    targetDate = endOfLocalDay(now);
    displayText = "Aujourd'hui";
  } else {
    const daysUntilWednesday = currentDay <= 3 ? 3 - currentDay : 10 - currentDay;
    const daysUntilSaturday = currentDay <= 6 ? 6 - currentDay : 13 - currentDay;
    if (daysUntilWednesday < daysUntilSaturday) {
      targetDate = new Date(now);
      targetDate.setDate(now.getDate() + daysUntilWednesday);
      targetDate = endOfLocalDay(targetDate);
      displayText = `Mercredi ${targetDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`;
    } else {
      targetDate = new Date(now);
      targetDate.setDate(now.getDate() + daysUntilSaturday);
      targetDate = endOfLocalDay(targetDate);
      displayText = `Samedi ${targetDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`;
    }
  }

  return {
    targetDate,
    displayText,
    timeRemaining: formatTimeRemaining(now, targetDate),
    source: 'wednesday_saturday',
    isActive: now.getTime() <= targetDate.getTime(),
  };
}

export function resolvePlatformServicePromotionDeadline(
  promotionDeadlineAt: string | null | undefined,
  hasPromotionalPrice: boolean,
  now = new Date(),
): ResolvedPromotionDeadline | null {
  if (!hasPromotionalPrice) return null;

  const custom = parseDateOnlyInput(promotionDeadlineAt);
  if (custom) {
    const customEnd = endOfLocalDay(custom);
    if (now.getTime() <= customEnd.getTime()) {
      return {
        targetDate: customEnd,
        displayText: customEnd.toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        timeRemaining: formatTimeRemaining(now, customEnd),
        source: 'custom',
        isActive: true,
      };
    }
  }

  return computeWednesdaySaturdayPromoDeadline(now);
}

export function pickEarliestPromotionDeadline(
  rows: Array<{ promotionDeadlineAt?: string | null; promotionalPrice?: string | null; price?: string | null }>,
  hasPromoFn: (sale: string, list: string) => boolean,
): ResolvedPromotionDeadline | null {
  let best: ResolvedPromotionDeadline | null = null;
  for (const row of rows) {
    const list = String(row.price ?? '').trim();
    const sale = String(row.promotionalPrice ?? '').trim();
    if (!sale || !list || !hasPromoFn(sale, list)) continue;
    const resolved = resolvePlatformServicePromotionDeadline(row.promotionDeadlineAt, true);
    if (!resolved?.isActive) continue;
    if (!best || resolved.targetDate.getTime() < best.targetDate.getTime()) {
      best = resolved;
    }
  }
  return best ?? computeWednesdaySaturdayPromoDeadline();
}
