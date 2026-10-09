import type { DiagnosticStep, ModuleId } from '../types/orientationDiagnosticPrototype';

export type OrientationUiLocale = 'fr' | 'ar';

export type StepArOverlay = {
  title?: string;
  subtitle?: string;
  leftLabel?: string;
  rightLabel?: string;
  /** option id → Arabic label */
  options?: Record<string, string>;
};

export const ORIENTATION_UI_LOCALE_KEY = 'orientationDiagnosticUiLocale';

export function isOrientationUiLocale(v: unknown): v is OrientationUiLocale {
  return v === 'fr' || v === 'ar';
}

export function readOrientationUiLocale(): OrientationUiLocale {
  try {
    const raw = localStorage.getItem(ORIENTATION_UI_LOCALE_KEY);
    if (isOrientationUiLocale(raw)) return raw;
  } catch {
    /* ignore */
  }
  return 'fr';
}

export function persistOrientationUiLocale(locale: OrientationUiLocale): void {
  try {
    localStorage.setItem(ORIENTATION_UI_LOCALE_KEY, locale);
  } catch {
    /* ignore */
  }
}

export function pickLocaleText(locale: OrientationUiLocale, fr: string, ar: string): string {
  return locale === 'ar' ? ar : fr;
}

/* ——— Module meta ——— */

export const MODULE_META_I18N: Record<
  OrientationUiLocale,
  Record<ModuleId, { label: string; short: string; duration: string; objective: string }>
> = {
  fr: {
    profile: {
      label: 'Mon profil',
      short: 'Profil',
      duration: '~2 min',
      objective: 'Informations personnelles, scolaires et académiques',
    },
    context: {
      label: 'Moi aujourd’hui',
      short: 'Contexte',
      duration: '~1 min',
      objective: 'Maturité du projet et connaissance des options',
    },
    riasec: {
      label: 'Centres d’intérêt',
      short: 'Intérêts',
      duration: '~3 min',
      objective: 'Mesurer tes préférences professionnelles',
    },
    situations: {
      label: 'Mises en situation',
      short: 'Situations',
      duration: '~2 min',
      objective: 'Observer tes choix naturels',
    },
    functioning: {
      label: 'Ma façon de fonctionner',
      short: 'Fonctionnement',
      duration: '~2 min',
      objective: 'Comprendre ton mode de travail',
    },
    ambitions: {
      label: 'Mes ambitions',
      short: 'Ambitions',
      duration: '~1,5 min',
      objective: 'Identifier tes moteurs professionnels',
    },
    reality: {
      label: 'Ma réalité & dilemmes',
      short: 'Réalité',
      duration: '~1,5 min',
      objective: 'Ancrer le projet dans le faisable',
    },
    careers: {
      label: 'Secteurs & métiers',
      short: 'Métiers',
      duration: '~2 min',
      objective: 'Choisir les secteurs, métiers et salaire qui t’intéressent',
    },
    schools: {
      label: 'Écoles qui m’attirent',
      short: 'Écoles',
      duration: '~1,5 min',
      objective: 'Types d’établissements + écoles actives de la base E-TAWJIHI',
    },
    versus: {
      label: 'Versus — choix forcés',
      short: 'Versus',
      duration: '~2 min',
      objective:
        'Duels dynamiques selon tes métiers/écoles + alternatives liées à ta filière',
    },
  },
  ar: {
    profile: {
      label: 'ملفي',
      short: 'الملف',
      duration: '~2 دق',
      objective: 'جمع معلوماتك الشخصية والدراسية',
    },
    context: {
      label: 'وضعي الحالي',
      short: 'السياق',
      duration: '~1 دق',
      objective: 'معرفة مدى وضوح مشروعك والخيارات المتاحة',
    },
    riasec: {
      label: 'مجالات الاهتمام',
      short: 'الاهتمامات',
      duration: '~3 دق',
      objective: 'قياس تفضيلاتك المهنية',
    },
    situations: {
      label: 'مواقف عملية',
      short: 'المواقف',
      duration: '~2 دق',
      objective: 'رصد اختياراتك الطبيعية',
    },
    functioning: {
      label: 'أسلوب عملي وتعلّمي',
      short: 'الأسلوب',
      duration: '~2 دق',
      objective: 'فهم طريقة عملك وتعلّمك',
    },
    ambitions: {
      label: 'طموحاتي',
      short: 'الطموح',
      duration: '~1,5 دق',
      objective: 'تحديد دوافعك المهنية',
    },
    reality: {
      label: 'الواقع والاختيارات',
      short: 'الواقع',
      duration: '~1,5 دق',
      objective: 'ربط المشروع بما هو قابل للتنفيذ',
    },
    careers: {
      label: 'القطاعات والمهن',
      short: 'المهن',
      duration: '~2 دق',
      objective: 'اختيار القطاعات والمهن والأجر المناسب لك',
    },
    schools: {
      label: 'المدارس التي تجذبني',
      short: 'المدارس',
      duration: '~1,5 دق',
      objective: 'اختيار أنواع المؤسسات والمدارس النشطة على E-TAWJIHI',
    },
    versus: {
      label: 'المواجهات — اختيارات حاسمة',
      short: 'المواجهات',
      duration: '~2 دق',
      objective: 'مقارنة المهن والمدارس وإضافة بدائل مناسبة لشعبتك',
    },
  },
};

/* ——— Shared AR banks ——— */

export const RIASEC_LIKERT_AR: Record<string, string> = {
  '1': 'لا على الإطلاق',
  '2': 'قليلاً',
  '3': 'بدرجة متوسطة',
  '4': 'كثيراً',
  '5': 'كثيراً جداً',
};

export const ROLE_OPTIONS_AR: Record<string, string> = {
  R: 'تركيب المعدات والاهتمام بالجوانب التقنية',
  I: 'تحليل البيانات للتحسين',
  A: 'ابتكار الهوية البصرية والمحتوى',
  S: 'استقبال الأشخاص ومرافقتهم',
  E: 'إقناع الشركاء والداعمين',
  C: 'تنظيم الجدول والقوائم والتسجيلات',
};

/* ——— Step overlays (Arabic) ——— */

