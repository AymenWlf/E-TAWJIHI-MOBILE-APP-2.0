import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Pressable, StyleSheet, View } from 'react-native';

import { AccountOrderRow } from '@/components/account/AccountOrderRow';
import { AccountOrdersLoadingSkeleton } from '@/components/account/AccountScreenSkeleton';
import { Text } from '@/components/ui/Text';
import type { HomeCopyKey } from '@/constants/i18n';
import type { UserOrderSummary } from '@/services/userOrders';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';

const PREVIEW_LIMIT = 3;

type Props = {
  orders: UserOrderSummary[];
  loading: boolean;
  loaded: boolean;
  error: string | null;
  openOrdersCount: number;
  rtl: boolean;
  locale: string;
  t: (k: HomeCopyKey) => string;
  onViewAll: () => void;
  onRetry: () => void;
  onOrderPress: (publicId: string) => void;
};

export function ProfileOrdersPreviewPanel({
  orders,
  loading,
  loaded,
  error,
  openOrdersCount,
  rtl,
  locale,
  t,
  onViewAll,
  onRetry,
  onOrderPress,
}: Props) {
  const preview = orders.slice(0, PREVIEW_LIMIT);
  const hasMore = orders.length > PREVIEW_LIMIT;

  return (
    <View style={styles.card}>
      <View style={[styles.head, rtl && styles.headRtl]}>
        <View style={[styles.headLeft, rtl && styles.headLeftRtl]}>
          <View style={styles.headIcon}>
            <FontAwesome name="shopping-bag" size={16} color={brand.primary} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={[styles.title, rtl && styles.txtRtl]}>{t('accountSectionOrders')}</Text>
            {openOrdersCount > 0 ? (
              <Text style={[styles.sub, rtl && styles.txtRtl]}>
                {t('accountOrdersOpenCount').replace('{{count}}', String(openOrdersCount))}
              </Text>
            ) : null}
          </View>
        </View>
        {orders.length > 0 ? (
          <Pressable
            onPress={onViewAll}
            accessibilityRole="button"
            style={({ pressed }) => [styles.viewAllBtn, pressed && { opacity: 0.85 }]}>
            <Text style={styles.viewAllTxt}>{t('accountTabOrders')}</Text>
            <FontAwesome name={rtl ? 'chevron-left' : 'chevron-right'} size={11} color={brand.primary} />
          </Pressable>
        ) : null}
      </View>

      {loading && !loaded ? (
        <AccountOrdersLoadingSkeleton count={2} isRTL={rtl} />
      ) : error ? (
        <View style={styles.center}>
          <FontAwesome name="exclamation-circle" size={24} color="#DC2626" />
          <Text style={[styles.hint, styles.error, rtl && styles.txtRtl]}>{error}</Text>
          <Pressable onPress={onRetry} style={styles.retryBtn}>
            <Text style={styles.retryTxt}>{t('commonRetry')}</Text>
          </Pressable>
        </View>
      ) : preview.length === 0 ? (
        <View style={styles.center}>
          <FontAwesome name="inbox" size={26} color={homeShell.borderOnWhite} />
          <Text style={[styles.hint, rtl && styles.txtRtl]}>{t('accountOrdersEmpty')}</Text>
          <Pressable onPress={onViewAll} style={({ pressed }) => [styles.shopCta, pressed && { opacity: 0.9 }]}>
            <Text style={styles.shopCtaTxt}>{t('accountTabOrders')}</Text>
          </Pressable>
        </View>
      ) : (
        <>
          {preview.map((order, idx) => (
            <AccountOrderRow
              key={order.publicId}
              order={order}
              rtl={rtl}
              locale={locale}
              first={idx === 0}
              t={t}
              onPress={() => onOrderPress(order.publicId)}
            />
          ))}
          {hasMore ? (
            <Pressable
              onPress={onViewAll}
              style={({ pressed }) => [styles.moreBtn, pressed && { opacity: 0.88 }]}>
              <Text style={[styles.moreTxt, rtl && styles.txtRtl]}>
                {t('accountTabOrders')}
              </Text>
            </Pressable>
          ) : null}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: homeShell.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 4,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  headRtl: {
    flexDirection: 'row-reverse',
  },
  headLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    minWidth: 0,
  },
  headLeftRtl: {
    flexDirection: 'row-reverse',
  },
  headIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(51, 62, 143, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: '900',
    color: homeShell.cardText,
  },
  sub: {
    marginTop: 2,
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: homeShell.cardMuted,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radius.full,
    backgroundColor: 'rgba(51, 62, 143, 0.08)',
  },
  viewAllTxt: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: brand.primary,
  },
  txtRtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  center: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  hint: {
    fontSize: fontSize.sm,
    color: homeShell.cardMuted,
    fontWeight: '600',
    textAlign: 'center',
  },
  error: { color: '#DC2626' },
  retryBtn: {
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: homeShell.blue,
  },
  retryTxt: { color: brand.white, fontWeight: '800', fontSize: fontSize.sm },
  shopCta: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderRadius: radius.full,
    backgroundColor: brand.primary,
  },
  shopCtaTxt: {
    color: brand.white,
    fontWeight: '800',
    fontSize: fontSize.sm,
  },
  moreBtn: {
    marginTop: spacing.sm,
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(15,23,42,0.08)',
  },
  moreTxt: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: brand.primary,
  },
});
