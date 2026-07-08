import type { ContestAnnouncementCard } from '@/services/contestAnnouncements';
import {
  type ContestRegistrationMethodsData,
  resolveContestOnlineRegistrationUrl,
} from '@/utils/contestRegistrationMethods';
import { placementTrafficDestinationUrl } from '@/utils/referencingPlacementUi';

export function contestCardRegistrationMethodsData(
  item: Pick<
    ContestAnnouncementCard,
    | 'registrationMethods'
    | 'registrationEmail'
    | 'physicalDepositAddressFr'
    | 'physicalDepositAddressAr'
    | 'registrationUrl'
    | 'registrationUrlPending'
    | 'registrationUrlPendingMessageFr'
    | 'registrationUrlPendingMessageAr'
  >,
): ContestRegistrationMethodsData {
  return {
    registrationMethods: item.registrationMethods,
    registrationEmail: item.registrationEmail,
    physicalDepositAddressFr: item.physicalDepositAddressFr,
    physicalDepositAddressAr: item.physicalDepositAddressAr,
    registrationUrl: item.registrationUrl,
    registrationUrlPending: item.registrationUrlPending,
    registrationUrlPendingMessageFr: item.registrationUrlPendingMessageFr,
    registrationUrlPendingMessageAr: item.registrationUrlPendingMessageAr,
  };
}

export function contestCardCampaignTrafficUrl(
  item: Pick<ContestAnnouncementCard, 'goalType' | 'destinationUrl'>,
): string | null {
  return placementTrafficDestinationUrl(
    item.goalType === 'traffic'
      ? { goalType: 'traffic', destinationUrl: item.destinationUrl ?? null }
      : null,
  );
}

export function contestCardEffectiveOnlineUrl(item: ContestAnnouncementCard): string {
  return resolveContestOnlineRegistrationUrl(
    contestCardRegistrationMethodsData(item),
    contestCardCampaignTrafficUrl(item),
  );
}
