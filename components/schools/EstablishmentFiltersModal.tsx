/**
 * EstablishmentFiltersModal — modale de filtres avancés pour le listing
 * d'établissements (« Écoles supérieures ») et tout autre écran qui
 * souhaite filtrer ses items via les **mêmes critères** (ex. l'onglet
 * « Annonces » de « Mes inscriptions »).
 *
 * Le composant est entièrement contrôlé : il reçoit `value` (la valeur
 * courante des filtres) et `onChange(next)` qui est appelée à chaque
 * modification. Il gère en interne les bottom-sheets de sélection (ville
 * et secteur) afin de cacher cette complexité au parent.
 *
 * Le parent doit charger les `cities` et `secteurs` (ces données sont
 * partagées par toutes les pages qui utilisent les filtres). Cette
 * conception permet de réutiliser les caches HTTP existants sans
 * dupliquer les requêtes.
 */

import { FontAwesome } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';

import {
  SearchablePickPanel,
  type SearchablePickItem,
} from '@/components/schools/SearchablePickSheet';
import { Text } from '@/components/ui/Text';
import { useLocale } from '@/contexts/LocaleContext';
import type { CityRow, SecteurRow } from '@/services/referenceData';
import { homeShell } from '@/theme/homeShell';
import { fontSize, radius, spacing } from '@/theme/tokens';
import { DIPLOME_OPTIONS } from '@/utils/establishmentWebFilters';

/** État complet des filtres appliqués sur un listing d'établissements. */
export type EstablishmentFiltersValue = {
  /** Type d'école : 'Public' | 'Privé' | 'Semi-Public' | 'Militaire' | ''. */
  type: string;
  /** Recherche texte sur le nom de l'université. */
  universite: string;
  /** Région (titre exact tel que renvoyé par /api/cities). */
  regionTitle: string;
  /** Ville exacte (titre tel que renvoyé par /api/cities). */
  ville: string;
  /** Secteur (id en string, vide ⇒ tous secteurs). */
  secteurId: string;
  /** Diplôme exact (label de DIPLOME_OPTIONS). */
  diplome: string;
  /** Borne basse de la fourchette de frais (DH/an). */
  fraisMin: number;
  /** Borne haute de la fourchette de frais (DH/an). */
  fraisMax: number;
  /** Filtre « E-Tawjihi inscription possible ». */
  eTawjihiOnly: boolean;
  /** Filtre « Mises en avant » (`isFeatured`). */
  featuredOnly: boolean;
  /** Filtre « Recommandées E-Tawjihi ». */
  recommendedOnly: boolean;
  /** Filtre « Sponsorisées ». */
  sponsoredOnly: boolean;
  /** Filtre « Accréditées par l'État ». */
  accreditationEtat: boolean;
  /** Filtre « Échange international ». */
  echangeInternational: boolean;
  /**
   * Filtre d'éligibilité de l'utilisateur connecté (basé sur la filière
   * du Bac uniquement — l'année du bac n'est volontairement pas prise en
   * compte ici, c'est un critère trop restrictif pour un filtre rapide).
   *  - `all`           : aucun filtrage (défaut).
   *  - `eligible`      : ne garder que les écoles où l'utilisateur passe.
   *  - `not_eligible`  : ne garder que les écoles où l'utilisateur ne passe pas.
   *
   * Le filtre n'a d'effet que si l'utilisateur est connecté ET a renseigné
   * son profil (filière ou spécialités). Sinon il est silencieusement
   * ignoré côté parent (les écoles « unknown » sont toujours affichées).
   */
  eligibilityFilter: 'all' | 'eligible' | 'not_eligible';
};

/** Valeurs par défaut équivalentes à « pas de filtre actif ». */
export const defaultEstablishmentFilters = (): EstablishmentFiltersValue => ({
  type: '',
  universite: '',
  regionTitle: '',
  ville: '',
  secteurId: '',
  diplome: '',
  fraisMin: 0,
  fraisMax: 100_000,
  eTawjihiOnly: false,
  featuredOnly: false,
  recommendedOnly: false,
  sponsoredOnly: false,
  accreditationEtat: false,
  echangeInternational: false,
  eligibilityFilter: 'all',
});

