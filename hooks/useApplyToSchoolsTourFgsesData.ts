import { useEffect, useMemo, useState } from 'react';

import { TOUR_DEMO_FGSES_ANNOUNCEMENT } from '@/constants/applyToSchoolsTour';
import type { ContestAnnouncementCard } from '@/services/contestAnnouncements';
import type { AppNotification } from '@/types/inscriptions';
import {
  buildTourDemoFollow,
  buildTourPushNotification,
  resolveTourFgsesAnnouncement,
  mergeTourAvailableStatuses,
  tourDefaultStatus,
} from '@/utils/applyToSchoolsTourData';

export function useApplyToSchoolsTourFgsesData() {
  const [announcement, setAnnouncement] = useState<ContestAnnouncementCard>(
    TOUR_DEMO_FGSES_ANNOUNCEMENT,
  );
  const [loading, setLoading] = useState(true);
  const [fromApi, setFromApi] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void (async () => {
      try {
        const resolved = await resolveTourFgsesAnnouncement();
        if (cancelled) return;
        setAnnouncement(resolved);
        setFromApi(resolved.id !== TOUR_DEMO_FGSES_ANNOUNCEMENT.id);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const pushNotification = useMemo(
    () => buildTourPushNotification(announcement),
    [announcement],
  );

  const defaultStatus = useMemo(() => tourDefaultStatus(announcement), [announcement]);

  const availableStatuses = useMemo(
    () => mergeTourAvailableStatuses(announcement.availableStatuses),
    [announcement],
  );

  const buildDemoFollow = useMemo(
    () => (status: Parameters<typeof buildTourDemoFollow>[1]) =>
      buildTourDemoFollow(announcement, status),
    [announcement],
  );

  return {
    announcement,
    pushNotification,
    defaultStatus,
    availableStatuses,
    buildDemoFollow,
    loading,
    fromApi,
  };
}

export type ApplyToSchoolsTourFgsesData = {
  announcement: ContestAnnouncementCard;
  pushNotification: AppNotification;
};
