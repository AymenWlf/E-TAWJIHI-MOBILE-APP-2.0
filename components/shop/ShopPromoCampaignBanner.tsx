import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { useLocale } from '@/contexts/LocaleContext';
import { fetchActiveShopPromoCampaign, type ShopPromoCampaignBrief } from '@/services/shopPromoCampaign';
import { radius, spacing } from '@/theme/tokens';
import {
  resolveShopPromoCampaignDeadline,
  shopPromoCampaignTickIntervalMs,
} from '@/utils/shopPromoCampaignDeadline';

type Props = {
  /** Incrémenter après un pull-to-refresh boutique pour recharger la campagne. */
  refreshKey?: number;
};

export function ShopPromoCampaignBanner({ refreshKey = 0 }: Props) {
  const { locale, isRTL } = useLocale();
  const [banner, setBanner] = useState<ShopPromoCampaignBrief | null>(null);
  const [now, setNow] = useState(() => new Date());

  const loadBanner = useCallback(() => {
    void fetchActiveShopPromoCampaign().then((r) => setBanner(r.banner));
  }, []);

  useEffect(() => {
    loadBanner();
  }, [loadBanner, refreshKey]);

  useFocusEffect(
    useCallback(() => {
      loadBanner();
    }, [loadBanner]),
  );

  useEffect(() => {
    if (!banner?.endsAt) return;
    const tick = () => setNow(new Date());
    tick();
    const id = setInterval(tick, shopPromoCampaignTickIntervalMs(banner.endsAt));
    return () => clearInterval(id);
  }, [banner?.endsAt]);

  const label = useMemo(() => {
    if (!banner) return '';
    const custom = locale === 'ar' ? banner.labelAr : banner.labelFr;
    return custom?.trim() || banner.name;
  }, [banner, locale]);

  const deadline = useMemo(() => {
    if (!banner?.endsAt) return null;
    return resolveShopPromoCampaignDeadline(banner.endsAt, locale === 'ar' ? 'ar' : 'fr', now);
  }, [banner?.endsAt, locale, now]);

  if (!banner || !deadline || deadline.expired) return null;

  const rtlText = isRTL ? styles.rtlText : undefined;

  return (
    <View style={[styles.wrap, isRTL && styles.wrapRtl]}>
      <View style={[styles.mainRow, isRTL && styles.mainRowRtl]}>
        <View style={styles.iconWrap}>
          <FontAwesome name="bullhorn" size={16} color="#FFFFFF" />
        </View>
        <View style={[styles.textCol, isRTL && styles.textColRtl]}>
          <Text style={[styles.title, rtlText]} numberOfLines={2}>
            {label}
          </Text>
          <Text style={[styles.sub, rtlText]}>
            {locale === 'ar' ? 'عروض محدودة على منتجات وخدمات مختارة' : 'Promotions limitées sur une sélection boutique'}
          </Text>
        </View>
      </View>

      <View style={[styles.deadlineBox, isRTL && styles.deadlineBoxRtl]}>
        <Text style={[styles.untilLabel, rtlText]}>{deadline.untilLabel}</Text>
        <Text style={[styles.dateText, rtlText]}>{deadline.dateText}</Text>
        {deadline.timeRemaining ? (
          <View style={[styles.remainingRow, isRTL && styles.remainingRowRtl]}>
            <FontAwesome name="hourglass-half" size={11} color="#FFFFFF" />
            <Text style={[styles.remainingTxt, rtlText]}>{deadline.timeRemaining}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: '#F87171',
    backgroundColor: '#DC2626',
    shadowColor: '#991B1B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  wrapRtl: {
    direction: 'rtl',
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'stretch',
  },
  mainRowRtl: {
    flexDirection: 'row-reverse',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  textCol: { flex: 1, minWidth: 0, alignSelf: 'stretch' },
  textColRtl: {
    alignItems: 'flex-end',
  },
  title: { fontSize: 14, fontWeight: '800', color: '#FFFFFF', width: '100%' },
  sub: { marginTop: 2, fontSize: 11, color: 'rgba(255,255,255,0.9)', width: '100%' },
  deadlineBox: {
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    gap: 2,
    width: '100%',
    alignSelf: 'stretch',
  },
  deadlineBoxRtl: {
    alignItems: 'flex-end',
  },
  untilLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    width: '100%',
  },
  dateText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 18,
    width: '100%',
  },
  remainingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
    width: '100%',
  },
  remainingRowRtl: {
    flexDirection: 'row-reverse',
    justifyContent: 'flex-start',
  },
  remainingTxt: {
    flex: 1,
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
    alignSelf: 'stretch',
    width: '100%',
  },
});
