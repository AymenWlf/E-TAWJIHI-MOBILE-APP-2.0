export type SchoolFicheLocale = 'fr' | 'ar';

function fold(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const DIPLOME_AR: Record<string, string> = {
  licence: 'الإجازة',
  'licence professionnelle': 'الإجازة المهنية',
  'licence pro': 'الإجازة المهنية',
  master: 'الماستر',
  'master specialise': 'الماستر المتخصص',
  doctorat: 'الدكتوراه',
  phd: 'الدكتوراه',
  bachelor: 'بكالوريوس',
  'diplome d ingenieur': 'دبلوم مهندس',
  ingenieur: 'دبلوم مهندس',
  dut: 'الدبلوم الجامعي للتكنولوجيا',
  deug: 'دبلوم الدراسات الجامعية العامة',
  bts: 'شهادة التقني العالي',
  'cycle preparatoire': 'سلك تحضيري',
  'classes preparatoires': 'أقسام تحضيرية',
  cpge: 'أقسام تحضيرية',
};

const FILIERE_AR: Record<string, string> = {
  'sciences math a': 'علوم رياضية أ',
  'sciences math b': 'علوم رياضية ب',
  'sciences maths a': 'علوم رياضية أ',
  'sciences maths b': 'علوم رياضية ب',
  'sciences mathematiques a': 'علوم رياضية أ',
  'sciences mathematiques b': 'علوم رياضية ب',
  'sciences physique': 'علوم فيزيائية',
  'sciences physiques': 'علوم فيزيائية',
  svt: 'علوم الحياة والأرض',
  'sciences de la vie et de la terre': 'علوم الحياة والأرض',
  'sciences et technologies electriques': 'علوم وتكنولوجيات كهربائية',
  'sciences et technologies mecaniques': 'علوم وتكنولوجيات ميكانيكية',
  'sciences economique': 'علوم اقتصادية',
  'sciences economiques': 'علوم اقتصادية',
  'sciences gestion comptable': 'علوم التدبير المحاسباتي',
  'sciences agronomiques': 'علوم زراعية',
  lettres: 'آداب',
  'sciences humaines': 'علوم إنسانية',
  'sciences de la chariaa': 'علوم الشريعة',
  'arts appliques': 'فنون تطبيقية',
  autre: 'أخرى',
  mathematiques: 'الرياضيات',
  'physique-chimie': 'الفيزياء والكيمياء',
  'physique chimie': 'الفيزياء والكيمياء',
  'sciences economiques et sociales': 'العلوم الاقتصادية والاجتماعية',
  'histoire-geographie': 'التاريخ والجغرافيا',
  'histoire geographie': 'التاريخ والجغرافيا',
  philosophie: 'الفلسفة',
  'langues vivantes': 'اللغات الحية',
  'numerique et sciences informatiques': 'الرقميات وعلوم الإعلام',
  'sciences de l ingenieur': 'علوم المهندس',
};

const TYPE_FR: Record<string, string> = {
  public: 'Public',
  semi_public: 'Semi-Public',
  prive: 'Privé',
  militaire: 'Militaire',
};

const TYPE_AR: Record<string, string> = {
  public: 'عمومي',
  semi_public: 'شبه عمومي',
  prive: 'خصوصي',
  militaire: 'عسكري',
};

function typeKey(type: string): string {
  const n = fold(type);
  if (n.includes('semi')) return 'semi_public';
  if (n === 'public') return 'public';
  if (n === 'prive') return 'prive';
  if (n === 'militaire') return 'militaire';
  return '';
}

export function localizeEstablishmentType(
  type: string | null | undefined,
  locale: SchoolFicheLocale,
): string {
  const raw = (type || '').trim();
  if (!raw) return '—';
  const key = typeKey(raw);
  if (!key) return raw;
  return locale === 'ar' ? TYPE_AR[key] : TYPE_FR[key];
}

export function localizeDiplomeLabel(value: string, locale: SchoolFicheLocale): string {
  const raw = value.trim();
  if (locale !== 'ar' || !raw) return raw;
  const key = fold(raw);
  if (DIPLOME_AR[key]) return DIPLOME_AR[key];
  if (key.startsWith('licence')) return 'الإجازة';
  if (key.startsWith('master')) return 'الماستر';
  if (key.includes('doctorat') || key === 'phd') return 'الدكتوراه';
  if (key.includes('ingenieur')) return 'دبلوم مهندس';
  if (key.includes('preparatoire')) return 'سلك تحضيري';
  return raw;
}

export function localizeBacFiliereLabel(value: string, locale: SchoolFicheLocale): string {
  const raw = value.trim();
  if (locale !== 'ar' || !raw) return raw;
  return FILIERE_AR[fold(raw)] || raw;
}