export const STEP_AR: Record<string, StepArOverlay> = {
  prof_identity: {
    title: 'معلوماتك الشخصية',
    subtitle: 'الاسم الشخصي والعائلي، الهاتف والمدينة.',
  },
  prof_school: {
    title: 'مسارك الدراسي',
    subtitle: 'المستوى، نوع البكالوريا، الشعبة، التخصصات والسنة: معلومات تساعد على تقييم الخيارات الممكنة.',
  },
  prof_grades: {
    title: 'نقطك الدراسية',
    subtitle: 'أدخل نقطك الحقيقية أو التقديرية حسب المعلومات المتوفرة لديك.',
  },

  ctx_maturite: {
    title: 'اليوم، أين وصلت بخصوص توجيهك؟',
    subtitle: 'هذه الإجابة تؤثر على تشخيص وضوح مشروعك.',
    options: {
      exact: 'أعرف بالضبط ما أريد أن أفعله',
      hesite: 'لدي فكرتان أو ثلاث، لكنني متردد',
      idee: 'لدي فكرة، لكنني غير متأكد',
      indecis: 'ما زلت متردداً تماماً',
      refus: 'أعرف أساساً ما لا أريد أن أفعله',
    },
  },
  ctx_connaissance_metiers: {
    title: 'إلى أي مدى تعرف المهن التي تهمّك بشكل ملموس؟',
    options: {
      '0': 'قليلاً جداً — لم أستكشف بعد',
      '1': 'قليلاً — قرأت أو سمعت عنها',
      '2': 'بدرجة متوسطة — لدي أمثلة واضحة',
      '3': 'جيداً — قابلت محترفين أو بحثت',
      '4': 'جيداً جداً — أعرف طبيعة العمل اليومي',
    },
  },
  ctx_connaissance_formations: {
    title: 'إلى أي مدى تعرف المسارات الدراسية والمدارس المتاحة في المغرب أو الخارج؟',
    options: {
      '0': 'قليلاً جداً',
      '1': 'قليلاً',
      '2': 'بدرجة متوسطة',
      '3': 'جيداً',
      '4': 'جيداً جداً',
    },
  },

  r1: {
    title: 'أحب فهم كيفية عمل الآلات أو الأجهزة أو الأنظمة التقنية.',
  },
  r2: {
    title: 'أفضل إنجاز شيء ملموس بدلاً من مناقشة فكرة مطولاً.',
  },
  r3: {
    title: 'الأنشطة التي أبني فيها أو أصلح أو أجرّب تهمّني.',
  },
  i1: {
    title: 'عندما يثيرني شيء ما، أحب البحث عن السبب وكيفية عمله.',
  },
  i2: {
    title: 'المشكلات الصعبة التي يجب تحليلها تحفّزني.',
  },
  i3: {
    title: 'أحب فهم الظواهر العلمية أو الاقتصادية أو التكنولوجية أو الإنسانية.',
  },
  a1: {
    title: 'أحب تخيّل أفكار جديدة أو ابتكار شيء أصيل.',
  },
  a2: {
    title: 'أفضل قدراً من الحرية بدلاً من اتباع طريقة مفروضة حرفياً.',
  },
  a3: {
    title: 'المجالات المرتبطة بالتصميم أو الكتابة أو الإبداع أو التعبير تجذبني.',
  },
  s1: {
    title: 'أحب شرح شيء لشخص لا يفهمه.',
  },
  s2: {
    title: 'أشعر بالفائدة عندما أستطيع تقديم النصح أو المرافقة أو المساعدة.',
  },
  s3: {
    title: 'أقدّر الأنشطة التي تتضمن الكثير من العلاقات الإنسانية.',
  },
  e1: {
    title: 'أحب إقناع الآخرين بدعم فكرة أو مشروع.',
  },
  e2: {
    title: 'يمكن أن أحب قيادة فريق أو تحمّل مسؤوليات.',
  },
  e3: {
    title: 'فكرة تطوير مشروع أو مقاولة تجذبني.',
  },
  c1: {
    title: 'أحب عندما تكون الأمور منظمة وواضحة الهيكلة.',
  },
  c2: {
    title: 'أشعر بالراحة مع المعلومات الدقيقة أو البيانات أو الأرقام.',
  },
  c3: {
    title: 'أفضل عموماً معرفة ما يُتوقَّع مني بوضوح.',
  },

  sit_lycee: {
    title: 'ثانويتك تنظّم حدثاً مهماً. أي أدوار تناسبك؟',
    subtitle: 'اختر أولاً الدور الأكثر جذباً لك، ثم الدور الأقل جذباً.',
    options: ROLE_OPTIONS_AR,
  },
  sit_app: {
    title: 'يريد أصدقاؤك إطلاق تطبيقاً للهاتف. ماذا تريد أن تفعل أساساً؟',
    options: {
      R: 'فهم وتطوير الجانب التقني',
      I: 'دراسة مشكلة المستخدمين',
      A: 'تصميم الهوية والتجربة البصرية',
      S: 'التواصل مع المستخدمين ومرافقتهم',
      E: 'عرض المشروع وإقناع المستثمرين',
      C: 'تنظيم الميزانية والمهام والجدول',
    },
  },
  sit_probleme: {
    title: 'في مؤسسة ما، ظهرت مشكلة في العمل. ما أول رد فعل لك؟',
    options: {
      R: 'النظر مباشرة إلى التشغيل الملموس',
      I: 'البحث عن أسباب المشكلة',
      A: 'تخيّل طريقة أخرى للعمل',
      S: 'سؤال الأشخاص المعنيين',
      E: 'جمع المعنيين والمساعدة على اتخاذ قرار',
      C: 'فحص الإجراءات والمعلومات الموجودة',
    },
  },
  sit_asso: {
    title: 'انضممت إلى جمعية طلابية. أي دور يناسبك بشكل طبيعي؟',
    options: {
      R: 'إدارة اللوجستيك والمعدات والأماكن',
      I: 'تقييم الأثر وتحليل النتائج',
      A: 'ابتكار الحملات والمحتويات',
      S: 'التنشيط والتكوين ومرافقة الأعضاء',
      E: 'التفاوض على الشراكات وجمع التمويل',
      C: 'متابعة الجدول والميزانيات والتقارير',
    },
  },
  sit_libre: {
    title: 'لديك وقت حر لمشروع شخصي. ما النشاط الذي يجذبك أكثر؟',
    options: {
      R: 'التركيب، صنع نموذج أولي، أو اختبار أداة',
      I: 'التعمّق في موضوع معقّد (وثائق، بيانات، علوم)',
      A: 'الإبداع (تصميم، كتابة، فيديو، موسيقى…)',
      S: 'مساعدة شخص أو تدريبه',
      E: 'إطلاق فكرة وإقناع من حولك',
      C: 'ترتيب الأمور: خطط، ملفات، تنظيم',
    },
  },
  sit_mission: {
    title: 'في أول تدريب مهني، ما المهمة التي تحفزك أكثر؟',
    options: {
      R: 'التنفيذ العملي في الميدان أو باستعمال الأدوات',
      I: 'دراسة، بحث، تشخيص',
      A: 'تصميم إبداعي لحل',
      S: 'التواصل مع العملاء ومرافقتهم',
      E: 'عرض، بيع، تطوير تجاري',
      C: 'متابعة العمليات والجودة والتقارير',
    },
  },

  fn_structure: {
    title: 'للعمل بفعالية، أفضل…',
    options: {
      a: 'معرفة ما يجب عليّ فعله بدقة',
      b: 'وجود هدف مع اختيار طريقة الوصول بنفسي',
    },
  },
  fn_collectif: {
    title: 'في مشروع مهم، أفضل…',
    options: {
      '1': 'العمل أساساً بمفردي',
      '2': 'العمل بمفردي مع بعض التبادل',
      '3': 'التناوب بين الفردي والجماعي',
      '4': 'العمل مع عدة أشخاص',
      '5': 'أن أكون محاطاً باستمرار',
    },
  },
  fn_theorie: {
    title: 'عندما أتعلّم شيئاً جديداً، أفضل…',
    options: {
      '1': 'فهم النظرية كاملة أولاً',
      '2': 'فهم المبادئ الأساسية',
      '3': 'التناوب بين النظرية والتمارين',
      '4': 'التجريب بسرعة',
      '5': 'التعلّم أساساً بالممارسة',
    },
  },
  fn_nouveaute: {
    title: 'أي بيئة تناسبك أكثر؟',
    subtitle: 'اختر بوضوح الخيار الذي يخاطبك أكثر.',
    leftLabel: 'متوقعة، مستقرة، منظمة',
    rightLabel: 'متغيرة، ديناميكية، بتحديات جديدة',
  },
  fn_reflexion: {
    title: 'أمام قرار مهم…',
    options: {
      '1': 'آخذ وقتاً طويلاً للتحليل',
      '2': 'أحلّل قبل أن أقرر',
      '3': 'يعتمد على الوضع',
      '4': 'أقرر بسرعة نسبياً',
      '5': 'أفضل التصرف ثم التعديل لاحقاً',
    },
  },
  fn_incertitude: {
    title: 'مهنة تتغير مهامها بانتظام…',
    options: {
      '1': 'ستسبب لي ضغطاً كبيراً',
      '2': 'ستجعلني غير مرتاح',
      '3': 'ستناسبني بدرجة متوسطة',
      '4': 'ستحفّزني',
      '5': 'ستحفّزني بقوة',
    },
  },
  fn_leadership: {
    title: 'في عمل جماعي، تلقائياً…',
    options: {
      '1': 'أفضل تلقي مهمة',
      '2': 'أساهم دون قيادة',
      '3': 'يعتمد على الوضع',
      '4': 'أنسّق غالباً',
      '5': 'أتولى القيادة طبيعياً',
    },
  },
  fn_contact: {
    title: 'قضاء جزء كبير من يومي في التفاعل مع أشخاص سيكون…',
    options: {
      '1': 'مُرهقاً جداً',
      '2': 'مُرهقاً نسبياً',
      '3': 'محايداً',
      '4': 'محفّزاً نسبياً',
      '5': 'محفّزاً جداً',
    },
  },

  amb_top3: {
    title: 'في مستقبلك المهني، ما الأهم؟',
    subtitle: 'اختر ثلاثة دوافع فقط.',
    options: {
      remuneration: 'الحصول على دخل مرتفع',
      stabilite: 'مسار مهني مستقر',
      entrepreneuriat: 'ريادة الأعمال أو إنشاء مشاريعي',
      apprentissage: 'مواصلة التعلّم',
      impact: 'مساعدة الآخرين وإحداث أثر إيجابي',
      international: 'العمل على المستوى الدولي',
      progression: 'تحمّل المسؤولية والتطور بسرعة',
      equilibre: 'التوازن بين العمل والحياة الشخصية',
    },
  },
  amb_priorite: {
    title: 'من بين اختياراتك الثلاثة، أيها الأهم؟',
    subtitle: 'يمكنك الاختيار فقط من بين دوافعك الثلاثة.',
  },
  amb_entreprise: {
    title: 'هل ترى نفسك يوماً ما تنشئ مقاولتك؟',
    options: {
      '1': 'بالتأكيد لا',
      '2': 'غير محتمل',
      '3': 'ربما',
      '4': 'محتمل',
      '5': 'بالتأكيد',
    },
  },
  amb_niveau_etudes: {
    title: 'إلى أي مستوى دراسي أنت مستعد للوصول؟',
    options: {
      bac2: 'بكالوريا+2',
      bac3: 'بكالوريا+3',
      bac5: 'بكالوريا+5',
      bac8: 'بكالوريا +8 أو دكتوراه',
      peuimporte: 'لا يهم — حسب المشروع',
    },
  },
  amb_etranger: {
    title: 'هل يهمّك العمل أو الدراسة في الخارج؟',
    options: {
      '1': 'لا على الإطلاق',
      '2': 'قليلاً',
      '3': 'بدرجة متوسطة',
      '4': 'كثيراً',
      '5': 'هدف قوي',
    },
  },
  amb_confiance: {
    title: 'اليوم، إلى أي مدى تثق بقدرتك على إنجاح مشروع دراستك؟',
    options: {
      '1': 'قليلاً جداً',
      '2': 'قليلاً',
      '3': 'بدرجة متوسطة',
      '4': 'كثيراً',
      '5': 'كثيراً جداً',
    },
  },

  real_villes: {
    title: 'في أي مدن يمكنك الدراسة؟',
    subtitle:
      'افتح القائمة واختر مدينة أو أكثر. أسماء المدن بالفرنسية. « Peu importe » = مرن في كل المغرب.',
    options: {
      casa: 'الدار البيضاء',
      rabat: 'الرباط',
      marrakech: 'مراكش',
      tanger: 'طنجة',
      fes: 'فاس',
      autres: 'مدن أخرى في المغرب',
      peuimporte: 'لا يهم — في أي مكان بالمغرب',
    },
  },
  real_etranger: {
    title: 'الدراسة في الخارج هي…',
    options: {
      '1': 'مستحيلة حالياً',
      '2': 'صعبة',
      '3': 'ممكنة',
      '4': 'مرغوبة',
      '5': 'هدف أولوي',
    },
  },
  real_budget: {
    title: 'الميزانية السنوية الممكنة لدراستك (رسوم التسجيل)؟',
    subtitle: 'إذا كنت قاصراً، أدخل الميزانية التقريبية التي تستطيع أسرتك توفيرها.',
    options: {
      public: 'تعليم عمومي فقط أو ميزانية محدودة جداً',
      lt30: 'أقل من 30.000 درهم',
      '30_60': 'من 30.000 إلى 60.000 درهم',
      '60_100': 'من 60.000 إلى 100.000 درهم',
      gt100: 'أكثر من 100.000 درهم',
      nsp: 'لا أعرف بعد',
    },
  },
  dil_stabilite: {
    title: 'معضلة 1 — أي فرصة تختار؟',
    subtitle: 'اختر بوضوح الخيار الذي يخاطبك أكثر.',
    leftLabel: 'مهنة مستقرة، جيدة الأجر، بمهام متوقعة',
    rightLabel: 'مهنة أكثر مخاطرة وإبداعاً، مع تطور كبير',
  },
  dil_passion: {
    title: 'معضلة 2 — أي تكوين تختار؟',
    subtitle: 'اختر بوضوح الخيار الذي يخاطبك أكثر.',
    leftLabel: 'تكوين أشغف به، حتى لو كانت آفاقه غير مؤكدة',
    rightLabel: 'تكوين أقل شغفاً، لكن بآفاق ممتازة',
  },
  dil_rythme: {
    title: 'معضلة 3 — أي إيقاع يناسبك؟',
    subtitle: 'اختر بوضوح الخيار الذي يخاطبك أكثر.',
    leftLabel: 'مسار آمن، بمراحل واضحة ومفاجآت قليلة',
    rightLabel: 'مسار طموح، تنافسي ومكثّف',
  },

  car_secteurs: {
    title: 'أي قطاعات تهمّك أكثر؟',
    subtitle: 'اختر حتى 7 قطاعات (قائمة E-TAWJIHI الحية).',
  },
  car_metiers: {
    title: 'أي مهن تريد استكشافها؟',
    subtitle: 'صفحة لكل قطاع — حتى 3 مهن لكل قطاع.',
  },
  car_salaire: {
    title: 'أي راتب في بداية المسار تستهدفه؟',
    subtitle: 'حجم تقريبي شهري صافٍ في المغرب — ليس التزاماً.',
    options: {
      lt8: 'أقل من 8.000 درهم شهرياً في بداية المسار',
      '8_12': 'من 8.000 إلى 12.000 درهم شهرياً',
      '12_18': 'من 12.000 إلى 18.000 درهم شهرياً',
      '18_25': 'من 18.000 إلى 25.000 درهم شهرياً',
      gt25: 'أكثر من 25.000 درهم شهرياً',
      nsp: 'لا أعرف بعد — أريد أولاً اختيار مهنة تناسبني',
    },
  },
  sch_types: {
    title: 'أي أنواع مؤسسات تجذبك؟',
    subtitle: 'اختر نوعاً أو أكثر — يمكنك تحديد الكل.',
    options: {
      public: 'عمومي',
      semi_public: 'شبه عمومي',
      prive: 'خصوصي',
      militaire: 'عسكري',
    },
  },
  sch_ecoles: {
    title: 'أي مدارس تريد الإبقاء عليها في رادارك؟',
    subtitle: 'صفحة لكل نوع مؤسسة — اختر حتى 8 مدارس لكل نوع.',
  },
};

/* ——— Hub + quiz chrome ——— */

