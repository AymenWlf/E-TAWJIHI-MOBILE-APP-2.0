import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { SearchablePickSheet, type SearchablePickItem } from '@/components/schools/SearchablePickSheet';
import { establishmentLeadGenSubtitle } from '@/components/schools/EstablishmentLeadGenSection';
import { Text } from '@/components/ui/Text';
import {
  BAC_TYPES,
  NIVEAU_ETUDE_OPTIONS,
  SPECIALITES_MISSION,
  type LabeledOption,
} from '@/constants/academicSetup';
import type { HomeCopyKey } from '@/constants/i18n';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import type { EstablishmentNormalized } from '@/services/establishments';
import { listCities } from '@/services/referenceData';
import {
  recordReferencingContactClickNative,
  submitReferencingLead,
  type ListingPlacementInfo,
} from '@/services/referencingAds';
import { placementIsActivelySponsored } from '@/utils/referencingPlacementUi';
import { getUserProfile } from '@/services/userProfile';
import { homeShell } from '@/theme/homeShell';
import { brand, fontSize, radius, spacing } from '@/theme/tokens';
import { filiereOptionsForNiveau } from '@/utils/academicFiliere';
import { fireAndForget } from '@/utils/fireAndForget';

const LEAD_FORM_DRAFT_KEY = 'etawjihi_lead_form_draft_v1';

type Props = {
  establishment: Pick<EstablishmentNormalized, 'id' | 'nom' | 'sigle' | 'nomArabe'>;
  placement: ListingPlacementInfo;
  variant?: 'inline' | 'compact' | 'detail' | 'modal';
  /** Sélecteurs rendus par le parent (évite modaux imbriqués dans EstablishmentLeadGenModal). */
  externalPickField?: LeadGenPickField | null;
  onExternalPickFieldChange?: (field: LeadGenPickField | null) => void;
  onPickConfigSnapshot?: (config: LeadGenPickConfigMap) => void;
  /** Appelé après envoi réussi (écran de confirmation). */
  onSubmitted?: () => void;
};

type Role = 'élève' | 'tuteur';
type BacType = 'normal' | 'mission';
export type LeadGenPickField = 'role' | 'niveau' | 'bacType' | 'filiere' | 'specialite1' | 'specialite2' | 'ville';

type PickField = LeadGenPickField | null;

export type LeadGenPickConfigMap = Record<
  LeadGenPickField,
  {
    title: string;
    items: SearchablePickItem[];
    value: string;
    onPick: (value: string) => void;
  }
>;

function buildPhoneForApi(raw: string): string {
  const n = raw.replace(/\s/g, '').trim();
  if (!n) return '';
  if (n.startsWith('+')) return n;
  if (n.startsWith('0')) return n;
  if (/^\d{9}$/.test(n)) return `+212${n}`;
  return n;
}

