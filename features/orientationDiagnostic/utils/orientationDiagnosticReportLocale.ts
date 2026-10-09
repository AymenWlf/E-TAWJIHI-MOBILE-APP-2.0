import {
  localizeAmbitionLabel,
  localizeRiasecLabel,
  tOd,
  tOdFill,
  type OrientationUiLocale,
} from '../data/orientationDiagnosticI18n';
import type {
  OrientationReport,
  OrientationSchoolReco,
  RiasecLetter,
} from '../types/orientationDiagnosticPrototype';
import type { DiagnosticTierId } from './schoolDiagnosticTier';

const REPORT_METIER_NAMES: Record<string, [fr: string, ar: string]> = {
  ing_ia: ['Ingénieur IA / Data', 'مهندس ذكاء اصطناعي / بيانات'],
  dev: ['Développeur logiciel', 'مطور برمجيات'],
  consultant: ['Consultant stratégie', 'مستشار استراتيجي'],
  product: ['Product Manager', 'مدير منتج'],
  inge_indus: ['Ingénieur industriel', 'مهندس صناعي'],
  founder: ['Entrepreneur / fondateur', 'رائد أعمال ومؤسس'],
  finance_ana: ['Analyste financier', 'محلل مالي'],
  mkt: ['Responsable marketing', 'مسؤول تسويق'],
  med: ['Métiers de la santé', 'مهن الصحة'],
  enseignant: ['Enseignant / formateur', 'أستاذ ومكوّن'],
  ux: ['Designer UX / UI', 'مصمم تجربة / واجهة المستخدم'],
  data_sci: ['Data scientist', 'عالم بيانات'],
};

export function reportMetierBilingualLines(
  id: string,
  fallback: string,
  locale: OrientationUiLocale,
): { primary: string; secondary?: string; primaryRtl: boolean; secondaryRtl: boolean } {
  const known = REPORT_METIER_NAMES[id];
  const separator = fallback.indexOf(' · ');
  const fr = known?.[0] || (separator > 0 ? fallback.slice(0, separator).trim() : fallback);
  const ar = known?.[1] || (separator > 0 ? fallback.slice(separator + 3).trim() : '');
  return locale === 'ar'
    ? { primary: ar || fr, secondary: ar ? fr : undefined, primaryRtl: Boolean(ar), secondaryRtl: false }
    : { primary: fr, secondary: ar || undefined, primaryRtl: false, secondaryRtl: true };
}

const PROFILE_TITLE_AR: Record<string, string> = {
  'L’Explorateur Stratège': 'المستكشف الاستراتيجي',
  'L’Analyste Curieux': 'المحلل الفضولي',
  'Le Bâtisseur de Projets': 'باني المشاريع',
  'Le Leader Ambitionné': 'القائد الطموح',
  'Le Facilitateur Engagé': 'الميسّر الملتزم',
  'Le Créateur Orienté Sens': 'المبدع الموجّه بالمعنى',
  'Le Praticien Concret': 'الممارس العملي',
  'L’Organisateur Fiable': 'المنظّم الموثوق',
  'Le Profil en Exploration': 'ملف قيد الاستكشاف',
};

/** Libellés FR canoniques (clé = id famille du moteur). */
const FAMILY_LABEL_FR: Record<string, string> = {
  tech: 'Technologie & numérique',
  conseil: 'Conseil & stratégie',
  inge: 'Ingénierie',
  entre: 'Entrepreneuriat',
  finance: 'Finance & gestion',
  marketing: 'Marketing stratégique',
  sante: 'Santé & soin',
  edu: 'Éducation & formation',
  design: 'Design & création',
  data: 'Data & analyse',
};

