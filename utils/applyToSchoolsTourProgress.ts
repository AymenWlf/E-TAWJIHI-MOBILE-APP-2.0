import {
  APPLY_TO_SCHOOLS_TOUR_STEPS,
  type ApplyToSchoolsTourStepId,
} from '@/constants/applyToSchoolsTour';
import type { HomeCopyKey } from '@/constants/i18n';
import type { CandidacyStatusType } from '@/types/inscriptions';

export type ApplyToSchoolsTourGate = 'readonly' | 'follow' | 'status' | 'link';

export type AnnouncementCardTourFocus = null | 'type' | 'follow' | 'status' | 'link' | 'all';

export type ApplyToSchoolsTourActionKind =
  | 'tap_notification'
  | 'tap_continue'
  | 'tap_follow'
  | 'tap_update_status'
  | 'tap_candidacies_tab'
  | 'tap_registration_link';

export type ApplyToSchoolsTourProgressState = {
  stepIndex: number;
  demoFollowed: boolean;
  demoStatus: CandidacyStatusType | null;
  completedActions: ReadonlySet<ApplyToSchoolsTourStepId>;
};

const STEP_REQUIRED_ACTION: Record<ApplyToSchoolsTourStepId, ApplyToSchoolsTourActionKind> = {
  notification_tease: 'tap_notification',
  push_preview: 'tap_continue',
  announcement_card: 'tap_continue',
  registration_link: 'tap_registration_link',
  follow_action: 'tap_follow',
  status_action: 'tap_update_status',
  inscriptions_tabs: 'tap_continue',
  candidacies_tab: 'tap_candidacies_tab',
  candidacy_card: 'tap_update_status',
  bravo: 'tap_continue',
};

export function getStepRequiredAction(step: ApplyToSchoolsTourStepId): ApplyToSchoolsTourActionKind {
  return STEP_REQUIRED_ACTION[step];
}

export function getStepRequiredActionLabelKey(
  step: ApplyToSchoolsTourStepId,
): HomeCopyKey {
  const action = STEP_REQUIRED_ACTION[step];
  switch (action) {
    case 'tap_notification':
      return 'applySchoolsTourActionTapNotification';
    case 'tap_follow':
      return 'applySchoolsTourActionTapFollow';
    case 'tap_update_status':
      return 'applySchoolsTourActionTapStatus';
    case 'tap_candidacies_tab':
      return 'applySchoolsTourActionTapCandidaciesTab';
    case 'tap_registration_link':
      return 'applySchoolsTourActionTapRegistrationLink';
    default:
      return 'applySchoolsTourActionTapContinue';
  }
}

export function getAnnouncementCardTourGate(
  step: ApplyToSchoolsTourStepId,
): ApplyToSchoolsTourGate | undefined {
  if (step === 'follow_action') return 'follow';
  if (step === 'status_action') return 'status';
  if (step === 'registration_link') return 'link';
  if (
    step === 'announcement_card' ||
    step === 'inscriptions_tabs' ||
    step === 'candidacies_tab' ||
    step === 'push_preview' ||
    step === 'candidacy_card' ||
    step === 'notification_tease' ||
    step === 'bravo'
  ) {
    return 'readonly';
  }
  return undefined;
}

export function getFollowedSchoolCardTourGate(
  step: ApplyToSchoolsTourStepId,
): ApplyToSchoolsTourGate | undefined {
  /** Étape 8 : lecture seule (pas de mise à jour ni de désabonnement). */
  if (step === 'candidacies_tab') {
    return 'readonly';
  }
  if (step === 'candidacy_card') {
    return 'status';
  }
  return undefined;
}

