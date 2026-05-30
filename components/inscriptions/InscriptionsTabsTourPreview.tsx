import FontAwesome from '@expo/vector-icons/FontAwesome';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { TourFocusWrap } from '@/components/inscriptions/TourFocusWrap';
import { Text } from '@/components/ui/Text';
import { useLocale } from '@/contexts/LocaleContext';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';

export type InscriptionsTourTabId = 'announcements' | 'candidacies';

type ShellProps = {
  children: ReactNode;
  /** Masque le sous-titre hero (étapes où le corps explique déjà). */
  compactHero?: boolean;
};

/** Bandeau + onglets calqués sur `InscriptionsTabScreen` (hero primary + corps soft). */
export function InscriptionsTourShell({ children, compactHero = false }: ShellProps) {
  const { t, isRTL } = useLocale();

  return (
    <View style={[styles.shell, isRTL && styles.shellRtl]}>
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.heroTitles}>
            <Text style={[styles.heroEyebrow, isRTL && styles.rtl]}>{t('inscEyebrow')}</Text>
            <Text style={[styles.heroTitle, isRTL && styles.rtl]} numberOfLines={2}>
              {t('inscTitle')}
            </Text>
          </View>
          <View style={styles.heroIcon}>
            <FontAwesome name="graduation-cap" size={16} color={brand.white} />
          </View>
        </View>
        {!compactHero ? (
          <Text style={[styles.heroSub, isRTL && styles.rtl]}>{t('inscSubtitle')}</Text>
        ) : null}
        {children}
      </View>
      <View style={styles.bodyGap} />
    </View>
  );
}

type TabsProps = {
  activeTab: InscriptionsTourTabId;
  activeCandidaciesCount: number;
  attentionCount: number;
  onSelectTab: (tab: InscriptionsTourTabId) => void;
  announcementsEnabled?: boolean;
  candidaciesEnabled?: boolean;
  focusCandidaciesTab?: boolean;
  focusCandidaciesLabel?: string;
};