const FAMILY_LABEL_AR: Record<string, string> = {
  tech: 'التكنولوجيا والرقمنة',
  conseil: 'الاستشارة والاستراتيجية',
  inge: 'الهندسة',
  entre: 'ريادة الأعمال',
  finance: 'المالية والتدبير',
  marketing: 'التسويق الاستراتيجي',
  sante: 'الصحة والرعاية',
  edu: 'التربية والتكوين',
  design: 'التصميم والإبداع',
  data: 'البيانات والتحليل',
  'Technologie & numérique': 'التكنولوجيا والرقمنة',
  'Conseil & stratégie': 'الاستشارة والاستراتيجية',
  Ingénierie: 'الهندسة',
  Entrepreneuriat: 'ريادة الأعمال',
  'Finance & gestion': 'المالية والتدبير',
  'Marketing stratégique': 'التسويق الاستراتيجي',
  'Santé & soin': 'الصحة والرعاية',
  'Éducation & formation': 'التربية والتكوين',
  'Design & création': 'التصميم والإبداع',
  'Data & analyse': 'البيانات والتحليل',
};

const DIAG_LABEL_AR: Record<string, string> = {
  'Décision active': 'قرار فعّال',
  'Affinage du projet': 'صقل المشروع',
  'Exploration active': 'استكشاف فعّال',
  'Exploration initiale': 'استكشاف أولي',
};

