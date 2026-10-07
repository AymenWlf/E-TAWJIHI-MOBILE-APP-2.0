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
    'حاجتك إلى الاستقلالية قد تجعل البيئات الجامدة (إجراءات ثقيلة) محبطة.',
  'Ton attrait pour la variété peut rendre le choix d’une spécialité difficile — cadre 2–3 familles avant de trancher.':
    'انجذابك للتنوع قد يصعّب اختيار تخصص — حدّد 2–3 عائلات قبل الحسم.',
  'Tes dilemmes montrent une tolérance au risque plus élevée que ta stabilité déclarée : clarifie ce que tu es prêt(e) à accepter.':
    'معضلاتك تُظهر تحملاً للمخاطر أعلى من استقرارك المصرّح به: وضّح ما أنت مستعد(ة) لقبوله.',
  'La clarté du projet est encore faible : priorise l’exploration concrète (métiers, stages, rencontres) avant les classements d’écoles.':
    'وضوح المشروع لا يزال ضعيفاً: قدّم الاستكشاف العملي (مهن، تداريب، لقاءات) قبل ترتيب المدارس.',
  'Tu vises l’impact, mais le contact humain intensif te fatigue : privilégie des rôles d’impact « analytique » ou « produit ».':
    'تستهدف الأثر لكن التواصل البشري المكثف يُرهقك: فضّل أدوار أثر «تحليلية» أو «منتج».',
  'Attention à ne pas sur-optimiser le prestige d’une école avant d’avoir validé l’adéquation métier / mode de vie.':
    'احذر من المبالغة في هيبة مدرسة قبل التأكد من ملاءمة المهنة / نمط الحياة.',
  'Prioriser universités publiques / CPGE / écoles à frais maîtrisés comme plan A.':
    'إعطاء الأولوية للجامعات العمومية / الأقسام التحضيرية / مدارس بتكاليف مضبوطة كخطة أ.',
  'Construire un plan A/B : 1–2 cibles ambitieuses + options accessibles budgétairement.':
    'بناء خطة أ/ب: هدف أو هدفان طموحان + خيارات في المتناول ميزانياً.',
  'Faisabilité correcte : passer aux actions (portes ouvertes, dossiers, calendrier concours).':
    'قابلية تنفيذ جيدة: الانتقال إلى الأفعال (أبواب مفتوحة، ملفات، رزنامة مباريات).',
  'Secteurs alignés avec tes choix': 'قطاعات متوافقة مع اختياراتك',
  'Secteurs peu alignés': 'قطاعات قليلة التوافق',
  'Ville compatible avec tes préférences': 'مدينة متوافقة مع تفضيلاتك',
  'Ville éloignée de tes choix': 'مدينة بعيدة عن اختياراتك',
  'Type d’établissement cohérent': 'نوع مؤسسة متسق',
  'Type d’établissement moins adapté': 'نوع مؤسسة أقل ملاءمة',
  'Filière bac non acceptée': 'شعبة الباك غير مقبولة',
  'Filière / bac compatible': 'شعبة / باك متوافق',
  'Compatibilité bac limitée': 'توافق باك محدود',
  'Seuil d’admission difficilement atteignable': 'عتبة قبول صعبة البلوغ',
  'Notes compatibles avec les seuils': 'نقط متوافقة مع العتبات',
  'Budget cohérent': 'ميزانية متسقة',
  'Frais potentiellement élevés pour ton budget': 'رسوم قد تكون مرتفعة لميزانيتك',
  'Niveau de diplôme visé proposé': 'مستوى الدبلوم المستهدف مقترح',
  'Accès sur concours': 'ولوج عبر مباراة',
  'Déjà dans ton radar': 'موجودة سلفاً في رادارك',
  'Vainqueur Versus': 'فائز Versus',
  'Écarté en Versus': 'مُستبعد في Versus',
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
  'Architecture d’intérieur': 'الهندسة الداخلية',
  'Médias créatifs': 'وسائط إبداعية',
  'Data science': 'علم البيانات',
  'Statistique': 'الإحصاء',
  'Mathématiques appliquées': 'الرياضيات التطبيقية',
};

const TIER_AR: Record<DiagnosticTierId, string> = {
  recommended: 'موصى به',
  possible: 'ممكن',
  lastResort: 'ملاذ أخير',
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
  if (vs) return `فائز Versus (×${vs[1]})`;
  const ancrer = text.match(/^Ancrer la shortlist sur les familles « (.+) » et « (.+) »\.$/);
  if (ancrer) {
    return `تثبيت القائمة القصيرة على عائلتي « ${localizeFamilyLabel(ancrer[1], locale)} » و« ${localizeFamilyLabel(ancrer[2], locale)} ».`;
  }
  const cities = text.match(/^Cibler d’abord les établissements dans : (.+)\.$/);
  if (cities) return `استهداف المؤسسات أولاً في: ${cities[1]}.`;
  const admis = text.match(/^Anticiper les modes d’admission de ton radar : (.+)\.$/);
  if (admis) return `توقّع أنماط القبول في رادارك: ${localizeReportPhrase(admis[1], locale)}.`;
  return PHRASE_AR[text] || text;
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
        ? 'في بيئات تعاونية'
        : 'بالمزج بين التفكير والعمل';
  return `${title} — ملف بغلبة ${p} و${s}، ${tone}. تبدو محفَّزاً/ة خصوصاً في السياقات التي تتيح فهم المشكلات واقتراح حلول والتقدّم نحو مسؤوليات أكبر.`;
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
    return `لديك بالفعل اهتمامات متسقة (خصوصاً ${top})، لكن مشروعك ليس دقيقاً بما يكفي لتثبيت تكوين. الأولوية: مقارنة 2 إلى 3 عائلات مهنية ثم بناء استراتيجية المدارس.`;
  }
  if (label === 'Affinage du projet') {
    return `لديك اتجاه واعد حول ${top}. الخطوة التالية هي التحقق من مهنة أو مهنتين مستهدفتين ورسم الشعب / المؤسسات المتوافقة مع قيودك.`;
  }
  return `مستوى وضوحك مرتفع. يمكنك الانتقال إلى استراتيجية قبول ملموسة: رزنامة، خطط أ/ب للمدارس، ومواءمة الميزانية / التنقل — مع الإبقاء على ${top} كبوصلة.`;
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
    return `سهولة التعبير ضمن سجل ${localizeRiasecLabel(dominante.primary, locale)} (و${localizeRiasecLabel(dominante.secondary, locale)} ثانوياً).`;
  }
  if (m) {
    return `سهولة التعبير ضمن سجل ${m[1]} (و${m[2]} ثانوياً).`;
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
