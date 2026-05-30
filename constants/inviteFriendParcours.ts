import type { PlanParcoursCompletion } from '@/constants/orientationParcours';

/** Nombre de parrainés qualifiés (commande éligible finalisée) pour valider l’étape. */
export const INVITE_FRIEND_QUALIFIED_MIN_COUNT = 1;

export function getInviteFriendQualifiedCount(
  completion: PlanParcoursCompletion | null | undefined,
): number {
  const n = completion?.inviteFriendQualifiedCount ?? 0;
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
}

export function isInviteFriendParcoursStepComplete(
  completion: PlanParcoursCompletion | null | undefined,
): boolean {
  return getInviteFriendQualifiedCount(completion) >= INVITE_FRIEND_QUALIFIED_MIN_COUNT;
}

export function inviteFriendQualifiedProgress(completion: PlanParcoursCompletion | null | undefined): {
  current: number;
  required: number;
  remaining: number;
  satisfied: boolean;
} {
  const current = getInviteFriendQualifiedCount(completion);
  const required = INVITE_FRIEND_QUALIFIED_MIN_COUNT;
  return {
    current,
    required,
    remaining: Math.max(0, required - current),
    satisfied: current >= required,
  };
}

export type InviteFriendParcoursCopyLocale = 'fr' | 'ar';

export function formatInviteFriendParcoursHint(
  current: number,
  locale: InviteFriendParcoursCopyLocale,
): string {
  const required = INVITE_FRIEND_QUALIFIED_MIN_COUNT;
  if (locale === 'ar') {
    if (current >= required) {
      return 'تم التحقق: مدعو أكمل طلباً مؤهلاً';
    }
    return `الهدف: مدعو واحد أنهى طلباً مؤهلاً (${current}/${required})`;
  }
  if (current >= required) {
    return 'Validé : un parrainé a finalisé une commande éligible';
  }
  return `Objectif : 1 parrainé avec commande finalisée (${current}/${required})`;
}