export const UI_I18N: Record<OrientationUiLocale, Record<string, string>> = {
  fr: {
    langFr: 'FR',
    langAr: 'AR',
    chooseLanguage: 'Langue de l’interface',
    hubKicker: 'Test d’orientation E-TAWJIHI',
    hubTitle: 'Trouve ton parcours selon',
    hubTitleEm: 'ton profil',
    hubLead:
      'Ne choisis plus tes écoles au hasard. Le test croise ta personnalité, tes ambitions et tes contraintes avec les établissements réels de la plateforme.',
    hubCheckReport: 'Rapport personnalisé',
    hubCheckProfile: 'Selon ton profil scolaire',
    hubCheckDuration: '~12 minutes',
    hubCheckAccount: 'Lié à ton compte',
    ctaStart: 'Trouver mon orientation',
    ctaResume: 'Reprendre mon test',
    ctaRetake: 'Refaire le test',
    ctaSeeReport: 'Voir mon rapport',
    ctaContinue: 'Continuer',
    ctaLaunch: 'Lancer mon test',
    ctaLogin: 'Se connecter pour commencer',
    noteConnected: 'Connecté — ta progression sera liée à ton compte.',
    noteSavedPrefix: 'Progression sauvegardée ·',
    noteLoginRequired: 'Connexion obligatoire pour lancer le test et sauvegarder ta progression.',
    passDepart: 'DÉPART',
    passArrivee: 'ARRIVÉE',
    passCaption: 'modules · Matching personnalisé',
    boardKicker: 'Mon board orientation',
    boardTitle: 'Toute ta progression. Au même endroit.',
    boardDone: 'Terminé',
    boardInProgress: 'En cours',
    boardLeadReport: 'Rapport généré — consulte-le ou relance le test pour affiner.',
    boardLeadProgress: 'Étape en cours · modules validés.',
    boardLeadSaved: 'Tes modules validés restent liés à ton compte.',
    statusDone: 'Fait',
    statusCurrent: 'En cours',
    statusTodo: 'À faire',
    boardOpenReport: 'Ouvrir le rapport',
    boardRevisit: 'Revoir / refaire',
    howKicker: 'Comment ça fonctionne',
    howTitle: '4 étapes pour un matching clair',
    howLead: 'Un parcours simple : ton profil, tes choix, le Versus, puis un rapport prêt à utiliser.',
    howStep1Title: 'Renseigne ton profil',
    howStep1Text: 'Niveau, filière, notes et contexte — la base pour un matching fiable.',
    howStep2Title: 'Explore métiers & écoles',
    howStep2Text: 'Choisis dans la base live E-TAWJIHI : secteurs, métiers, établissements actifs.',
    howStep3Title: 'Tranche avec le Versus',
    howStep3Text: 'Duels métiers / écoles / admissions pour affiner ce qui compte vraiment pour toi.',
    howStep4Title: 'Reçois ton rapport',
    howStep4Text: 'Profil, familles, shortlist écoles et stratégie d’admission — actionnable tout de suite.',
    howStepLabel: 'ÉTAPE',
    whyKicker: 'Pourquoi ce test',
    whyTitle1: 'Ton profil est unique.',
    whyTitle2: 'Tes choix doivent l’être aussi.',
    whyP1:
      'Choisir une école uniquement pour son nom ou sa ville ne suffit pas. Ton parcours, tes notes, tes ambitions et les modes d’admission comptent aussi.',
    whyAccent:
      'C’est pour cela que le test E-TAWJIHI croise ton profil avec les écoles réelles de la plateforme.',
    whyItem1Title: 'Lecture du profil',
    whyItem1Text: 'RIASEC, fonctionnement, ambition, faisabilité.',
    whyItem2Title: 'Base écoles live',
    whyItem2Text: 'Plans A–D, types d’admission, campus réels.',
    whyItem3Title: 'Versus pour trancher',
    whyItem3Text: 'Chaque duel affine ton classement.',
    whyItem4Title: 'Rapport actionnable',
    whyItem4Text: 'Shortlist + stratégie, lié à ton compte.',
    modulesKicker: 'Les modules',
    modulesTitle: 'Le parcours en {n} modules',
    modulesLead: 'Chaque module a un objectif précis. Tu avances à ton rythme, avec sauvegarde.',
    finalTitle1: 'Tu regardes.',
    finalTitle2: 'Tu comprends.',
    finalTitle3: 'Tu choisis.',
    finalLi1: 'Les modules construisent ton profil',
    finalLi2: 'Le Versus affine tes priorités',
    finalLi3: 'Le rapport te donne une shortlist claire',
    finalEyebrow: 'Test d’orientation E-TAWJIHI',
    finalTitle: 'Profil. Métiers. Écoles.\nRapport personnalisé.',
    finalPlanLink: 'Voir Mon Plan de Réussite',
    btnBack: 'Retour',
    btnContinue: 'Continuer',
    btnLoading: 'Chargement…',
    btnGenDuels: 'Génération des duels…',
    btnRankingSchools: 'Classement des écoles…',
    btnLoadSchools: 'Chargement des écoles…',
    btnLoadMetiers: 'Chargement des métiers…',
    btnLoadSectors: 'Chargement des secteurs…',
    btnLoad: 'Chargement…',
    situationBriefTitle: 'Avant de commencer : PLUS & MOINS',
    situationBriefSub: 'Pour chaque mise en situation, tu feras deux choix parmi les mêmes rôles.',
    plusBadge: 'PLUS',
    plusTitle: 'Ce qui t’attire le plus',
    plusText:
      'Choisis le rôle dans lequel tu te projettes naturellement — celui que tu ferais volontiers. La carte sélectionnée s’affiche en vert.',
    moinsBadge: 'MOINS',
    moinsTitle: 'Ce qui t’attire le moins',
    moinsText:
      'Ensuite, choisis le rôle le moins attractif pour toi (différent du PLUS). La carte sélectionnée s’affiche en rouge.',
    briefTip:
      'Astuce : réponds instinctivement, sans trop réfléchir — il n’y a pas de bonne ou mauvaise réponse.',
    versusBriefTitle: 'Avant de commencer : le Versus',
    versusBriefSub:
      'Tableau Coupe du monde : 16 métiers puis 16 écoles, seedés selon tes choix — 8es, quarts, demies, finale. Chaque match est loggé pour un classement 1→16.',
    metierBadge: 'MÉTIER',
    ecoleBadge: 'ÉCOLE',
    versusCardTitle: '16 → Finale',
    versusMetierText:
      'Les 16 métiers les plus cohérents avec ton parcours s’affrontent jusqu’au sacre. Le journal des matchs produit l’ordre du meilleur au moins bon.',
    versusEcoleText:
      'Après les métiers, 16 écoles seedées (radar, type, ville, filière) jouent le même tableau jusqu’à la finale — classement 1→16 inclus.',
    versusNote: 'Un vainqueur par match. Tout est journalisé pour ordonner du meilleur au moins bon.',
    versusKindMetier: 'MÉTIER',
    versusKindEcole: 'ÉCOLE',
    versusRoundR16: '8e de finale',
    versusRoundQF: 'Quart de finale',
    versusRoundSF: 'Demi-finale',
    versusRoundFINAL: 'Finale',
    versusRoundDefault: 'Tournoi',
    versusWorldCupMetiers: 'Coupe du monde · {round} · 16 métiers',
    versusWorldCupEcoles: 'Coupe du monde · {round} · 16 écoles',
    versusSeed: 'N°{n}',
    versusChosen: 'Choisi',
    versusTapToChoose: 'Appuie pour choisir',
    versusFavorite: 'Favori',
    versusChallenger: 'Challenger',
    versusFicheMetier: 'Fiche métier',
    versusFicheEcole: 'Fiche école',
    versusHintMetier:
      'Tape sur le métier qui te parle le plus — un seul vainqueur avance.',
    versusHintEcole:
      'Tape sur l’école que tu préfères — un seul vainqueur avance.',
    versusTitleMetier: 'Versus métier — {round}',
    versusTitleEcole: 'Versus école — {round}',
    versusSubMatch: 'Match {n}/{total} · seeds {a} vs {b}',
    versusSubFinalMetier: 'Finale métier — qui termine n°1 ?',
    versusSubFinalEcole: 'Finale école — qui termine n°1 ?',
    versusRoundLabelR16: '8es de finale',
    versusRoundLabelQF: 'Quarts de finale',
    versusRoundLabelSF: 'Demi-finales',
    versusRoundLabelFINAL: 'Finale',
    moduleSaved: 'Module sauvegardé',
    moduleSavedResume: 'Reprise de ta progression sauvegardée',
    prefillEditable: 'tu peux modifier',
    reportRestart: 'Recommencer à zéro',
    reportDemo: 'Voir un rapport démo',
    reportPrint: 'Imprimer',
    reportPdf: 'Télécharger le PDF',
    reportPdfHint: 'Génère un PDF à enregistrer ou imprimer',
    reportPdfLoading: 'Préparation du PDF…',
    reportPdfError: 'Impossible de générer le PDF. Réessaie dans un instant.',
    reportReloadSchools: 'Relancer le classement des écoles',
    reportReloading: 'Classement en cours…',
    reportHeroKicker: 'Rapport d’orientation · E-TAWJIHI',
    reportHeroKickerProto: 'Rapport diagnostic · E-TAWJIHI',
    reportPassChip: 'RAPPORT',
    reportPassAmbition: 'Ambition',
    reportPassFaisabilite: 'Faisabilité',
    reportSec0: '0. Identité & parcours scolaire',
    reportSec1: '1. Profil RIASEC',
    reportSec2: '2. Mode de fonctionnement',
    reportSec3: '3. Moteurs professionnels',
    reportSec4: '4. Forces naturelles',
    reportSec5: '5. Points de vigilance',
    reportSec6: '6. Familles professionnelles',
    reportSec7: '7. Tes choix métiers & écoles',
    reportSec8: '8. Métiers → filières → stratégie écoles',
    reportSec9: '9. Écoles — synthèse',
    reportSec10: '10. Diagnostic d’orientation',
    reportKvEleve: 'Élève',
    reportKvNiveau: 'Niveau',
    reportKvBac: 'Bac / filière',
    reportKvVilles: 'Villes d’études',
    reportKvNotes: 'Notes',
    reportRiasecIntro:
      'Ton profil RIASEC se lit en trois couches. On compare ce que tu dis aimer, ce que tu choisis en situation, puis on calcule un profil final utilisé pour les recommandations.',
    reportLayer1Tag: 'Couche 1',
    reportLayer1Title: 'Profil déclaré',
    reportLayer1Body:
      'Ce que tu affirms aimer quand on te le demande directement (questions du type « j’aime / je n’aime pas »).',
    reportLayer1How: 'Comment c’est mesuré : tes réponses aux questions d’intérêts RIASEC.',
    reportLayer2Tag: 'Couche 2',
    reportLayer2Title: 'Profil comportemental',
    reportLayer2Body:
      'Ce que tu choisis vraiment quand tu dois trancher en situation (ce qui te attire le plus / le moins).',
    reportLayer2How:
      'Comment c’est mesuré : tes choix « le plus » / « le moins » dans les mises en situation.',
    reportLayer3Tag: 'Profil final',
    reportLayer3Title: 'Profil consolidé',
    reportLayer3Body:
      'La synthèse utilisée pour ton orientation : on donne un peu plus de poids à ce que tu déclares, tout en tenant compte de ton comportement réel.',
    reportLayer3How: 'Formule : 55 % déclaré + 45 % comportemental.',
    reportDominante: 'Dominante',
    reportSecondaire: 'Secondaire',
    reportComplementaire: 'Complémentaire',
    reportConsolideBars: 'Ton profil consolidé (barres)',
    reportConsolideHint:
      'Ce sont les scores finaux utilisés pour les familles, métiers et écoles recommandés.',
    reportGapTitle: 'Où tu es aligné… et où tu diverges',
    reportGapHint:
      'Pour tes 3 dimensions les plus fortes, on compare le déclaré et le comportemental. Un écart important signifie que ton discours et tes choix en situation ne disent pas exactement la même chose — utile à clarifier avec un conseiller.',
    reportGapFlat: 'Discours et comportement proches',
    reportGapUp: 'Tu te comportes plus « {label} » que tu ne le déclares',
    reportGapDown: 'Tu déclares plus « {label} » que tu ne le montres en situation',
    reportDeclareBar: 'Ce que tu déclares',
    reportBehaviorBar: 'Ce que tu choisis en situation',
    reportPrefLead:
      'Synthèse de ce que tu as sélectionné pendant le parcours — lisible d’un coup d’œil.',
    reportStatSectors: 'secteurs',
    reportStatMetiers: 'métiers',
    reportStatEcoles: 'écoles radar',
    reportStatSalary: 'salaire visé',
    reportPrefSectors: 'Secteurs',
    reportPrefMetiers: 'Métiers retenus',
    reportPrefEcoles: 'Écoles radar',
    reportPrefEmptySectors: 'Aucun secteur sélectionné',
    reportPrefEmptyMetiers: 'Aucun métier sélectionné',
    reportPrefEmptyEcoles: 'Aucune école au radar',
    reportVersusTitle: 'Coupe du monde Versus',
    reportVersusMatches: '{n} matchs',
    reportVersusRankMetiers: 'Classement métiers',
    reportVersusRankEcoles: 'Classement écoles',
    reportVersusKindMetier: 'Métier',
    reportVersusKindEcole: 'École',
    reportFilieres: 'Filières suggérées',
    reportStrategie: 'Stratégie d’études',
    reportSchoolsLead:
      'Toutes les écoles actives de la plateforme ({n}) classées avec les mêmes paliers que le diagnostic mobile : Recommandé (≥78 %), Possible (60–77 %), Dernier recours (45–59 %), À éviter (<45 % ou filière/seuil incompatible). Algo seul, sans IA.',
    reportSchoolsEmpty:
      'Aucune école classée : le chargement du catalogue a échoué ou a expiré (API lente). Relance le classement pour réessayer.',
    reportSeeFiche: 'Voir la fiche →',
    reportDiagClarte: 'Clarté du projet',
    reportDiagConnMetiers: 'Connaissance métiers',
    reportDiagConnFormations: 'Connaissance formations',
    reportDiagConfiance: 'Confiance',
    reportDiagAmbition: 'Ambition',
    reportDiagFaisabilite: 'Faisabilité',
    reportDiagProfil: 'Profil :',
    reportBackHub: 'Retour à la présentation',
    reportNotePlatform:
      'Rapport lié à ton compte E-TAWJIHI. Progression sauvegardée après chaque module. Chaîne : personnalité → secteurs → métiers → écoles → Versus.',
    reportNoteProto:
      'Prototype front-only : scores RIASEC déterministes (déclaré 55% + comportemental 45%). Les écoles recommandées suivent l’algo du diagnostic mobile sans score IA. Progression sauvegardée localement après chaque module.',
    reportBdMode: 'Mode',
    reportBdAmbitions: 'Ambitions',
    reportBdValeurs: 'Valeurs',
    fn_autonomie: 'Autonomie',
    fn_leadership: 'Leadership',
    fn_analyse: 'Analyse',
    fn_contactHumain: 'Contact humain',
    fn_structure: 'Besoin de structure',
    fn_creativite: 'Créativité',
    fn_action: 'Action',
    fn_incertitude: 'Tolérance incertitude',
    fn_pratique: 'Pratique',
    fn_collaboration: 'Collaboration',
    fn_variete: 'Besoin de variété',
    riasecR: 'Réaliste',
    riasecI: 'Investigateur',
    riasecA: 'Artistique',
    riasecS: 'Social',
    riasecE: 'Entreprenant',
    riasecC: 'Conventionnel',
    ambition_remuneration: 'Rémunération',
    ambition_stabilite: 'Stabilité',
    ambition_entrepreneuriat: 'Entrepreneuriat',
    ambition_apprentissage: 'Apprentissage',
    ambition_impact: 'Impact / aide',
    ambition_international: 'International',
    ambition_progression: 'Progression',
    ambition_equilibre: 'Équilibre de vie',
    schoolType_public: 'Public',
    schoolType_semi_public: 'Semi-public',
    schoolType_prive: 'Privé',
    schoolType_militaire: 'Militaire',
    metiersSectorTitle: 'Métiers ·',
    metiersSectorEmptyTitle: 'Métiers par secteur',
    metiersSectorEmptySub: 'Sélectionne d’abord des secteurs à l’étape précédente.',
    metiersSectorSub: 'Sélectionne jusqu’à 3 métiers (marché actuel, classés par salaire).',
    ecolesTypeTitle: 'Écoles ·',
    ecolesTypeEmptyTitle: 'Écoles par type',
    ecolesTypeEmptySub: 'Sélectionne d’abord au moins un type d’établissement à l’étape précédente.',
    ecolesTypeSub: 'Sélectionne jusqu’à 8 établissements par type.',
    profile_firstName: 'Prénom',
    profile_lastName: 'Nom',
    profile_phone: 'Téléphone',
    profile_city: 'Ville',
    profile_studyLevel: 'Niveau d’études',
    profile_bacType: 'Type de bac',
    profile_filiere: 'Filière',
    profile_anneeBac: 'Année du bac',
    profile_notesHint: 'Notes réelles ou estimation selon disponibilité.',
    profile_select: 'Sélectionner…',
    profile_specialites: 'Spécialités',
    profile_notesNone: 'Pas de notes requises pour ton niveau actuel — tu peux continuer.',
    profile_notesAvailable: 'Notes disponibles (je peux les remplir)',
    profile_notesEstimate: 'Notes non disponibles (estimation)',
    profile_note1ere: 'Note 1ère Bac',
    profile_noteControle: 'Contrôle continu',
    profile_noteNational: 'National',
    profile_notePremiere: 'Moyenne Première',
    profile_noteTerminale: 'Moyenne Terminale',
    profile_noteBac: 'Moyenne Bac',
    profile_estim: '(estim.)',
    situationMostSub:
      'Choisis uniquement le rôle qui t’attire le PLUS — la carte sélectionnée devient verte.',
    situationLeastSub:
      'Choisis le rôle qui t’attire le MOINS — la carte sélectionnée devient rouge. Le PLUS reste en vert.',
    topQuit: 'Quitter',
    quitConfirmTitle: 'Quitter le test ?',
    quitConfirmBody:
      'Ta progression est sauvegardée. Tu pourras reprendre plus tard là où tu t’es arrêté.',
    quitConfirmLeave: 'Quitter',
    quitConfirmStay: 'Rester',
    topBrand: 'Test d’orientation',
    topReset: 'Réinit.',
    topResetTitle: 'Réinitialiser le test',
    retakeTest: 'Refaire le test',
    retakeTestConfirm:
      'Refaire le test ? Tes réponses actuelles et le rapport seront effacés. Ton profil (nom, bac…) est conservé.',
    retakeTestConfirmAction: 'Refaire',
    retakeTestCancel: 'Annuler',
    seoTitle: 'Test d’orientation — E-TAWJIHI',
    seoTitleReport: 'Rapport d’orientation — E-TAWJIHI',
    seoDesc:
      'Test d’orientation complet (~12 min) : RIASEC déclaré + comportemental, fonctionnement, ambitions, contraintes et rapport exploitable.',
    boardLeadProgressTpl: 'Étape en cours · {done} module(s) validé(s) sur {total}.',
    passProfile: 'Ton profil',
    passProfileSub: 'Parcours · Ambitions',
    passReport: 'Ton rapport',
    passReportSub: 'Métiers · Écoles',
    passChipProfile: 'Profil',
    passChipMetiers: 'Métiers',
    passChipEcoles: 'Écoles',
    passChipReport: 'Rapport',
    lastModuleDone: 'Dernier module terminé :',
    reportBuilding: 'Calcul du rapport et classement des écoles…',
    sectorsCountTpl: '{n} / {max} secteurs (max {max})',
    metiersCountTpl: '{n} / {max} métiers pour ce secteur · {total} propositions',
    metiersCountMarket: ' · marché actuel',
    metiersCountMixte: ' · API + marché',
    metiersCountSalary: ' · salaire ↓',
    metiersWord: 'métiers',
    schoolsLinked: 'écoles liées',
    seeMoreDetail: 'Voir plus de détail →',
    seeMoreDetailRtl: '← عرض المزيد من التفاصيل',
    ficheSecteur: 'Fiche secteur',
    ficheMetier: 'Fiche métier',
    closeFiche: 'Fermer la fiche',
    closeAria: 'Fermer',
    loadingSectors: 'Chargement des secteurs…',
    loadingMetiers: 'Chargement des métiers…',
    noSectors: 'Aucun secteur actif pour le moment.',
    noMetiers: 'Aucun métier trouvé pour ce secteur.',
    sectorsLoadError: 'Impossible de charger les secteurs.',
    hintSelectSectorsFirst: 'Sélectionne d’abord des secteurs à l’étape précédente.',
    hintMarketMetiers: 'Métiers du marché actuel (catalogue moderne).',
    hintMixteMetiers: 'Liste enrichie avec des métiers du marché actuel (7–10).',
    chosenRank: 'Choisi · {n}',
    modalTendance: 'Tendance marché',
    modalSalaire: 'Ordre de salaire',
    modalSalaireDebut: 'Salaire début',
    modalAccess: 'Accessibilité',
    modalSoftSkills: 'Soft skills utiles',
    modalAtouts: 'Atouts du secteur',
    modalAttention: 'Points d’attention',
    modalBacs: 'Bacs / profils souvent adaptés',
    modalExemplesMetiers: 'Exemples de métiers',
    modalSecteur: 'Secteur',
    modalMissions: 'Missions typiques',
    modalCompetences: 'Compétences clés',
    modalFormations: 'Formations possibles',
    modalDebouches: 'Débouchés',
    sourceApi: 'Données E-TAWJIHI',
    sourceMixte: 'Base E-TAWJIHI + marché actuel',
    sourceMarche: 'Infos marché actuel (complément)',
    sourceFicheEtawjihi: 'Fiche E-TAWJIHI',
    ficheEtablissement: 'Fiche établissement',
    detailFallback: 'Détail',
    loadingDetails: 'Chargement des détails…',
    situationPhaseMost: 'Étape A · Choisis le rôle qui t’attire le PLUS',
    situationPhasePlusDone: 'PLUS · vert ✓',
    situationPhaseLeast: 'Étape B · Choisis le rôle qui t’attire le MOINS',
    dilemmaEqual: 'Les deux m’attirent autant',
    chosenShort: 'choisi',
    citiesRetainedTpl: '{n} ville{s} retenues',
    citiesFlexibleTitle: 'Flexible partout au Maroc',
    citiesFlexibleSub: 'Les écoles de toutes les villes pourront être classées.',
    citiesPrimaryTitle: 'Villes principales',
    citiesSelectedTpl: '{n} sélectionnée{s}',
    citiesOthersExamples: 'Agadir, Meknès, Oujda…',
    citiesSelectAtLeastOne: 'Sélectionne au moins une ville pour pouvoir continuer.',
    citiesRemoveTitle: 'Retirer {name}',
    citiesSuggestions: 'Suggestions',
    citiesSearch: 'Rechercher',
    citiesSearchPlaceholder: 'Ex. Agadir, Berkane, Settat…',
    citiesSearchMinChars: 'Tape au moins 2 lettres pour chercher une ville (évite la longue liste).',
    citiesOtherAria: 'Autres villes',
    citiesNoResult: 'Aucun résultat pour « {q} ».',
    citiesShowFirst60: 'Affichage des 30 premiers résultats — affine ta recherche.',
    citiesFlexibleReplace: 'Remplace les choix de villes précises',
    schoolSearchLabel: 'Rechercher une école {type}',
    schoolSearchPlaceholder: 'Nom, sigle, ville…',
    schoolNoActiveType: 'Aucune école active de type {type} pour le moment — tu peux continuer.',
    schoolLoadError: 'Impossible de charger les écoles.',
    schoolTotalRadar: 'total radar {n}',
    schoolResultsTpl: '{n} résultat{s}',
    schoolSortPlan: 'tri Plan A→D, durée la plus longue',
    schoolSansPlan: 'Sans plan',
    schoolGroupFacultesPubliques: 'Universités et facultés publiques',
    schoolGroupFacultesPubliquesHint: 'Accès ouvert — ouvrir pour voir la liste',
    schoolGroupFacultesPubliquesCount: '{n} établissements',
    schoolGroupFacultesOpen: 'Masquer la liste',
    schoolGroupFacultesClosed: 'Voir toutes les facultés',
    schoolNoResultQuery: 'Aucun résultat pour « {q} » dans {type}.',
    schoolNoType: 'Aucune école de type {type}.',
    schoolCampusTitle: 'Villes des campus',
    schoolDiplomesTitle: 'Diplômes délivrés',
    seeSummary: 'Voir le résumé →',
    seeSummaryRtl: '← عرض الملخص',
    modalType: 'Type',
    modalPlanOrientation: 'Plan orientation',
    modalVillesCampus: 'Villes / campus',
    modalFrais: 'Frais de scolarité',
    modalDuree: 'Durée d’études',
    modalAdmission: 'Admission',
    modalPointsCles: 'Points clés',
    modalDiplomesDelivres: 'Diplômes délivrés',
    modalFilieresBac: 'Filières bac acceptées',
    modalSecteurs: 'Secteurs',
    chipReconnuEtat: 'Reconnu par l’État',
    chipEchangesIntl: 'Échanges internationaux',
    chipBacObligatoire: 'Bac obligatoire',
    chipFilieresTpl: '{n} filières',
    chipEtudiantsTpl: '~{n} étudiants',
    feesNotSet: 'Non renseignés',
    feesRangeTpl: '{min} – {max} DH / an (ordre de grandeur)',
    feesSingleTpl: '{v} DH / an (ordre de grandeur)',
    schoolFallbackType: 'Établissement {type}',
    schoolFallbackGeneric: 'Établissement d’enseignement supérieur',
    schoolFallbackPresent: 'présent à {cities}',
    schoolFallbackAdmission: 'admission : {admission}',
    schoolFallbackReconnu: 'diplôme reconnu par l’État',
    schoolFallbackEchanges: 'échanges internationaux',
    draftSavedTitle: 'Progression sauvegardée',
    draftHasReport: 'Tu as déjà un rapport généré.',
    draftCanResume: 'Tu peux reprendre exactement où tu t’étais arrêté.',
    draftSavedAt: 'Enregistré le {date}.',
    draftResumeReport: 'Revoir mon rapport',
    draftResumeQuiz: 'Reprendre le test',
    draftRestart: 'Recommencer à zéro',
    protoStart: 'Commencer le test',
    protoDemoReport: 'Voir un rapport démo',
    protoEyebrow: 'Diagnostic d’orientation',
    protoTitle: 'Pas un simple test RIASEC.',
    protoLead:
      'Un parcours de 10 à 15 minutes qui croise intérêts, mises en situation, mode de fonctionnement, ambitions et réalité — pour un profil exploitable : secteurs → métiers → filières → écoles.',
    protoPill1: 'Métiers par secteur · Versus',
    protoPill2: '~12–14 minutes',
    protoPill3: '10 modules',
    protoPill4: 'Métiers · Écoles · Versus',
    protoPill5: 'Profil scolaire inclus',
    protoPersonasTitle: 'Tester avec un profil prérempli',
    protoPersonasLead:
      'Clique un profil : le questionnaire est rempli. Tu n’as qu’à enchaîner sur Continuer jusqu’au rapport.',
    protoHome: 'Retour accueil',
    reportPassBrand: 'ORIENTATION PASS',
    reportProfilFallback: 'Profil',
    salaryNotSet: 'Salaire non renseigné',
    demoProfileNote: 'Profil démo « {title} »',
    diplomesShort: 'Diplômes',
    versusEliminated: 'Écarté',
    personaCta: 'Lancer → Continuer seulement',
    cityNotSet: 'Ville non renseignée',
    resetConfirm:
      'Réinitialiser le test ? Toutes les réponses et le brouillon seront effacés.',
  },
  ar: {
    langFr: 'FR',
    langAr: 'AR',
    chooseLanguage: 'لغة الواجهة',
    hubKicker: 'اختبار التوجيه E-TAWJIHI',
    hubTitle: 'اعثر على مسارك حسب',
    hubTitleEm: 'ملفك الشخصي',
    hubLead:
      'لا تختر مدارسك عشوائياً. يربط الاختبار شخصيتك وطموحاتك وقيودك بالمؤسسات الحقيقية على المنصة.',
    hubCheckReport: 'تقرير مخصّص',
    hubCheckProfile: 'حسب ملفك الدراسي',
    hubCheckDuration: '~12 دقيقة',
    hubCheckAccount: 'مرتبط بحسابك',
    ctaStart: 'اعثر على توجهي',
    ctaResume: 'متابعة اختباري',
    ctaRetake: 'إعادة الاختبار',
    ctaSeeReport: 'عرض تقريري',
    ctaContinue: 'متابعة',
    ctaLaunch: 'ابدأ اختباري',
    ctaLogin: 'سجّل الدخول للبدء',
    noteConnected: 'متّصل — سيتم ربط تقدّمك بحسابك.',
    noteSavedPrefix: 'تم حفظ التقدّم ·',
    noteLoginRequired: 'تسجيل الدخول إلزامي لبدء الاختبار وحفظ تقدّمك.',
    passDepart: 'الانطلاق',
    passArrivee: 'الوصول',
    passCaption: 'وحدات · مطابقة مخصّصة',
    boardKicker: 'لوحة توجهي',
    boardTitle: 'كل تقدّمك. في مكان واحد.',
    boardDone: 'منتهٍ',
    boardInProgress: 'جارٍ',
    boardLeadReport: 'تم إنشاء التقرير — اطّلع عليه أو أعد الاختبار للتحسين.',
    boardLeadProgress: 'مرحلة جارية · وحدات مكتملة.',
    boardLeadSaved: 'وحداتك المكتملة تبقى مرتبطة بحسابك.',
    statusDone: 'تم',
    statusCurrent: 'جارٍ',
    statusTodo: 'قادم',
    boardOpenReport: 'فتح التقرير',
    boardRevisit: 'مراجعة / إعادة',
    howKicker: 'طريقة العمل',
    howTitle: '4 خطوات لتوجيه أوضح',
    howLead: 'مسار بسيط يبدأ بملفك واختياراتك، ثم المواجهات، وينتهي بتقرير عملي.',
    howStep1Title: 'أكمل ملفك',
    howStep1Text: 'المستوى، الشعبة، النقط والوضع الحالي: معلومات أساسية لتوجيه موثوق.',
    howStep2Title: 'استكشف المهن والمدارس',
    howStep2Text: 'اختر من قاعدة E-TAWJIHI المحدّثة: قطاعات ومهن ومؤسسات نشطة.',
    howStep3Title: 'احسم اختياراتك بالمواجهات',
    howStep3Text: 'قارن بين المهن والمدارس لتحديد ما يناسبك فعلاً.',
    howStep4Title: 'استلم تقريرك',
    howStep4Text: 'احصل على ملفك المهني وقائمة مدارس مختصرة وخطة قبول قابلة للتنفيذ.',
    howStepLabel: 'خطوة',
    whyKicker: 'لماذا هذا الاختبار',
    whyTitle1: 'ملفك فريد.',
    whyTitle2: 'وينبغي أن تكون اختياراتك كذلك.',
    whyP1:
      'اختيار مدرسة بسبب اسمها أو مدينتها فقط لا يكفي. مسارك ونقطك وطموحاتك وشروط القبول مهمة أيضاً.',
    whyAccent: 'لذلك يربط اختبار E-TAWJIHI ملفك بالمدارس الحقيقية على المنصة.',
    whyItem1Title: 'قراءة الملف',
    whyItem1Text: 'RIASEC، أسلوب العمل، الطموح، الجدوى.',
    whyItem2Title: 'قاعدة مدارس حية',
    whyItem2Text: 'خطط أ–د، أنواع القبول، ومدن الدراسة.',
    whyItem3Title: 'مواجهات للحسم',
    whyItem3Text: 'كل مواجهة تصقل ترتيبك.',
    whyItem4Title: 'تقرير قابل للتطبيق',
    whyItem4Text: 'قائمة مختصرة وخطة عملية محفوظتان في حسابك.',
    modulesKicker: 'الوحدات',
    modulesTitle: 'المسار عبر {n} وحدات',
    modulesLead: 'لكل وحدة هدف واضح. تتقدّم بوتيرتك، مع الحفظ.',
    finalTitle1: 'تلاحظ.',
    finalTitle2: 'تفهم.',
    finalTitle3: 'تختار.',
    finalLi1: 'الوحدات تبني ملفك',
    finalLi2: 'المواجهات ترتّب أولوياتك',
    finalLi3: 'التقرير يمنحك قائمة قصيرة واضحة',
    finalEyebrow: 'اختبار التوجيه E-TAWJIHI',
    finalTitle: 'الملف. المهن. المدارس.\nتقرير مخصّص.',
    finalPlanLink: 'عرض خطة نجاحي',
    btnBack: 'رجوع',
    btnContinue: 'متابعة',
    btnLoading: 'جارٍ التحميل…',
    btnGenDuels: 'جارٍ إنشاء المواجهات…',
    btnRankingSchools: 'جارٍ ترتيب المدارس…',
    btnLoadSchools: 'جارٍ تحميل المدارس…',
    btnLoadMetiers: 'جارٍ تحميل المهن…',
    btnLoadSectors: 'جارٍ تحميل القطاعات…',
    btnLoad: 'جارٍ التحميل…',
    situationBriefTitle: 'قبل البدء: الأكثر والأقل',
    situationBriefSub: 'في كل موقف، ستختار دوراً يجذبك أكثر ودوراً يجذبك أقل.',
    plusBadge: 'الأكثر',
    plusTitle: 'ما يجذبك أكثر',
    plusText:
      'اختر الدور الذي تتخيّل نفسك تقوم به بشكل طبيعي. ستظهر البطاقة المختارة باللون الأخضر.',
    moinsBadge: 'الأقل',
    moinsTitle: 'ما يجذبك أقل',
    moinsText:
      'بعد ذلك، اختر دوراً آخر يجذبك أقل. ستظهر البطاقة المختارة باللون الأحمر.',
    briefTip: 'نصيحة: أجب بعفوية. لا توجد إجابة صحيحة أو خاطئة.',
    versusBriefTitle: 'قبل بدء المواجهات',
    versusBriefSub:
      'بطولة من 16 مهنة، ثم 16 مدرسة، مرتّبة حسب اختياراتك. تبدأ بثمن النهائي وتنتهي بالمباراة النهائية.',
    metierBadge: 'مهنة',
    ecoleBadge: 'مدرسة',
    versusCardTitle: '16 → النهائي',
    versusMetierText:
      'تتنافس 16 مهنة متوافقة مع ملفك. اختياراتك تحدد ترتيبها من الأنسب إلى الأقل ملاءمة.',
    versusEcoleText:
      'بعد المهن، تقارن بين 16 مدرسة مرتّبة حسب اختياراتك ونوع المؤسسة والمدينة والشعبة.',
    versusNote: 'اختر فائزاً واحداً في كل مواجهة للحصول على ترتيب من 1 إلى 16.',
    versusKindMetier: 'مهنة',
    versusKindEcole: 'مدرسة',
    versusRoundR16: 'ثمن النهائي',
    versusRoundQF: 'ربع النهائي',
    versusRoundSF: 'نصف النهائي',
    versusRoundFINAL: 'النهائي',
    versusRoundDefault: 'البطولة',
    versusWorldCupMetiers: 'كأس العالم · {round} · 16 مهنة',
    versusWorldCupEcoles: 'كأس العالم · {round} · 16 مدرسة',
    versusSeed: 'الترتيب {n}',
    versusChosen: 'مختار',
    versusTapToChoose: 'اضغط للاختيار',
    versusFavorite: 'المفضّل',
    versusChallenger: 'المنافس',
    versusFicheMetier: 'بطاقة المهنة',
    versusFicheEcole: 'بطاقة المدرسة',
    versusHintMetier:
      'اضغط على المهنة الأقرب إليك — فائز واحد يتأهل.',
    versusHintEcole:
      'اضغط على المدرسة التي تفضّلها — فائز واحد يتأهل.',
    versusTitleMetier: 'مواجهة المهن — {round}',
    versusTitleEcole: 'مواجهة المدارس — {round}',
    versusSubMatch: 'المواجهة {n}/{total} · الترتيب {a} ضد {b}',
    versusSubFinalMetier: 'نهائي المهن — ما المهنة التي ستحتل المركز الأول؟',
    versusSubFinalEcole: 'نهائي المدارس — ما المدرسة التي ستحتل المركز الأول؟',
    versusRoundLabelR16: 'ثمن النهائي',
    versusRoundLabelQF: 'أرباع النهائي',
    versusRoundLabelSF: 'نصف النهائي',
    versusRoundLabelFINAL: 'النهائي',
    moduleSaved: 'تم حفظ الوحدة',
    moduleSavedResume: 'استئناف تقدّمك المحفوظ',
    prefillEditable: 'يمكنك التعديل',
    reportRestart: 'البدء من الصفر',
    reportDemo: 'عرض تقرير تجريبي',
    reportPrint: 'طباعة',
    reportPdf: 'تحميل PDF',
    reportPdfHint: 'ينشئ ملف PDF للحفظ أو الطباعة',
    reportPdfLoading: 'جاري إعداد ملف PDF…',
    reportPdfError: 'تعذّر إنشاء ملف PDF. أعد المحاولة بعد لحظات.',
    reportReloadSchools: 'إعادة ترتيب المدارس',
    reportReloading: 'الترتيب جارٍ…',
    reportHeroKicker: 'تقرير التوجيه · E-TAWJIHI',
    reportHeroKickerProto: 'تقرير التشخيص · E-TAWJIHI',
    reportPassChip: 'تقرير',
    reportPassAmbition: 'الطموح',
    reportPassFaisabilite: 'القابلية للتنفيذ',
    reportSec0: '0. الهوية والمسار الدراسي',
    reportSec1: '1. ميولك المهنية (RIASEC)',
    reportSec2: '2. أسلوب العمل',
    reportSec3: '3. دوافعك المهنية',
    reportSec4: '4. القوى الطبيعية',
    reportSec5: '5. نقاط الانتباه',
    reportSec6: '6. العائلات المهنية',
    reportSec7: '7. اختياراتك من المهن والمدارس',
    reportSec8: '8. المهن والشعب وخطة اختيار المدارس',
    reportSec9: '9. خلاصة المدارس المقترحة',
    reportSec10: '10. تشخيص التوجيه',
    reportKvEleve: 'التلميذ',
    reportKvNiveau: 'المستوى',
    reportKvBac: 'الباك / الشعبة',
    reportKvVilles: 'مدن الدراسة',
    reportKvNotes: 'النقط',
    reportRiasecIntro:
      'نعرض ميولك المهنية في ثلاث مراحل: ما تقول إنك تحبه، وما تختاره في المواقف، ثم النتيجة النهائية المستخدمة في التوصيات.',
    reportLayer1Tag: 'الطبقة 1',
    reportLayer1Title: 'ما صرّحت به',
    reportLayer1Body:
      'ما تقول إنك تحبه عند الإجابة مباشرة عن أسئلة «أحب / لا أحب».',
    reportLayer1How: 'كيف يُقاس: إجاباتك على أسئلة اهتمامات RIASEC.',
    reportLayer2Tag: 'الطبقة 2',
    reportLayer2Title: 'ما أظهرته اختياراتك',
    reportLayer2Body:
      'ما تختاره فعلاً عندما تحسم بين ما يجذبك أكثر وما يجذبك أقل.',
    reportLayer2How: 'كيف يُقاس: اختياراتك «الأكثر» / «الأقل» في الوضعيات.',
    reportLayer3Tag: 'الملف النهائي',
    reportLayer3Title: 'ملفك النهائي',
    reportLayer3Body:
      'الخلاصة المستخدمة لتوجيهك: نعطي وزناً أكبر لما تصرّح به مع مراعاة سلوكك الفعلي.',
    reportLayer3How: 'الحساب: 55٪ من إجاباتك المباشرة و45٪ من اختياراتك في المواقف.',
    reportDominante: 'الغالب',
    reportSecondaire: 'الثانوي',
    reportComplementaire: 'المكمّل',
    reportConsolideBars: 'ملفك النهائي',
    reportConsolideHint: 'هذه هي النتائج النهائية المستخدمة لاقتراح العائلات المهنية والمهن والمدارس.',
    reportGapTitle: 'أين تتوافق إجاباتك وأين تختلف؟',
    reportGapHint:
      'نقارن، في أقوى ثلاثة أبعاد لديك، بين ما صرّحت به وما أظهرته اختياراتك. يساعدك الفرق الكبير على معرفة ما يحتاج إلى توضيح.',
    reportGapFlat: 'الخطاب والسلوك متقاربان',
    reportGapUp: 'سلوكك أقرب إلى {label} مما تقول',
    reportGapDown: 'ما تقوله أقرب إلى {label} مما تُظهره اختياراتك',
    reportDeclareBar: 'ما تصرّح به',
    reportBehaviorBar: 'ما تختاره في الوضعيات',
    reportPrefLead: 'خلاصة واضحة لاختياراتك خلال الاختبار.',
    reportStatSectors: 'قطاعات',
    reportStatMetiers: 'مهن',
    reportStatEcoles: 'مدارس مختارة',
    reportStatSalary: 'الأجر المستهدف',
    reportPrefSectors: 'القطاعات',
    reportPrefMetiers: 'المهن المختارة',
    reportPrefEcoles: 'المدارس التي اخترتها',
    reportPrefEmptySectors: 'لم يُختر أي قطاع',
    reportPrefEmptyMetiers: 'لم تُختر أي مهنة',
    reportPrefEmptyEcoles: 'لم تختر أي مدرسة',
    reportVersusTitle: 'ترتيب المواجهات',
    reportVersusMatches: '{n} مباريات',
    reportVersusRankMetiers: 'ترتيب المهن',
    reportVersusRankEcoles: 'ترتيب المدارس',
    reportVersusKindMetier: 'مهنة',
    reportVersusKindEcole: 'مدرسة',
    reportFilieres: 'شعب مقترحة',
    reportStrategie: 'خطة الدراسة',
    reportSchoolsLead:
      'صُنّفت المدارس النشطة ({n}) حسب توافقها مع ملفك: موصى بها (78٪ فأكثر)، ممكنة (60–77٪)، خيار احتياطي (45–59٪)، وغير مناسبة (أقل من 45٪ أو شعبة/عتبة غير متوافقة).',
    reportSchoolsEmpty:
      'تعذّر ترتيب المدارس بسبب بطء التحميل. أعد المحاولة بعد قليل.',
    reportSeeFiche: 'عرض البطاقة ←',
    reportDiagClarte: 'وضوح المشروع',
    reportDiagConnMetiers: 'معرفة المهن',
    reportDiagConnFormations: 'معرفة المسارات الدراسية',
    reportDiagConfiance: 'الثقة',
    reportDiagAmbition: 'الطموح',
    reportDiagFaisabilite: 'القابلية للتنفيذ',
    reportDiagProfil: 'الملف:',
    reportBackHub: 'العودة إلى التقديم',
    reportNotePlatform:
      'هذا التقرير مرتبط بحسابك على E-TAWJIHI، ويُحفظ تقدمك بعد كل مرحلة.',
    reportNoteProto:
      'نسخة تجريبية: تُحسب النتيجة النهائية من إجاباتك المباشرة (55٪) واختياراتك في المواقف (45٪). تُرتّب المدارس آلياً، ويُحفظ تقدمك على هذا الجهاز.',
    reportBdMode: 'الأسلوب',
    reportBdAmbitions: 'الطموحات',
    reportBdValeurs: 'القيم',
    fn_autonomie: 'الاستقلالية',
    fn_leadership: 'القيادة',
    fn_analyse: 'التحليل',
    fn_contactHumain: 'التواصل البشري',
    fn_structure: 'التنظيم',
    fn_creativite: 'الإبداع',
    fn_action: 'المبادرة',
    fn_incertitude: 'تحمّل عدم اليقين',
    fn_pratique: 'التطبيق العملي',
    fn_collaboration: 'التعاون',
    fn_variete: 'الحاجة إلى التنوع',
    riasecR: 'واقعي',
    riasecI: 'استقصائي',
    riasecA: 'فني',
    riasecS: 'اجتماعي',
    riasecE: 'مبادر',
    riasecC: 'تقليدي',
    ambition_remuneration: 'الأجر',
    ambition_stabilite: 'الاستقرار',
    ambition_entrepreneuriat: 'ريادة الأعمال',
    ambition_apprentissage: 'التعلّم',
    ambition_impact: 'الأثر ومساعدة الآخرين',
    ambition_international: 'العمل الدولي',
    ambition_progression: 'التقدّم',
    ambition_equilibre: 'التوازن بين العمل والحياة',
    schoolType_public: 'عمومي',
    schoolType_semi_public: 'شبه عمومي',
    schoolType_prive: 'خصوصي',
    schoolType_militaire: 'عسكري',
    metiersSectorTitle: 'مهن ·',
    metiersSectorEmptyTitle: 'مهن حسب القطاع',
    metiersSectorEmptySub: 'اختر أولاً قطاعات في الخطوة السابقة.',
    metiersSectorSub: 'اختر حتى 3 مهن من سوق العمل الحالي، مرتبة حسب الأجر.',
    ecolesTypeTitle: 'مدارس ·',
    ecolesTypeEmptyTitle: 'مدارس حسب النوع',
    ecolesTypeEmptySub: 'اختر أولاً نوع مؤسسة واحداً على الأقل في الخطوة السابقة.',
    ecolesTypeSub: 'اختر حتى 8 مؤسسات من كل نوع.',
    profile_firstName: 'الاسم الشخصي',
    profile_lastName: 'الاسم العائلي',
    profile_phone: 'الهاتف',
    profile_city: 'المدينة',
    profile_studyLevel: 'المستوى الدراسي',
    profile_bacType: 'نوع البكالوريا',
    profile_filiere: 'الشعبة',
    profile_anneeBac: 'سنة البكالوريا',
    profile_notesHint: 'أدخل نقطاً حقيقية أو تقديرية حسب المعلومات المتوفرة.',
    profile_select: 'اختر…',
    profile_specialites: 'التخصصات',
    profile_notesNone: 'لا نحتاج إلى نقط في مستواك الحالي. يمكنك المتابعة.',
    profile_notesAvailable: 'النقط متوفرة ويمكنني إدخالها',
    profile_notesEstimate: 'النقط غير متوفرة وسأدخل تقديراً',
    profile_note1ere: 'معدل السنة الأولى باك',
    profile_noteControle: 'المراقبة المستمرة',
    profile_noteNational: 'الوطني',
    profile_notePremiere: 'معدل الأولى',
    profile_noteTerminale: 'معدل النهائية',
    profile_noteBac: 'معدل البكالوريا',
    profile_estim: '(تقديري)',
    situationMostSub: 'اختر الدور الذي يجذبك أكثر. ستصبح البطاقة المختارة خضراء.',
    situationLeastSub:
      'اختر الدور الذي يجذبك أقل. ستصبح البطاقة المختارة حمراء، وسيبقى اختيارك الأول أخضر.',
    topQuit: 'خروج',
    quitConfirmTitle: 'مغادرة الاختبار؟',
    quitConfirmBody: 'تم حفظ تقدّمك. يمكنك المتابعة لاحقاً من حيث توقفت.',
    quitConfirmLeave: 'مغادرة',
    quitConfirmStay: 'البقاء',
    topBrand: 'اختبار التوجيه',
    topReset: 'إعادة',
    topResetTitle: 'إعادة ضبط الاختبار',
    retakeTest: 'إعادة الاختبار',
    retakeTestConfirm:
      'إعادة الاختبار؟ سيتم مسح إجاباتك الحالية والتقرير. يُحتفظ بملفك (الاسم، البكالوريا…).',
    retakeTestConfirmAction: 'إعادة',
    retakeTestCancel: 'إلغاء',
    seoTitle: 'اختبار التوجيه — E-TAWJIHI',
    seoTitleReport: 'تقرير التوجيه — E-TAWJIHI',
    seoDesc:
      'اختبار توجيه كامل (~12 دق): RIASEC معلن + سلوكي، أسلوب العمل، الطموحات، القيود وتقرير قابل للاستخدام.',
    boardLeadProgressTpl: 'مرحلة جارية · {done} وحدة مكتملة من أصل {total}.',
    passProfile: 'ملفك',
    passProfileSub: 'المسار · الطموحات',
    passReport: 'تقريرك',
    passReportSub: 'المهن · المدارس',
    passChipProfile: 'الملف',
    passChipMetiers: 'المهن',
    passChipEcoles: 'المدارس',
    passChipReport: 'التقرير',
    lastModuleDone: 'آخر وحدة مكتملة:',
    reportBuilding: 'جارٍ حساب التقرير وترتيب المدارس…',
    sectorsCountTpl: '{n} / {max} قطاعات (حد أقصى {max})',
    metiersCountTpl: '{n} / {max} مهن لهذا القطاع · {total} اقتراحات',
    metiersCountMarket: ' · سوق العمل الحالي',
    metiersCountMixte: ' · قاعدة E-TAWJIHI وسوق العمل',
    metiersCountSalary: ' · الأجر من الأعلى إلى الأقل',
    metiersWord: 'مهن',
    schoolsLinked: 'مدارس مرتبطة',
    seeMoreDetail: 'عرض المزيد من التفاصيل →',
    seeMoreDetailRtl: '← عرض المزيد من التفاصيل',
    ficheSecteur: 'بطاقة القطاع',
    ficheMetier: 'بطاقة المهنة',
    closeFiche: 'إغلاق البطاقة',
    closeAria: 'إغلاق',
    loadingSectors: 'جارٍ تحميل القطاعات…',
    loadingMetiers: 'جارٍ تحميل المهن…',
    noSectors: 'لا يوجد قطاع نشط حالياً.',
    noMetiers: 'لم يتم العثور على مهن لهذا القطاع.',
    sectorsLoadError: 'تعذّر تحميل القطاعات.',
    hintSelectSectorsFirst: 'اختر أولاً قطاعات في الخطوة السابقة.',
    hintMarketMetiers: 'مهن حديثة من سوق العمل.',
    hintMixteMetiers: 'قائمة موسّعة تضم من 7 إلى 10 مهن حديثة.',
    chosenRank: 'مختار · {n}',
    modalTendance: 'اتجاه السوق',
    modalSalaire: 'مستوى الأجر',
    modalSalaireDebut: 'أجر البداية',
    modalAccess: 'سهولة الولوج',
    modalSoftSkills: 'مهارات شخصية مفيدة',
    modalAtouts: 'نقاط قوة القطاع',
    modalAttention: 'نقاط انتباه',
    modalBacs: 'شعب الباك والمسارات المناسبة غالباً',
    modalExemplesMetiers: 'أمثلة على المهن',
    modalSecteur: 'القطاع',
    modalMissions: 'مهام نموذجية',
    modalCompetences: 'مهارات أساسية',
    modalFormations: 'تكوينات ممكنة',
    modalDebouches: 'آفاق التشغيل',
    sourceApi: 'بيانات E-TAWJIHI',
    sourceMixte: 'قاعدة E-TAWJIHI وسوق العمل',
    sourceMarche: 'معلومات إضافية من سوق العمل',
    sourceFicheEtawjihi: 'بطاقة E-TAWJIHI',
    ficheEtablissement: 'بطاقة المؤسسة',
    detailFallback: 'تفاصيل',
    loadingDetails: 'جارٍ تحميل التفاصيل…',
    situationPhaseMost: 'الخطوة أ · اختر الدور الذي يجذبك أكثر',
    situationPhasePlusDone: 'الأكثر · أخضر ✓',
    situationPhaseLeast: 'الخطوة ب · اختر الدور الذي يجذبك أقل',
    dilemmaEqual: 'كلاهما يجذبني بنفس القدر',
    chosenShort: 'مختار',
    citiesRetainedTpl: '{n} مدينة محتفظ بها',
    citiesFlexibleTitle: 'يمكنني الدراسة في أي مدينة بالمغرب',
    citiesFlexibleSub: 'ستظهر لك مدارس من جميع المدن.',
    citiesPrimaryTitle: 'المدن الرئيسية',
    citiesSelectedTpl: '{n} مختارة',
    citiesOthersExamples: 'Agadir, Meknès, Oujda…',
    citiesSelectAtLeastOne: 'اختر مدينة واحدة على الأقل للمتابعة.',
    citiesRemoveTitle: 'إزالة {name}',
    citiesSuggestions: 'اقتراحات',
    citiesSearch: 'بحث',
    citiesSearchPlaceholder: 'اكتب بالفرنسية: Agadir, Berkane, Settat…',
    citiesSearchMinChars: 'اكتب اسم المدينة بالفرنسية، حرفين على الأقل.',
    citiesOtherAria: 'مدن أخرى',
    citiesNoResult: 'لا نتيجة لـ « {q} ».',
    citiesShowFirst60: 'نعرض أول 30 نتيجة. اكتب اسماً أدق لتقليل النتائج.',
    citiesFlexibleReplace: 'يلغي اختيارات المدن المحددة',
    schoolSearchLabel: 'ابحث عن مدرسة {type}',
    schoolSearchPlaceholder: 'الاسم، الاختصار، المدينة…',
    schoolNoActiveType: 'لا توجد مدرسة نشطة من نوع {type} حالياً — يمكنك المتابعة.',
    schoolLoadError: 'تعذّر تحميل المدارس.',
    schoolTotalRadar: 'مجموع المدارس المختارة: {n}',
    schoolResultsTpl: '{n} نتيجة',
    schoolSortPlan: 'الترتيب حسب الخطة من أ إلى د، ثم حسب أطول مدة دراسة',
    schoolSansPlan: 'غير مصنفة ضمن خطة',
    schoolGroupFacultesPubliques: 'الجامعات والكليات العمومية',
    schoolGroupFacultesPubliquesHint: 'ولوج مفتوح — اضغط لعرض القائمة',
    schoolGroupFacultesPubliquesCount: '{n} مؤسسة',
    schoolGroupFacultesOpen: 'إخفاء القائمة',
    schoolGroupFacultesClosed: 'عرض كل الكليات',
    schoolNoResultQuery: 'لا نتيجة لـ « {q} » في {type}.',
    schoolNoType: 'لا مدرسة من نوع {type}.',
    schoolCampusTitle: 'مدن الفروع الجامعية',
    schoolDiplomesTitle: 'الشهادات الممنوحة',
    seeSummary: 'عرض الملخص →',
    seeSummaryRtl: '← عرض الملخص',
    modalType: 'النوع',
    modalPlanOrientation: 'خطة التوجيه',
    modalVillesCampus: 'المدن / الفروع الجامعية',
    modalFrais: 'رسوم الدراسة',
    modalDuree: 'مدة الدراسة',
    modalAdmission: 'القبول',
    modalPointsCles: 'نقاط أساسية',
    modalDiplomesDelivres: 'الشهادات الممنوحة',
    modalFilieresBac: 'شعب الباك المقبولة',
    modalSecteurs: 'القطاعات',
    chipReconnuEtat: 'معترف به من الدولة',
    chipEchangesIntl: 'تبادلات دولية',
    chipBacObligatoire: 'الباك إلزامي',
    chipFilieresTpl: '{n} شعب',
    chipEtudiantsTpl: 'حوالي {n} طالب',
    feesNotSet: 'غير مذكورة',
    feesRangeTpl: 'من {min} إلى {max} درهم سنوياً تقريباً',
    feesSingleTpl: '{v} درهم سنوياً تقريباً',
    schoolFallbackType: 'مؤسسة {type}',
    schoolFallbackGeneric: 'مؤسسة للتعليم العالي',
    schoolFallbackPresent: 'موجودة في {cities}',
    schoolFallbackAdmission: 'القبول: {admission}',
    schoolFallbackReconnu: 'شهادة معترف بها من الدولة',
    schoolFallbackEchanges: 'تبادلات دولية',
    draftSavedTitle: 'تم حفظ التقدّم',
    draftHasReport: 'لديك تقرير مُنشأ مسبقاً.',
    draftCanResume: 'يمكنك المتابعة من حيث توقّفت بالضبط.',
    draftSavedAt: 'حُفظ في {date}.',
    draftResumeReport: 'مراجعة تقريري',
    draftResumeQuiz: 'متابعة الاختبار',
    draftRestart: 'البدء من الصفر',
    protoStart: 'بدء الاختبار',
    protoDemoReport: 'عرض تقرير تجريبي',
    protoEyebrow: 'تشخيص التوجيه',
    protoTitle: 'ليس مجرد اختبار RIASEC.',
    protoLead:
      'مسار من 10 إلى 15 دقيقة يربط الاهتمامات والمواقف وأسلوب العمل والطموحات والواقع — لملف قابل للاستخدام: قطاعات → مهن → شعب → مدارس.',
    protoPill1: 'مهن حسب القطاع · مواجهات',
    protoPill2: '~12–14 دقيقة',
    protoPill3: '10 وحدات',
    protoPill4: 'مهن · مدارس · مواجهات',
    protoPill5: 'الملف الدراسي مشمول',
    protoPersonasTitle: 'جرّب بملف معبّأ مسبقاً',
    protoPersonasLead:
      'انقر ملفاً: يُعبَّأ الاستبيان. يكفي المتابعة عبر «متابعة» حتى التقرير.',
    protoHome: 'العودة للرئيسية',
    reportPassBrand: 'ORIENTATION PASS',
    reportProfilFallback: 'الملف',
    salaryNotSet: 'الأجر غير مذكور',
    demoProfileNote: 'ملف تجريبي « {title} »',
    diplomesShort: 'شهادات',
    versusEliminated: 'مُستبعد',
    personaCta: 'ابدأ → متابعة فقط',
    cityNotSet: 'مدينة غير مذكورة',
    resetConfirm: 'إعادة ضبط الاختبار؟ ستُمسح كل الإجابات والمسودة.',
  },
};