export function isStepActionComplete(
  step: ApplyToSchoolsTourStepId,
  state: ApplyToSchoolsTourProgressState,
): boolean {
  if (state.completedActions.has(step)) return true;

  switch (step) {
    case 'notification_tease':
      return state.stepIndex > APPLY_TO_SCHOOLS_TOUR_STEPS.indexOf('notification_tease');
    case 'follow_action':
      return state.demoFollowed;
    case 'status_action':
      return state.demoStatus != null;
    case 'push_preview':
    case 'announcement_card':
    case 'inscriptions_tabs':
      return false;
    case 'registration_link':
      return state.completedActions.has('registration_link');
    case 'candidacies_tab':
      return state.completedActions.has('candidacies_tab');
    case 'candidacy_card':
      return state.completedActions.has('candidacy_card');
    case 'bravo':
      return false;
    default:
      return false;
  }
}

/** Le bouton principal du footer est-il utilisable ? */
export function isFooterPrimaryAllowed(
  step: ApplyToSchoolsTourStepId,
  state: ApplyToSchoolsTourProgressState,
): boolean {
  const action = STEP_REQUIRED_ACTION[step];

  if (action === 'tap_notification') return false;
  if (action === 'tap_registration_link') {
    return state.completedActions.has('registration_link');
  }
  if (action === 'tap_candidacies_tab') return state.completedActions.has('candidacies_tab');
  if (action === 'tap_follow') return state.demoFollowed;
  if (action === 'tap_update_status') {
    if (step === 'candidacy_card') {
      return state.completedActions.has('candidacy_card');
    }
    return state.demoStatus != null;
  }

  if (action === 'tap_continue') {
    if (step === 'bravo') return true;
    if (isLearnContinueStep(step)) return true;
    return isStepActionComplete(step, state);
  }

  return false;
}

/**
 * Étapes « Continuer » : le bouton footer n’avance qu’après lecture
 * (on marque l’action faite au premier tap sur Continuer).
 */
export function shouldMarkContinueOnPrimary(step: ApplyToSchoolsTourStepId): boolean {
  const action = STEP_REQUIRED_ACTION[step];
  return action === 'tap_continue' && step !== 'bravo';
}

/** Étapes « à découvrir » : l’utilisateur appuie sur Continuer (pas d’auto-avance). */
export function isLearnContinueStep(step: ApplyToSchoolsTourStepId): boolean {
  return (
    step === 'push_preview' ||
    step === 'announcement_card' ||
    step === 'inscriptions_tabs'
  );
}

/** Zone mise en avant sur `AnnouncementCard` (null = pas de focus). */
export function getAnnouncementCardTourFocus(
  step: ApplyToSchoolsTourStepId,
  actionDone: boolean,
): AnnouncementCardTourFocus {
  if (step === 'announcement_card') return 'all';
  if (actionDone) return null;
  if (step === 'registration_link') return 'link';
  if (step === 'follow_action') return 'follow';
  if (step === 'status_action') return 'status';
  return null;
}

/** Pulse sur la carte uniquement tant que l’action tap n’est pas faite. */
export function shouldPulseAnnouncementCardTourFocus(
  step: ApplyToSchoolsTourStepId,
  actionDone: boolean,
): boolean {
  const zone = getAnnouncementCardTourFocus(step, actionDone);
  return zone != null && zone !== 'all';
}

/** Pulse sur « Continuer » : étapes lecture tout de suite ; actions après le tap. */
export function shouldPulseFooterContinue(
  step: ApplyToSchoolsTourStepId,
  footerPrimaryAllowed: boolean,
  actionDone: boolean,
  isLast: boolean,
): boolean {
  if (!footerPrimaryAllowed) return false;
  if (step === 'bravo' || isLast) return true;
  if (isLearnContinueStep(step)) return true;
  if (
    step === 'follow_action' ||
    step === 'status_action' ||
    step === 'registration_link' ||
    step === 'candidacy_card' ||
    step === 'candidacies_tab'
  ) {
    return actionDone;
  }
  return false;
}

export function canTapTeaseCard(step: ApplyToSchoolsTourStepId): boolean {
  return step === 'notification_tease';
}

export function canTapCandidaciesTab(step: ApplyToSchoolsTourStepId): boolean {
  return step === 'candidacies_tab';
}

export function canInteractWithPushPreview(step: ApplyToSchoolsTourStepId): boolean {
  return false;
}
