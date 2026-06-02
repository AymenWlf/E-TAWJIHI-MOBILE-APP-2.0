import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Clipboard,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { Text } from '@/components/ui/Text';
import { PlatformSheetOverlay } from '@/components/ui/PlatformSheetOverlay';
import {
  BAC_MEN_GOV_URL,
  BAC_OUTLOOK_CHECK_URL,
  buildMassarOutlookEmail,
  type BacVerificationChannel,
} from '@/constants/bacResultsCard';
import type { HomeCopyKey } from '@/constants/i18n';
import { useLocale } from '@/contexts/LocaleContext';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';

const SHEET_MS = 300;
/** Hauteur du sheet : ~78 % de l’écran pour laisser place au CTA bas. */
const SHEET_HEIGHT_RATIO = 0.78;

type Props = {
  visible: boolean;
  channel: BacVerificationChannel | null;
  massarCode: string;
  massarLoading?: boolean;
  massarSaving?: boolean;
  onConfirmMassar: (code: string) => Promise<boolean>;
  onClose: () => void;
};

function StepRow({ n, text, rtl, last }: { n: number; text: string; rtl: boolean; last?: boolean }) {
  return (
    <View style={[styles.stepRow, rtl && styles.stepRowRtl]}>
      <View style={styles.stepRail}>
        <View style={styles.stepNum}>
          <Text style={styles.stepNumTxt}>{n}</Text>
        </View>
        {!last ? <View style={styles.stepLine} /> : null}
      </View>
      <Text style={[styles.stepTxt, rtl && styles.rtlText]}>{text}</Text>
    </View>
  );
}

