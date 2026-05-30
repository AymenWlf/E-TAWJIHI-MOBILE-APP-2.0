import { Redirect } from 'expo-router';

import { Orientation1BacReportScreen } from '@/components/orientation1bac/Orientation1BacReportScreen';
import { isOrientation1BacUnlocked } from '@/constants/orientation1bacAccess';
import { ORIENTATION_1BAC_MOBILE_ENABLED } from '@/constants/mobileFeatureFlags';

export default function Orientation1BacReportRoute() {
  if (!ORIENTATION_1BAC_MOBILE_ENABLED || !isOrientation1BacUnlocked()) {
    return <Redirect href="/(tabs)" />;
  }
  return <Orientation1BacReportScreen />;
}
