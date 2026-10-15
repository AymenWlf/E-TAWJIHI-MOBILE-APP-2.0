import { localizeBacFiliereLabel } from '@/utils/schoolFicheLocale';

const TITLE_AR: Record<string, string> = {
  SANTE: 'الصحة',
  TECH: 'التكنولوجيا والمعلوميات والذكاء الاصطناعي',
  EDUC: 'التربية والتعليم',
  FIN: 'المالية',
  JUR: 'القانون',
  ARTS: 'الفنون والإبداع',
  COMM: 'التواصل والإعلام',
  COMMERCE: 'التجارة والمبيعات',
  MKT: 'التسويق',
  RH: 'الموارد البشرية',
  TRANS: 'النقل واللوجستيك',
  HOTEL: 'الفندقة والمطاعم',
  PUBLIC: 'الخدمات العمومية',
  ENTREP: 'ريادة الأعمال',
  RECH: 'البحث العلمي',
  ENVIRONNEMENT: 'البيئة والتنمية المستدامة',
  BATIMENT: 'البناء والهندسة المعمارية والأشغال العمومية',
  INDUSTRIE: 'الصناعة والإنتاج',
  AGRICULTURE: 'الفلاحة والصناعات الغذائية',
  CULTURE: 'الثقافة والفعاليات والفنون',
  SHS: 'العلوم الإنسانية والاجتماعية',
  DEFENSE: 'الدفاع والأمن والمهن العسكرية',
  JEUX_VIDEO: 'ألعاب الفيديو والصناعات الإبداعية الرقمية',
  SPORT: 'الرياضة ومهن الرياضة',
  TOURISME: 'السياحة',
  PECHE_MARITIME: 'الصيد البحري',
  SCIENCES_POLITIQUES: 'العلوم السياسية',
};