export function BacResultsVerificationModal({
  visible,
  channel,
  massarCode,
  massarLoading = false,
  massarSaving = false,
  onConfirmMassar,
  onClose,
}: Props) {
  const { t, isRTL } = useLocale();
  const insets = useSafeAreaInsets();
  const { height: windowH } = useWindowDimensions();
  const sheetHeight = Math.round(windowH * SHEET_HEIGHT_RATIO);
  const slideOffset = sheetHeight + 48;
  const [mounted, setMounted] = useState(visible);
  const [draftMassar, setDraftMassar] = useState(massarCode);
  const [editing, setEditing] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  const backdropOpacity = useSharedValue(0);
  const sheetY = useSharedValue(slideOffset);

  useEffect(() => {
    sheetY.value = slideOffset;
  }, [slideOffset, sheetY]);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      setDraftMassar(massarCode);
      setEditing(!massarCode);
      setSavedFlash(false);
      sheetY.value = slideOffset;
      backdropOpacity.value = withTiming(1, { duration: SHEET_MS, easing: Easing.out(Easing.cubic) });
      sheetY.value = withTiming(0, { duration: SHEET_MS, easing: Easing.out(Easing.cubic) });
      return;
    }
    backdropOpacity.value = withTiming(0, { duration: 220 });
    sheetY.value = withTiming(slideOffset, { duration: 260, easing: Easing.in(Easing.cubic) }, (finished) => {
      if (finished) runOnJS(setMounted)(false);
    });
  }, [visible, massarCode, backdropOpacity, sheetY, slideOffset]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdropOpacity.value }));
  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: sheetY.value }] }));

  const titleKey: HomeCopyKey =
    channel === 'outlook' ? 'bacVerifyModalTitleOutlook' : 'bacVerifyModalTitleMen';

  const channelAccent = channel === 'men' ? homeShell.greenDark : homeShell.blue;
  const channelIcon = channel === 'outlook' ? 'envelope-o' : 'graduation-cap';

  const stepKeys: HomeCopyKey[] = useMemo(() => {
    if (channel === 'outlook') {
      return [
        'bacOutlookStep1',
        'bacOutlookStep2',
        'bacOutlookStep3',
        'bacOutlookStep4',
        'bacOutlookStep5',
      ];
    }
    return [
      'bacMenStep1',
      'bacMenStep2',
      'bacMenStep3',
      'bacMenStep4',
      'bacMenStep5',
      'bacMenStep6',
    ];
  }, [channel]);

  const outlookEmailPreview = buildMassarOutlookEmail(
    editing ? draftMassar : massarCode || draftMassar,
  );

  const massarReady = (massarCode || draftMassar).replace(/\s/g, '').length >= 5;
  const openDisabled = !massarReady;

  const handleConfirm = async () => {
    const ok = await onConfirmMassar(draftMassar);
    if (ok) {
      setSavedFlash(true);
      setEditing(false);
    }
  };

  const openExternal = () => {
    const url = channel === 'outlook' ? BAC_OUTLOOK_CHECK_URL : BAC_MEN_GOV_URL;
    void Linking.openURL(url).catch(() => {});
  };

  const copyOutlookEmail = () => {
    const email = outlookEmailPreview.trim();
    if (!email) return;
    void Clipboard.setString(email);
    Alert.alert('', t('shopThankCopied'));
  };

  if (!mounted || !channel) return null;

  return (
    <PlatformSheetOverlay visible={visible} keepMounted={mounted} onRequestClose={onClose}>
      <View style={styles.root}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]} pointerEvents="none" />
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel={t('bacModalClose')} />

        <Animated.View style={[styles.sheet, sheetStyle, { height: sheetHeight }]}>
          <View style={styles.sheetChrome}>
            <View style={styles.handle} />
            <View style={[styles.header, isRTL && styles.headerRtl]}>
              <View style={[styles.channelBadge, { backgroundColor: `${channelAccent}18` }]}>
                <FontAwesome name={channelIcon} size={18} color={channelAccent} />
              </View>
              <View style={styles.headerText}>
                <Text style={[styles.title, isRTL && styles.rtlText]} numberOfLines={2}>
                  {t(titleKey)}
                </Text>
                <Text style={[styles.subtitle, isRTL && styles.rtlText]} numberOfLines={2}>
                  {channel === 'outlook' ? t('bacOutletOutlook') : t('bacOutletMenResults')}
                </Text>
              </View>
              <Pressable
                onPress={onClose}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel={t('bacModalClose')}
                style={({ pressed }) => [styles.closeBtn, pressed && styles.pressed]}>
                <FontAwesome name="times" size={16} color={brand.textMuted} />
              </Pressable>
            </View>
          </View>

          <KeyboardAvoidingView
            style={styles.scrollHost}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={insets.top + 24}>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator
              nestedScrollEnabled
              bounces>
              <View style={styles.massarCard}>
                <View style={[styles.sectionHead, isRTL && styles.rowRtl]}>
                  <FontAwesome name="id-card-o" size={14} color={brand.primary} />
                  <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>{t('bacMassarSectionTitle')}</Text>
                </View>
                <Text style={[styles.sectionHint, isRTL && styles.rtlText]}>{t('bacMassarSectionHint')}</Text>

                  {massarLoading ? (
                    <ActivityIndicator color={brand.primary} style={{ marginVertical: spacing.sm }} />
                  ) : editing || !massarCode ? (
                    <TextInput
                      value={draftMassar}
                      onChangeText={(v) => setDraftMassar(v.replace(/\s/g, ''))}
                      placeholder={t('bacMassarPlaceholder')}
                      placeholderTextColor={brand.textMuted}
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="default"
                      style={[styles.input, isRTL && styles.inputRtl]}
                      textAlign={isRTL ? 'right' : 'left'}
                    />
                  ) : (
                    <View style={[styles.massarDisplayRow, isRTL && styles.rowRtl]}>
                      <Text style={styles.massarDisplay}>{massarCode}</Text>
                      {savedFlash ? (
                        <View style={styles.savedBadge}>
                          <FontAwesome name="check" size={10} color={homeShell.greenDark} />
                          <Text style={styles.savedBadgeTxt}>{t('bacMassarSaved')}</Text>
                        </View>
                      ) : null}
                    </View>
                  )}

                  <View style={[styles.massarActions, isRTL && styles.rowRtl]}>
                    {!editing && massarCode ? (
                      <Pressable
                        onPress={() => {
                          setDraftMassar(massarCode);
                          setEditing(true);
                        }}
                        style={({ pressed }) => [styles.btnGhost, pressed && styles.pressed]}>
                        <Text style={styles.btnGhostTxt}>{t('bacMassarEdit')}</Text>
                      </Pressable>
                    ) : null}
                    <Pressable
                      onPress={() => void handleConfirm()}
                      disabled={massarSaving || draftMassar.replace(/\s/g, '').length < 5}
                      style={({ pressed }) => [
                        styles.btnPrimary,
                        (massarSaving || draftMassar.replace(/\s/g, '').length < 5) && styles.btnDisabled,
                        pressed && !massarSaving && styles.pressed,
                      ]}>
                      {massarSaving ? (
                        <ActivityIndicator color={brand.white} size="small" />
                      ) : (
                        <Text style={styles.btnPrimaryTxt}>{t('bacMassarConfirm')}</Text>
                      )}
                    </Pressable>
                  </View>

                  {channel === 'outlook' && outlookEmailPreview ? (
                    <View style={styles.credentialBlock}>
                      <Text style={[styles.credLabel, isRTL && styles.rtlText]}>{t('bacOutlookEmailLabel')}</Text>
                      <View style={[styles.credEmailRow, isRTL && styles.rowRtl]}>
                        <Text style={[styles.credValue, styles.credEmailText, isRTL && styles.rtlText]} selectable>
                          {outlookEmailPreview}
                        </Text>
                        <Pressable
                          onPress={copyOutlookEmail}
                          hitSlop={10}
                          accessibilityRole="button"
                          accessibilityLabel={`${t('shopThankCopy')} — ${outlookEmailPreview}`}
                          style={({ pressed }) => [styles.copyBtn, pressed && styles.pressed]}>
                          <FontAwesome name="copy" size={16} color={brand.primary} />
                        </Pressable>
                      </View>
                      <Text style={[styles.credLabel, isRTL && styles.rtlText, { marginTop: spacing.sm }]}>
                        {t('bacOutlookPasswordLabel')}
                      </Text>
                      <Text style={[styles.credValueMuted, isRTL && styles.rtlText]}>
                        {t('bacOutlookPasswordHint')}
                      </Text>
                    </View>
                  ) : null}
                </View>

              <View style={styles.stepsCard}>
                <View style={[styles.sectionHead, isRTL && styles.rowRtl]}>
                  <FontAwesome name="list-ol" size={14} color={brand.primary} />
                  <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>{t('bacVerifyStepsTitle')}</Text>
                </View>
                {stepKeys.map((key, i) => {
                  let text = t(key);
                  if (key === 'bacOutlookStep2' && outlookEmailPreview) {
                    text = text.replace('{email}', outlookEmailPreview);
                  }
                  return (
                    <StepRow
                      key={key}
                      n={i + 1}
                      text={text}
                      rtl={isRTL}
                      last={i === stepKeys.length - 1}
                    />
                  );
                })}
              </View>
            </ScrollView>
          </KeyboardAvoidingView>

          <View
            style={[
              styles.footer,
              isRTL && styles.footerRtl,
              { paddingBottom: Math.max(insets.bottom, 10) + 4 },
            ]}>
            <Pressable
              onPress={openExternal}
              disabled={openDisabled}
              accessibilityRole="button"
              accessibilityLabel={channel === 'outlook' ? t('bacOpenOutlook') : t('bacOpenMenSite')}
              style={({ pressed }) => [
                styles.btnOpen,
                channel === 'men' ? styles.btnOpenMen : styles.btnOpenOutlook,
                openDisabled && styles.btnDisabled,
                pressed && !openDisabled && styles.btnOpenPressed,
              ]}>
              <FontAwesome name="external-link" size={16} color={brand.white} />
              <Text style={styles.btnOpenTxt}>
                {channel === 'outlook' ? t('bacOpenOutlook') : t('bacOpenMenSite')}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </PlatformSheetOverlay>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  sheet: {
    width: '100%',
    flexDirection: 'column',
    overflow: 'hidden',
    backgroundColor: brand.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 24,
  },
  sheetChrome: {
    flexShrink: 0,
    paddingBottom: spacing.sm,
  },
  scrollHost: {
    flex: 1,
    minHeight: 0,
  },
  scrollView: {
    flex: 1,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  headerRtl: {
    flexDirection: 'row-reverse',
  },
  headerText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  channelBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.06)',
    flexShrink: 0,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: brand.text,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: brand.textMuted,
    lineHeight: 16,
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: spacing.xs,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  massarCard: {
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(51, 62, 143, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(51, 62, 143, 0.1)',
    gap: spacing.sm,
  },
  stepsCard: {
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: brand.backgroundSoft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: brand.text,
  },
  sectionHint: {
    fontSize: fontSize.xs,
    color: brand.textMuted,
    lineHeight: 18,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(51, 62, 143, 0.2)',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: fontSize.md,
    color: brand.text,
    backgroundColor: brand.white,
  },
  inputRtl: {
    writingDirection: 'rtl',
  },
  massarDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  rowRtl: {
    flexDirection: 'row-reverse',
  },
  massarDisplay: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: homeShell.blue,
    fontVariant: ['tabular-nums'],
    letterSpacing: 1,
  },
  savedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
  },
  savedBadgeTxt: {
    fontSize: 10,
    fontWeight: '700',
    color: homeShell.greenDark,
  },
  massarActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  btnGhost: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(51, 62, 143, 0.25)',
  },
  btnGhostTxt: {
    fontWeight: '700',
    color: brand.primary,
    fontSize: fontSize.sm,
  },
  btnPrimary: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    backgroundColor: brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 42,
  },
  btnPrimaryTxt: {
    color: brand.white,
    fontWeight: '800',
    fontSize: fontSize.sm,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.88,
  },
  credentialBlock: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(15, 23, 42, 0.08)',
    gap: 4,
  },
  credLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: brand.textMuted,
    textTransform: 'uppercase',
  },
  credEmailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  credEmailText: {
    flex: 1,
    minWidth: 0,
  },
  copyBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(51, 62, 143, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(51, 62, 143, 0.18)',
    flexShrink: 0,
  },
  credValue: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: homeShell.blue,
  },
  credValueMuted: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: brand.text,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.sm,
  },
  stepRowRtl: {
    flexDirection: 'row-reverse',
  },
  stepRail: {
    alignItems: 'center',
    width: 22,
    flexShrink: 0,
  },
  stepNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLine: {
    width: 2,
    flex: 1,
    minHeight: 10,
    marginTop: 4,
    borderRadius: 1,
    backgroundColor: 'rgba(51, 62, 143, 0.16)',
  },
  stepNumTxt: {
    fontSize: 11,
    fontWeight: '800',
    color: brand.white,
  },
  stepTxt: {
    flex: 1,
    fontSize: fontSize.sm,
    color: brand.text,
    lineHeight: 20,
    paddingBottom: spacing.sm,
  },
  footer: {
    flexShrink: 0,
    paddingTop: spacing.sm,
    paddingHorizontal: 0,
    backgroundColor: brand.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(15, 23, 42, 0.08)',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 8 },
      default: {},
    }),
  },
  footerRtl: {
    direction: 'rtl',
  },
  btnOpen: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    minHeight: 52,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
  },
  btnOpenOutlook: {
    backgroundColor: brand.primary,
  },
  btnOpenMen: {
    backgroundColor: homeShell.greenDark,
  },
  btnOpenPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  btnOpenTxt: {
    fontWeight: '800',
    fontSize: fontSize.md,
    color: brand.white,
  },
});