const CORRECTED_METIER_AR: Record<string, string> = {
  'مهندس الذكاء الاصطناعي / التعلم الآلي': 'مهندس الذكاء الاصطناعي والتعلم الآلي',
  'مهندس السحابة / DevOps': 'مهندس الحوسبة السحابية وDevOps',
  'مهندس الأتمتة / الروبوتات': 'مهندس الأتمتة والروبوتات',
  'مهندس مدني / أشغال عمومية': 'مهندس مدني وأشغال عمومية',
  'مهندس الجودة / الصحة والسلامة والبيئة': 'مهندس الجودة والصحة والسلامة والبيئة',
  'أكتواري / محلل مخاطر': 'خبير اكتواري ومحلل مخاطر',
  'خبير محاسب (مسار)': 'خبير محاسب',
  'رائد أعمال / مؤسس': 'رائد أعمال ومؤسس',
  'محامٍ (مسار)': 'محامٍ',
  'مهندس بيانات / تحليلات': 'مهندس بيانات وتحليلات',
  'مهندس معماري للبرمجيات': 'مهندس بنية البرمجيات',
  'محلل منتج / نمو': 'محلل المنتجات والنمو',
  'استشاري استراتيجية': 'مستشار في الاستراتيجية',
  'رئيس مشروع / PMO': 'مدير مشاريع ومكتب إدارة المشاريع',
  'استراتيجي محتوى / شبكات اجتماعية': 'استراتيجي المحتوى والشبكات الاجتماعية',
  'مدير علاقات العملاء / الاحتفاظ': 'مدير علاقات العملاء والاحتفاظ بهم',
  'مشتري إعلانات أداء': 'مسؤول شراء الإعلانات الرقمية',
  'مصمم فضاءات / داخلي': 'مصمم فضاءات داخلية',
  'صيدلي / صيدلية': 'صيدلي',
  'ممرض(ة) متخصص(ة)': 'ممرض متخصص',
  'مسؤول جودة صيدلانية': 'مسؤول الجودة في الصناعات الدوائية',
  'أستاذ / مكوّن': 'أستاذ ومكوّن',
  'مصمم تعليمي (EdTech)': 'مصمم محتوى تعليمي رقمي',
  'مدير منتج تعليمي': 'مدير منتج تعليمي رقمي',
  'مدرب / مرشد أكاديمي': 'مدرب ومرشد أكاديمي',
  'امتثال / تكنولوجيا قانونية': 'مختص في الامتثال والتقنيات القانونية',
  'موثق / مساعد موثق': 'موثق أو مساعد موثق',
  'محلل مهني': 'محلل وظيفي',
  'تجاري B2B / مدير حسابات': 'مسؤول مبيعات للشركات وإدارة الحسابات',
  'مدير مجتمع / شراكات': 'مسؤول المجتمع والشراكات',
};

