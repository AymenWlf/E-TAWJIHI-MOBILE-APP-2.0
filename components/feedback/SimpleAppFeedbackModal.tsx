import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
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

import { KeyboardAwareBottomSpacer } from '@/components/ui/KeyboardAwareBottomSpacer';
import { PlatformSheetOverlay } from '@/components/ui/PlatformSheetOverlay';
import { Text } from '@/components/ui/Text';
import { openStoreReviewPage } from '@/constants/mobileAppStores';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { submitSimpleAppFeedback } from '@/services/simpleAppFeedback';
import { classifyApiError, getUserFacingApiError } from '@/utils/apiError';
import { markSimpleFeedbackSubmitted } from '@/utils/simpleAppFeedbackStorage';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';

const SHEET_SLIDE_MS = 320;
const STAR_COUNT = 5;

type Props = {
  visible: boolean;
  onClose: () => void;
  isCommercialClient: boolean;
  onSubmitted?: () => void;
  onDismiss?: () => void;
};

function StarRating({
  value,
  onChange,
  isRTL,
  label,
}: {
  value: number | null;
  onChange: (n: number) => void;
  isRTL: boolean;
  label: string;
}) {
  return (
    <View style={styles.starsWrap} accessibilityLabel={label}>
      <View style={[styles.starsRow, isRTL && styles.rowRtl]}>
        {Array.from({ length: STAR_COUNT }, (_, i) => {
          const star = i + 1;
          const filled = value != null && star <= value;
          return (
            <Pressable
              key={star}
              onPress={() => onChange(star)}
              accessibilityRole="button"
              accessibilityLabel={`${star} / ${STAR_COUNT}`}
              style={({ pressed }) => [styles.starBtn, pressed && { opacity: 0.85 }]}>
              <FontAwesome
                name={filled ? 'star' : 'star-o'}
                size={34}
                color={filled ? '#F59E0B' : '#CBD5E1'}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function SimpleAppFeedbackModal({
  visible,
  onClose,
  isCommercialClient,
  onSubmitted,
  onDismiss,
}: Props) {
  const insets = useSafeAreaInsets();
  const { t, isRTL, locale } = useLocale();
  const { getValidAccessToken, user } = useAuth();

  const [mounted, setMounted] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [thanks, setThanks] = useState(false);
  const [storeReviewPrompt, setStoreReviewPrompt] = useState(false);

  const backdropOpacity = useSharedValue(0);
  const sheetTranslateY = useSharedValue(520);

  const resetForm = useCallback(() => {
    setRating(null);
    setComment('');
    setSubmitting(false);
    setThanks(false);
    setStoreReviewPrompt(false);
  }, []);

  useEffect(() => {
    if (visible) {
      resetForm();
      setMounted(true);
      backdropOpacity.value = withTiming(1, { duration: SHEET_SLIDE_MS, easing: Easing.out(Easing.cubic) });
      sheetTranslateY.value = withTiming(0, { duration: SHEET_SLIDE_MS, easing: Easing.out(Easing.cubic) });
      return;
    }
    backdropOpacity.value = withTiming(0, { duration: 220 });
    sheetTranslateY.value = withTiming(
      520,
      { duration: 260, easing: Easing.in(Easing.cubic) },
      (finished) => {
        if (finished) runOnJS(setMounted)(false);
      },
    );
  }, [visible, backdropOpacity, sheetTranslateY, resetForm]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdropOpacity.value }));
  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: sheetTranslateY.value }] }));

  const handleClose = useCallback(() => {
    if (submitting) return;
    onClose();
  }, [onClose, submitting]);

  const handleLater = useCallback(() => {
    if (submitting) return;
    onDismiss?.();
    onClose();
  }, [onClose, onDismiss, submitting]);

  const handleSubmit = useCallback(async () => {
    if (rating == null || rating < 1) {
      Alert.alert(t('appFeedbackSimpleTitle'), t('appFeedbackSimpleRatingRequired'));
      return;
    }
    const trimmedComment = comment.trim();
    if (trimmedComment.length === 0) {
      Alert.alert(t('appFeedbackSimpleTitle'), t('appFeedbackSimpleCommentRequired'));
      return;
    }
    const token = await getValidAccessToken();
    if (!token) {
      Alert.alert(t('appFeedbackSimpleTitle'), t('appFeedbackLoginRequired'));
      return;
    }

    setSubmitting(true);
    try {
      await submitSimpleAppFeedback(token, {
        rating,
        comment: trimmedComment,
        locale,
        audience: isCommercialClient ? 'client' : 'visitor',
      });
      if (user?.id) {
        await markSimpleFeedbackSubmitted(user.id);
      }
      onSubmitted?.();
      if (rating === STAR_COUNT && Platform.OS !== 'web') {
        setStoreReviewPrompt(true);
        return;
      }
      setThanks(true);
      setTimeout(() => {
        onClose();
      }, 1400);
    } catch (e) {
      if (classifyApiError(e) === 'conflict' && user?.id) {
        await markSimpleFeedbackSubmitted(user.id);
      }
      Alert.alert(t('appFeedbackSimpleTitle'), getUserFacingApiError(e, t, { context: 'feedback' }));
    } finally {
      setSubmitting(false);
    }
  }, [rating, comment, getValidAccessToken, t, locale, isCommercialClient, onSubmitted, onClose, user?.id]);

  const storeReviewCta =
    Platform.OS === 'ios'
      ? t('appFeedbackSimpleStoreCtaIos')
      : t('appFeedbackSimpleStoreCtaAndroid');

  const handleOpenStoreReview = useCallback(() => {
    void openStoreReviewPage().finally(() => {
      onClose();
    });
  }, [onClose]);

  const showPostSubmit = thanks || storeReviewPrompt;
  const canSubmit = rating != null && rating >= 1 && comment.trim().length > 0 && !submitting;

  const intro = isCommercialClient
    ? t('appFeedbackSimpleIntroClient')
    : t('appFeedbackSimpleIntroGuest');

  if (!mounted) return null;

  return (
    <PlatformSheetOverlay visible={visible || submitting} keepMounted={mounted} onRequestClose={handleClose}>
      <View style={styles.overlayRoot} pointerEvents="box-none">
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} accessibilityLabel={t('closeOverlayA11y')} />
        </Animated.View>

        <Animated.View
          style={[styles.sheet, sheetStyle, isRTL && styles.sheetRtl, { paddingBottom: insets.bottom + spacing.md }]}
          accessibilityViewIsModal>
          <View style={styles.handleWrap}>
            <View style={styles.handle} />
          </View>

          <View style={[styles.header, isRTL && styles.rowRtl]}>
            <View style={styles.headerIcon}>
              <FontAwesome
                name={storeReviewPrompt ? 'external-link' : showPostSubmit ? 'check' : 'star'}
                size={18}
                color={showPostSubmit ? homeShell.greenDark : brand.primary}
              />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={[styles.eyebrow, isRTL && styles.rtl]}>{t('appFeedbackSimpleEyebrow')}</Text>
              <Text style={[styles.title, isRTL && styles.rtl]}>
                {storeReviewPrompt
                  ? t('appFeedbackSimpleStoreTitle')
                  : showPostSubmit
                    ? t('appFeedbackSimpleThanks')
                    : t('appFeedbackSimpleTitle')}
              </Text>
              <Text style={[styles.subtitle, isRTL && styles.rtl]}>
                {storeReviewPrompt
                  ? t('appFeedbackSimpleStoreSub')
                  : showPostSubmit
                    ? t('appFeedbackSimpleThanksSub')
                    : intro}
              </Text>
            </View>
            {!showPostSubmit ? (
              <Pressable onPress={handleClose} hitSlop={10} accessibilityLabel={t('modalClose')}>
                <FontAwesome name="times" size={16} color={brand.textMuted} />
              </Pressable>
            ) : null}
          </View>

          {storeReviewPrompt ? (
            <View style={[styles.actions, isRTL && styles.rowRtl]}>
              <Pressable
                onPress={onClose}
                style={({ pressed }) => [styles.laterBtn, pressed && { opacity: 0.88 }]}>
                <Text style={styles.laterBtnTxt}>{t('appFeedbackSimpleLater')}</Text>
              </Pressable>
              <Pressable
                onPress={handleOpenStoreReview}
                style={({ pressed }) => [
                  styles.submitBtn,
                  isRTL && styles.rowRtl,
                  pressed && { opacity: 0.9 },
                ]}>
                <FontAwesome name="star" size={13} color={brand.white} />
                <Text style={styles.submitBtnTxt}>{storeReviewCta}</Text>
              </Pressable>
            </View>
          ) : !showPostSubmit ? (
            <>
              <Text style={[styles.starsLabel, isRTL && styles.rtl]}>{t('appFeedbackSimpleStarsLabel')}</Text>
              <StarRating
                value={rating}
                onChange={setRating}
                isRTL={isRTL}
                label={t('appFeedbackSimpleStarsLabel')}
              />

              <Text style={[styles.commentLabel, isRTL && styles.rtl]}>{t('appFeedbackSimpleCommentLabel')}</Text>
              <TextInput
                value={comment}
                onChangeText={setComment}
                placeholder={t('appFeedbackSimpleCommentPh')}
                placeholderTextColor={brand.textMuted}
                multiline
                textAlignVertical="top"
                style={[styles.commentInput, isRTL && styles.commentInputRtl]}
                maxLength={1200}
              />

              <View style={[styles.actions, isRTL && styles.rowRtl]}>
                <Pressable
                  onPress={handleLater}
                  disabled={submitting}
                  style={({ pressed }) => [styles.laterBtn, pressed && { opacity: 0.88 }]}>
                  <Text style={styles.laterBtnTxt}>{t('appFeedbackSimpleLater')}</Text>
                </Pressable>
                <Pressable
                  onPress={() => void handleSubmit()}
                  disabled={!canSubmit}
                  style={({ pressed }) => [
                    styles.submitBtn,
                    isRTL && styles.rowRtl,
                    !canSubmit && styles.submitBtnDisabled,
                    pressed && canSubmit && { opacity: 0.9 },
                  ]}>
                  {submitting ? (
                    <ActivityIndicator size="small" color={brand.white} />
                  ) : (
                    <FontAwesome name="send" size={13} color={brand.white} />
                  )}
                  <Text style={styles.submitBtnTxt}>{t('appFeedbackSimpleSubmit')}</Text>
                </Pressable>
              </View>
              <KeyboardAwareBottomSpacer />
            </>
          ) : null}
        </Animated.View>
      </View>
    </PlatformSheetOverlay>
  );
}

