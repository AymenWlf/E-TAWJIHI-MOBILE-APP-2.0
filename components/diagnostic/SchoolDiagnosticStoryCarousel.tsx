import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useCallback, useEffect, useRef } from 'react';
import {
  Dimensions,
  FlatList,
  I18nManager,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type ListRenderItem,
} from 'react-native';

import { DIAGNOSTIC_STEP_META } from '@/constants/diagnosticWizardUi';
import { Text } from '@/components/ui/Text';
import type {
  StoryChipGroup,
  StoryReportBullet,
  StoryReportCard,
  StoryTopSchool,
} from '@/utils/buildSchoolDiagnosticStoryReport';
import { tierColor, tierLabel, type DiagnosticTier } from '@/utils/schoolDiagnosticTier';
import {
  establishmentRecommendationTitle,
  formatDiagnosticPercent,
} from '@/utils/diagnosticDisplayText';
import { preserveLtrDigitsInRtlLabel } from '@/utils/bidiText';
import type { DiagnosticReportLocale } from '@/utils/schoolDiagnosticPayloadDisplayContext';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const CARD_GAP = spacing.md;
const CARD_W = SCREEN_W - spacing.md * 2;
const CARD_H = Math.min(SCREEN_H * 0.72, 580);
const CARD_SNAP_INTERVAL = CARD_W + CARD_GAP;

function indexFromScrollOffset(offsetX: number, cardCount: number): number {
  if (cardCount <= 0) return 0;
  const raw = Math.round(offsetX / CARD_SNAP_INTERVAL);
  return Math.max(0, Math.min(raw, cardCount - 1));
}

const SECTION_ANSWERS = { fr: 'Vos réponses', ar: 'إجاباتك' } as const;

/** Évite la double inversion quand l’écran parent a déjà `direction: 'rtl'`. */
function shouldMirrorFlexRows(isRTL: boolean, parentDirectionRtl?: boolean): boolean {
  return isRTL && !parentDirectionRtl;
}

type Props = {
  cards: StoryReportCard[];
  locale: DiagnosticReportLocale;
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  onOpenFullReport: () => void;
  swipeHint: string;
  /** Titre de l’étape affiché dans l’en-tête écran — pas de bandeau lourd sur chaque carte. */
  embedScreenHeader?: boolean;
  /** Rapport / résultats : le root a déjà `direction: 'rtl'`. */
  parentDirectionRtl?: boolean;
};

export function storyReportCardAccent(card: StoryReportCard | undefined): string {
  if (!card) return brand.primary;
  if (card.kind === 'synthesis') return homeShell.green;
  return brand.primary;
}

function iconNameForCard(card: StoryReportCard): React.ComponentProps<typeof FontAwesome>['name'] {
  if (card.kind === 'intro') return 'magic';
  if (card.kind === 'synthesis') return 'cogs';
  if (card.kind === 'cta') return 'list-alt';
  const meta = DIAGNOSTIC_STEP_META[card.stepIndex ?? 0];
  return meta?.icon ?? 'list';
}

function headerBg(card: StoryReportCard): string {
  if (card.kind === 'synthesis') return homeShell.greenDark;
  return brand.primary;
}

function chipToneStyle(tone: StoryChipGroup['tone']) {
  switch (tone) {
    case 'positive':
      return { bg: 'rgba(47,206,148,0.14)', border: 'rgba(47,206,148,0.45)', text: '#0F766E' };
    case 'negative':
      return { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.35)', text: '#B91C1C' };
    case 'accent':
      return { bg: 'rgba(51,62,143,0.1)', border: 'rgba(51,62,143,0.3)', text: brand.primary };
    default:
      return { bg: '#F1F5F9', border: '#E2E8F0', text: brand.text };
  }
}

function isEmptyValue(value: string): boolean {
  const v = value.trim();
  return v === '' || v === '—' || v === '-' || v.toLowerCase() === 'non renseigné';
}

function isGradeField(label: string): boolean {
  return /sur\s*20|\/20|note|moyenne|prévisionnel|regional|jihawia|جهوي|bac|mission|semestre/i.test(label);
}

function isLongValue(value: string): boolean {
  return value.trim().length > 48;
}