/** Toujours FR + AR (si dispo) — test + rapport, indépendant de la locale UI. */
export function formatBilingualName(
  fr?: string | null,
  ar?: string | null,
): string {
  const f = (fr || '').trim();
  const rawAr = (ar || '').trim();
  const a = CORRECTED_METIER_AR[rawAr] || rawAr;
  if (f && a && f.localeCompare(a, undefined, { sensitivity: 'accent' }) !== 0) {
    return `${f} · ${a}`;
  }
  return f || a;
}

export function pickSecteurDisplayTitle(
  s: { titre?: string | null; titreAr?: string | null },
  _locale?: OrientationUiLocale,
): string {
  return formatBilingualName(s.titre, s.titreAr);
}

export function pickMetierDisplayName(
  m: { nom?: string | null; nomArabe?: string | null },
  _locale?: OrientationUiLocale,
): string {
  return formatBilingualName(m.nom, m.nomArabe);
}

export function pickSchoolDisplayName(
  e: { nom?: string | null; nomArabe?: string | null; sigle?: string | null },
): string {
  const fr = e.sigle?.trim() ? `${e.sigle.trim()} — ${(e.nom || '').trim()}` : (e.nom || '').trim();
  return formatBilingualName(fr, e.nomArabe);
}

/** Hub « Comment ça marche » — structure parallèle aux clés howStep* plates. */
export const HOW_STEPS_I18N: Record<
  OrientationUiLocale,
  ReadonlyArray<{ n: string; title: string; text: string }>