/** Nombre de filtres actuellement actifs (utile pour afficher un badge). */
export function countActiveEstablishmentFilters(v: EstablishmentFiltersValue): number {
  return (
    (v.type.trim() ? 1 : 0) +
    (v.universite.trim() ? 1 : 0) +
    (v.regionTitle.trim() ? 1 : 0) +
    (v.ville.trim() ? 1 : 0) +
    (v.secteurId.trim() ? 1 : 0) +
    (v.diplome.trim() ? 1 : 0) +
    (v.fraisMin > 0 || v.fraisMax < 100_000 ? 1 : 0) +
    (v.eTawjihiOnly ? 1 : 0) +
    (v.featuredOnly ? 1 : 0) +
    (v.recommendedOnly ? 1 : 0) +
    (v.sponsoredOnly ? 1 : 0) +
    (v.accreditationEtat ? 1 : 0) +
    (v.echangeInternational ? 1 : 0) +
    (v.eligibilityFilter && v.eligibilityFilter !== 'all' ? 1 : 0)
  );
}

export type EstablishmentFiltersModalProps = {
  visible: boolean;
  onClose: () => void;
  value: EstablishmentFiltersValue;
  onChange: (next: EstablishmentFiltersValue) => void;
  cities: CityRow[];
  secteurs: SecteurRow[];
};