function IntroStatsGrid({
  bullets,
  isRTL,
  mirrorFlex,
  locale,
}: {
  bullets: StoryReportBullet[];
  isRTL: boolean;
  mirrorFlex: boolean;
  locale: DiagnosticReportLocale;
}) {
  return (
    <View style={[styles.statsGrid, mirrorFlex && styles.statsGridRtl]}>
      {bullets.map((b) => (
        <View key={b.label} style={styles.statTile}>
          <Text style={[styles.statLabel, isRTL && styles.rtlText]} numberOfLines={2}>
            {b.label}
          </Text>
          <Text style={[styles.statValue, isRTL && styles.rtlText]} numberOfLines={3}>
            {isEmptyValue(b.value) ? (locale === 'ar' ? '—' : '—') : b.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

function ProfileHeroBlock({
  bullets,
  isRTL,
  mirrorFlex,
  locale,
}: {
  bullets: StoryReportBullet[];
  isRTL: boolean;
  mirrorFlex: boolean;
  locale: DiagnosticReportLocale;
}) {
  const first = bullets.find((b) => /prénom|first/i.test(b.label));
  const last = bullets.find((b) => /nom|last/i.test(b.label) && !/prénom/i.test(b.label));
  const rest = bullets.filter((b) => b !== first && b !== last);
  const fullName = [first?.value, last?.value].filter((v) => v && !isEmptyValue(v)).join(' ').trim();

  return (
    <>
      {fullName ? (
        <View style={[styles.profileHero, isRTL && styles.profileHeroRtl]}>
          <View style={styles.profileAvatar}>
            <FontAwesome name="user" size={22} color={brand.primary} />
          </View>
          <Text style={[styles.profileName, isRTL && styles.rtlText]}>{fullName}</Text>
        </View>
      ) : null}
      <AnswersList bullets={rest} isRTL={isRTL} mirrorFlex={mirrorFlex} locale={locale} layout="compact" />
    </>
  );
}

function GradesGrid({
  bullets,
  isRTL,
  mirrorFlex,
  locale,
}: {
  bullets: StoryReportBullet[];
  isRTL: boolean;
  mirrorFlex: boolean;
  locale: DiagnosticReportLocale;
}) {
  const gradeRows = bullets.filter((b) => isGradeField(b.label));
  const other = bullets.filter((b) => !isGradeField(b.label));

  return (
    <>
      {gradeRows.length > 0 ? (
        <View style={[styles.gradeGrid, mirrorFlex && styles.gradeGridRtl]}>
          {gradeRows.map((b) => (
            <View key={b.label} style={styles.gradeCell}>
              <Text style={[styles.gradeLabel, isRTL && styles.rtlText]} numberOfLines={2}>
                {b.label}
              </Text>
              <Text style={[styles.gradeValue, isRTL && styles.rtlText]}>
                {isEmptyValue(b.value) ? '—' : b.value}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
      {other.length > 0 ? (
        <AnswersList bullets={other} isRTL={isRTL} mirrorFlex={mirrorFlex} locale={locale} layout="list" />
      ) : null}
    </>
  );
}

function rankBadgeStyle(rank: number) {
  if (rank === 1) return { bg: 'rgba(245, 158, 11, 0.2)', border: '#D97706', text: '#B45309' };
  if (rank === 2) return { bg: 'rgba(148, 163, 184, 0.25)', border: '#94A3B8', text: '#475569' };
  if (rank === 3) return { bg: 'rgba(180, 83, 9, 0.15)', border: '#CD7F32', text: '#92400E' };
  return { bg: 'rgba(51, 62, 143, 0.1)', border: brand.primary, text: brand.primary };
}

function TopSchoolsList({
  schools,
  isRTL,
  mirrorFlex,
  locale,
}: {
  schools: StoryTopSchool[];
  isRTL: boolean;
  mirrorFlex: boolean;
  locale: DiagnosticReportLocale;
}) {
  const title = locale === 'ar' ? 'أفضل التوافقات' : 'Meilleures adéquations';

  return (
    <View style={styles.topSchoolsSection}>
      <View style={[styles.topSchoolsHead, mirrorFlex && styles.rowRtl]}>
        <View style={styles.topSchoolsHeadIcon}>
          <FontAwesome name="trophy" size={15} color={homeShell.greenDark} />
        </View>
        <Text style={[styles.topSchoolsHeadTitle, isRTL && styles.rtlText]}>{title}</Text>
      </View>
      {schools.map((school) => {
        const rankStyle = rankBadgeStyle(school.rank);
        const tier = school.tier as DiagnosticTier;
        const accent = tierColor(tier);
        const displayName = establishmentRecommendationTitle(
          { nom: school.name, sigle: school.sigle },
          isRTL,
        );

        return (
          <View
            key={`${school.rank}-${school.name}`}
            style={[styles.topSchoolCard, mirrorFlex && styles.topSchoolCardRtl]}>
            <View
              style={[
                styles.rankBadge,
                { backgroundColor: rankStyle.bg, borderColor: rankStyle.border },
              ]}>
              <Text
                style={[styles.rankBadgeTxt, { color: rankStyle.text }]}
                latinDigits={isRTL}>
                {school.rank}
              </Text>
            </View>
            <View style={styles.topSchoolMain}>
              <Text style={[styles.topSchoolName, isRTL && styles.rtlText]} numberOfLines={2}>
                {displayName}
              </Text>
              {school.ville ? (
                <View style={[styles.topSchoolMetaRow, mirrorFlex && styles.rowRtl]}>
                  <FontAwesome name="map-marker" size={11} color={brand.textMuted} />
                  <Text style={[styles.topSchoolVille, isRTL && styles.rtlText]} numberOfLines={1}>
                    {preserveLtrDigitsInRtlLabel(school.ville ?? '', isRTL)}
                  </Text>
                </View>
              ) : null}
            </View>
            <View style={[styles.scoreCol, isRTL && styles.scoreColRtl]}>
              <View
                style={[
                  styles.scorePill,
                  isRTL && styles.scorePillRtl,
                  { backgroundColor: `${accent}18`, borderColor: accent },
                ]}>
                <Text
                  style={[styles.scorePillValue, { color: accent }]}
                  latinDigits={isRTL}>
                  {formatDiagnosticPercent(school.score, isRTL)}
                </Text>
              </View>
              <Text style={[styles.scoreTierLabel, { color: accent }, isRTL && styles.rtlText]} numberOfLines={1}>
                {tierLabel(tier)}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function SynthesisBody({
  bullets,
  topSchools,
  isRTL,
  mirrorFlex,
  locale,
}: {
  bullets: StoryReportBullet[];
  topSchools?: StoryTopSchool[];
  isRTL: boolean;
  mirrorFlex: boolean;
  locale: DiagnosticReportLocale;
}) {
  const matchRate = bullets.find((b) => /compatibilité|توافق/i.test(b.label));
  const legacyTop = bullets.find((b) => /meilleur|أفضل/i.test(b.label));
  const tiers = bullets.filter((b) => b !== matchRate && b !== legacyTop);

  return (
    <>
      {matchRate && !isEmptyValue(matchRate.value) ? (
        <View style={styles.matchRateBox}>
          <Text style={[styles.matchRateLabel, isRTL && styles.rtlText]}>{matchRate.label}</Text>
          <Text
            style={[styles.matchRateValue, isRTL && styles.rtlText]}
            latinDigits={isRTL && /\d/.test(matchRate.value)}>
            {isRTL ? preserveLtrDigitsInRtlLabel(matchRate.value, true) : matchRate.value}
          </Text>
        </View>
      ) : null}
      {tiers.length > 0 ? (
        <View style={styles.tierGrid}>
          {tiers.map((t) => (
            <View key={t.label} style={styles.tierCell}>
              <Text style={[styles.tierCount, isRTL && styles.rtlText]}>{t.value}</Text>
              <Text style={[styles.tierLabel, isRTL && styles.rtlText]} numberOfLines={2}>
                {t.label}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
      {topSchools && topSchools.length > 0 ? (
        <TopSchoolsList schools={topSchools} isRTL={isRTL} mirrorFlex={mirrorFlex} locale={locale} />
      ) : null}
    </>
  );
}

function AnswersList({
  bullets,
  isRTL,
  mirrorFlex,
  locale,
  layout,
  showSectionTitle = true,
}: {
  bullets: StoryReportBullet[];
  isRTL: boolean;
  mirrorFlex: boolean;
  locale: DiagnosticReportLocale;
  layout: 'list' | 'grid' | 'compact';
  showSectionTitle?: boolean;
}) {
  if (bullets.length === 0) return null;
  const textAlign = isRTL ? ('right' as const) : ('left' as const);
  const rowDir = mirrorFlex ? styles.rowRtl : undefined;

  const body =
    layout === 'grid' ? (
      <View style={[styles.answerGrid, mirrorFlex && styles.answerGridRtl]}>
        {bullets.map((b) => (
          <View key={`${b.label}-${b.value}`} style={styles.answerGridCell}>
            <AnswerFieldRow bullet={b} isRTL={isRTL} mirrorFlex={mirrorFlex} locale={locale} compact />
          </View>
        ))}
      </View>
    ) : (
      bullets.map((b) => (
        <AnswerFieldRow
          key={`${b.label}-${b.value.slice(0, 16)}`}
          bullet={b}
          isRTL={isRTL}
          mirrorFlex={mirrorFlex}
          locale={locale}
          compact={layout === 'compact'}
        />
      ))
    );

  return (
    <View style={[styles.answersSection, isRTL && styles.answersSectionRtl]}>
      {showSectionTitle ? (
        <View style={[styles.answersSectionHead, rowDir, isRTL && styles.answersSectionHeadRtl]}>
          <FontAwesome name="check-circle" size={14} color={brand.primary} />
          <Text style={[styles.answersSectionTitle, { textAlign }, isRTL && styles.rtlText]}>
            {SECTION_ANSWERS[locale]}
          </Text>
        </View>
      ) : null}
      {body}
    </View>
  );
}

function CardBodyContent({
  card,
  isRTL,
  mirrorFlex,
  locale,
}: {
  card: StoryReportCard;
  isRTL: boolean;
  mirrorFlex: boolean;
  locale: DiagnosticReportLocale;
}) {
  if (card.kind === 'intro') {
    return <IntroStatsGrid bullets={card.bullets} isRTL={isRTL} mirrorFlex={mirrorFlex} locale={locale} />;
  }
  if (card.kind === 'synthesis') {
    return (
      <SynthesisBody
        bullets={card.bullets}
        topSchools={card.topSchools}
        isRTL={isRTL}
        mirrorFlex={mirrorFlex}
        locale={locale}
      />
    );
  }
  if (card.kind === 'step' && card.stepIndex === 0) {
    return <ProfileHeroBlock bullets={card.bullets} isRTL={isRTL} mirrorFlex={mirrorFlex} locale={locale} />;
  }
  if (card.kind === 'step' && card.stepIndex === 2) {
    return <GradesGrid bullets={card.bullets} isRTL={isRTL} mirrorFlex={mirrorFlex} locale={locale} />;
  }
  if (card.kind === 'step' && (card.stepIndex === 1 || card.stepIndex === 5)) {
    return (
      <AnswersList bullets={card.bullets} isRTL={isRTL} mirrorFlex={mirrorFlex} locale={locale} layout="grid" />
    );
  }
  const useGrid =
    card.bullets.length >= 4 &&
    card.bullets.every((b) => !isLongValue(b.value) && !isGradeField(b.label));
  return (
    <AnswersList
      bullets={card.bullets}
      isRTL={isRTL}
      mirrorFlex={mirrorFlex}
      locale={locale}
      layout={useGrid ? 'grid' : 'list'}
      showSectionTitle={card.bullets.length > 0}
    />
  );
}

function AnswerFieldRow({
  bullet,
  isRTL,
  mirrorFlex,
  locale,
  compact,
}: {
  bullet: StoryReportBullet;
  isRTL: boolean;
  mirrorFlex: boolean;
  locale: DiagnosticReportLocale;
  compact?: boolean;
}) {
  const empty = isEmptyValue(bullet.value);
  return (
    <View style={[styles.answerRow, compact && styles.answerRowCompact, mirrorFlex && styles.answerRowRtl]}>
      <View style={styles.answerAccent} />
      <View style={styles.answerBody}>
        <Text style={[styles.answerLabel, isRTL && styles.rtlText]} numberOfLines={2}>
          {bullet.label}
        </Text>
        <Text
          style={[
            styles.answerValue,
            compact && styles.answerValueCompact,
            empty && styles.answerValueEmpty,
            isRTL && styles.rtlText,
          ]}
          numberOfLines={compact ? 2 : 6}>
          {empty ? (locale === 'ar' ? 'غير مذكور' : 'Non renseigné') : bullet.value}
        </Text>
      </View>
    </View>
  );
}

function isStudyLevelChipGroup(title: string): boolean {
  return /niveau|études visés|études supérieures|مستوى|الدراسة/i.test(title);
}

function StudyLevelChipList({
  items,
  isRTL,
  mirrorFlex,
}: {
  items: string[];
  isRTL: boolean;
  mirrorFlex: boolean;
}) {
  return (
    <View style={styles.levelList}>
      {items.map((item) => (
        <View key={item} style={[styles.levelRow, mirrorFlex && styles.levelRowRtl]}>
          <View style={styles.levelIconWrap}>
            <FontAwesome name="graduation-cap" size={14} color={brand.primary} />
          </View>
          <Text style={[styles.levelLabel, isRTL && styles.rtlText]}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function ChipGroupsBlock({
  groups,
  isRTL,
  mirrorFlex,
}: {
  groups: StoryChipGroup[];
  isRTL: boolean;
  mirrorFlex: boolean;
}) {
  return (
    <>
      {groups.map((group) => {
        const tone = chipToneStyle(group.tone);
        const isLevels = isStudyLevelChipGroup(group.title);
        return (
          <View key={group.title} style={[styles.chipSection, isRTL && styles.chipSectionRtl]}>
            <Text style={[styles.chipSectionTitle, isRTL && styles.rtlText]}>{group.title}</Text>
            {isLevels ? (
              <StudyLevelChipList items={group.items} isRTL={isRTL} mirrorFlex={mirrorFlex} />
            ) : (
              <View style={[styles.chipWrap, mirrorFlex && styles.chipWrapRtl]}>
                {group.items.map((item) => (
                  <View
                    key={`${group.title}-${item}`}
                    style={[
                      styles.chip,
                      { backgroundColor: tone.bg, borderColor: tone.border },
                    ]}>
                    <Text
                      style={[styles.chipTxt, { color: tone.text }, isRTL && styles.rtlText]}
                      numberOfLines={3}>
                      {item}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        );
      })}
    </>
  );
}

function StoryCardContent({
  card,
  isRTL,
  mirrorFlex,
  locale,
  onOpenFullReport,
  embedScreenHeader,
}: {
  card: StoryReportCard;
  isRTL: boolean;
  mirrorFlex: boolean;
  locale: DiagnosticReportLocale;
  onOpenFullReport: () => void;
  embedScreenHeader?: boolean;
}) {
  const textAlign = isRTL ? ('right' as const) : ('left' as const);
  const rowDir = mirrorFlex ? styles.rowRtl : undefined;
  const showBody =
    card.kind === 'intro' ||
    card.kind === 'synthesis' ||
    (card.kind === 'step' && card.bullets.length > 0);
  const accent = storyReportCardAccent(card);

  return (
    <View style={[styles.cardInner, { minHeight: CARD_H }]}>
      {embedScreenHeader ? (
        <View style={[styles.cardAccentBar, { backgroundColor: accent }]} />
      ) : (
        <View style={[styles.cardHeader, { backgroundColor: headerBg(card) }]}>
          <View style={[styles.headerStripe, isRTL ? styles.headerStripeRtl : undefined]} />
          <View style={[styles.cardHeaderTop, rowDir]}>
            <View style={styles.headerIconWrap}>
              <FontAwesome name={iconNameForCard(card)} size={20} color="#fff" />
            </View>
            {card.badge ? (
              <View style={styles.badgePill}>
                <Text style={styles.badge}>{card.badge}</Text>
              </View>
            ) : null}
          </View>
          {card.kind === 'step' && card.stepNumber != null && card.stepTotal != null ? (
            <Text style={[styles.stepMeta, { textAlign }]}>
              {locale === 'ar'
                ? `المرحلة ${card.stepNumber} من ${card.stepTotal}`
                : `Étape ${card.stepNumber} sur ${card.stepTotal}`}
            </Text>
          ) : null}
          <Text style={[styles.cardTitle, { textAlign }]}>{card.title}</Text>
          {card.subtitle ? (
            <Text style={[styles.cardSub, { textAlign }]}>{card.subtitle}</Text>
          ) : null}
        </View>
      )}

      <ScrollView
        style={styles.cardScroll}
        contentContainerStyle={[
          styles.cardScrollContent,
          embedScreenHeader && styles.cardScrollContentFlush,
          isRTL && styles.cardScrollContentRtl,
        ]}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled>
        {card.highlight ? (
          <View style={styles.highlight}>
            <View style={[styles.highlightLabelRow, rowDir]}>
              <FontAwesome name="star" size={12} color={homeShell.greenDark} />
              <Text style={[styles.highlightLabel, { textAlign }, isRTL && styles.rtlText]}>
                {card.kind === 'synthesis'
                  ? locale === 'ar'
                    ? 'تعليق عام'
                    : 'Commentaire global'
                  : locale === 'ar'
                    ? 'ملخص'
                    : 'Synthèse'}
              </Text>
            </View>
            <Text style={[styles.highlightTxt, { textAlign }, isRTL && styles.rtlText]}>{card.highlight}</Text>
          </View>
        ) : null}

        {card.insights?.map((line) => (
          <View key={line.slice(0, 40)} style={[styles.insightRow, rowDir]}>
            <View style={styles.insightIconWrap}>
              <FontAwesome name="lightbulb-o" size={14} color={homeShell.greenDark} />
            </View>
            <Text style={[styles.insightTxt, { textAlign, flex: 1 }, isRTL && styles.rtlText]}>{line}</Text>
          </View>
        ))}

        {card.chipGroups && card.chipGroups.length > 0 ? (
          <ChipGroupsBlock groups={card.chipGroups} isRTL={isRTL} mirrorFlex={mirrorFlex} />
        ) : null}

        {showBody ? (
          <CardBodyContent card={card} isRTL={isRTL} mirrorFlex={mirrorFlex} locale={locale} />
        ) : null}

        {card.kind === 'cta' ? (
          <View style={styles.ctaBlock}>
            <Pressable style={[styles.ctaPrimary, isRTL && styles.ctaPrimaryRtl]} onPress={onOpenFullReport}>
              <Text style={[styles.ctaPrimaryTxt, isRTL && styles.rtlText]}>
                {isRTL ? 'عرض التقرير الكامل' : 'Voir le rapport complet'}
              </Text>
              <FontAwesome name={isRTL ? 'arrow-left' : 'arrow-right'} size={14} color="#fff" />
            </Pressable>
            <Pressable style={styles.ctaSecondary} onPress={onOpenFullReport}>
              <Text style={[styles.ctaSecondaryTxt, isRTL && styles.rtlText]}>
                {isRTL ? 'ترتيب المؤسسات' : 'Classement détaillé des écoles'}
              </Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

export function SchoolDiagnosticStoryCarousel({
  cards,
  locale,
  activeIndex,
  onActiveIndexChange,
  onOpenFullReport,
  swipeHint,
  embedScreenHeader = false,
  parentDirectionRtl = false,
}: Props) {
  const isRTL = locale === 'ar' || I18nManager.isRTL;
  const mirrorFlex = shouldMirrorFlexRows(isRTL, parentDirectionRtl);
  const listRef = useRef<FlatList<StoryReportCard>>(null);
  const lastReportedIndexRef = useRef(activeIndex);

  useEffect(() => {
    lastReportedIndexRef.current = activeIndex;
  }, [activeIndex]);

  const syncActiveIndexFromOffset = useCallback(
    (offsetX: number) => {
      const idx = indexFromScrollOffset(offsetX, cards.length);
      if (idx === lastReportedIndexRef.current) return;
      lastReportedIndexRef.current = idx;
      onActiveIndexChange(idx);
    },
    [cards.length, onActiveIndexChange],
  );

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      syncActiveIndexFromOffset(e.nativeEvent.contentOffset.x);
    },
    [syncActiveIndexFromOffset],
  );

  const onScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      syncActiveIndexFromOffset(e.nativeEvent.contentOffset.x);
    },
    [syncActiveIndexFromOffset],
  );

  const renderItem: ListRenderItem<StoryReportCard> = useCallback(
    ({ item }) => (
      <View style={[styles.cardShell, { width: CARD_W }]}>
        <StoryCardContent
          card={item}
          isRTL={isRTL}
          mirrorFlex={mirrorFlex}
          locale={locale}
          onOpenFullReport={onOpenFullReport}
          embedScreenHeader={embedScreenHeader}
        />
      </View>
    ),
    [isRTL, mirrorFlex, locale, onOpenFullReport, embedScreenHeader],
  );

  const listContentStyle = isRTL
    ? [styles.listContent, styles.listContentRtl]
    : styles.listContent;

  return (
    <View style={[styles.root, isRTL && styles.rootRtl]}>
      <FlatList
        ref={listRef}
        data={cards}
        horizontal
        pagingEnabled={false}
        snapToInterval={CARD_SNAP_INTERVAL}
        snapToAlignment="start"
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        onScrollEndDrag={onScrollEnd}
        onMomentumScrollEnd={onScrollEnd}
        scrollEventThrottle={16}
        keyExtractor={(card, i) => `${card.kind}-${card.stepIndex ?? i}`}
        renderItem={renderItem}
        style={isRTL ? styles.listRtl : undefined}
        contentContainerStyle={listContentStyle}
        ItemSeparatorComponent={() => <View style={{ width: CARD_GAP }} />}
      />

      {activeIndex < cards.length - 1 ? (
        <View style={[styles.hintRow, isRTL && styles.hintRowRtl]}>
          <FontAwesome
            name={isRTL ? 'chevron-left' : 'chevron-right'}
            size={12}
            color={brand.primary}
          />
          <Text style={[styles.hintTxt, isRTL && styles.rtlText]}>{swipeHint}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  rootRtl: { direction: 'rtl' },
  listRtl: { direction: 'rtl' },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  listContentRtl: { direction: 'rtl' },
  cardShell: {
    borderRadius: radius.xl,
    backgroundColor: brand.white,
    borderWidth: 1,
    borderColor: 'rgba(51,62,143,0.12)',
    overflow: 'hidden',
    shadowColor: '#333E8F',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
  cardInner: { flex: 1 },
  cardAccentBar: {
    height: 4,
    width: '100%',
  },
  cardScrollContentFlush: {
    paddingTop: spacing.md,
  },
  cardHeader: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    overflow: 'hidden',
  },
  headerStripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: brand.secondary,
  },
  headerStripeRtl: {
    left: undefined,
    right: 0,
  },
  cardHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgePill: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  badge: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: '#fff',
  },
  stepMeta: {
    marginTop: spacing.sm,
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardTitle: {
    marginTop: 4,
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.3,
  },
  cardSub: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.92)',
    marginTop: 6,
    lineHeight: 20,
  },
  cardScroll: { flex: 1, backgroundColor: '#F8FAFC' },
  cardScrollContent: { padding: spacing.md, paddingBottom: spacing.xl },
  cardScrollContentRtl: { direction: 'rtl', alignItems: 'stretch' },
  highlight: {
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(47,206,148,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(47,206,148,0.35)',
    marginBottom: spacing.sm,
  },
  highlightLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  highlightLabel: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: homeShell.greenDark,
    textTransform: 'uppercase',
  },
  highlightTxt: { fontSize: fontSize.sm, color: brand.text, lineHeight: 21 },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: 'rgba(51,62,143,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(51,62,143,0.08)',
  },
  rowRtl: { flexDirection: 'row-reverse' },
  rtlText: { writingDirection: 'rtl', textAlign: 'right' },
  insightIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: homeShell.greenAlpha18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightTxt: { fontSize: fontSize.sm, color: brand.text, lineHeight: 20 },
  chipSection: {
    marginBottom: spacing.md,
    padding: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: brand.white,
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
  },
  chipSectionRtl: { direction: 'rtl', alignItems: 'stretch' },
  chipSectionTitle: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: brand.primary,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
    letterSpacing: 0.4,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipWrapRtl: {
    flexDirection: 'row-reverse',
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1,
    maxWidth: '100%',
  },
  chipTxt: { fontSize: fontSize.sm, fontWeight: '600', textAlign: 'center' },
  levelList: { gap: spacing.sm },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(51, 62, 143, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(51, 62, 143, 0.14)',
  },
  levelRowRtl: { flexDirection: 'row-reverse' },
  levelIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: brand.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(51, 62, 143, 0.12)',
  },
  levelLabel: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: brand.text,
    lineHeight: 20,
  },
  answersSection: {
    marginTop: spacing.xs,
    gap: spacing.sm,
  },
  answersSectionRtl: { direction: 'rtl', alignItems: 'stretch' },
  answersSectionHeadRtl: { direction: 'rtl' },
  answersSectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  answersSectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: brand.primary,
  },
  answerRow: {
    flexDirection: 'row',
    backgroundColor: brand.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  answerRowRtl: { flexDirection: 'row-reverse' },
  answerAccent: {
    width: 4,
    backgroundColor: brand.secondary,
  },
  answerBody: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  answerLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: brand.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  answerValue: {
    marginTop: 3,
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: brand.text,
    lineHeight: 20,
  },
  answerValueEmpty: {
    fontStyle: 'italic',
    fontWeight: '500',
    color: brand.textMuted,
  },
  ctaBlock: { marginTop: spacing.lg, gap: spacing.sm },
  ctaPrimaryRtl: { direction: 'rtl' },
  ctaPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: brand.primary,
    paddingVertical: 15,
    borderRadius: radius.lg,
    shadowColor: '#333E8F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  ctaPrimaryTxt: { color: '#fff', fontWeight: '800', fontSize: fontSize.sm },
  ctaSecondary: {
    alignItems: 'center',
    paddingVertical: 13,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: brand.primary,
    backgroundColor: brand.white,
  },
  ctaSecondaryTxt: { color: brand.primary, fontWeight: '700', fontSize: fontSize.sm },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.md,
  },
  hintRowRtl: { direction: 'rtl' },
  hintTxt: { fontSize: fontSize.xs, color: brand.primary, fontWeight: '700' },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statsGridRtl: { flexDirection: 'row-reverse' },
  statTile: {
    flex: 1,
    minWidth: '30%',
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: brand.white,
    borderWidth: 1,
    borderColor: 'rgba(51,62,143,0.1)',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: brand.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.35,
  },
  statValue: {
    marginTop: 6,
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: brand.primary,
    lineHeight: 20,
  },
  profileHero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: brand.white,
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
  },
  profileHeroRtl: { direction: 'rtl' },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(51,62,143,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: brand.text,
  },
  gradeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  gradeGridRtl: { flexDirection: 'row-reverse' },
  gradeCell: {
    width: '48%',
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: brand.white,
    borderWidth: 1,
    borderColor: 'rgba(51,62,143,0.1)',
  },
  gradeLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: brand.textMuted,
    textTransform: 'uppercase',
  },
  gradeValue: {
    marginTop: 4,
    fontSize: fontSize.md,
    fontWeight: '800',
    color: brand.primary,
  },
  matchRateBox: {
    alignItems: 'center',
    padding: spacing.lg,
    marginBottom: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(51,62,143,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(51,62,143,0.12)',
  },
  matchRateLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: brand.textMuted,
    textTransform: 'uppercase',
  },
  matchRateValue: {
    marginTop: 4,
    fontSize: 32,
    fontWeight: '900',
    color: brand.primary,
  },
  tierGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  tierCell: {
    width: '48%',
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: brand.white,
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
    alignItems: 'center',
  },
  tierCount: {
    fontSize: fontSize.xl,
    fontWeight: '900',
    color: homeShell.greenDark,
  },
  tierLabel: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: '700',
    color: brand.textMuted,
    textAlign: 'center',
  },
  topSchoolsSection: {
    marginTop: spacing.xs,
    gap: spacing.sm,
  },
  topSchoolsHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 2,
  },
  topSchoolsHeadIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: homeShell.greenAlpha18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topSchoolsHeadTitle: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: brand.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.35,
  },
  topSchoolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: brand.white,
    borderWidth: 1,
    borderColor: 'rgba(51, 62, 143, 0.12)',
    shadowColor: '#333E8F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  topSchoolCardRtl: { flexDirection: 'row-reverse' },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadgeTxt: {
    fontSize: fontSize.md,
    fontWeight: '900',
  },
  topSchoolMain: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  topSchoolName: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: brand.text,
    lineHeight: 20,
  },
  topSchoolMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  topSchoolVille: {
    flex: 1,
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: brand.textMuted,
  },
  scoreCol: {
    alignItems: 'flex-end',
    gap: 4,
    maxWidth: 88,
  },
  scoreColRtl: { alignItems: 'flex-start' },
  scorePill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    minWidth: 56,
    alignItems: 'center',
  },
  scorePillRtl: { direction: 'ltr' },
  scorePillValue: {
    fontSize: fontSize.md,
    fontWeight: '900',
  },
  scoreTierLabel: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.25,
    textAlign: 'center',
  },
  answerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  answerGridRtl: { flexDirection: 'row-reverse' },
  answerGridCell: { width: '48%' },
  answerRowCompact: { marginBottom: 0 },
  answerValueCompact: { fontSize: fontSize.sm },
});
