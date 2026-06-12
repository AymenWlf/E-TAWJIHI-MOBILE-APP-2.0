import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import {
  effectiveRegistrationMethods,
  formatRegistrationMethodsList,
  pickPhysicalDepositAddress,
  primaryRegistrationUrl,
  registrationMailto,
  registrationMethodLabel,
  type ContestRegistrationMethod,
  type ContestRegistrationMethodsData,
} from '@/utils/contestRegistrationMethods';

type Props = {
  data: ContestRegistrationMethodsData;
  locale: 'fr' | 'ar';
  isRTL: boolean;
  registrationLocked?: boolean;
  compact?: boolean;
  onOnlinePress?: () => void;
  onLockedPress?: () => void;
};

function LockedValueRow({
  isRTL,
  onPress,
  compact = false,
}: {
  isRTL: boolean;
  onPress?: () => void;
  compact?: boolean;
}) {
  const row = (
    <View style={[styles.lockedValueRow, isRTL && styles.rowRtl, compact && styles.lockedValueRowCompact]}>
      <Text
        style={[styles.lockedPlaceholder, compact && styles.lockedPlaceholderCompact, isRTL && styles.rtl]}
        aria-hidden
        importantForAccessibility="no-hide-descendants">
        ————————
      </Text>
      <FontAwesome name="lock" size={compact ? 9 : 10} color="#64748B" />
    </View>
  );
  if (!onPress) return row;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && { opacity: 0.88 }]}>
      {row}
    </Pressable>
  );
}

function MethodTitleRow({
  method,
  locale,
  isRTL,
  locked,
}: {
  method: ContestRegistrationMethod;
  locale: 'fr' | 'ar';
  isRTL: boolean;
  locked?: boolean;
}) {
  const icon =
    method === 'online' ? 'globe' : method === 'email' ? 'envelope' : 'map-marker';
  const iconColor =
    method === 'online' ? brand.primary : method === 'email' ? '#059669' : '#D97706';

  return (
    <View style={[styles.row, isRTL && styles.rowRtl]}>
      <FontAwesome name={icon} size={14} color={iconColor} />
      <Text style={[styles.blockTitle, isRTL && styles.rtl]}>
        {registrationMethodLabel(method, locale)}
      </Text>
      {locked ? <FontAwesome name="lock" size={11} color="#64748B" style={styles.blockTitleLock} /> : null}
    </View>
  );
}

export function AnnouncementRegistrationMethodsSummary({
  data,
  locale,
  isRTL,
  registrationLocked = false,
  onLockedPress,
}: Pick<Props, 'data' | 'locale' | 'isRTL' | 'registrationLocked' | 'onLockedPress'>) {
  const list = formatRegistrationMethodsList(data, locale);
  if (!list) return null;
  const prefix = locale === 'ar' ? 'التسجيل عبر' : 'Inscription par';

  if (registrationLocked) {
    return (
      <Pressable
        onPress={onLockedPress}
        style={({ pressed }) => [styles.summaryLockedWrap, pressed && { opacity: 0.88 }]}>
        <Text style={[styles.summary, isRTL && styles.rtl]} numberOfLines={2}>
          <Text style={styles.summaryMuted}>{prefix} : </Text>
          {list}
        </Text>
        <LockedValueRow isRTL={isRTL} compact />
      </Pressable>
    );
  }

  return (
    <Text style={[styles.summary, isRTL && styles.rtl]} numberOfLines={3}>
      <Text style={styles.summaryMuted}>{prefix} : </Text>
      {list}
    </Text>
  );
}

