import type { ComponentProps } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import {
  getDiagnosticStepLabels,
  type DiagnosticUiLocale,
} from '@/constants/schoolDiagnosticLocale';

type FaName = ComponentProps<typeof FontAwesome>['name'];

export type { DiagnosticUiLocale };

export type DiagnosticStepMeta = {
  icon: FaName;
  title: string;
  subtitle: string;
};

const STEP_SUBTITLES: Record<DiagnosticUiLocale, readonly string[]> = {
  fr: [
    'Qui êtes-vous et comment vous joindre ?',
    'Votre niveau, bac et filière actuels',
    'Vos notes — une estimation suffit',
    'Public, privé, semi-public ou militaire',
    'Villes, mobilité et budget',
    'Concours et préparation',
    'Projet d’études et consentement',
  ],
  ar: [
    'من أنت وكيف نتواصل معك؟',
    'مستواك وباكك والشعبة الحالية',
    'نقطك — تقدير كافٍ',
    'عمومي، خاص، شبه عمومي أو عسكري',
    'المدن، التنقل والميزانية',
    'المباريات والتحضير',
    'مشروع الدراسة والموافقة',
  ],
};

/** Messages affichés pendant l’envoi / analyse du diagnostic. */
export const DIAGNOSTIC_ANALYSIS_MESSAGES: Record<DiagnosticUiLocale, readonly string[]> = {
  fr: [
    'Analyse de votre profil…',
    'Comparaison avec les établissements…',
    'Calcul des scores d’adéquation…',
    'Préparation de vos recommandations…',
  ],
  ar: [
    'جاري تحليل ملفك…',
    'مقارنة مع المؤسسات…',
    'حساب درجات التوافق…',
    'إعداد توصياتك…',
  ],
};

export const DIAGNOSTIC_LOADING_COPY: Record<
  DiagnosticUiLocale,
  {
    bootTitle: string;
    bootSubtitle: string;
    analysisTitle: string;
    analysisSubtitle: string;
    iaEnrichmentTitle: string;
    iaEnrichmentSubtitle: string;
    resultsTitle: string;
    resultsSubtitle: string;
    reportTitle: string;
    reportSubtitle: string;
    saving: string;
    progressLabel: string;
    secureFooter: string;
  }
> = {
  fr: {
    bootTitle: 'Diagnostic d’orientation',
    bootSubtitle: 'Chargement de votre parcours…',
    analysisTitle: 'Analyse en cours',
    analysisSubtitle: 'Nous personnalisons vos recommandations d’écoles',
    iaEnrichmentTitle: 'Enrichissement IA',
    iaEnrichmentSubtitle: 'Synthèse globale et pourcentages de recommandation',
    resultsTitle: 'Vos recommandations',
    resultsSubtitle: 'Récupération de votre classement personnalisé…',
    reportTitle: 'Rapport du diagnostic',
    reportSubtitle: 'Préparation de votre rapport…',
    saving: 'Enregistrement…',
    progressLabel: 'Progression',
    secureFooter: 'Données sécurisées · E-Tawjihi',
  },
  ar: {
    bootTitle: 'تشخيص التوجيه',
    bootSubtitle: 'جاري تحميل مسارك…',
    analysisTitle: 'جاري التحليل',
    analysisSubtitle: 'نخصص توصيات المدارس لك',
    iaEnrichmentTitle: 'تحليل الذكاء الاصطناعي',
    iaEnrichmentSubtitle: 'إعداد الملخص ونسب التوصية',
    resultsTitle: 'توصياتك',
    resultsSubtitle: 'جاري استرجاع ترتيبك الشخصي…',
    reportTitle: 'تقرير التشخيص',
    reportSubtitle: 'جاري إعداد تقريرك…',
    saving: 'جاري الحفظ…',
    progressLabel: 'التقدم',
    secureFooter: 'بيانات آمنة · E-Tawjihi',
  },
};

/** Locale des textes UI / analyse IA (priorité à `locale` explicite, sinon déduit du RTL). */
export function diagnosticContentLocale(
  rtl?: boolean,
  locale?: DiagnosticUiLocale,
): DiagnosticUiLocale {
  if (locale === 'ar' || locale === 'fr') return locale;
  return rtl ? 'ar' : 'fr';
}

export function getDiagnosticStepMeta(locale: DiagnosticUiLocale): DiagnosticStepMeta[] {
  const titles = getDiagnosticStepLabels(locale);
  const subs = STEP_SUBTITLES[locale];
  const icons: FaName[] = [
    'user',
    'graduation-cap',
    'line-chart',
    'university',
    'map-marker',
    'trophy',
    'compass',
  ];
  return titles.map((title, i) => ({
    icon: icons[i] ?? 'list',
    title,
    subtitle: subs[i] ?? '',
  }));
}

/** @deprecated Utiliser `getDiagnosticStepMeta(locale)`. */
export const DIAGNOSTIC_STEP_META: DiagnosticStepMeta[] = getDiagnosticStepMeta('fr');