export function EstablishmentFiltersModal({
  visible,
  onClose,
  value,
  onChange,
  cities,
  secteurs,
}: EstablishmentFiltersModalProps) {
  const { isRTL, t } = useLocale();
  const { height: winH } = useWindowDimensions();

  const [cityPickOpen, setCityPickOpen] = useState(false);
  const [sectorPickOpen, setSectorPickOpen] = useState(false);
  const [fraisMinStr, setFraisMinStr] = useState(String(value.fraisMin || 0));
  const [fraisMaxStr, setFraisMaxStr] = useState(String(value.fraisMax || 100_000));

  /* Si les valeurs externes changent (ex. reset du parent), on resync les inputs texte. */
  React.useEffect(() => {
    setFraisMinStr(String(value.fraisMin || 0));
    setFraisMaxStr(String(value.fraisMax || 100_000));
  }, [value.fraisMin, value.fraisMax]);

  const set = <K extends keyof EstablishmentFiltersValue>(
    key: K,
    v: EstablishmentFiltersValue[K],
  ) => onChange({ ...value, [key]: v });

  const typeOptions = useMemo(
    () => [
      { label: t('schoolsTypeAll'), value: '' },
      { label: t('schoolsTypePublic'), value: 'Public' },
      { label: t('schoolsTypePrivate'), value: 'Privé' },
      { label: t('schoolsTypeSemiPublic'), value: 'Semi-Public' },
      { label: t('schoolsTypeMilitary'), value: 'Militaire' },
    ],
    [t],
  );

  const regionOptions = useMemo(() => {
    const r = new Set<string>();
    for (const c of cities) {
      if (c.region?.titre) r.add(c.region.titre);
    }
    return Array.from(r).sort((a, b) => a.localeCompare(b, 'fr'));
  }, [cities]);

  const sortedSecteurs = useMemo(
    () => [...secteurs].sort((a, b) => (a.titre ?? '').localeCompare(b.titre ?? '', 'fr')),
    [secteurs],
  );

  const sortedCities = useMemo(
    () => [...cities].sort((a, b) => (a.titre ?? '').localeCompare(b.titre ?? '', 'fr')),
    [cities],
  );

  const cityPickItems = useMemo<SearchablePickItem[]>(
    () =>
      sortedCities
        .filter((c) => (c.titre ?? '').trim())
        .map((c) => ({
          id: `city-${c.id}`,
          value: (c.titre ?? '').trim(),
          label: (c.titre ?? '').trim(),
          subtitle: c.region?.titre ?? undefined,
        })),
    [sortedCities],
  );

  const secteurPickItems = useMemo<SearchablePickItem[]>(
    () =>
      sortedSecteurs.map((s) => ({
        id: `secteur-${s.id}`,
        value: String(s.id),
        label:
          ((isRTL ? s.titreAr || s.titre : s.titre) ?? '').trim() ||
          `${t('schoolsSectorLabel')} ${s.id}`,
      })),
    [sortedSecteurs, isRTL, t],
  );

  const villeLabel = useMemo(() => {
    const v = value.ville.trim();
    if (!v) return t('schoolsAllCities');
    const hit = sortedCities.find((c) => (c.titre ?? '').trim() === v);
    return hit?.titre?.trim() ?? v;
  }, [value.ville, sortedCities, t]);

  const secteurLabel = useMemo(() => {
    const id = value.secteurId.trim();
    if (!id) return t('schoolsAllSectors');
    const s = sortedSecteurs.find((x) => String(x.id) === id);
    if (!s) return id;
    return ((isRTL ? s.titreAr || s.titre : s.titre) ?? '').trim() || id;
  }, [value.secteurId, sortedSecteurs, isRTL, t]);

  const pickSheetOpen = cityPickOpen || sectorPickOpen;

  const closeAll = () => {
    setCityPickOpen(false);
    setSectorPickOpen(false);
    onClose();
  };

  const closePickSheetsOnly = () => {
    setCityPickOpen(false);
    setSectorPickOpen(false);
  };

  const reset = () => {
    onChange(defaultEstablishmentFilters());
  };

  const syncFraisFromStr = (kind: 'min' | 'max', txt: string) => {
    if (kind === 'min') {
      setFraisMinStr(txt);
      const n = Number.parseInt(txt.replace(/\D/g, ''), 10);
      set('fraisMin', Number.isFinite(n) ? Math.max(0, n) : 0);
    } else {
      setFraisMaxStr(txt);
      const n = Number.parseInt(txt.replace(/\D/g, ''), 10);
      set('fraisMax', Number.isFinite(n) ? Math.max(0, n) : 100_000);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={closeAll}>
      <View style={styles.modalRoot}>
        <Pressable style={styles.modalOverlay} onPress={closeAll} />
        <View
          style={[
            styles.modalCard,
            pickSheetOpen && styles.modalCardBehindPick,
          ]}
          pointerEvents={pickSheetOpen ? 'none' : 'auto'}>
          <View style={styles.modalHandle} />
          <View style={[styles.modalHeader, isRTL && styles.rowRtl]}>
            <Text style={[styles.modalTitle, isRTL && styles.txtRtl]}>{t('schoolsFiltersTitle')}</Text>
            <Pressable onPress={closeAll} hitSlop={10} accessibilityLabel={t('closeOverlayA11y')}>
              <FontAwesome name="times" size={18} color={homeShell.cardMuted} />
            </Pressable>
          </View>

          <ScrollView
            style={{ maxHeight: Math.min(winH * 0.62, 520) }}
            contentContainerStyle={styles.modalScrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled>
            <Text style={[styles.modalHint, isRTL && styles.txtRtl]}>{t('schoolsFiltersHint')}</Text>

            <Text style={[styles.modalLabel, isRTL && styles.txtRtl]}>{t('schoolsTypeLabel')}</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={isRTL && styles.hScrollRtl}
              contentContainerStyle={styles.hScrollTight}
              nestedScrollEnabled>
              {typeOptions.map((opt) => (
                <Pressable
                  key={opt.value || 'all'}
                  onPress={() => set('type', opt.value)}
                  style={[styles.modalTypeChip, value.type === opt.value && styles.modalTypeChipOn]}>
                  <Text
                    style={[
                      styles.modalTypeChipTxt,
                      value.type === opt.value && styles.modalTypeChipTxtOn,
                    ]}>
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
              {value.type.trim() ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('schoolsClearFilter')}
                  onPress={() => set('type', '')}
                  style={styles.chipClearHit}
                  hitSlop={12}>
                  <FontAwesome name="times-circle" size={20} color={homeShell.blue} />
                </Pressable>
              ) : null}
            </ScrollView>

            <Text style={[styles.modalLabel, isRTL && styles.txtRtl]}>{t('schoolsUniversityLabel')}</Text>
            <View style={[styles.modalInputRow, isRTL && styles.rowRtl]}>
              <FontAwesome name="search" size={15} color={homeShell.greenDark} />
              <TextInput
                value={value.universite}
                onChangeText={(v) => set('universite', v)}
                placeholder={t('schoolsUniversityPlaceholder')}
                placeholderTextColor={homeShell.cardMuted}
                style={[styles.modalInput, isRTL && styles.searchInputRtl]}
              />
            </View>

            <Text style={[styles.modalLabel, isRTL && styles.txtRtl]}>{t('schoolsRegionLabel')}</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={isRTL && styles.hScrollRtl}
              contentContainerStyle={styles.hScrollTight}
              nestedScrollEnabled>
              <Pressable
                onPress={() => set('regionTitle', '')}
                style={[styles.miniChip, !value.regionTitle && styles.miniChipOn]}>
                <Text
                  style={[
                    styles.miniChipTxt,
                    !value.regionTitle && styles.miniChipTxtOn,
                  ]}>
                  {t('schoolsAll')}
                </Text>
              </Pressable>
              {regionOptions.map((r) => (
                <Pressable
                  key={r}
                  onPress={() => set('regionTitle', r)}
                  style={[styles.miniChip, value.regionTitle === r && styles.miniChipOn]}>
                  <Text
                    style={[
                      styles.miniChipTxt,
                      value.regionTitle === r && styles.miniChipTxtOn,
                    ]}>
                    {r}
                  </Text>
                </Pressable>
              ))}
              {value.regionTitle ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('schoolsClearFilter')}
                  onPress={() => set('regionTitle', '')}
                  style={styles.chipClearHit}
                  hitSlop={12}>
                  <FontAwesome name="times-circle" size={20} color={homeShell.blue} />
                </Pressable>
              ) : null}
            </ScrollView>

            <Text style={[styles.modalLabel, isRTL && styles.txtRtl]}>{t('schoolsCityLabel')}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('schoolsCityLabel')}
              onPress={() => {
                setSectorPickOpen(false);
                setCityPickOpen(true);
              }}
              style={({ pressed }) => [
                styles.selectField,
                isRTL && styles.selectFieldRtl,
                pressed && { opacity: 0.92 },
              ]}>
              <Text
                style={[
                  styles.selectFieldTxt,
                  !value.ville.trim() && styles.selectFieldPlaceholder,
                  isRTL && styles.txtRtl,
                ]}
                numberOfLines={1}>
                {villeLabel}
              </Text>
              <FontAwesome
                name={isRTL ? 'chevron-left' : 'chevron-right'}
                size={14}
                color={homeShell.cardMuted}
              />
            </Pressable>

            <Text style={[styles.modalLabel, isRTL && styles.txtRtl]}>{t('schoolsSectorLabel')}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('schoolsSectorLabel')}
              onPress={() => {
                setCityPickOpen(false);
                setSectorPickOpen(true);
              }}
              style={({ pressed }) => [
                styles.selectField,
                isRTL && styles.selectFieldRtl,
                pressed && { opacity: 0.92 },
              ]}>
              <Text
                style={[
                  styles.selectFieldTxt,
                  !value.secteurId.trim() && styles.selectFieldPlaceholder,
                  isRTL && styles.txtRtl,
                ]}
                numberOfLines={1}>
                {secteurLabel}
              </Text>
              <FontAwesome
                name={isRTL ? 'chevron-left' : 'chevron-right'}
                size={14}
                color={homeShell.cardMuted}
              />
            </Pressable>

            <Text style={[styles.modalLabel, isRTL && styles.txtRtl]}>{t('schoolsDiplomaLabel')}</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={isRTL && styles.hScrollRtl}
              contentContainerStyle={styles.hScrollTight}
              nestedScrollEnabled>
              <Pressable
                onPress={() => set('diplome', '')}
                style={[styles.miniChip, !value.diplome && styles.miniChipOn]}>
                <Text
                  style={[
                    styles.miniChipTxt,
                    !value.diplome && styles.miniChipTxtOn,
                  ]}>
                  {t('schoolsAllDiplomas')}
                </Text>
              </Pressable>
              {DIPLOME_OPTIONS.map((d) => (
                <Pressable
                  key={d}
                  onPress={() => set('diplome', d)}
                  style={[styles.miniChip, value.diplome === d && styles.miniChipOn]}>
                  <Text
                    style={[styles.miniChipTxt, value.diplome === d && styles.miniChipTxtOn]}
                    numberOfLines={1}>
                    {d}
                  </Text>
                </Pressable>
              ))}
              {value.diplome.trim() ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('schoolsClearFilter')}
                  onPress={() => set('diplome', '')}
                  style={styles.chipClearHit}
                  hitSlop={12}>
                  <FontAwesome name="times-circle" size={20} color={homeShell.blue} />
                </Pressable>
              ) : null}
            </ScrollView>

            <Text style={[styles.modalLabel, isRTL && styles.txtRtl]}>{t('schoolsFeesLabel')}</Text>
            <View style={[styles.row2, isRTL && styles.rowRtl]}>
              <View style={styles.fraisCol}>
                <Text style={[styles.fraisLbl, isRTL && styles.txtRtl]}>{t('schoolsMin')}</Text>
                <TextInput
                  value={fraisMinStr}
                  onChangeText={(txt) => syncFraisFromStr('min', txt)}
                  keyboardType="number-pad"
                  style={[styles.fraisInput, isRTL && styles.searchInputRtl]}
                />
              </View>
              <View style={styles.fraisCol}>
                <Text style={[styles.fraisLbl, isRTL && styles.txtRtl]}>{t('schoolsMax')}</Text>
                <TextInput
                  value={fraisMaxStr}
                  onChangeText={(txt) => syncFraisFromStr('max', txt)}
                  keyboardType="number-pad"
                  style={[styles.fraisInput, isRTL && styles.searchInputRtl]}
                />
              </View>
            </View>

            {/*
              Éligibilité — basée sur la filière du bac (cf.
              `evaluateEligibilityByFiliere` côté parent). On ne tient pas
              compte de l'année du bac pour ce filtre rapide afin d'éviter
              une exclusion trop restrictive.
            */}
            <Text style={[styles.modalLabel, isRTL && styles.txtRtl]}>
              {t('inscFilterEligibilityLabel')}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={isRTL && styles.hScrollRtl}
              contentContainerStyle={styles.hScrollTight}
              nestedScrollEnabled>
              {(
                [
                  { value: 'all', label: t('inscFilterEligibilityAll') },
                  { value: 'eligible', label: t('inscFilterEligibilityEligible') },
                  { value: 'not_eligible', label: t('inscFilterEligibilityNotEligible') },
                ] as const
              ).map((opt) => (
                <Pressable
                  key={opt.value}
                  onPress={() => set('eligibilityFilter', opt.value)}
                  style={[
                    styles.modalTypeChip,
                    value.eligibilityFilter === opt.value && styles.modalTypeChipOn,
                  ]}>
                  <Text
                    style={[
                      styles.modalTypeChipTxt,
                      value.eligibilityFilter === opt.value && styles.modalTypeChipTxtOn,
                    ]}>
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <View style={styles.toggleRow}>
              <Toggle
                label={t('schoolsToggleRecommended')}
                value={value.recommendedOnly}
                onToggle={() => set('recommendedOnly', !value.recommendedOnly)}
              />
              <Toggle
                label={t('schoolsToggleSponsored')}
                value={value.sponsoredOnly}
                onToggle={() => set('sponsoredOnly', !value.sponsoredOnly)}
              />
              <Toggle
                label={t('schoolsToggleFeatured')}
                value={value.featuredOnly}
                onToggle={() => set('featuredOnly', !value.featuredOnly)}
              />
              <Toggle
                label={t('schoolsToggleAccreditationEtat')}
                value={value.accreditationEtat}
                onToggle={() => set('accreditationEtat', !value.accreditationEtat)}
              />
              <Toggle
                label={t('schoolsToggleExchangeInternational')}
                value={value.echangeInternational}
                onToggle={() => set('echangeInternational', !value.echangeInternational)}
              />
              <Toggle
                label={t('schoolsToggleEtawjihiOnly')}
                value={value.eTawjihiOnly}
                onToggle={() => set('eTawjihiOnly', !value.eTawjihiOnly)}
              />
            </View>

            <Text style={styles.modalFootnote}>{t('schoolsFootnote')}</Text>
          </ScrollView>

          <View style={styles.modalActions}>
            <Pressable
              onPress={reset}
              style={({ pressed }) => [styles.modalGhostBtn, pressed && { opacity: 0.9 }]}>
              <Text style={styles.modalGhostTxt}>{t('schoolsReset')}</Text>
            </Pressable>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [styles.modalPrimaryBtn, pressed && { opacity: 0.92 }]}>
              <Text style={styles.modalPrimaryTxt}>{t('schoolsApply')}</Text>
            </Pressable>
          </View>
        </View>

        {pickSheetOpen ? (
          <View style={styles.pickSheetRoot} pointerEvents="box-none">
            <Pressable style={StyleSheet.absoluteFillObject} onPress={closePickSheetsOnly} />
            {cityPickOpen ? (
              <SearchablePickPanel
                isActive={cityPickOpen}
                title={t('setupCityModalTitle')}
                searchPlaceholder={t('setupCitySearchPlaceholder')}
                emptyLabel={t('setupCityNoResults')}
                allLabel={t('schoolsAllCities')}
                items={cityPickItems}
                selectedValue={value.ville.trim()}
                onPick={(v) => set('ville', v)}
                onClose={() => setCityPickOpen(false)}
                rtl={isRTL}
              />
            ) : (
              <SearchablePickPanel
                isActive={sectorPickOpen}
                title={t('schoolsSectorPickTitle')}
                searchPlaceholder={t('schoolsSectorSearchPlaceholder')}
                emptyLabel={t('schoolsSectorNoResults')}
                allLabel={t('schoolsAllSectors')}
                items={secteurPickItems}
                selectedValue={value.secteurId.trim()}
                onPick={(v) => set('secteurId', v)}
                onClose={() => setSectorPickOpen(false)}
                rtl={isRTL}
              />
            )}
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

function Toggle({
  label,
  value,
  onToggle,
}: {
  label: string;
  value: boolean;
  onToggle: () => void;
}) {
  const { isRTL } = useLocale();
  return (
    <Pressable
      onPress={onToggle}
      style={({ pressed }) => [styles.tgl, isRTL && styles.rowRtl, pressed && { opacity: 0.92 }]}>
      <View style={[styles.tglBox, value && styles.tglBoxOn]}>
        {value ? <FontAwesome name="check" size={12} color={homeShell.text} /> : null}
      </View>
      <Text style={[styles.tglTxt, isRTL && styles.txtRtl]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2,6,23,0.55)',
  },
  modalCard: {
    width: '100%',
    maxHeight: '92%',
    backgroundColor: homeShell.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: homeShell.borderOnWhite,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 16,
  },
  modalCardBehindPick: { opacity: 0.38 },
  pickSheetRoot: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    justifyContent: 'flex-end',
  },
  modalHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(15,23,42,0.15)',
    marginBottom: spacing.sm,
  },
  modalScrollContent: { paddingBottom: spacing.sm, flexGrow: 1 },
  modalHint: {
    color: homeShell.cardMuted,
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginBottom: spacing.md,
    lineHeight: 19,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  rowRtl: { flexDirection: 'row-reverse' },
  txtRtl: { textAlign: 'right', writingDirection: 'rtl' },
  hScrollRtl: { direction: 'rtl' },
  hScrollTight: { paddingEnd: spacing.lg, alignItems: 'center', gap: 0 },
  modalTitle: {
    color: homeShell.cardText,
    fontSize: fontSize.lg,
    fontWeight: '900',
    letterSpacing: -0.2,
    flex: 1,
    paddingEnd: spacing.md,
  },
  modalLabel: {
    color: homeShell.blue,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.45,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  selectField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
    borderRadius: radius.lg,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 6,
    marginBottom: spacing.sm,
  },
  selectFieldRtl: { flexDirection: 'row-reverse' },
  selectFieldTxt: {
    flex: 1,
    minWidth: 0,
    color: homeShell.cardText,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  selectFieldPlaceholder: { color: homeShell.cardMuted, fontWeight: '600' },
  modalInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
  },
  modalInput: {
    flex: 1,
    minWidth: 0,
    color: homeShell.cardText,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  searchInputRtl: { textAlign: 'right', writingDirection: 'rtl' },
  modalTypeChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
    borderRadius: radius.full,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
    marginEnd: 8,
  },
  modalTypeChipOn: {
    backgroundColor: 'rgba(51,62,143,0.10)',
    borderColor: 'rgba(51,62,143,0.28)',
  },
  modalTypeChipTxt: { color: homeShell.cardMuted, fontWeight: '800', fontSize: 13 },
  modalTypeChipTxtOn: { color: homeShell.blue },
  chipClearHit: { paddingHorizontal: 8, paddingVertical: 6 },
  miniChip: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: radius.full,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
    marginEnd: 6,
    marginBottom: 6,
    maxWidth: 220,
  },
  miniChipOn: {
    backgroundColor: 'rgba(51,62,143,0.10)',
    borderColor: 'rgba(51,62,143,0.28)',
  },
  miniChipTxt: { color: homeShell.cardMuted, fontSize: 12, fontWeight: '700' },
  miniChipTxtOn: { color: homeShell.blue },
  row2: { flexDirection: 'row', gap: spacing.md },
  fraisCol: { flex: 1 },
  fraisLbl: { fontSize: 11, fontWeight: '800', color: '#94A3B8', marginBottom: 6 },
  fraisInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: homeShell.cardText,
    fontWeight: '700',
    fontSize: fontSize.md,
  },
  toggleRow: { marginTop: spacing.md, gap: spacing.md },
  tgl: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tglBox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: homeShell.borderOnWhite,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tglBoxOn: { backgroundColor: homeShell.green, borderColor: 'rgba(47,206,148,0.55)' },
  tglTxt: { flex: 1, color: homeShell.cardText, fontSize: fontSize.md, fontWeight: '700' },
  modalFootnote: {
    marginTop: spacing.md,
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
    fontStyle: 'italic',
    marginBottom: spacing.sm,
  },
  modalActions: {
    paddingTop: spacing.md,
    marginTop: spacing.xs,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: homeShell.borderOnWhite,
  },
  modalGhostBtn: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
    paddingVertical: 12,
    borderRadius: radius.full,
    alignItems: 'center',
  },
  modalGhostTxt: { color: homeShell.blueDeep, fontWeight: '900', fontSize: fontSize.md },
  modalPrimaryBtn: {
    flex: 1,
    backgroundColor: homeShell.blue,
    paddingVertical: 12,
    borderRadius: radius.full,
    alignItems: 'center',
  },
  modalPrimaryTxt: { color: homeShell.text, fontWeight: '900', fontSize: fontSize.md },
});
