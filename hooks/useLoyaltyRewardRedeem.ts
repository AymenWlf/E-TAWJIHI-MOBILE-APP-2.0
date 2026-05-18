import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import { useLocale } from '@/contexts/LocaleContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  redeemLoyaltyReward,
  type LoyaltyRedeemErrorCode,
} from '@/services/loyalty';
import type { LoyaltyRewardTier } from '@/utils/loyaltyCatalogRewards';
import { loyaltyRewardEntityId } from '@/utils/loyaltyRewardEntityId';

function redeemErrorMessage(
  code: LoyaltyRedeemErrorCode,
  t: (k: import('@/constants/i18n').HomeCopyKey) => string,
): string {
  switch (code) {
    case 'already_redeemed':
      return t('loyaltyRedeemAlreadyUsed');
    case 'insufficient_points':
      return t('loyaltyRedeemInsufficient');
    case 'network':
      return t('loyaltyRedeemError');
    default:
      return t('loyaltyRedeemError');
  }
}

export function useLoyaltyRewardRedeem(onAfterSuccess?: () => void | Promise<void>) {
  const { t } = useLocale();
  const { getValidAccessToken } = useAuth();
  const [redeeming, setRedeeming] = useState(false);

  const runRedeem = useCallback(
    async (reward: LoyaltyRewardTier) => {
      const entityId = loyaltyRewardEntityId(reward);
      if (!entityId) {
        Alert.alert(t('loyaltyRedeemError'));
        return;
      }
      setRedeeming(true);
      try {
        const token = await getValidAccessToken();
        if (!token) {
          Alert.alert(t('loyaltyRedeemError'));
          return;
        }
        const res = await redeemLoyaltyReward(token, reward.kind, entityId);
        if (!res.ok) {
          Alert.alert(t('loyaltyRedeemError'), redeemErrorMessage(res.code, t));
          return;
        }
        await onAfterSuccess?.();
        Alert.alert(
          t('loyaltyRedeemSuccessTitle'),
          t('loyaltyRedeemSuccessBody')
            .replace('{{title}}', reward.title)
            .replace('{{count}}', String(res.data.pointsSpent))
            .replace('{{unit}}', t('loyaltyPointsUnit')),
        );
      } finally {
        setRedeeming(false);
      }
    },
    [getValidAccessToken, onAfterSuccess, t],
  );

  const confirmAndRedeem = useCallback(
    (reward: LoyaltyRewardTier) => {
      if (reward.alreadyRedeemed || !reward.affordable || redeeming) {
        return;
      }
      Alert.alert(
        t('loyaltyRedeemConfirmTitle'),
        t('loyaltyRedeemConfirmBody')
          .replace('{{title}}', reward.title)
          .replace('{{count}}', String(reward.pointsCost))
          .replace('{{unit}}', t('loyaltyPointsUnit')),
        [
          { text: t('loyaltyRedeemCancel'), style: 'cancel' },
          {
            text: t('loyaltyRedeemCta'),
            onPress: () => void runRedeem(reward),
          },
        ],
      );
    },
    [redeeming, runRedeem, t],
  );

  return { confirmAndRedeem, redeeming };
}