> = {
  fr: [
    {
      n: '01',
      title: UI_I18N.fr.howStep1Title,
      text: UI_I18N.fr.howStep1Text,
    },
    {
      n: '02',
      title: UI_I18N.fr.howStep2Title,
      text: UI_I18N.fr.howStep2Text,
    },
    {
      n: '03',
      title: UI_I18N.fr.howStep3Title,
      text: UI_I18N.fr.howStep3Text,
    },
    {
      n: '04',
      title: UI_I18N.fr.howStep4Title,
      text: UI_I18N.fr.howStep4Text,
    },
  ],
  ar: [
    {
      n: '01',
      title: UI_I18N.ar.howStep1Title,
      text: UI_I18N.ar.howStep1Text,
    },
    {
      n: '02',
      title: UI_I18N.ar.howStep2Title,
      text: UI_I18N.ar.howStep2Text,
    },
    {
      n: '03',
      title: UI_I18N.ar.howStep3Title,
      text: UI_I18N.ar.howStep3Text,
    },
    {
      n: '04',
      title: UI_I18N.ar.howStep4Title,
      text: UI_I18N.ar.howStep4Text,
    },
  ],
};

/* ——— Helpers ——— */

export function tOd(locale: OrientationUiLocale, key: string): string {
  return UI_I18N[locale][key] ?? UI_I18N.fr[key] ?? key;
}