export function EstablishmentLeadGenForm({
  establishment,
  placement,
  variant = 'inline',
  externalPickField,
  onExternalPickFieldChange,
  onPickConfigSnapshot,
  onSubmitted,
}: Props) {
  const { t, locale, isRTL } = useLocale();
  const { user, getValidAccessToken } = useAuth();
  const contactRecorded = useRef(false);
  const isModal = variant === 'modal';
  const sheetFields = variant === 'modal' || variant === 'detail';
  const embedPicks = isModal && onExternalPickFieldChange != null;

  const [role, setRole] = useState<Role>('élève');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [niveau, setNiveau] = useState('');
  const [bacType, setBacType] = useState<BacType>('normal');
  const [filiere, setFiliere] = useState('');
  const [specialite1, setSpecialite1] = useState('');
  const [specialite2, setSpecialite2] = useState('');
  const [ville, setVille] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [internalPickField, setInternalPickField] = useState<PickField>(null);
  const [cityItems, setCityItems] = useState<SearchablePickItem[]>([]);

  const pickField = embedPicks ? (externalPickField ?? null) : internalPickField;
  const setPickField = useCallback(
    (field: PickField) => {
      if (field != null) {
        Keyboard.dismiss();
      }
      if (embedPicks) {
        onExternalPickFieldChange?.(field);
      } else {
        setInternalPickField(field);
      }
    },
    [embedPicks, onExternalPickFieldChange],
  );

  const applyPickValue = useCallback((field: LeadGenPickField, value: string) => {
    if (field === 'role') setRole(value === 'tuteur' ? 'tuteur' : 'élève');
    if (field === 'niveau') setNiveau(value);
    if (field === 'bacType') setBacType(value === 'mission' ? 'mission' : 'normal');
    if (field === 'filiere') setFiliere(value);
    if (field === 'specialite1') setSpecialite1(value);
    if (field === 'specialite2') setSpecialite2(value);
    if (field === 'ville') setVille(value);
  }, []);

  const frenchLabel =
    establishment.sigle && establishment.nom
      ? `${establishment.sigle} – ${establishment.nom}`
      : establishment.nom;

  const toPickItems = useCallback(
    (options: readonly LabeledOption[] | LabeledOption[]): SearchablePickItem[] =>
      options
        .filter((o) => o.value !== '')
        .map((o) => ({
          id: o.value,
          value: o.value,
          label: locale === 'ar' && o.labelAr ? o.labelAr : o.label,
        })),
    [locale],
  );

  const specialiteMissionOptions = useMemo<LabeledOption[]>(
    () => SPECIALITES_MISSION.map((s) => ({ value: s, label: s, labelAr: s })),
    [],
  );

  const pickConfig = useMemo<LeadGenPickConfigMap>(
    () => ({
      role: {
        title: t('estLeadgenRole'),
        items: [
          { id: 'élève', value: 'élève', label: t('estLeadgenRoleStudent') },
          { id: 'tuteur', value: 'tuteur', label: t('estLeadgenRoleTutor') },
        ],
        value: role,
        onPick: (value) => applyPickValue('role', value),
      },
      niveau: {
        title: t('setupStudyLevel'),
        items: toPickItems(NIVEAU_ETUDE_OPTIONS),
        value: niveau,
        onPick: (value) => applyPickValue('niveau', value),
      },
      bacType: {
        title: t('setupBacType'),
        items: BAC_TYPES.map((b) => ({
          id: b.value,
          value: b.value,
          label: locale === 'ar' && b.labelAr ? b.labelAr : b.label,
        })),
        value: bacType,
        onPick: (value) => applyPickValue('bacType', value),
      },
      filiere: {
        title: t('setupFiliere'),
        items: toPickItems(filiereOptionsForNiveau(niveau)),
        value: filiere,
        onPick: (value) => applyPickValue('filiere', value),
      },
      specialite1: {
        title: t('setupSpecialite1'),
        items: toPickItems(specialiteMissionOptions),
        value: specialite1,
        onPick: (value) => applyPickValue('specialite1', value),
      },
      specialite2: {
        title: t('setupSpecialite2'),
        items: toPickItems(specialiteMissionOptions),
        value: specialite2,
        onPick: (value) => applyPickValue('specialite2', value),
      },
      ville: {
        title: t('setupCity'),
        items: cityItems,
        value: ville,
        onPick: (value) => applyPickValue('ville', value),
      },
    }),
    [
      t,
      locale,
      toPickItems,
      role,
      niveau,
      bacType,
      filiere,
      specialite1,
      specialite2,
      ville,
      cityItems,
      specialiteMissionOptions,
      applyPickValue,
    ],
  );

  useEffect(() => {
    if (embedPicks) {
      onPickConfigSnapshot?.(pickConfig);
    }
  }, [embedPicks, onPickConfigSnapshot, pickConfig]);

  useEffect(() => {
    if (contactRecorded.current) return;
    contactRecorded.current = true;
    fireAndForget(recordReferencingContactClickNative({ placementId: placement.placementId }));
  }, [placement.placementId]);

  useEffect(() => {
    let cancelled = false;
    void listCities(1000).then((rows) => {
      if (cancelled) return;
      setCityItems(
        rows.map((c) => ({
          id: String(c.id),
          value: c.titre,
          label: c.titre,
        })),
      );
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (user) {
        const token = await getValidAccessToken();
        if (!token || cancelled) return;
        const profile = await getUserProfile(token);
        if (cancelled || !profile || profile.userType === 'tutor') return;
        setRole('élève');
        setName([profile.nom, profile.prenom].filter(Boolean).join(' '));
        setEmail(profile.email ?? user.email ?? '');
        setPhone(profile.telephone ?? user.phone ?? '');
        setNiveau(profile.niveau ?? '');
        setBacType(profile.bacType === 'mission' ? 'mission' : 'normal');
        setFiliere(profile.filiere ?? '');
        setSpecialite1(profile.specialite1 ?? '');
        setSpecialite2(profile.specialite2 ?? '');
        setVille(profile.ville?.titre ?? '');
        return;
      }
      try {
        const raw = await AsyncStorage.getItem(LEAD_FORM_DRAFT_KEY);
        if (!raw || cancelled) return;
        const draft = JSON.parse(raw) as Record<string, string>;
        if (draft.role === 'tuteur') setRole('tuteur');
        setName(draft.name ?? '');
        setEmail(draft.email ?? '');
        setPhone(draft.phone ?? '');
        setNiveau(draft.niveau ?? '');
        setBacType(draft.bacType === 'mission' ? 'mission' : 'normal');
        setFiliere(draft.filiere ?? '');
        setSpecialite1(draft.specialite1 ?? '');
        setSpecialite2(draft.specialite2 ?? '');
        setVille(draft.ville ?? '');
        setMessage(draft.message ?? '');
      } catch {
        /* noop */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, getValidAccessToken]);

  const onSubmit = async () => {
    if (!name.trim()) {
      setError(t('estLeadgenErrName'));
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const phoneForApi = buildPhoneForApi(phone);
      await submitReferencingLead({
        placementId: placement.placementId,
        establishmentId: establishment.id,
        campaignId: placement.campaignId ?? undefined,
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phoneForApi || undefined,
        message: message.trim() || undefined,
        source: 'referencing',
        cardSource: placementIsActivelySponsored(placement) ? 'sponsorship' : 'referencing',
        role,
        niveau: niveau || undefined,
        bacType,
        filiere: bacType === 'normal' && filiere ? filiere : undefined,
        specialite1: bacType === 'mission' && specialite1 ? specialite1 : undefined,
        specialite2: bacType === 'mission' && specialite2 ? specialite2 : undefined,
        ville: ville || undefined,
      });
      if (!user) {
        await AsyncStorage.setItem(
          LEAD_FORM_DRAFT_KEY,
          JSON.stringify({
            role,
            name: name.trim(),
            email: email.trim(),
            phone: phoneForApi || phone.trim(),
            niveau,
            bacType,
            filiere,
            specialite1,
            specialite2,
            ville,
            message: message.trim(),
          }),
        );
      }
      setSent(true);
      onSubmitted?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : t('estLeadgenErrSubmit'));
    } finally {
      setSubmitting(false);
    }
  };

  const bacTypeLabel =
    bacType === 'mission'
      ? locale === 'ar'
        ? 'باك فرنسي (ميسيون)'
        : 'Bac Mission'
      : locale === 'ar'
        ? 'باك مغربي'
        : 'Bac marocain';

  const formBody = (
    <>
      {error ? (
        <View style={[styles.errorBox, sheetFields && styles.errorBoxModal]}>
          <FontAwesome name="exclamation-circle" size={14} color={brand.error} />
          <Text style={[styles.errorTxt, isRTL && styles.txtRtl]}>{error}</Text>
        </View>
      ) : null}

      {sheetFields ? (
        <RoleSegment
          role={role}
          isRTL={isRTL}
          onChange={(r) => {
            Keyboard.dismiss();
            setRole(r);
          }}
          t={t}
        />
      ) : (
        <FieldPick
          label={t('estLeadgenRole')}
          value={role === 'tuteur' ? t('estLeadgenRoleTutor') : t('estLeadgenRoleStudent')}
          onPress={() => setPickField('role')}
          isRTL={isRTL}
          isModal={sheetFields}
        />
      )}
      <FieldInput
        label={`${t('estLeadgenName')} *`}
        value={name}
        onChangeText={setName}
        isRTL={isRTL}
        isModal={sheetFields}
        icon="user"
      />
      <FieldInput
        label={t('estLeadgenEmail')}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        isRTL={isRTL}
        isModal={sheetFields}
        icon="envelope-o"
        autoCapitalize="none"
      />
      <FieldInput
        label={t('estLeadgenPhone')}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        isRTL={isRTL}
        isModal={sheetFields}
        icon="phone"
      />
      <FieldPick
        label={t('setupStudyLevel')}
        value={niveau || t('schoolsAll')}
        onPress={() => setPickField('niveau')}
        isRTL={isRTL}
        isModal={sheetFields}
        placeholder={!niveau}
      />
      <FieldPick
        label={t('setupBacType')}
        value={bacTypeLabel}
        onPress={() => setPickField('bacType')}
        isRTL={isRTL}
        isModal={sheetFields}
      />
      {bacType === 'normal' ? (
        <FieldPick
          label={t('setupFiliere')}
          value={filiere || t('schoolsAll')}
          onPress={() => setPickField('filiere')}
          isRTL={isRTL}
          isModal={sheetFields}
          placeholder={!filiere}
        />
      ) : (
        <>
          <FieldPick
            label={t('setupSpecialite1')}
            value={specialite1 || t('schoolsAll')}
            onPress={() => setPickField('specialite1')}
            isRTL={isRTL}
            isModal={sheetFields}
            placeholder={!specialite1}
          />
          <FieldPick
            label={t('setupSpecialite2')}
            value={specialite2 || t('schoolsAll')}
            onPress={() => setPickField('specialite2')}
            isRTL={isRTL}
            isModal={sheetFields}
            placeholder={!specialite2}
          />
        </>
      )}
      <FieldPick
        label={t('setupCity')}
        value={ville || t('schoolsAll')}
        onPress={() => setPickField('ville')}
        isRTL={isRTL}
        isModal={sheetFields}
        placeholder={!ville}
      />
      <FieldInput
        label={t('estLeadgenMessage')}
        value={message}
        onChangeText={setMessage}
        multiline
        isRTL={isRTL}
        isModal={sheetFields}
        icon="comment-o"
      />

      <Pressable
        disabled={submitting}
        onPress={() => void onSubmit()}
        style={({ pressed }) => [
          styles.submitBtn,
          sheetFields && styles.submitBtnModal,
          pressed && { opacity: 0.9 },
          submitting && { opacity: 0.7 },
        ]}>
        {submitting ? (
          <ActivityIndicator color={brand.white} />
        ) : (
          <>
            <FontAwesome name="send" size={13} color={brand.white} />
            <Text style={styles.submitBtnTxt}>{t('estLeadgenSubmit')}</Text>
          </>
        )}
      </Pressable>
    </>
  );

  const pickSheet = pickField && !embedPicks ? (
    <SearchablePickSheet
      visible
      title={pickConfig[pickField].title}
      searchPlaceholder={t('schoolsSectorSearchPlaceholder')}
      emptyLabel={t('accountSelectNoResults')}
      allLabel={t('inscCandidaciesFilterAll')}
      items={pickConfig[pickField].items}
      selectedValue={pickConfig[pickField].value}
      rtl={isRTL}
      onClose={() => setPickField(null)}
      onPick={(value: string) => {
        pickConfig[pickField].onPick(value);
        setPickField(null);
      }}
    />
  ) : null;

  if (sent) {
    const schoolLine = establishmentLeadGenSubtitle(establishment);
    return (
      <View
        style={[
          styles.successBox,
          variant === 'compact' && styles.successBoxCompact,
          variant === 'detail' && styles.successBoxDetail,
          sheetFields && styles.successBoxModal,
        ]}>
        <View style={styles.successCard}>
          <View style={styles.successIconOuter}>
            <View style={styles.successIconRing}>
              <FontAwesome name="check" size={26} color={homeShell.greenDark} />
            </View>
          </View>
          <Text style={[styles.successEyebrow, isRTL && styles.txtRtl]}>{t('estLeadgenSuccessEyebrow')}</Text>
          <Text style={[styles.successTitle, isRTL && styles.txtRtl]}>{t('estLeadgenSuccessTitle')}</Text>
          <Text style={[styles.successBody, isRTL && styles.txtRtl]}>{t('estLeadgenSuccessBody')}</Text>
          <View style={[styles.successSchoolPill, isRTL && styles.successSchoolPillRtl]}>
            <FontAwesome name="graduation-cap" size={12} color={brand.primary} />
            <Text style={[styles.successSchoolPillTxt, isRTL && styles.txtRtl]} numberOfLines={2}>
              {schoolLine}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  if (variant === 'modal' && embedPicks) {
    return <View style={styles.wrapModal}>{formBody}</View>;
  }

  if (variant === 'detail' || variant === 'modal') {
    return (
      <View style={styles.wrapModal}>
        {formBody}
        {pickSheet}
      </View>
    );
  }

  return (
    <View style={[styles.wrap, variant === 'compact' && styles.wrapCompact]}>
      {variant !== 'compact' ? (
        <View style={[styles.header, isRTL && styles.headerRtl]}>
          <View style={styles.headerIcon}>
            <FontAwesome name="comment" size={18} color={brand.white} />
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.headerTitle, isRTL && styles.txtRtl]}>{t('estLeadgenTitle')}</Text>
            <Text style={[styles.headerSub, isRTL && styles.txtRtl]}>{frenchLabel}</Text>
            {establishment.nomArabe ? (
              <Text style={[styles.headerSubAr, isRTL && styles.txtRtl]}>{establishment.nomArabe}</Text>
            ) : null}
          </View>
        </View>
      ) : null}

      {variant === 'compact' ? (
        <View style={styles.formContentCompact}>{formBody}</View>
      ) : (
        <ScrollView
          style={styles.formScroll}
          contentContainerStyle={styles.formContent}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}>
          {formBody}
        </ScrollView>
      )}

      {pickSheet}
    </View>
  );
}

function RoleSegment({
  role,
  isRTL,
  onChange,
  t,
}: {
  role: Role;
  isRTL?: boolean;
  onChange: (r: Role) => void;
  t: (key: HomeCopyKey) => string;
}) {
  return (
    <View style={styles.field}>
      <Text style={[styles.labelModal, isRTL && styles.txtRtl]}>{t('estLeadgenRole')}</Text>
      <View style={[styles.roleRow, isRTL && styles.roleRowRtl]}>
        {(['élève', 'tuteur'] as const).map((r) => {
          const active = role === r;
          const label = r === 'tuteur' ? t('estLeadgenRoleTutor') : t('estLeadgenRoleStudent');
          return (
            <Pressable
              key={r}
              onPress={() => onChange(r)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={({ pressed }) => [
                styles.roleChip,
                active && styles.roleChipOn,
                pressed && { opacity: 0.9 },
              ]}>
              <FontAwesome
                name={r === 'tuteur' ? 'users' : 'graduation-cap'}
                size={12}
                color={active ? homeShell.blue : homeShell.cardMuted}
              />
              <Text style={[styles.roleChipTxt, active && styles.roleChipTxtOn, isRTL && styles.txtRtl]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function FieldInput({
  label,
  value,
  onChangeText,
  keyboardType,
  multiline,
  isRTL,
  isModal,
  icon,
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  multiline?: boolean;
  isRTL?: boolean;
  isModal?: boolean;
  icon?: React.ComponentProps<typeof FontAwesome>['name'];
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}) {
  if (isModal) {
    return (
      <View style={styles.field}>
        <Text style={[styles.labelModal, isRTL && styles.txtRtl]}>{label}</Text>
        <View style={[styles.inputRowModal, multiline && styles.inputRowModalMultiline, isRTL && styles.inputRowModalRtl]}>
          {icon ? (
            <FontAwesome name={icon} size={14} color={homeShell.cardMuted} style={styles.inputRowIcon} />
          ) : null}
          <TextInput
            value={value}
            onChangeText={onChangeText}
            keyboardType={keyboardType}
            multiline={multiline}
            numberOfLines={multiline ? 4 : 1}
            textAlignVertical={multiline ? 'top' : 'center'}
            autoCapitalize={autoCapitalize}
            style={[styles.inputModal, multiline && styles.inputModalMultiline, isRTL && styles.inputRtl]}
            placeholderTextColor={homeShell.cardMuted}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.field}>
      <Text style={[styles.label, isRTL && styles.txtRtl]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        textAlignVertical={multiline ? 'top' : 'center'}
        autoCapitalize={autoCapitalize}
        style={[styles.input, multiline && styles.inputMultiline, isRTL && styles.inputRtl]}
        placeholderTextColor={brand.textMuted}
      />
    </View>
  );
}

function FieldPick({
  label,
  value,
  onPress,
  isRTL,
  isModal,
  placeholder,
}: {
  label: string;
  value: string;
  onPress: () => void;
  isRTL?: boolean;
  isModal?: boolean;
  placeholder?: boolean;
}) {
  if (isModal) {
    return (
      <View style={styles.field}>
        <Text style={[styles.labelModal, isRTL && styles.txtRtl]}>{label}</Text>
        <Pressable
          onPress={() => {
            Keyboard.dismiss();
            onPress();
          }}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.pickBtnModal,
            isRTL && styles.pickBtnModalRtl,
            pressed && { opacity: 0.9 },
          ]}>
          <Text
            style={[
              styles.pickBtnModalTxt,
              placeholder && styles.pickBtnModalPlaceholder,
              isRTL && styles.txtRtl,
            ]}
            numberOfLines={2}>
            {value}
          </Text>
          <FontAwesome name="chevron-down" size={11} color={homeShell.cardMuted} />
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.field}>
      <Text style={[styles.label, isRTL && styles.txtRtl]}>{label}</Text>
      <Pressable onPress={onPress} style={({ pressed }) => [styles.pickBtn, pressed && { opacity: 0.9 }]}>
        <Text style={[styles.pickBtnTxt, isRTL && styles.txtRtl]} numberOfLines={2}>
          {value}
        </Text>
        <FontAwesome name={isRTL ? 'chevron-left' : 'chevron-right'} size={12} color={brand.textMuted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
    backgroundColor: brand.white,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  wrapCompact: {
    borderRadius: radius.lg,
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
    backgroundColor: 'transparent',
  },
  wrapModal: {
    gap: spacing.md,
  },
  wrapDetail: {
    gap: spacing.xs,
  },
  detailSubtitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: brand.text,
    lineHeight: 20,
  },
  detailSubtitleAr: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: brand.textMuted,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  formContentDetail: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: brand.primary,
  },
  headerRtl: {
    flexDirection: 'row-reverse',
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  headerTitle: {
    color: brand.white,
    fontSize: fontSize.lg,
    fontWeight: '800',
  },
  headerSub: {
    marginTop: 2,
    color: 'rgba(255,255,255,0.92)',
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  headerSubAr: {
    marginTop: 2,
    color: 'rgba(255,255,255,0.85)',
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  formScroll: {
    maxHeight: 520,
  },
  formContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  formContentCompact: {
    padding: 0,
    gap: spacing.md,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: brand.textSecondary,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  labelModal: {
    fontSize: 12,
    fontWeight: '900',
    color: homeShell.blue,
    letterSpacing: 0.45,
    textTransform: 'uppercase',
  },
  roleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  roleRowRtl: {
    flexDirection: 'row-reverse',
  },
  roleChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
    backgroundColor: '#F8FAFC',
  },
  roleChipOn: {
    backgroundColor: 'rgba(51, 62, 143, 0.10)',
    borderColor: 'rgba(51, 62, 143, 0.28)',
  },
  roleChipTxt: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: homeShell.cardMuted,
  },
  roleChipTxtOn: {
    color: homeShell.blue,
    fontWeight: '800',
  },
  inputRowModal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
    borderRadius: radius.lg,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  inputRowModalMultiline: {
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    minHeight: 108,
  },
  inputRowModalRtl: {
    flexDirection: 'row-reverse',
  },
  inputRowIcon: {
    marginTop: 2,
  },
  inputModal: {
    flex: 1,
    minWidth: 0,
    fontSize: fontSize.md,
    fontWeight: '600',
    color: homeShell.cardText,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
  },
  inputModalMultiline: {
    minHeight: 88,
    paddingTop: 4,
    textAlignVertical: 'top',
  },
  pickBtnModal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 13,
    backgroundColor: '#F8FAFC',
    minHeight: 48,
  },
  pickBtnModalRtl: {
    flexDirection: 'row-reverse',
  },
  pickBtnModalTxt: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: '600',
    color: homeShell.cardText,
  },
  pickBtnModalPlaceholder: {
    color: homeShell.cardMuted,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: brand.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: fontSize.sm,
    color: brand.text,
    backgroundColor: brand.backgroundSoft,
  },
  inputMultiline: {
    minHeight: 96,
    paddingTop: 12,
  },
  inputRtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  pickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: brand.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    backgroundColor: brand.backgroundSoft,
  },
  pickBtnTxt: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: brand.text,
  },
  submitBtn: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: radius.md,
    backgroundColor: brand.primary,
    paddingVertical: 14,
    minHeight: 48,
    shadowColor: brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtnModal: {
    borderRadius: radius.lg,
    marginTop: spacing.xs,
    minHeight: 50,
  },
  submitBtnTxt: {
    color: brand.white,
    fontSize: fontSize.sm,
    fontWeight: '800',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    backgroundColor: 'rgba(239, 68, 68, 0.06)',
    padding: spacing.md,
  },
  errorBoxModal: {
    borderRadius: radius.lg,
  },
  errorTxt: {
    color: brand.error,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  successBox: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  successBoxCompact: {
    paddingVertical: spacing.sm,
  },
  successBoxDetail: {
    paddingHorizontal: 0,
  },
  successBoxModal: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    minHeight: 280,
    justifyContent: 'center',
  },
  successCard: {
    width: '100%',
    alignItems: 'center',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.22)',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    gap: spacing.sm,
    shadowColor: homeShell.greenDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  successIconOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  successIconRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: brand.white,
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successEyebrow: {
    fontSize: 11,
    fontWeight: '800',
    color: homeShell.greenDark,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    textAlign: 'center',
  },
  successTitle: {
    fontSize: fontSize.xl,
    fontWeight: '900',
    color: brand.text,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  successBody: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: brand.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    maxWidth: 300,
  },
  successSchoolPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.full,
    backgroundColor: 'rgba(51, 62, 143, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(51, 62, 143, 0.12)',
    maxWidth: '100%',
  },
  successSchoolPillRtl: {
    flexDirection: 'row-reverse',
  },
  successSchoolPillTxt: {
    flexShrink: 1,
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: brand.primary,
    textAlign: 'center',
  },
  txtRtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