const styles = StyleSheet.create({
  overlayRoot: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15,23,42,0.45)' },
  sheet: {
    backgroundColor: brand.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    maxHeight: '88%',
  },
  sheetRtl: { direction: 'rtl' },
  handleWrap: { alignItems: 'center', paddingVertical: spacing.sm },
  handle: { width: 40, height: 4, borderRadius: 999, backgroundColor: '#E2E8F0' },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, marginBottom: spacing.md },
  rowRtl: { flexDirection: 'row-reverse' },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: 'rgba(51,62,143,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: { fontSize: fontSize.xs, fontWeight: '800', color: brand.primary, marginBottom: 2 },
  title: { fontSize: fontSize.lg, fontWeight: '900', color: brand.text },
  subtitle: { marginTop: 4, fontSize: fontSize.sm, color: brand.textMuted, lineHeight: 20 },
  rtl: { writingDirection: 'rtl', textAlign: 'right' },
  starsLabel: { fontSize: fontSize.sm, fontWeight: '800', color: brand.text, marginBottom: spacing.sm },
  starsWrap: { marginBottom: spacing.md },
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm },
  starBtn: { padding: 4 },
  commentLabel: { fontSize: fontSize.sm, fontWeight: '800', color: brand.text, marginBottom: spacing.xs },
  commentInput: {
    minHeight: 96,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.sm,
    color: brand.text,
    backgroundColor: '#F8FAFC',
    marginBottom: spacing.lg,
  },
  commentInputRtl: { textAlign: 'right' },
  actions: { flexDirection: 'row', gap: spacing.sm },
  laterBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
    backgroundColor: brand.white,
  },
  laterBtnTxt: { fontSize: fontSize.sm, fontWeight: '800', color: brand.textMuted },
  submitBtn: {
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: radius.lg,
    backgroundColor: brand.primary,
  },
  submitBtnDisabled: {
    opacity: 0.45,
  },
  submitBtnTxt: { fontSize: fontSize.sm, fontWeight: '800', color: brand.white },
});