/** Remplace `{key}` dans une chaîne i18n. */
export function tOdFill(
  locale: OrientationUiLocale,
  key: string,
  vars: Record<string, string | number>,
): string {
  return tOd(locale, key).replace(/\{(\w+)\}/g, (_, k: string) =>
    vars[k] != null ? String(vars[k]) : `{${k}}`,
  );
}

export function localizeModuleMeta(moduleId: ModuleId, locale: OrientationUiLocale) {
  return MODULE_META_I18N[locale][moduleId];
}

export function localizeAmbitionLabel(id: string, locale: OrientationUiLocale): string {
  return tOd(locale, `ambition_${id}`);
}

export function localizeRiasecLabel(letter: string, locale: OrientationUiLocale): string {
  return tOd(locale, `riasec${letter.toUpperCase()}`);
}

export function localizeSchoolTypeLabel(key: string, locale: OrientationUiLocale): string {
  return tOd(locale, `schoolType_${key}`);
}

function allOptionIdsAreLikert5(options: { id: string }[]): boolean {
  if (options.length !== 5) return false;
  const ids = new Set(options.map((o) => o.id));
  return ['1', '2', '3', '4', '5'].every((id) => ids.has(id));
}

function mapOptionsWithOverlay(
  step: DiagnosticStep,
  overlay: StepArOverlay | undefined,
): DiagnosticStep['options'] {
  if (!step.options?.length) return step.options;

  let optionMap = overlay?.options;
  if (!optionMap && step.id === 'sit_lycee') {
    optionMap = ROLE_OPTIONS_AR;
  }
  if (!optionMap && allOptionIdsAreLikert5(step.options)) {
    optionMap = RIASEC_LIKERT_AR;
  }
  if (!optionMap) return step.options;

  return step.options.map((opt) => ({
    ...opt,
    label: optionMap![opt.id] ?? opt.label,
  }));
}