const PHRASE_AR: Record<string, string> = {
  'Capacité à analyser rapidement des situations complexes.':
    'القدرة على تحليل الوضعيات المعقدة بسرعة.',
  'Aisance à coordonner ou prendre des responsabilités en groupe.':
    'سهولة تنسيق أو تحمّل المسؤوليات ضمن مجموعة.',
  'Préférence pour l’apprentissage par l’expérimentation.':
    'تفضيل التعلم عبر التجريب.',
  'Appétence pour imaginer des approches originales.':
    'ميل إلى تخيّل مقاربات أصيلة.',
  'Motivation forte pour continuer à apprendre.': 'دافع قوي للاستمرار في التعلم.',
  'Besoin de sens et d’impact dans ton projet professionnel.':
    'حاجة إلى المعنى والأثر في مشروعك المهني.',
  'Capacité à articuler ambitions personnelles et contraintes réalistes.':
    'القدرة على الجمع بين الطموحات الشخصية والقيود الواقعية.',
  'Ton besoin d’autonomie peut rendre les environnements très rigides (process lourds) frustrants.':
    'قد تجعلك حاجتك إلى الاستقلالية غير مرتاح في البيئات الصارمة ذات الإجراءات الكثيرة.',
  'Ton attrait pour la variété peut rendre le choix d’une spécialité difficile — cadre 2–3 familles avant de trancher.':
    'قد يصعّب حبك للتنوع اختيار تخصص واحد. حدّد عائلتين أو ثلاث عائلات مهنية قبل الحسم.',
  'Tes dilemmes montrent une tolérance au risque plus élevée que ta stabilité déclarée : clarifie ce que tu es prêt(e) à accepter.':
    'تُظهر اختياراتك استعداداً أكبر للمخاطرة. حدّد بوضوح ما يمكنك قبوله.',
  'La clarté du projet est encore faible : priorise l’exploration concrète (métiers, stages, rencontres) avant les classements d’écoles.':
    'مشروعك يحتاج إلى مزيد من الوضوح. استكشف المهن والتداريب واللقاءات أولاً، ثم رتّب المدارس.',
  'Tu vises l’impact, mais le contact humain intensif te fatigue : privilégie des rôles d’impact « analytique » ou « produit ».':
    'تريد إحداث أثر، لكن التواصل المستمر قد يتعبك. اختر أدواراً تحليلية أو مرتبطة بالمنتجات.',
  'Attention à ne pas sur-optimiser le prestige d’une école avant d’avoir validé l’adéquation métier / mode de vie.':
    'لا تجعل سمعة المدرسة أهم من توافق المهنة ونمط الحياة معك.',
  'Prioriser universités publiques / CPGE / écoles à frais maîtrisés comme plan A.':
    'إعطاء الأولوية للجامعات العمومية / الأقسام التحضيرية / مدارس بتكاليف مضبوطة كخطة أ.',
  'Construire un plan A/B : 1–2 cibles ambitieuses + options accessibles budgétairement.':
    'بناء خطة أ/ب: هدف أو هدفان طموحان + خيارات في المتناول ميزانياً.',
  'Mobilité géographique large : avantage pour optimiser le fit école / filière.':
    'مرونة جغرافية واسعة: ميزة لتحسين التوافق بين المدرسة والشعبة.',
  'Faisabilité correcte : passer aux actions (portes ouvertes, dossiers, calendrier concours).':
    'إمكانية التنفيذ جيدة. انتقل إلى خطوات عملية: الأيام المفتوحة والملفات ومواعيد المباريات.',
  'Secteurs alignés avec tes choix': 'قطاعات متوافقة مع اختياراتك',
  'Secteurs peu alignés': 'قطاعات قليلة التوافق',
  'Ville compatible avec tes préférences': 'مدينة متوافقة مع تفضيلاتك',
  'Ville éloignée de tes choix': 'مدينة بعيدة عن اختياراتك',
  'Type d’établissement cohérent': 'نوع مؤسسة متسق',
  'Type d’établissement moins adapté': 'نوع مؤسسة أقل ملاءمة',
  'Filière bac non acceptée': 'شعبة الباك غير مقبولة',
  'Filière / bac compatible': 'شعبة / باك متوافق',
  'Compatibilité bac limitée': 'توافق باك محدود',
  'Seuil d’admission difficilement atteignable': 'عتبة قبول صعبة المنال',
  'Notes compatibles avec les seuils': 'نقط متوافقة مع العتبات',
  'Budget cohérent': 'ميزانية متسقة',
  'Frais potentiellement élevés pour ton budget': 'رسوم قد تكون مرتفعة لميزانيتك',
  'Niveau de diplôme visé proposé': 'مستوى الدبلوم المستهدف مقترح',
  'Accès sur concours': 'ولوج عبر مباراة',
  'Déjà dans ton radar': 'موجودة في قائمة مدارسك',
  'Vainqueur Versus': 'فائز في المواجهات',
  'Écarté en Versus': 'مُستبعد في المواجهات',
  Concours: 'مباراة',
  'Étude de dossier': 'دراسة ملف',
  'Management': 'التدبير',
  'Stratégie & organisation': 'الاستراتيجية والتنظيم',
  'Entrepreneuriat': 'ريادة الأعمال',
  'Innovation & startup': 'الابتكار والشركات الناشئة',
  'Marketing digital': 'التسويق الرقمي',
  'Communication': 'التواصل',
  'Informatique / Génie logiciel': 'المعلوميات / هندسة البرمجيات',
  'IA & Data': 'الذكاء الاصطناعي والبيانات',
  'Systèmes & réseaux': 'الأنظمة والشبكات',
  'Business analytics': 'تحليل الأعمال',
  'Génie industriel': 'الهندسة الصناعية',
  'Génie civil / électromécanique': 'الهندسة المدنية / الكهروميكانيك',
  'Génie des procédés': 'هندسة العمليات',
  'Management de projet': 'إدارة المشاريع',
  'Finance': 'المالية',
  'Comptabilité / contrôle': 'المحاسبة / المراقبة',
  'Économie appliquée': 'الاقتصاد التطبيقي',
  'Commerce international': 'التجارة الدولية',
  'Médecine / paramédical': 'الطب / شبه الطبي',
  'Biologie / biotech': 'البيولوجيا / البيوتك',
  'Santé publique': 'الصحة العمومية',
  'Sciences de l’éducation': 'علوم التربية',
  'Formation & RH': 'التكوين والموارد البشرية',
  'Psychologie': 'علم النفس',
  'Design graphique / UX': 'التصميم الجرافيكي / UX',
  'Architecture d’intérieur': 'التصميم الداخلي',
  'Médias créatifs': 'وسائط إبداعية',
  'Data science': 'علم البيانات',
  'Statistique': 'الإحصاء',
  'Mathématiques appliquées': 'الرياضيات التطبيقية',
};

const TIER_AR: Record<DiagnosticTierId, string> = {
  recommended: 'موصى به',
  possible: 'ممكن',
  lastResort: 'خيار احتياطي',
  avoid: 'يُفضّل تجنّبه',
};

const TIER_HINT_AR: Record<DiagnosticTierId, string> = {
  recommended: '≥ 78 %',
  possible: '60 % – 77 %',
  lastResort: '45 % – 59 %',
  avoid: '< 45 % أو شعبة / عتبة غير متوافقة',
};

