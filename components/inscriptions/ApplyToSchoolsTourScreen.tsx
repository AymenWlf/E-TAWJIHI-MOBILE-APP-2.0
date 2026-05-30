import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnnouncementCard } from '@/components/inscriptions/AnnouncementCard';
import { ApplyToSchoolsTourTracker } from '@/components/inscriptions/ApplyToSchoolsTourTracker';
import { FollowedSchoolCard } from '@/components/inscriptions/FollowedSchoolCard';
import {
  InscriptionsCandidaciesFilterTourPreview,
  InscriptionsTabsTourPreview,
  InscriptionsTourPanel,
  InscriptionsTourShell,
  TOUR_DEMO_INSCRIPTIONS_TAB_ACTIVE_COUNT,
  TOUR_DEMO_INSCRIPTIONS_TAB_ATTENTION_COUNT,
  type InscriptionsTourTabId,
} from '@/components/inscriptions/InscriptionsTabsTourPreview';
import { NotificationCard } from '@/components/inscriptions/NotificationCard';
import { StatusUpdateSheet } from '@/components/inscriptions/StatusUpdateSheet';
import { TourEstablishmentHeader } from '@/components/inscriptions/TourEstablishmentHeader';
import { TourFocusWrap } from '@/components/inscriptions/TourFocusWrap';
import { Text } from '@/components/ui/Text';
import {
  APPLY_TO_SCHOOLS_TOUR_STEPS,
  type ApplyToSchoolsTourStepId,
} from '@/constants/applyToSchoolsTour';
import type { HomeCopyKey } from '@/constants/i18n';
import { PLAN_PARCOURS_MOBILE_STEP_KEYS } from '@/constants/orientationParcours';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { useTawjihPlusAccessContext } from '@/contexts/TawjihPlusAccessContext';
import { TawjihPlusUpgradeCta } from '@/components/inscriptions/TawjihPlusPaywall';
import { useApplyToSchoolsTourFgsesData } from '@/hooks/useApplyToSchoolsTourFgsesData';
import {
  formatApplyTourCopy,
  pickTourCandidacyCardSheetStatuses,
  pickTourStatusActionSheetStatuses,
  tourSchoolShortLabel,
} from '@/utils/applyToSchoolsTourData';
import { presentApplyTourDemoPush } from '@/services/pushNotifications';
import { completePlanParcoursStep } from '@/services/planParcoursStepComplete';
import { notificationMessage, notificationTitle } from '@/utils/notificationDisplay';
import {
  getAnnouncementCardTourFocus,
  getAnnouncementCardTourGate,
  getFollowedSchoolCardTourGate,
  isFooterPrimaryAllowed,
  isStepActionComplete,
  isLearnContinueStep,
  shouldMarkContinueOnPrimary,
  shouldPulseAnnouncementCardTourFocus,
  shouldPulseFooterContinue,
  type ApplyToSchoolsTourProgressState,
} from '@/utils/applyToSchoolsTourProgress';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import type { CandidacyStatusType } from '@/types/inscriptions';

function stepTitleKey(step: ApplyToSchoolsTourStepId): HomeCopyKey {
  return `applySchoolsTourStep_${step}_title` as HomeCopyKey;
}

function stepBodyKey(step: ApplyToSchoolsTourStepId): HomeCopyKey {
  return `applySchoolsTourStep_${step}_body` as HomeCopyKey;
}