export function localizeStep(step: DiagnosticStep, locale: OrientationUiLocale): DiagnosticStep {
  if (locale === 'fr') return step;

  // Versus Coupe du monde (titres / sous-titres dynamiques)
  if (step.kind === 'versus') {
    const round = (step.versusRound || 'R16') as 'R16' | 'QF' | 'SF' | 'FINAL';
    const roundLabel = tOd(locale, `versusRoundLabel${round}`);
    const isEcole = step.versusType === 'ecole';
    const opts = step.options ?? [];
    const a = opts[0]?.seed ?? '?';
    const b = opts[1]?.seed ?? '?';
    const matchFromId = step.id.match(/_(?:r16|qf|sf|final)_(\d+)$/i);
    const matchN = matchFromId ? Number(matchFromId[1]) + 1 : 1;
    const total =
      round === 'FINAL' ? 1 : round === 'SF' ? 2 : round === 'QF' ? 4 : 8;
    return {
      ...step,
      title: tOdFill(
        locale,
        isEcole ? 'versusTitleEcole' : 'versusTitleMetier',
        { round: roundLabel },
      ),
      subtitle:
        round === 'FINAL'
          ? tOd(locale, isEcole ? 'versusSubFinalEcole' : 'versusSubFinalMetier')
          : tOdFill(locale, 'versusSubMatch', { n: matchN, total, a, b }),
    };
  }

  // Dynamic métier pages: car_metiers__{sectorId}
  if (step.id.startsWith('car_metiers__')) {
    const sectorLabel = step.title.includes('Métiers · ')
      ? step.title.replace(/^Métiers · /, '')
      : step.title;
    return {
      ...step,
      title: `مهن · ${sectorLabel}`,
      subtitle: tOd(locale, 'metiersSectorSub'),
    };
  }

  // Dynamic school pages: sch_ecoles__{typeKey}
  if (step.id.startsWith('sch_ecoles__')) {
    const typeKey = step.schoolTypeKey ?? step.id.replace(/^sch_ecoles__/, '');
    const typeAr = localizeSchoolTypeLabel(typeKey, locale);
    const frType =
      step.title.includes('Écoles · ') ? step.title.replace(/^Écoles · /, '') : typeAr;
    const label = typeAr !== `schoolType_${typeKey}` ? typeAr : frType;
    return {
      ...step,
      title: `مدارس · ${label}`,
      subtitle: tOd(locale, 'ecolesTypeSub'),
    };
  }

  // Placeholder empty states retitled at runtime
  if (step.id === 'car_metiers' && step.title === 'Métiers par secteur') {
    return {
      ...step,
      title: tOd(locale, 'metiersSectorEmptyTitle'),
      subtitle: tOd(locale, 'metiersSectorEmptySub'),
    };
  }
  if (step.id === 'sch_ecoles' && step.title === 'Écoles par type') {
    return {
      ...step,
      title: tOd(locale, 'ecolesTypeEmptyTitle'),
      subtitle: tOd(locale, 'ecolesTypeEmptySub'),
    };
  }

  const overlay = STEP_AR[step.id];
  if (!overlay) return step;

  return {
    ...step,
    title: overlay.title ?? step.title,
    subtitle: overlay.subtitle ?? step.subtitle,
    leftLabel: overlay.leftLabel ?? step.leftLabel,
    rightLabel: overlay.rightLabel ?? step.rightLabel,
    options: mapOptionsWithOverlay(step, overlay),
  };
}