export function localizeReportPhrase(text: string, locale: OrientationUiLocale): string {
  if (locale !== 'ar' || !text) return text;
  if (PHRASE_AR[text]) return PHRASE_AR[text];
  const vs = text.match(/^Vainqueur Versus \(×(\d+)\)$/);
  if (vs) return `فائز في المواجهات (×${vs[1]})`;
  const ancrer = text.match(/^Ancrer la shortlist sur les familles « (.+) » et « (.+) »\.$/);
  if (ancrer) {
    return `تثبيت القائمة القصيرة على عائلتي « ${localizeFamilyLabel(ancrer[1], locale)} » و« ${localizeFamilyLabel(ancrer[2], locale)} ».`;
  }
  const cities = text.match(/^Cibler d’abord les établissements dans : (.+)\.$/);
  if (cities) return `استهداف المؤسسات أولاً في: ${cities[1]}.`;
  const admis = text.match(/^Anticiper les modes d’admission de ton radar : (.+)\.$/);
  if (admis) {
    const modes = admis[1]
      .split(',')
      .map((mode) => localizeReportPhrase(mode.trim(), locale))
      .join('، ');
    return `توقّع أنماط القبول في رادارك: ${modes}.`;
  }
  return PHRASE_AR[text] || text;
}

export function reportPhraseBilingualLines(
  french: string,
  locale: OrientationUiLocale,
): { primary: string; secondary?: string; primaryRtl: boolean; secondaryRtl: boolean } {
  const arabic = localizeReportPhrase(french, 'ar');
  const hasArabic = arabic !== french;
  return locale === 'ar'
    ? {
        primary: hasArabic ? arabic : french,
        secondary: hasArabic ? french : undefined,
        primaryRtl: hasArabic,
        secondaryRtl: false,
      }
    : {
        primary: french,
        secondary: hasArabic ? arabic : undefined,
        primaryRtl: false,
        secondaryRtl: true,
      };
}

export function localizeFamilyLabel(labelOrId: string, locale: OrientationUiLocale): string {
  const key = (labelOrId || '').trim();
  if (!key) return '';
  if (locale === 'ar') {
    return FAMILY_LABEL_AR[key] || FAMILY_LABEL_FR[key] || key;
  }
  // Ne pas afficher l’id technique (ex. « entre », « inge ») : résoudre vers le libellé.
  return FAMILY_LABEL_FR[key] || key;
}

export function localizeProfileTitle(title: string, locale: OrientationUiLocale): string {
  if (locale !== 'ar') return title;
  return PROFILE_TITLE_AR[title] || title;
}

export function localizeDiagnosticLabel(label: string, locale: OrientationUiLocale): string {
  if (locale !== 'ar') return label;
  return DIAG_LABEL_AR[label] || label;
}

export function localizeTierLabel(tier: DiagnosticTierId, locale: OrientationUiLocale): string {
  if (locale !== 'ar') {
    const fr: Record<DiagnosticTierId, string> = {
      recommended: 'Recommandé',
      possible: 'Possible',
      lastResort: 'Dernier recours',
      avoid: 'À éviter',
    };
    return fr[tier];
  }
  return TIER_AR[tier];
}

export function localizeTierHint(tier: DiagnosticTierId, locale: OrientationUiLocale): string {
  if (locale !== 'ar') {
    const fr: Record<DiagnosticTierId, string> = {
      recommended: '≥ 78 %',
      possible: '60 % – 77 %',
      lastResort: '45 % – 59 %',
      avoid: '< 45 % ou filière / seuil incompatible',
    };
    return fr[tier];
  }
  return TIER_HINT_AR[tier];
}

export function localizeProfileSentence(
  report: OrientationReport,
  locale: OrientationUiLocale,
): string {
  if (locale !== 'ar') return report.profileSentence;
  const title = localizeProfileTitle(report.profileTitle, locale);
  const p = localizeRiasecLabel(report.dominante.primary, locale);
  const s = localizeRiasecLabel(report.dominante.secondary, locale);
  const fn = report.scores.functioning;
  const tone =
    fn.autonomie > 70
      ? 'مع ميل قوي إلى الاستقلالية'
      : fn.collaboration > 70
        ? 'مع ميل قوي إلى التعاون'
        : 'مع توازن بين التفكير والعمل';
  return `${title} — يغلب على ملفك بُعدا ${p} و${s}، ${tone}. تبدو أكثر تحفيزاً في البيئات التي تتيح لك فهم المشكلات واقتراح الحلول وتحمّل مسؤوليات أكبر.`;
}