export function AnnouncementRegistrationMethodsPanel({
  data,
  locale,
  isRTL,
  registrationLocked = false,
  compact = false,
  onOnlinePress,
  onLockedPress,
}: Props) {
  const resolvedMethods = effectiveRegistrationMethods(data);
  const methods =
    resolvedMethods.length > 0
      ? resolvedMethods
      : registrationLocked
        ? (['online', 'email', 'physical'] as const)
        : [];
  if (methods.length === 0) return null;

  const url = primaryRegistrationUrl(data);
  const email = (data.registrationEmail ?? '').trim();
  const address = pickPhysicalDepositAddress(data, locale);

  return (
    <View style={[styles.panel, compact && styles.panelCompact]}>
      {!compact ? (
        <View style={[styles.panelTitleRow, isRTL && styles.rowRtl]}>
          <Text style={[styles.panelTitle, isRTL && styles.rtl]}>
            {locale === 'ar' ? 'طرق التسجيل' : "Modalités d'inscription"}
          </Text>
          {registrationLocked ? (
            <FontAwesome name="lock" size={12} color="#64748B" />
          ) : null}
        </View>
      ) : null}
      {methods.map((method) => {
        if (method === 'online') {
          if (registrationLocked) {
            return (
              <Pressable
                key={method}
                onPress={onLockedPress}
                style={[styles.block, styles.blockLocked]}>
                <MethodTitleRow method={method} locale={locale} isRTL={isRTL} locked />
                <LockedValueRow isRTL={isRTL} />
              </Pressable>
            );
          }
          if (!url) {
            return (
              <View key={method} style={styles.block}>
                <View style={[styles.row, isRTL && styles.rowRtl]}>
                  <FontAwesome name="globe" size={14} color={brand.primary} />
                  <Text style={[styles.blockTitle, isRTL && styles.rtl]}>
                    {registrationMethodLabel(method, locale)}
                  </Text>
                </View>
                <Text style={[styles.muted, isRTL && styles.rtl]}>
                  {locale === 'ar' ? 'الرابط غير متوفر' : 'Lien non renseigné'}
                </Text>
              </View>
            );
          }
          return (
            <Pressable
              key={method}
              onPress={onOnlinePress}
              style={({ pressed }) => [styles.block, styles.blockAction, pressed && { opacity: 0.88 }]}>
              <View style={[styles.row, isRTL && styles.rowRtl]}>
                <FontAwesome name="globe" size={14} color={brand.primary} />
                <Text style={[styles.blockTitle, isRTL && styles.rtl]}>
                  {registrationMethodLabel(method, locale)}
                </Text>
              </View>
              <Text style={[styles.linkTxt, isRTL && styles.rtl]}>
                {locale === 'ar' ? 'التسجيل عبر الإنترنت' : "S'inscrire en ligne"}
              </Text>
            </Pressable>
          );
        }

        if (method === 'email') {
          if (registrationLocked) {
            return (
              <Pressable
                key={method}
                onPress={onLockedPress}
                style={[styles.block, styles.blockLocked]}>
                <MethodTitleRow method={method} locale={locale} isRTL={isRTL} locked />
                <LockedValueRow isRTL={isRTL} />
              </Pressable>
            );
          }
          if (!email) {
            return (
              <View key={method} style={styles.block}>
                <MethodTitleRow method={method} locale={locale} isRTL={isRTL} />
                <Text style={[styles.muted, isRTL && styles.rtl]}>
                  {locale === 'ar' ? 'البريد غير متوفر' : 'E-mail non renseigné'}
                </Text>
              </View>
            );
          }
          return (
            <Pressable
              key={method}
              onPress={() => void Linking.openURL(registrationMailto(email))}
              style={({ pressed }) => [styles.block, styles.blockAction, pressed && { opacity: 0.88 }]}>
              <View style={[styles.row, isRTL && styles.rowRtl]}>
                <FontAwesome name="envelope" size={14} color="#059669" />
                <Text style={[styles.blockTitle, isRTL && styles.rtl]}>
                  {registrationMethodLabel(method, locale)}
                </Text>
              </View>
              <Text style={[styles.emailTxt, isRTL && styles.rtl]} selectable>
                {email}
              </Text>
            </Pressable>
          );
        }

        if (method === 'physical') {
          return (
            <Pressable
              key={method}
              onPress={registrationLocked ? onLockedPress : undefined}
              disabled={!registrationLocked}
              style={[styles.block, registrationLocked && styles.blockLocked]}>
              <MethodTitleRow method={method} locale={locale} isRTL={isRTL} locked={registrationLocked} />
              {registrationLocked ? (
                <LockedValueRow isRTL={isRTL} />
              ) : address ? (
                <Text
                  style={[styles.addressTxt, isRTL && styles.rtl]}
                  selectable
                  dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                  {address}
                </Text>
              ) : (
                <Text style={[styles.muted, isRTL && styles.rtl]}>
                  {locale === 'ar' ? 'العنوان غير متوفر' : 'Adresse non renseignée'}
                </Text>
              )}
              {!registrationLocked &&
              locale === 'fr' &&
              (data.physicalDepositAddressAr ?? '').trim() &&
              (data.physicalDepositAddressFr ?? '').trim() !==
                (data.physicalDepositAddressAr ?? '').trim() ? (
                <Text style={[styles.addressTxtAr, isRTL && styles.rtl]} selectable dir="rtl">
                  {(data.physicalDepositAddressAr ?? '').trim()}
                </Text>
              ) : null}
            </Pressable>
          );
        }

        return null;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  summary: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: '#475569',
    lineHeight: 18,
  },
  summaryMuted: {
    color: '#64748B',
    fontWeight: '700',
  },
  summaryLockedWrap: {
    gap: 4,
    paddingVertical: 2,
  },
  rtl: { writingDirection: 'rtl', textAlign: 'right' },
  panel: { gap: spacing.sm },
  panelCompact: { marginTop: spacing.xs },
  panelTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.xs,
  },
  panelTitle: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: '#0F172A',
  },
  block: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: radius.lg,
    backgroundColor: '#F8FAFC',
    padding: spacing.md,
    gap: spacing.xs,
  },
  blockLocked: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  blockAction: { backgroundColor: '#FFFFFF' },
  lockedValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  lockedValueRowCompact: {
    marginTop: 0,
  },
  lockedPlaceholder: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    letterSpacing: 0.8,
  },
  lockedPlaceholderCompact: {
    fontSize: fontSize.xs,
    letterSpacing: 0.5,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rowRtl: { flexDirection: 'row-reverse' },
  blockTitle: { flex: 1, fontSize: fontSize.sm, fontWeight: '700', color: '#0F172A' },
  blockTitleLock: { marginStart: 4 },
  linkTxt: { fontSize: fontSize.sm, fontWeight: '800', color: brand.primary },
  emailTxt: { fontSize: fontSize.sm, fontWeight: '600', color: '#047857' },
  addressTxt: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: '#334155',
    lineHeight: 20,
  },
  addressTxtAr: {
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F0',
    fontSize: fontSize.sm,
    color: '#475569',
    lineHeight: 20,
    textAlign: 'right',
  },
  muted: { fontSize: fontSize.xs, color: '#64748B' },
});
