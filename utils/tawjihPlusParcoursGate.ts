import { Alert } from 'react-native';

import type { HomeCopyKey } from '@/constants/i18n';
import { isPlanStepTawjihPlusGated, isPracticalLinkTawjihPlusGated } from '@/constants/tawjihPlusParcours';

export type TawjihPlusParcoursGate = {
  hasAccess: boolean;
  loading: boolean;
  openProduct: () => void;
  t: (key: HomeCopyKey) => string;
};

export function isTawjihPlusParcoursBlocked(
  target: { stepId?: string; practicalLinkId?: string },
  gate: TawjihPlusParcoursGate,
): boolean {
  const gated =
    (target.stepId != null && isPlanStepTawjihPlusGated(target.stepId)) ||
    (target.practicalLinkId != null && isPracticalLinkTawjihPlusGated(target.practicalLinkId));
  if (!gated) return false;
  if (gate.loading) return true;
  return !gate.hasAccess;
}

export function promptTawjihPlusParcoursLock(gate: TawjihPlusParcoursGate): void {
  Alert.alert(gate.t('inscTawjihPlusLockTitle'), gate.t('inscTawjihPlusLockHint'), [
    { text: gate.t('closeOverlayA11y'), style: 'cancel' },
    { text: gate.t('inscTawjihPlusUpgradeCta'), onPress: gate.openProduct },
  ]);
}

export function guardTawjihPlusParcoursStep(
  stepId: string,
  gate: TawjihPlusParcoursGate | undefined,
  run: () => void,
): void {
  if (gate && isTawjihPlusParcoursBlocked({ stepId }, gate)) {
    promptTawjihPlusParcoursLock(gate);
    return;
  }
  run();
}

export function guardTawjihPlusPracticalLink(
  linkId: string,
  gate: TawjihPlusParcoursGate | undefined,
  run: () => void,
): void {
  if (gate && isTawjihPlusParcoursBlocked({ practicalLinkId: linkId }, gate)) {
    promptTawjihPlusParcoursLock(gate);
    return;
  }
  run();
}