export function ApplyToSchoolsTourScreen() {
  const { t, isRTL, locale } = useLocale();
  const { getValidAccessToken } = useAuth();
  const {
    isInscriptionsAccessPending,
    isInscriptionsLocked,
    openTawjihPlusProduct,
  } = useTawjihPlusAccessContext();
  const insets = useSafeAreaInsets();
  const {
    announcement: tourAnnouncement,
    pushNotification: tourPushNotification,
    defaultStatus: tourDefaultStatus,
    availableStatuses: tourAvailableStatuses,
    buildDemoFollow,
    loading: tourDataLoading,
  } = useApplyToSchoolsTourFgsesData();

  const [stepIndex, setStepIndex] = useState(0);
  const [demoFollowed, setDemoFollowed] = useState(false);
  const [demoStatus, setDemoStatus] = useState<CandidacyStatusType | null>(null);
  const [statusSheetOpen, setStatusSheetOpen] = useState(false);
  const [completedActions, setCompletedActions] = useState<Set<ApplyToSchoolsTourStepId>>(
    () => new Set(),
  );
  const [demoInscriptionsTab, setDemoInscriptionsTab] =
    useState<InscriptionsTourTabId>('announcements');
  const [demoAttentionFilter, setDemoAttentionFilter] = useState<'all' | 'action_required'>('all');

  const step = APPLY_TO_SCHOOLS_TOUR_STEPS[stepIndex];
  const isLast = stepIndex >= APPLY_TO_SCHOOLS_TOUR_STEPS.length - 1;

  const tourProgress = useMemo<ApplyToSchoolsTourProgressState>(
    () => ({
      stepIndex,
      demoFollowed,
      demoStatus,
      completedActions,
    }),
    [stepIndex, demoFollowed, demoStatus, completedActions],
  );

  const currentActionDone = isStepActionComplete(step, tourProgress);
  const footerPrimaryAllowed = isFooterPrimaryAllowed(step, tourProgress);
  const announcementTourGate = getAnnouncementCardTourGate(step);
  const followedSchoolTourGate = getFollowedSchoolCardTourGate(step);

  const markStepActionDone = useCallback((stepId: ApplyToSchoolsTourStepId) => {
    setCompletedActions((prev) => {
      if (prev.has(stepId)) return prev;
      const next = new Set(prev);
      next.add(stepId);
      return next;
    });
  }, []);
  const focusTapLabel = t('applySchoolsTourFocusTap');
  const focusLearnLabel = t('applySchoolsTourFocusLearn');

  const pushTranslateY = useSharedValue(-24);
  const pushOpacity = useSharedValue(0);

  useEffect(() => {
    if (step !== 'push_preview') {
      pushTranslateY.value = -24;
      pushOpacity.value = 0;
      return;
    }
    pushTranslateY.value = -24;
    pushOpacity.value = 0;
    pushOpacity.value = withDelay(80, withTiming(1, { duration: 280 }));
    pushTranslateY.value = withDelay(
      80,
      withTiming(0, { duration: 420, easing: Easing.out(Easing.cubic) }),
    );
  }, [step, pushTranslateY, pushOpacity]);

  useEffect(() => {
    setDemoFollowed(false);
    setDemoStatus(null);
  }, [tourAnnouncement.id]);

  useEffect(() => {
    if (step === 'follow_action') {
      setDemoFollowed(false);
      setDemoStatus(null);
    }
    if (step === 'status_action') {
      setDemoFollowed(true);
      setDemoStatus(null);
    }
    if (step === 'inscriptions_tabs') {
      setDemoInscriptionsTab('announcements');
      setDemoAttentionFilter('all');
    }
    if (step === 'candidacies_tab') {
      setDemoInscriptionsTab('announcements');
      setDemoAttentionFilter('all');
    }
    if (step === 'candidacy_card' || step === 'bravo') {
      setDemoInscriptionsTab('candidacies');
      setDemoAttentionFilter('action_required');
    }
  }, [step]);

  const pushBannerStyle = useAnimatedStyle(() => ({
    opacity: pushOpacity.value,
    transform: [{ translateY: pushTranslateY.value }],
  }));

  const statusActionSheetStatuses = useMemo(
    () => pickTourStatusActionSheetStatuses(tourAvailableStatuses),
    [tourAvailableStatuses],
  );

  const candidacyCardSheetStatuses = useMemo(
    () => pickTourCandidacyCardSheetStatuses(tourAvailableStatuses),
    [tourAvailableStatuses],
  );

  const tourSheetStatuses = useMemo(() => {
    if (step === 'status_action') return statusActionSheetStatuses;
    if (step === 'candidacy_card') return candidacyCardSheetStatuses;
    return tourAvailableStatuses;
  }, [step, statusActionSheetStatuses, candidacyCardSheetStatuses, tourAvailableStatuses]);

  const demoFollow = useMemo(
    () => buildDemoFollow(demoStatus ?? tourDefaultStatus),
    [buildDemoFollow, demoStatus, tourDefaultStatus],
  );

  const tourSchoolLabel = useMemo(
    () => tourSchoolShortLabel(tourAnnouncement.establishment, locale),
    [tourAnnouncement.establishment, locale],
  );

  const stepTitleDisplay = useMemo(
    () => formatApplyTourCopy(t(stepTitleKey(step)), tourSchoolLabel, { rtl: isRTL }),
    [step, t, tourSchoolLabel, isRTL],
  );

  const stepBodyDisplay = useMemo(
    () => formatApplyTourCopy(t(stepBodyKey(step)), tourSchoolLabel, { rtl: isRTL }),
    [step, t, tourSchoolLabel, isRTL],
  );

  const teaseSchoolLabel = tourSchoolLabel;

  const pushTitleDisplay = notificationTitle(tourPushNotification, locale);
  const pushMessageDisplay = notificationMessage(tourPushNotification, locale);

  const handleClose = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)/inscriptions' as never);
  }, []);

  const stepIndexRef = useRef(stepIndex);
  stepIndexRef.current = stepIndex;

  const goNext = useCallback(async () => {
    if (stepIndexRef.current >= APPLY_TO_SCHOOLS_TOUR_STEPS.length - 1) {
      const token = await getValidAccessToken();
      if (token) {
        await completePlanParcoursStep(token, PLAN_PARCOURS_MOBILE_STEP_KEYS.applyToSchools);
      }
      router.replace('/inscriptions?tab=announcements' as never);
      return;
    }
    setStepIndex((i) => Math.min(i + 1, APPLY_TO_SCHOOLS_TOUR_STEPS.length - 1));
  }, [getValidAccessToken]);

  const goBack = useCallback(() => {
    setStepIndex((i) => Math.max(0, i - 1));
  }, []);

  const showPushFromTease = useCallback(() => {
    void presentApplyTourDemoPush({
      title: pushTitleDisplay,
      body: pushMessageDisplay,
    });
    markStepActionDone('notification_tease');
    setStepIndex(APPLY_TO_SCHOOLS_TOUR_STEPS.indexOf('push_preview'));
  }, [markStepActionDone, pushTitleDisplay, pushMessageDisplay]);

  const handleSelectInscriptionsTab = useCallback(
    (tab: InscriptionsTourTabId) => {
      setDemoInscriptionsTab(tab);
      if (step === 'candidacies_tab' && tab === 'candidacies') {
        setDemoAttentionFilter('action_required');
        markStepActionDone('candidacies_tab');
      }
    },
    [step, markStepActionDone],
  );

  const primaryLabel = useMemo(() => {
    if (isLast) return t('applySchoolsTourGoInscriptions');
    return t('applySchoolsTourNext');
  }, [isLast, t]);

  const handlePrimary = useCallback(() => {
    if (!footerPrimaryAllowed) return;

    if (shouldMarkContinueOnPrimary(step) || isLearnContinueStep(step)) {
      markStepActionDone(step);
    }
    if (step === 'follow_action' && demoFollowed) {
      markStepActionDone('follow_action');
    }
    if (step === 'status_action' && demoStatus != null) {
      markStepActionDone('status_action');
    }

    goNext();
  }, [footerPrimaryAllowed, step, demoFollowed, demoStatus, markStepActionDone, goNext]);

  const handleDemoFollow = useCallback(() => {
    if (step !== 'follow_action' || demoFollowed) return;
    setDemoFollowed(true);
  }, [step, demoFollowed]);

  const handleDemoOpenRegistrationLink = useCallback(() => {
    if (step !== 'registration_link' || currentActionDone) return;
    markStepActionDone('registration_link');
  }, [step, currentActionDone, markStepActionDone]);

  const handleDemoUpdateStatus = useCallback(() => {
    if (step !== 'status_action' && step !== 'candidacy_card') return;
    setStatusSheetOpen(true);
  }, [step]);

  useEffect(() => {
    if (step !== 'candidacy_card') return;
    const applied =
      tourAvailableStatuses.find((s) => s.code === 'applied') ??
      tourAvailableStatuses.find((s) => s.code === 'interested') ??
      tourDefaultStatus;
    if (applied) setDemoStatus(applied);
  }, [step, tourAvailableStatuses, tourDefaultStatus]);

  const showFooterPrimary =
    step === 'notification_tease'
      ? false
      : step === 'candidacies_tab'
        ? currentActionDone
        : true;

  const announcementCardTourFocus = getAnnouncementCardTourFocus(step, currentActionDone);
  const announcementCardTourPulse = shouldPulseAnnouncementCardTourFocus(
    step,
    currentActionDone,
  );

  const footerFocusPulse = shouldPulseFooterContinue(
    step,
    footerPrimaryAllowed,
    currentActionDone,
    isLast,
  );
  const footerFocusLabel = isLearnContinueStep(step) ? focusLearnLabel : focusTapLabel;
  const footerFocusActive = showFooterPrimary && footerFocusPulse;

  if (isInscriptionsLocked) {
    return (
      <View style={[styles.root, isRTL && styles.rootRtl]}>
        <View style={[styles.hero, { paddingTop: insets.top + spacing.sm }]}>
          <View style={styles.heroTop}>
            <Pressable onPress={handleClose} hitSlop={10} style={styles.heroBack}>
              <FontAwesome
                name={isRTL ? 'chevron-right' : 'chevron-left'}
                size={18}
                color={homeShell.text}
              />
            </Pressable>
          </View>
        </View>
        <View style={styles.plusLockBody}>
          <FontAwesome name="lock" size={28} color={brand.primary} />
          <Text style={[styles.plusLockTitle, isRTL && styles.rtlText]}>{t('inscTawjihPlusLockTitle')}</Text>
          <Text style={[styles.plusLockHint, isRTL && styles.rtlText]}>{t('inscTawjihPlusLockHint')}</Text>
          <TawjihPlusUpgradeCta onPress={openTawjihPlusProduct} style={styles.plusLockCta} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, isRTL && styles.rootRtl]}>
      <View style={[styles.hero, { paddingTop: insets.top + spacing.sm }]}>
        <View style={styles.heroTop}>
          <Pressable
            onPress={handleClose}
            hitSlop={10}
            style={({ pressed }) => [styles.heroBack, pressed && { opacity: 0.85 }]}
            accessibilityRole="button"
            accessibilityLabel={t('modalClose')}>
            <FontAwesome
              name={isRTL ? 'chevron-right' : 'chevron-left'}
              size={18}
              color={homeShell.text}
            />
          </Pressable>
          <View style={[styles.heroTitles, isRTL && styles.heroTitlesRtl]}>
            <Text style={[styles.heroEyebrow, isRTL && styles.heroTxtRtl]}>
              {t('applySchoolsTourEyebrow')}
            </Text>
            <Text style={[styles.heroTitle, isRTL && styles.heroTxtRtl]} numberOfLines={2}>
              {t('applySchoolsTourTitle')}
            </Text>
          </View>
          <View style={styles.heroIcon}>
            <FontAwesome name="graduation-cap" size={16} color={homeShell.text} />
          </View>
        </View>
        <View style={[styles.progressRow, isRTL && styles.progressRowRtl]}>
          {APPLY_TO_SCHOOLS_TOUR_STEPS.map((id, idx) => (
            <View
              key={id}
              style={[
                styles.progressDot,
                idx <= stepIndex && styles.progressDotActive,
                idx === stepIndex && styles.progressDotCurrent,
              ]}
            />
          ))}
        </View>
      </View>

      <View style={[styles.body, isRTL && styles.bodyRtl]}>
      <ScrollView
        style={[styles.scroll, isRTL && styles.scrollRtl]}
        contentContainerStyle={[styles.scrollContent, isRTL && styles.scrollContentRtl]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <TourEstablishmentHeader establishment={tourAnnouncement.establishment} />

        <View style={[styles.stepBlock, isRTL && styles.stepBlockRtl]}>
          <Text style={[styles.stepTitle, isRTL && styles.stepTitleRtl]}>{stepTitleDisplay}</Text>
          <Text style={[styles.stepBody, isRTL && styles.stepBodyRtl]}>{stepBodyDisplay}</Text>
        </View>

        <ApplyToSchoolsTourTracker step={step} stepIndex={stepIndex} progress={tourProgress} />

        {step === 'notification_tease' ? (
          <TourFocusWrap
            active={!currentActionDone}
            pulse={!currentActionDone}
            label={focusTapLabel}>
            <Pressable
              onPress={showPushFromTease}
              disabled={currentActionDone}
              style={({ pressed }) => [styles.teaseCard, pressed && { opacity: 0.92 }]}>
              <View style={[styles.teaseRow, isRTL && styles.dirRtl]}>
                <View style={styles.teaseSchoolWrap}>
                  <TourEstablishmentHeader
                    establishment={tourAnnouncement.establishment}
                    compact
                  />
                </View>
                <FontAwesome
                  name={isRTL ? 'chevron-left' : 'chevron-right'}
                  size={14}
                  color={brand.textMuted}
                />
              </View>
              <Text style={[styles.teaseTitle, isRTL && styles.txtRtl]}>
                {formatApplyTourCopy(t('applySchoolsTourTeaseTitle'), teaseSchoolLabel, { rtl: isRTL })}
              </Text>
              <Text style={[styles.teaseSub, isRTL && styles.txtRtl]}>
                {t('applySchoolsTourTeaseSub')}
              </Text>
            </Pressable>
          </TourFocusWrap>
        ) : null}

        {step === 'push_preview' ? (
          tourDataLoading ? (
            <View style={styles.previewLoading}>
              <ActivityIndicator color={homeShell.green} />
            </View>
          ) : (
            <View style={styles.previewBlock}>
              <Animated.View style={[styles.pushBannerInline, pushBannerStyle]}>
                <TourFocusWrap active pulse={false} label={focusLearnLabel}>
                  <View style={[styles.pushBannerInner, isRTL && styles.dirRtl]}>
                    <View style={styles.pushAppIcon}>
                      <Text style={styles.pushAppIconTxt}>ET</Text>
                    </View>
                    <View style={styles.pushTexts}>
                      <Text style={[styles.pushTitle, isRTL && styles.txtRtl]} numberOfLines={1}>
                        {pushTitleDisplay}
                      </Text>
                      <Text style={[styles.pushMessage, isRTL && styles.txtRtl]} numberOfLines={2}>
                        {pushMessageDisplay}
                      </Text>
                    </View>
                    <Text style={[styles.pushTime, isRTL && styles.txtRtl]}>
                      {isRTL
                        ? tourPushNotification.timeAgoAr ?? tourPushNotification.timeAgo
                        : tourPushNotification.timeAgo}
                    </Text>
                  </View>
                </TourFocusWrap>
              </Animated.View>
              <TourFocusWrap active pulse={false} label={focusLearnLabel}>
                <NotificationCard notif={tourPushNotification} interactive={false} />
              </TourFocusWrap>
            </View>
          )
        ) : null}

        {(step === 'announcement_card' ||
          step === 'registration_link' ||
          step === 'follow_action' ||
          step === 'status_action') ? (
          tourDataLoading ? (
            <View style={styles.previewLoading}>
              <ActivityIndicator color={homeShell.green} />
            </View>
          ) : (
            <View style={styles.previewBlock}>
              <View style={styles.cardHighlight}>
                <AnnouncementCard
                  item={tourAnnouncement}
                  isFollowed={demoFollowed}
                  onToggleFollow={handleDemoFollow}
                  onOpenLink={handleDemoOpenRegistrationLink}
                  currentStatus={demoStatus ?? (demoFollowed ? tourDefaultStatus : null)}
                  onUpdateStatus={handleDemoUpdateStatus}
                  showDiagnosticBadge={false}
                  tourGate={announcementTourGate}
                  tourFocus={announcementCardTourFocus}
                  tourFocusLabel={
                    step === 'announcement_card'
                      ? focusLearnLabel
                      : announcementCardTourFocus
                        ? focusTapLabel
                        : undefined
                  }
                  tourFocusPulse={announcementCardTourPulse}
                />
              </View>
              {step === 'registration_link' ? (
                <View style={[styles.tourHintCard, isRTL && styles.dirRtl]}>
                  <FontAwesome name="info-circle" size={14} color={brand.primary} />
                  <Text style={[styles.tourHintTxt, isRTL && styles.txtRtl]}>
                    {t('applySchoolsTourRegistrationLinkHint')}
                  </Text>
                </View>
              ) : null}
            </View>
          )
        ) : null}

        {step === 'inscriptions_tabs' || step === 'candidacies_tab' ? (
          <View style={[styles.inscTourWrap, isRTL && styles.dirRtl]}>
            <InscriptionsTourShell compactHero={step === 'candidacies_tab'}>
              <InscriptionsTabsTourPreview
                activeTab={demoInscriptionsTab}
                activeCandidaciesCount={TOUR_DEMO_INSCRIPTIONS_TAB_ACTIVE_COUNT}
                attentionCount={TOUR_DEMO_INSCRIPTIONS_TAB_ATTENTION_COUNT}
                onSelectTab={handleSelectInscriptionsTab}
                announcementsEnabled={step === 'inscriptions_tabs'}
                candidaciesEnabled={step === 'candidacies_tab'}
                focusCandidaciesTab={step === 'candidacies_tab' && !currentActionDone}
                focusCandidaciesLabel={focusTapLabel}
              />
            </InscriptionsTourShell>
            <InscriptionsTourPanel>
              {step === 'inscriptions_tabs' ? (
                <View style={styles.tabPanelPlaceholder}>
                  <View style={styles.tabPanelIcon}>
                    <FontAwesome name="bullhorn" size={20} color={brand.primary} />
                  </View>
                  <Text style={[styles.tabPanelPlaceholderTitle, isRTL && styles.txtRtl]}>
                    {t('inscTabAnnouncements')}
                  </Text>
                  <Text style={[styles.tabPanelPlaceholderTxt, isRTL && styles.txtRtl]}>
                    {t('applySchoolsTourTabsAnnouncementsPlaceholder')}
                  </Text>
                  <View style={[styles.badgeLegendRow, isRTL && styles.dirRtl]}>
                    <View style={[styles.legendPill, styles.legendPillGreen]}>
                      <Text style={styles.legendPillTxt}>
                        {TOUR_DEMO_INSCRIPTIONS_TAB_ACTIVE_COUNT}
                      </Text>
                    </View>
                    <Text style={[styles.legendPillHint, isRTL && styles.txtRtl]}>
                      {t('inscCandidaciesActiveShort')}
                    </Text>
                    <View style={[styles.legendPill, styles.legendPillRed]}>
                      <Text style={styles.legendPillTxt}>
                        {TOUR_DEMO_INSCRIPTIONS_TAB_ATTENTION_COUNT}
                      </Text>
                    </View>
                    <Text style={[styles.legendPillHint, isRTL && styles.txtRtl]}>
                      {t('inscCandidaciesActionsRequiredShort')}
                    </Text>
                  </View>
                </View>
              ) : demoInscriptionsTab === 'candidacies' ? (
                <>
                  <InscriptionsCandidaciesFilterTourPreview
                    activeCandidaciesCount={TOUR_DEMO_INSCRIPTIONS_TAB_ACTIVE_COUNT}
                    filter={demoAttentionFilter}
                    attentionCount={TOUR_DEMO_INSCRIPTIONS_TAB_ATTENTION_COUNT}
                    onSelectFilter={setDemoAttentionFilter}
                    actionRequiredEnabled
                  />
                  {demoAttentionFilter === 'action_required' && !tourDataLoading ? (
                    <FollowedSchoolCard
                      follow={demoFollow}
                      actionRequired
                      onUpdateStatus={handleDemoUpdateStatus}
                      onOpenLatest={() => {}}
                      tourGate={followedSchoolTourGate}
                      tourSuppressUpdatePulse={step === 'candidacies_tab'}
                      tourFocusStatus={false}
                      tourFocusPulse={false}
                    />
                  ) : null}
                </>
              ) : (
                <View style={styles.tabPanelPlaceholder}>
                  <View style={styles.tabPanelIcon}>
                    <FontAwesome name="hand-pointer-o" size={20} color={brand.primary} />
                  </View>
                  <Text style={[styles.tabPanelPlaceholderTxt, isRTL && styles.txtRtl]}>
                    {t('applySchoolsTourTabsTapCandidaciesHint')}
                  </Text>
                </View>
              )}
            </InscriptionsTourPanel>
          </View>
        ) : null}

        {step === 'candidacy_card' ? (
          tourDataLoading ? (
            <View style={styles.previewLoading}>
              <ActivityIndicator color={homeShell.green} />
            </View>
          ) : (
            <View style={[styles.inscTourWrap, isRTL && styles.dirRtl]}>
              <InscriptionsTourShell compactHero>
                <InscriptionsTabsTourPreview
                  activeTab="candidacies"
                  activeCandidaciesCount={TOUR_DEMO_INSCRIPTIONS_TAB_ACTIVE_COUNT}
                  attentionCount={TOUR_DEMO_INSCRIPTIONS_TAB_ATTENTION_COUNT}
                  onSelectTab={handleSelectInscriptionsTab}
                  announcementsEnabled={false}
                  candidaciesEnabled={false}
                />
              </InscriptionsTourShell>
              <InscriptionsTourPanel>
                <InscriptionsCandidaciesFilterTourPreview
                  activeCandidaciesCount={TOUR_DEMO_INSCRIPTIONS_TAB_ACTIVE_COUNT}
                  filter="action_required"
                  attentionCount={TOUR_DEMO_INSCRIPTIONS_TAB_ATTENTION_COUNT}
                  onSelectFilter={() => {}}
                  actionRequiredEnabled={false}
                />
                <FollowedSchoolCard
                  follow={demoFollow}
                  actionRequired
                  onUpdateStatus={handleDemoUpdateStatus}
                  onOpenLatest={() => {}}
                  tourGate={followedSchoolTourGate}
                  tourFocusStatus={!currentActionDone}
                  tourFocusPulse={!currentActionDone}
                  tourFocusLabel={!currentActionDone ? focusTapLabel : undefined}
                />
              </InscriptionsTourPanel>
            </View>
          )
        ) : null}

        {step === 'bravo' ? (
          <View style={styles.bravoWrap}>
            <View style={styles.bravoIconRing}>
              <View style={styles.bravoIcon}>
                <FontAwesome name="trophy" size={36} color={homeShell.greenDark} />
              </View>
            </View>
            <Text style={[styles.bravoTitle, isRTL && styles.bravoTitleRtl]}>
              {t('applySchoolsTourBravoTitle')}
            </Text>
            <Text style={[styles.bravoSub, isRTL && styles.bravoSubRtl]}>{t('applySchoolsTourBravoSub')}</Text>
          </View>
        ) : null}
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, spacing.md) },
          isRTL && styles.footerRtl,
        ]}>
        {stepIndex > 0 ? (
          <Pressable
            onPress={goBack}
            style={({ pressed }) => [styles.secondaryBtn, pressed && { opacity: 0.85 }]}
            accessibilityRole="button">
            <Text style={[styles.secondaryBtnTxt, isRTL && styles.txtRtl]}>{t('applySchoolsTourBack')}</Text>
          </Pressable>
        ) : (
          <View style={styles.footerSpacer} />
        )}
        {showFooterPrimary ? (
          <View style={styles.footerPrimaryCol}>
            {footerFocusPulse ? (
              <View style={[styles.footerActionChip, isRTL && styles.footerActionChipRtl]}>
                <FontAwesome name="hand-pointer-o" size={12} color={brand.white} />
                <Text style={[styles.footerActionChipTxt, isRTL && styles.txtRtl]}>{footerFocusLabel}</Text>
              </View>
            ) : null}
            <TourFocusWrap
              active={footerFocusActive && footerFocusPulse}
              pulse={footerFocusPulse}
              style={styles.footerBtnFocus}>
              <Pressable
                onPress={handlePrimary}
                disabled={!footerPrimaryAllowed}
                style={({ pressed }) => [
                  styles.primaryBtn,
                  styles.primaryBtnFooter,
                  isRTL && styles.primaryBtnRtl,
                  (!footerPrimaryAllowed || pressed) && {
                    opacity: footerPrimaryAllowed ? 0.92 : 0.45,
                  },
                ]}
                accessibilityRole="button">
                <Text style={[styles.primaryBtnTxt, isRTL && styles.txtRtl]} numberOfLines={1}>
                  {primaryLabel}
                </Text>
                <FontAwesome
                  name={isLast ? (isRTL ? 'arrow-left' : 'arrow-right') : isRTL ? 'arrow-left' : 'arrow-right'}
                  size={14}
                  color={homeShell.text}
                />
              </Pressable>
            </TourFocusWrap>
          </View>
        ) : (
          <View style={styles.footerSpacer} />
        )}
      </View>
      </View>

      <StatusUpdateSheet
        visible={statusSheetOpen}
        currentStatus={demoStatus}
        availableStatuses={tourSheetStatuses}
        showUnavailable={false}
        onClose={() => setStatusSheetOpen(false)}
        onConfirm={(status) => {
          const fallback =
            step === 'status_action'
              ? (statusActionSheetStatuses[0] ?? tourDefaultStatus)
              : step === 'candidacy_card'
                ? (candidacyCardSheetStatuses[0] ?? tourDefaultStatus)
                : tourDefaultStatus;
          setDemoStatus(status ?? fallback);
          setDemoFollowed(true);
          setStatusSheetOpen(false);
          if (step === 'candidacy_card') {
            markStepActionDone('candidacy_card');
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: brand.primary,
  },
  rootRtl: {
    direction: 'rtl',
  },
  hero: {
    backgroundColor: brand.primary,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  heroBack: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  heroTitles: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  heroTitlesRtl: {
    alignItems: 'flex-start',
  },
  heroIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEyebrow: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: homeShell.textMuted,
    letterSpacing: 0.6,
  },
  heroTitle: {
    fontSize: fontSize.xl,
    fontWeight: '900',
    color: homeShell.text,
  },
  heroTxtRtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
    alignSelf: 'stretch',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingTop: spacing.xs,
  },
  progressRowRtl: {
    direction: 'rtl',
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: homeShell.dotInactive,
  },
  progressDotActive: {
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  progressDotCurrent: {
    width: 22,
    backgroundColor: homeShell.green,
  },
  body: {
    flex: 1,
    backgroundColor: brand.backgroundSoft,
  },
  bodyRtl: {
    direction: 'rtl',
    alignItems: 'stretch',
  },
  scroll: {
    flex: 1,
  },
  scrollRtl: {
    direction: 'rtl',
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  scrollContentRtl: {
    direction: 'rtl',
    alignItems: 'stretch',
    width: '100%',
  },
  stepBlock: {
    width: '100%',
    gap: spacing.xs,
  },
  stepBlockRtl: {
    direction: 'rtl',
    width: '100%',
  },
  stepTitle: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: brand.text,
    letterSpacing: -0.2,
    width: '100%',
  },
  stepTitleRtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  stepBody: {
    fontSize: fontSize.sm,
    color: brand.textMuted,
    lineHeight: 21,
    width: '100%',
  },
  stepBodyRtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  dirRtl: {
    direction: 'rtl',
  },
  previewBlock: {
    gap: spacing.sm,
  },
  previewLoading: {
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pushBannerInline: {
    marginBottom: spacing.xs,
  },
  pushBannerInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: brand.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: homeShell.borderOnWhite,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  pushAppIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pushAppIconTxt: {
    color: brand.white,
    fontSize: 11,
    fontWeight: '900',
  },
  pushTexts: {
    flex: 1,
    minWidth: 0,
  },
  pushTitle: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: brand.text,
  },
  pushMessage: {
    marginTop: 2,
    fontSize: fontSize.xs,
    color: brand.textMuted,
    lineHeight: 16,
  },
  pushTime: {
    fontSize: 10,
    color: brand.textMuted,
    fontWeight: '600',
  },
  cardHighlight: {
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  tourHintCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(51, 62, 143, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(51, 62, 143, 0.12)',
  },
  tourHintTxt: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: brand.text,
    lineHeight: 20,
  },
  inscTourWrap: {
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  tabPanelPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  tabPanelIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: brand.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
  },
  tabPanelPlaceholderTitle: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: brand.text,
    textAlign: 'center',
  },
  tabPanelPlaceholderTxt: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: brand.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 320,
  },
  badgeLegendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  legendPill: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendPillGreen: {
    backgroundColor: '#059669',
  },
  legendPillRed: {
    backgroundColor: '#DC2626',
  },
  legendPillTxt: {
    color: brand.white,
    fontSize: 11,
    fontWeight: '800',
  },
  legendPillHint: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: brand.textMuted,
    marginEnd: spacing.sm,
  },
  footerPrimaryCol: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xs,
    alignSelf: 'stretch',
  },
  footerPrimaryColRtl: {
    alignItems: 'flex-end',
  },
  footerActionChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.full,
    backgroundColor: homeShell.green,
  },
  footerActionChipRtl: {
    alignSelf: 'flex-end',
    direction: 'rtl',
  },
  footerActionChipTxt: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: brand.white,
  },
  footerBtnFocus: {
    width: '100%',
  },
  teaseCard: {
    backgroundColor: brand.white,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
    gap: spacing.sm,
  },
  teaseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  teaseSchoolWrap: {
    flex: 1,
    minWidth: 0,
  },
  teaseTitle: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: brand.text,
  },
  teaseSub: {
    marginTop: 2,
    fontSize: fontSize.xs,
    color: brand.textMuted,
  },
  bravoWrap: {
    alignItems: 'center',
    alignSelf: 'center',
    width: '100%',
    paddingVertical: spacing.xxl,
    gap: spacing.md,
  },
  bravoIconRing: {
    alignSelf: 'center',
    padding: spacing.sm,
    borderRadius: 999,
    backgroundColor: homeShell.greenAlpha11,
  },
  bravoIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: brand.white,
    borderWidth: 2,
    borderColor: homeShell.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bravoTitle: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: brand.primary,
    textAlign: 'center',
    width: '100%',
  },
  bravoTitleRtl: {
    writingDirection: 'rtl',
    textAlign: 'center',
  },
  bravoSub: {
    fontSize: fontSize.sm,
    color: brand.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.md,
    width: '100%',
  },
  bravoSubRtl: {
    writingDirection: 'rtl',
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: brand.primary,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.12)',
  },
  footerRtl: {
    direction: 'rtl',
    alignItems: 'stretch',
  },
  footerSpacer: {
    width: 88,
  },
  secondaryBtn: {
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.55)',
  },
  secondaryBtnTxt: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: homeShell.text,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    backgroundColor: homeShell.green,
  },
  primaryBtnFooter: {
    width: '100%',
    minHeight: 48,
  },
  primaryBtnRtl: {
    flexDirection: 'row-reverse',
  },
  primaryBtnTxt: {
    flexShrink: 1,
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: homeShell.text,
  },
  txtRtl: {
    writingDirection: 'rtl',
    textAlign: 'right',
    alignSelf: 'stretch',
  },
  plusLockBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
    backgroundColor: '#F8FAFC',
  },
  plusLockTitle: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: brand.text,
    textAlign: 'center',
  },
  plusLockHint: {
    fontSize: fontSize.sm,
    color: brand.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  plusLockCta: { alignSelf: 'stretch', maxWidth: 320 },
  rtlText: {
    writingDirection: 'rtl',
    textAlign: 'right',
  },
});
