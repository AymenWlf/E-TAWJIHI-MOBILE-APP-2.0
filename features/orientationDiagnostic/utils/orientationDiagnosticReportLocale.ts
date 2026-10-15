import {
  localizeAmbitionLabel,
  localizeDisplayedStudyCities,
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
  'Ton besoin d’autonomie peut rendre les environnements très rigides frustrants.':
    'قد تجعلك حاجتك إلى الاستقلالية غير مرتاح في البيئات الصارمة.',
  'Ton attrait pour la variété peut rendre le choix d’une spécialité difficile — cadre 2–3 familles avant de trancher.':
    'قد يصعّب حبك للتنوع اختيار تخصص واحد. حدّد عائلتين أو ثلاث عائلات مهنية قبل الحسم.',
  'Ton attrait pour la variété peut rendre le choix d’une spécialité difficile.':
    'قد يصعّب حبك للتنوع اختيار تخصص واحد.',
  'Tes dilemmes montrent une tolérance au risque plus élevée que ta stabilité déclarée : clarifie ce que tu es prêt(e) à accepter.':
    'تُظهر اختياراتك استعداداً أكبر للمخاطرة. حدّد بوضوح ما يمكنك قبوله.',
  'La clarté du projet est encore faible : priorise l’exploration concrète (métiers, stages, rencontres) avant les classements d’écoles.':
    'مشروعك يحتاج إلى مزيد من الوضوح. استكشف المهن والتداريب واللقاءات أولاً، ثم رتّب المدارس.',
  'La clarté du projet est encore faible : priorise l’exploration concrète avant les classements d’écoles.':
    'مشروعك يحتاج إلى مزيد من الوضوح. استكشف المهن أولاً، ثم رتّب المدارس.',
  'Tu vises l’impact, mais le contact humain intensif te fatigue : privilégie des rôles d’impact « analytique » ou « produit ».':
    'تريد إحداث أثر، لكن التواصل المستمر قد يتعبك. اختر أدواراً تحليلية أو مرتبطة بالمنتجات.',
  'Tu vises l’impact, mais le contact humain intensif te fatigue : privilégie des rôles plus analytiques.':
    'تريد إحداث أثر، لكن التواصل المستمر قد يتعبك. اختر أدواراً تحليلية.',
  'Attention à ne pas sur-optimiser le prestige d’une école avant d’avoir validé l’adéquation métier / mode de vie.':
    'لا تجعل سمعة المدرسة أهم من توافق المهنة ونمط الحياة معك.',
  'Attention à ne pas sur-optimiser le prestige d’une école avant d’avoir validé l’adéquation métier.':
    'لا تجعل سمعة المدرسة أهم من توافق المهنة معك.',
  'Prioriser universités publiques / CPGE / écoles à frais maîtrisés comme plan A.':
    'إعطاء الأولوية للجامعات العمومية / الأقسام التحضيرية / مدارس بتكاليف مضبوطة كخطة أ.',
  'Construire un plan A/B : 1–2 cibles ambitieuses + options accessibles budgétairement.':
    'بناء خطة أ/ب: هدف أو هدفان طموحان + خيارات في المتناول ميزانياً.',
  'Mobilité géographique large : avantage pour optimiser le fit école / filière.':
    'مرونة جغرافية واسعة: ميزة لتحسين التوافق بين المدرسة والشعبة.',
  'Faisabilité correcte : passer aux actions (portes ouvertes, dossiers, calendrier concours).':
    'إمكانية التنفيذ جيدة. انتقل إلى خطوات عملية: الأيام المفتوحة والملفات ومواعيد المباريات.',
  'Tu peux ouvrir le spectre aux écoles privées sélectives — garde un plan B public.':
    'يمكنك توسيع الاختيار نحو المدارس الخاصة الانتقائية، مع الإبقاء على خطة ب عمومية.',
  'Faisabilité actuelle limitée : séquencer (année de consolidation / alternatives) plutôt que forcer un parcours inaccessible.':
    'إمكانية التنفيذ محدودة حالياً. رتّب المراحل (سنة لتقوية الملف أو بدائل) بدل فرض مسار صعب المنال.',
  'Plan A': 'الخطة A',
  'Plan B': 'الخطة B',
  'Plan C': 'الخطة C',
  'Plan D': 'الخطة D',
  'Accès ouvert': 'ولوج مفتوح',
  'Ordre de mérite': 'ترتيب الاستحقاق',
  'Secteur d\'activité aligné avec vos centres d\'intérêt.':
    'قطاع النشاط متوافق مع ميولك.',
  'Recoupement avec un secteur que vous souhaitez éviter.':
    'تداخل مع قطاع تريد تجنبه.',
  'Ville compatible avec votre projet de mobilité.':
    'المدينة متوافقة مع مشروع تنقلك.',
  'Localisation peu alignée avec vos villes d\'études ciblées.':
    'الموقع قليل التوافق مع مدن الدراسة التي اخترتها.',
  'Type d\'établissement correspondant à vos préférences.':
    'نوع المؤسسة يوافق تفضيلاتك.',
  'Type d\'établissement éloigné de vos préférences (public / privé / autre).':
    'نوع المؤسسة بعيد عن تفضيلاتك (عمومي / خاص / آخر).',
  'Cohérence bac / filière ou spécialités avec l\'établissement.':
    'توافق الباك / الشعبة أو التخصصات مع المؤسسة.',
  'Filière ou spécialités bac potentiellement moins alignées.':
    'الشعبة أو تخصصات الباك قد تكون أقل توافقاً.',
  'Filière du bac : incompatible avec cette fiche (filière non ouverte par l\'établissement, ou non renseignée alors que la fiche distingue les filières).':
    'شعبة الباك غير متوافقة مع هذه البطاقة (الشعبة غير مفتوحة في المؤسسة، أو غير مُدخلة بينما البطاقة تميّز الشعب).',
  'Fourchette de frais compatible avec votre budget indicatif.':
    'نطاق الرسوم متوافق مع ميزانيتك التقريبية.',
  'Frais de scolarité potentiellement élevés par rapport à votre budget.':
    'رسوم الدراسة قد تكون مرتفعة مقارنة بميزانيتك.',
  'Concours / sélection : l\'établissement en propose.':
    'مباراة / انتقاء: المؤسسة تنظّمها.',
  'Concours ou sélection alors que vous les évitez.':
    'مباراة أو انتقاء بينما تفضّل تجنبهما.',
  'Critères militaires : taille minimale habituellement exigée non atteinte (déclaration « non »).':
    'المعايير العسكرية: الطول الأدنى المطلوب عادة غير متوفر (تصريح « لا »).',
  'Vos notes de référence semblent dans la fourchette des seuils connus.':
    'نقطك المرجعية تبدو ضمن نطاق العتبات المعروفة.',
  'Seuils d\'admission éventuels : comparer avec vos notes prévisionnelles.':
    'عتبات القبول المحتملة: قارنها بنقطك التوقعية.',
  'Notes de référence et seuils indiqués sur la fiche : correspondance intermédiaire — vérifiez les conditions d\'admission.':
    'النقط المرجعية والعتبات في البطاقة: توافق متوسط. راجع شروط القبول.',
  'Diplômes délivrés par l’établissement compatibles avec vos diplômes visés.':
    'الدبلومات التي تمنحها المؤسسة متوافقة مع الدبلومات التي تستهدفها.',
  'Diplômes visés : recouvrement limité avec les diplômes délivrés par cet établissement.':
    'الدبلومات المستهدفة: توافق محدود مع دبلومات هذه المؤسسة.',
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

/** Pourcentage du score école : « 0% » en français, « 0٪ » en arabe. */
export function formatReportScorePercent(score: number, locale: OrientationUiLocale): string {
  const n = Math.round(Number(score) || 0);
  return locale === 'ar' ? `${n}٪` : `${n}%`;
}

export function localizeReportPhrase(text: string, locale: OrientationUiLocale): string {
  if (locale !== 'ar' || !text) return text;
  if (PHRASE_AR[text]) return PHRASE_AR[text];
  const vs = text.match(/^Vainqueur Versus \(×(\d+)\)$/);
  if (vs) return `فائز في المواجهات (×${vs[1]})`;
  const ancrer = text.match(/^Ancrer la shortlist sur les familles « (.+) »\.$/);
  if (ancrer) {
    const names = ancrer[1].split(' » et « ').map((name) => localizeFamilyLabel(name.trim(), locale));
    if (names.length <= 1) return `تثبيت القائمة القصيرة على عائلة « ${names[0] || ''} ».`;
    const last = names[names.length - 1];
    const head = names.slice(0, -1).join(' » و« ');
    return `تثبيت القائمة القصيرة على عائلات « ${head} » و« ${last} ».`;
  }
  const cities = text.match(/^Cibler d’abord les établissements dans : (.+)\.$/);
  if (cities) {
    const place = localizeDisplayedStudyCities(cities[1].replace(/, /g, ' · '), locale).replace(/ · /g, '، ');
    return `استهداف المؤسسات أولاً في: ${place}.`;
  }
  const plans = text.match(/^Répartir tes candidatures selon les catégories retenues : (.+)\.$/);
  if (plans) {
    const list = plans[1]
      .split(',')
      .map((part) => localizeReportPhrase(part.trim(), locale))
      .join('، ');
    return `وزّع ترشيحاتك حسب الفئات المختارة: ${list}.`;
  }
  const align = text.match(/^Alignement RIASEC (\d+)% avec ton profil consolidé\.$/);
  if (align) return `توافق RIASEC بنسبة ${align[1]}٪ مع ملفك النهائي.`;
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