export function localizeDiagnosticBody(
  report: OrientationReport,
  locale: OrientationUiLocale,
): string {
  if (locale !== 'ar') return report.diagnosticBody;
  const top = report.families
    .slice(0, 3)
    .map((f) => localizeFamilyLabel(f.id, locale) || localizeFamilyLabel(f.label, locale))
    .join('، ');
  const label = report.diagnosticLabel;
  if (label === 'Exploration active' || label === 'Exploration initiale') {
    return `لديك اهتمامات واضحة، خصوصاً في ${top}، لكن مشروعك يحتاج إلى مزيد من التحديد. قارن بين عائلتين أو ثلاث عائلات مهنية، ثم ضع خطة لاختيار المدارس.`;
  }
  if (label === 'Affinage du projet') {
    return `لديك اتجاه واعد نحو ${top}. اختر مهنة أو مهنتين، ثم حدّد الشعب والمؤسسات التي تناسب وضعك وإمكاناتك.`;
  }
  return `مشروعك واضح. يمكنك الآن إعداد خطة قبول عملية تشمل المواعيد، وخطتي أ وب للمدارس، والميزانية والتنقل، مع اعتماد ${top} كاتجاه رئيسي.`;
}

export function localizeForceLine(
  line: string,
  locale: OrientationUiLocale,
  dominante?: { primary: RiasecLetter; secondary: RiasecLetter },
): string {
  if (locale !== 'ar') return line;
  const m = line.match(
    /^Facilité à t’exprimer dans un registre (.+) \(et (.+) en secondaire\)\.$/,
  );
  if (m && dominante) {
    return `سهولة التعبير عن ميول ${localizeRiasecLabel(dominante.primary, locale)}، مع ميول ثانوية من نوع ${localizeRiasecLabel(dominante.secondary, locale)}.`;
  }
  if (m) {
    return `سهولة التعبير عن ميول ${m[1]}، مع ميول ثانوية من نوع ${m[2]}.`;
  }
  return localizeReportPhrase(line, locale);
}

export function localizeSchoolRecoReasons(
  ec: OrientationSchoolReco,
  locale: OrientationUiLocale,
): OrientationSchoolReco {
  if (locale !== 'ar') return ec;
  return {
    ...ec,
    tierLabel: localizeTierLabel(ec.tier, locale),
    reasonsYes: ec.reasonsYes.map((r) => localizeReportPhrase(r, locale)),
    reasonsNo: ec.reasonsNo.map((r) => localizeReportPhrase(r, locale)),
  };
}

export function reportFamilyTierLabel(
  tier: 'forte' | 'bonne' | 'exploratoire',
  locale: OrientationUiLocale,
): string {
  if (locale === 'ar') {
    if (tier === 'forte') return 'توافق قوي جداً';
    if (tier === 'bonne') return 'توافق جيد';
    return 'للاستكشاف';
  }
  if (tier === 'forte') return 'Très forte compatibilité';
  if (tier === 'bonne') return 'Bonne compatibilité';
  return 'À explorer';
}

export function reportFunctioningLabels(locale: OrientationUiLocale): Record<string, string> {
  const keys = [
    'autonomie',
    'leadership',
    'analyse',
    'contactHumain',
    'structure',
    'creativite',
    'action',
    'incertitude',
    'pratique',
    'collaboration',
    'variete',
  ] as const;
  const out: Record<string, string> = {};
  for (const k of keys) out[k] = tOd(locale, `fn_${k}`);
  return out;
}

export function reportAmbitionLabel(key: string, fallback: string, locale: OrientationUiLocale): string {
  const localized = localizeAmbitionLabel(key, locale);
  return localized.startsWith('ambition_') ? fallback : localized;
}

export { tOd, tOdFill };