export function InscriptionsTabsTourPreview({
  activeTab,
  activeCandidaciesCount,
  attentionCount,
  onSelectTab,
  announcementsEnabled = true,
  candidaciesEnabled = true,
  focusCandidaciesTab = false,
  focusCandidaciesLabel,
}: TabsProps) {
  const { t, isRTL } = useLocale();
  const showCandidaciesBadge = activeCandidaciesCount > 0 || attentionCount > 0;

  const renderTab = (id: InscriptionsTourTabId) => {
    const active = activeTab === id;
    const enabled = id === 'candidacies' ? candidaciesEnabled : announcementsEnabled;
    const labelKey = id === 'candidacies' ? 'inscTabCandidacies' : 'inscTabAnnouncements';
    const icon: React.ComponentProps<typeof FontAwesome>['name'] =
      id === 'candidacies' ? 'flag-checkered' : 'bullhorn';

    const tabBtn = (
      <Pressable
        onPress={() => {
          if (!enabled) return;
          onSelectTab(id);
        }}
        disabled={!enabled}
        style={({ pressed }) => [
          styles.tab,
          isRTL && styles.tabRtl,
          active && styles.tabActive,
          !enabled && styles.tabDisabled,
          pressed && enabled && !active && { opacity: 0.85 },
        ]}
        accessibilityRole="tab"
        accessibilityState={{ selected: active, disabled: !enabled }}>
        {id === 'candidacies' ? (
          <View style={styles.tabCandidaciesInline}>
            <View style={[styles.tabCandidaciesIconText, isRTL && styles.dirRtl]}>
              <FontAwesome name={icon} size={13} color={active ? brand.primary : brand.white} />
              <Text
                style={[
                  styles.tabTxt,
                  active && styles.tabTxtActive,
                  styles.tabCandidaciesLabel,
                  isRTL && styles.rtl,
                ]}
                numberOfLines={1}>
                {t(labelKey)}
              </Text>
            </View>
            {showCandidaciesBadge ? (
              <View style={[styles.candidaciesTabBadgeWrap, isRTL && styles.dirRtl]}>
                <View style={[styles.tabBadge, styles.tabBadgeCompact, styles.badgeActive]}>
                  <Text style={styles.tabBadgeTxt}>
                    {activeCandidaciesCount > 99 ? '99+' : activeCandidaciesCount}
                  </Text>
                </View>
                {attentionCount > 0 ? (
                  <View style={[styles.tabBadge, styles.tabBadgeCompact, styles.badgeAttention]}>
                    <Text style={styles.tabBadgeTxt}>
                      {attentionCount > 99 ? '99+' : attentionCount}
                    </Text>
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>
        ) : (
          <>
            <FontAwesome name={icon} size={13} color={active ? brand.primary : brand.white} />
            <Text style={[styles.tabTxt, active && styles.tabTxtActive, isRTL && styles.rtl]}>
              {t(labelKey)}
            </Text>
          </>
        )}
      </Pressable>
    );

    if (id === 'candidacies' && focusCandidaciesTab) {
      return (
        <TourFocusWrap
          key={id}
          active
          pulse
          label={focusCandidaciesLabel}
          fill
          style={styles.tabFocusWrap}>
          {tabBtn}
        </TourFocusWrap>
      );
    }

    return (
      <View key={id} style={styles.tabSlot}>
        {tabBtn}
      </View>
    );
  };

  return (
    <View style={[styles.tabsRow, isRTL && styles.tabsRowRtl]}>
      {renderTab('announcements')}
      {renderTab('candidacies')}
    </View>
  );
}

type PanelProps = {
  children: ReactNode;
};

export function InscriptionsTourPanel({ children }: PanelProps) {
  const { isRTL } = useLocale();
  return <View style={[styles.panel, isRTL && styles.panelRtl]}>{children}</View>;
}

type AttentionFilterProps = {
  activeCandidaciesCount: number;
  filter: 'all' | 'action_required';
  attentionCount: number;
  onSelectFilter: (mode: 'all' | 'action_required') => void;
  focusActionRequired?: boolean;
  focusActionRequiredLabel?: string;
  actionRequiredEnabled?: boolean;
};

export function InscriptionsCandidaciesFilterTourPreview({
  activeCandidaciesCount,
  filter,
  attentionCount,
  onSelectFilter,
  focusActionRequired = false,
  focusActionRequiredLabel,
  actionRequiredEnabled = true,
}: AttentionFilterProps) {
  const { t, isRTL } = useLocale();

  return (
    <View style={styles.filterWrap}>
      <View style={[styles.attentionFilterRow, isRTL && styles.dirRtl]}>
        {(['all', 'action_required'] as const).map((mode) => {
          const active = filter === mode;
          const isRequired = mode === 'action_required';
          const enabled = isRequired ? actionRequiredEnabled : true;

          const chip = (
            <Pressable
              key={mode}
              onPress={() => {
                if (!enabled) return;
                onSelectFilter(mode);
              }}
              disabled={!enabled}
              style={({ pressed }) => [
                styles.attentionChip,
                active && styles.attentionChipActive,
                isRequired && active && styles.attentionChipActiveDanger,
                !enabled && styles.chipDisabled,
                pressed && enabled && !active && { opacity: 0.88 },
              ]}
              accessibilityRole="tab"
              accessibilityState={{ selected: active, disabled: !enabled }}>
              <Text
                style={[
                  styles.attentionChipTxt,
                  active && styles.attentionChipTxtActive,
                  isRequired && active && styles.attentionChipTxtActiveDanger,
                ]}>
                {mode === 'all'
                  ? t('inscCandidaciesAttentionFilterAll')
                  : t('inscCandidaciesAttentionFilterRequired')}
              </Text>
              {isRequired && attentionCount > 0 ? (
                <View style={[styles.attentionChipBadge, active && styles.attentionChipBadgeActive]}>
                  <Text style={styles.attentionChipBadgeTxt}>
                    {attentionCount > 99 ? '99+' : attentionCount}
                  </Text>
                </View>
              ) : null}
            </Pressable>
          );

          if (isRequired && focusActionRequired) {
            return (
              <TourFocusWrap
                key={mode}
                active
                pulse
                label={focusActionRequiredLabel}
                style={styles.chipFocusWrap}>
                {chip}
              </TourFocusWrap>
            );
          }

          return chip;
        })}
      </View>
      <Text style={[styles.followsCount, isRTL && styles.rtl]}>
        {t('followedSchoolsTitle')} ({activeCandidaciesCount} {t('inscCandidaciesActiveShort')}
        {attentionCount > 0
          ? ` · ${attentionCount} ${t('inscCandidaciesActionsRequiredShort')}`
          : ''}
        )
      </Text>
    </View>
  );
}

/** Comptes affichés sur les pastilles du tutoriel. */
export const TOUR_DEMO_INSCRIPTIONS_TAB_ACTIVE_COUNT = 3;
export const TOUR_DEMO_INSCRIPTIONS_TAB_ATTENTION_COUNT = 1;

const styles = StyleSheet.create({
  shell: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(51, 62, 143, 0.12)',
  },
  shellRtl: {
    direction: 'rtl',
    alignItems: 'stretch',
  },
  hero: {
    backgroundColor: brand.primary,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  heroTitles: {
    flex: 1,
    gap: 2,
  },
  heroIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEyebrow: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: fontSize.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: brand.white,
    fontSize: fontSize.lg,
    fontWeight: '900',
  },
  heroSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: fontSize.sm,
    lineHeight: 19,
  },
  bodyGap: {
    height: 0,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.12)',
    padding: 4,
    borderRadius: radius.full,
  },
  tabRtl: {
    direction: 'rtl',
  },
  dirRtl: {
    direction: 'rtl',
  },
  tabSlot: {
    flex: 1,
    minWidth: 0,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    flex: 1,
    minWidth: 0,
    paddingVertical: 9,
    paddingHorizontal: 6,
    borderRadius: radius.full,
  },
  tabActive: {
    backgroundColor: brand.white,
  },
  tabDisabled: {
    opacity: 0.5,
  },
  tabFocusWrap: {
    flex: 1,
    minWidth: 0,
  },
  tabCandidaciesInline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    flex: 1,
    minWidth: 0,
    maxWidth: '100%',
  },
  tabCandidaciesIconText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexShrink: 1,
    minWidth: 0,
  },
  tabCandidaciesLabel: {
    flexShrink: 1,
    textAlign: 'center',
  },
  tabTxt: {
    color: brand.white,
    fontWeight: '700',
    fontSize: fontSize.xs,
  },
  tabTxtActive: {
    color: brand.primary,
    fontWeight: '800',
  },
  candidaciesTabBadgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    flexShrink: 0,
  },
  tabBadge: {
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBadgeCompact: {
    minWidth: 15,
    height: 15,
    paddingHorizontal: 3,
  },
  badgeActive: {
    backgroundColor: '#059669',
  },
  badgeAttention: {
    backgroundColor: '#DC2626',
  },
  tabBadgeTxt: {
    color: brand.white,
    fontSize: 9,
    fontWeight: '800',
  },
  panel: {
    backgroundColor: brand.backgroundSoft,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(51, 62, 143, 0.08)',
  },
  panelRtl: {
    direction: 'rtl',
    alignItems: 'stretch',
  },
  filterWrap: {
    gap: spacing.xs,
  },
  filterWrapRtl: {
    direction: 'rtl',
    alignItems: 'stretch',
  },
  attentionFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  attentionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.full,
    backgroundColor: brand.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
  },
  attentionChipActive: {
    backgroundColor: 'rgba(51,62,143,0.12)',
    borderColor: brand.primary,
  },
  attentionChipActiveDanger: {
    backgroundColor: '#FEE2E2',
    borderColor: '#F87171',
  },
  chipDisabled: {
    opacity: 0.45,
  },
  chipFocusWrap: {
    alignSelf: 'flex-start',
  },
  attentionChipTxt: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: brand.textMuted,
  },
  attentionChipTxtActive: {
    color: brand.primary,
  },
  attentionChipTxtActiveDanger: {
    color: '#991B1B',
  },
  attentionChipBadge: {
    minWidth: 17,
    height: 17,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: '#FECACA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  attentionChipBadgeActive: {
    backgroundColor: '#DC2626',
  },
  attentionChipBadgeTxt: {
    color: brand.white,
    fontSize: 9,
    fontWeight: '900',
  },
  followsCount: {
    color: brand.textMuted,
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  rtl: {
    writingDirection: 'rtl',
    textAlign: 'right',
  },
});