const TAGS: Record<string, string> = {
  patience: 'الصبر',
  rigueur: 'الصرامة',
  'sens pratique': 'الحس العملي',
  'sens-pratique': 'الحس العملي',
  creativite: 'الإبداع',
  intuition: 'الحدس',
  adaptabilite: 'القدرة على التكيّف',
  precision: 'الدقة',
  'gestion de projet': 'إدارة المشاريع',
  'gestion-de-projet': 'إدارة المشاريع',
  'gestion du stress': 'إدارة الضغط',
  gestion: 'التدبير',
  communication: 'التواصل',
  persuasion: 'الإقناع',
  resilience: 'المرونة',
  organisation: 'التنظيم',
  discipline: 'الانضباط',
  courage: 'الشجاعة',
  leadership: 'القيادة',
  empathie: 'التعاطف',
  'sensibilite environnementale': 'الحس البيئي',
  analyse: 'التحليل',
  analytique: 'التحليل',
  "travail d'equipe": 'العمل الجماعي',
  'travail-equipe': 'العمل الجماعي',
  innovation: 'الابتكار',
  endurance: 'التحمل',
  motivation: 'التحفيز',
  'gestion-stress': 'إدارة الضغط',
  'gestion stress': 'إدارة الضغط',
  discretion: 'التكتم',
  perseverance: 'المثابرة',
  pedagogie: 'البيداغوجيا',
  ecoute: 'الإنصات',
  autonomie: 'الاستقلالية',
  'service-public': 'الخدمة العمومية',
  pratique: 'عملي',
  methodique: 'منهجي',
  responsable: 'مسؤول',
  innovant: 'مبتكر',
  extraverti: 'منفتح',
  introverti: 'انطوائي',
  sociable: 'اجتماعي',
  independant: 'مستقل',
  creatif: 'مبدع',
  intuitif: 'حدسي',
  normal: 'بكالوريا عادية',
  mission: 'بكالوريا البعثة',
  international: 'بكالوريا دولية',
  'bac normal': 'بكالوريا عادية',
  'bac mission': 'بكالوريا البعثة',
  'bac marocain': 'بكالوريا مغربية',
  'bac scientifique': 'بكالوريا علمية',
  scientifique: 'بكالوريا علمية',
  'bac lettres': 'بكالوريا الآداب',
  'bac economique': 'بكالوريا اقتصادية',
  economique: 'بكالوريا اقتصادية',
  'bac technique': 'بكالوريا تقنية',
  technique: 'بكالوريا تقنية',
  'bac professionnel': 'بكالوريا مهنية',
  professionnel: 'بكالوريا مهنية',
  facile: 'سهل',
  moyen: 'متوسط',
  moyenne: 'متوسطة',
  difficile: 'صعب',
  'tres difficile': 'صعب جداً',
  variable: 'متغيّر',
  selectif: 'انتقائي',
  accessible: 'في المتناول',
  exigeant: 'صعب الولوج',
  'secteur essentiel': 'قطاع أساسي',
  'diversite des metiers': 'تنوّع المهن',
  diversite: 'التنوّع',
  'contact avec la nature': 'التواصل مع الطبيعة',
  'innovation constante': 'ابتكار مستمر',
  'travail saisonnier parfois': 'عمل موسمي أحياناً',
  'dependance aux conditions climatiques': 'تبعية للظروف المناخية',
  "sens du service et de l'aide aux autres": 'حس الخدمة ومساعدة الآخرين',
  "stabilite de l'emploi": 'استقرار الوظيفة',
  'evolution de carriere possible': 'إمكانية التطوّر المهني',
  'reconnaissance sociale': 'الاعتراف الاجتماعي',
  'salaires attractifs': 'أجور جذابة',
  'teletravail possible': 'إمكانية العمل عن بُعد',
  'evolution rapide': 'تطوّر سريع',
  'opportunites internationales': 'فرص دولية',
  'ambiance conviviale': 'أجواء ودّية',
  'commissions possibles': 'عمولات ممكنة',
  'conges genereux': 'عطل سخية',
  'contact avec les jeunes': 'التواصل مع الشباب',
  'contact client': 'التواصل مع الزبناء',
  'contact humain': 'تواصل إنساني',
  decouvertes: 'اكتشافات',
  'expression personnelle': 'التعبير الشخصي',
  'impact sur les personnes': 'أثر على الأشخاص',
  independance: 'الاستقلالية',
  'independance possible': 'استقلالية ممكنة',
  'liberte creative': 'حرّية إبداعية',
  'liberte de recherche': 'حرّية البحث',
  liberte: 'الحرّية',
  mobilite: 'الحركية',
  'opportunites variees': 'فرص متنوّعة',
  passion: 'الشغف',
  'potentiel eleve': 'إمكانات عالية',
  prestige: 'الهيبة',
  'projets varies': 'مشاريع متنوّعة',
  retraite: 'التقاعد',
  'realisation personnelle': 'تحقيق الذات',
  reseaux: 'شبكات',
  'salaires eleves': 'أجور مرتفعة',
  'secteur en croissance': 'قطاع في نمو',
  'sens de la mission': 'حس الرسالة',
  stabilite: 'الاستقرار',
  statut: 'الوضعية',
  securite: 'الأمان',
  'tips possibles': 'إكراميات ممكنة',
  'vacances scolaires': 'عطل مدرسية',
  visibilite: 'البروز',
  'voyages possibles': 'سفر ممكن',
  evolution: 'التطوّر',
  'evolution de carriere': 'تطوّر مهني',
  'evolution possible': 'تطوّر ممكن',
  'horaires parfois contraignants': 'أوقات عمل مقيِّدة أحياناً',
  'stress et responsabilites importantes': 'ضغط ومسؤوليات كبيرة',
  'formation longue et exigeante': 'تكوين طويل ومتطلّب',
  'contact avec la souffrance': 'الاحتكاك بالمعاناة',
  'formation continue necessaire': 'ضرورة التكوين المستمر',
  'concurrence importante': 'منافسة قوية',
  'technologies qui evoluent rapidement': 'تقنيات تتطوّر بسرعة',
  'pression des deadlines': 'ضغط الآجال',
  bureaucratie: 'البيروقراطية',
  'charge administrative': 'عبء إداري',
  'charge de travail importante': 'عبء عمل كبير',
  'charge physique': 'مجهود بدني',
  concurrence: 'المنافسة',
  'concurrence forte': 'منافسة شديدة',
  'conditions parfois difficiles': 'ظروف صعبة أحياناً',
  'conflits possibles': 'نزاعات محتملة',
  'deadlines serres': 'آجال ضيّقة',
  'financement incertain': 'تمويل غير مضمون',
  'formation continue': 'تكوين مستمر',
  'formation longue': 'تكوين طويل',
  'gestion de classe difficile': 'صعوبة تدبير القسم',
  'horaires charges': 'أوقات مكتظّة',
  'horaires decales': 'أوقات غير منتظمة',
  'horaires variables': 'أوقات متغيّرة',
  'pression client': 'ضغط الزبناء',
  'pression de publication': 'ضغط النشر',
  'pression des delais': 'ضغط الآجال',
  'pression des objectifs': 'ضغط الأهداف',
  'pression des resultats': 'ضغط النتائج',
  'pression importante': 'ضغط كبير',
  'pression manageriale': 'ضغط إداري',
  'pression mediatique': 'ضغط إعلامي',
  precarite: 'الهشاشة',
  'precarite possible': 'هشاشة محتملة',
  responsabilites: 'المسؤوليات',
  'responsabilites financieres': 'مسؤوليات مالية',
  'revenus incertains': 'دخل غير مضمون',
  'revenus irreguliers': 'دخل غير منتظم',
  'revenus parfois modestes': 'دخل متواضع أحياناً',
  rigidite: 'الجمود',
  risques: 'المخاطر',
  'salaires parfois modestes': 'أجور متواضعة أحياناً',
  stress: 'الضغط',
  'stress des dossiers': 'ضغط الملفات',
  'travail les weekends': 'عمل في عطل نهاية الأسبوع',
  'evolution lente': 'تطوّر بطيء',
};

function tagKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[_]+/g, ' ')
    .replace(/['’]/g, "'")
    .replace(/\s+/g, ' ');
}

export function secteurTitleArByCode(code?: string | null): string | null {
  const key = (code || '').trim().toUpperCase();
  return key && TITLE_AR[key] ? TITLE_AR[key] : null;
}

export function resolveSecteurDescription(
  secteur: { code?: string | null; description?: string | null; descriptionAr?: string | null },
  locale: 'fr' | 'ar',
): string {
  const french = (secteur.description || '').trim();
  const arabic = (secteur.descriptionAr || '').trim();
  return locale === 'ar' ? arabic || french : french;
}

export function translateSecteurTag(value: string, locale: 'fr' | 'ar'): string {
  const raw = value.trim();
  if (locale !== 'ar' || !raw) return raw;
  const key = tagKey(raw);
  const tagged = TAGS[key] || TAGS[key.replace(/ /g, '-')];
  if (tagged) return tagged;
  return localizeBacFiliereLabel(raw, 'ar');
}

export function translateSecteurTags(values: string[], locale: 'fr' | 'ar'): string[] {
  return values.map((value) => translateSecteurTag(value, locale));
}

export function localizeSecteurSalary(raw: string | null | undefined, locale: 'fr' | 'ar'): string | null {
  const trimmed = (raw || '').trim();
  if (!trimmed) return null;
  if (locale !== 'ar') return trimmed;
  if (/^variable$/i.test(trimmed)) return 'متغيّر';
  const money = (value: string) => value.replace(/\bMAD\b/gi, 'درهم').replace(/\bDhs\b/gi, 'درهم');
  const from = trimmed.match(/^À partir de\s+(.+)$/i);
  if (from) return `ابتداءً من ${money(from[1])}`;
  const up = trimmed.match(/^Jusqu['’]à\s+(.+)$/i);
  if (up) return `حتى ${money(up[1])}`;
  return money(trimmed);
}

export function pickLocalizedJobName(
  nom: string,
  nomArabe: string | null | undefined,
  locale: 'fr' | 'ar',
  arabicByFrench?: Map<string, string>,
): string {
  if (locale !== 'ar') return nom;
  const arabic = (nomArabe || '').trim();
  if (arabic) return arabic;
  const mapped = arabicByFrench?.get(tagKey(nom));
  if (mapped) return mapped;
  return translateSecteurTag(nom, 'ar');
}
