import { Redirect } from 'expo-router';

import { Orientation1BacWizard } from '@/components/orientation1bac/Orientation1BacWizard';
import { isOrientation1BacUnlocked } from '@/constants/orientation1bacAccess';
import { ORIENTATION_1BAC_MOBILE_ENABLED } from '@/constants/mobileFeatureFlags';

export default function Orientation1BacWizardScreen() {
  if (!ORIENTATION_1BAC_MOBILE_ENABLED || !isOrientation1BacUnlocked()) {
    return <Redirect href="/(tabs)" />;
  }
  return <Orientation1BacWizard />;
}
