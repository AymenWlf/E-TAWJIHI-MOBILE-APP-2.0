export type SchoolReasonTag = {
  key: string;
  label: string;
  background: string;
  color: string;
};

const POSITIVE = { background: '#D1FAE5', color: '#047857' };
const NEGATIVE = { background: '#FEE2E2', color: '#B91C1C' };

const TAGS: Array<{
  key: string;
  tone: 'positive' | 'negative';
  needles: string[];
  fr: string;
  ar: string;
}> = [
  {
    key: 'secteur',
    tone: 'positive',
    needles: ["Secteur d'activité aligné avec vos centres d'intérêt.", 'قطاع النشاط متوافق مع ميولك.'],
    fr: "Secteur d'activité aligné avec vos centres d'intérêt.",
    ar: 'قطاع النشاط متوافق مع ميولك.',
  },
  {
    key: 'secteur-no',
    tone: 'negative',
    needles: ['Recoupement avec un secteur que vous souhaitez éviter.', 'تداخل مع قطاع تريد تجنبه.'],
    fr: 'Recoupement avec un secteur que vous souhaitez éviter.',
    ar: 'تداخل مع قطاع تريد تجنبه.',
  },
  {
    key: 'ville',
    tone: 'positive',
    needles: ['Ville compatible avec votre projet de mobilité.', 'المدينة متوافقة مع مشروع تنقلك.'],
    fr: 'Ville compatible avec votre projet de mobilité.',
    ar: 'المدينة متوافقة مع مشروع تنقلك.',
  },
  {
    key: 'ville-no',
    tone: 'negative',
    needles: ["Localisation peu alignée avec vos villes d'études ciblées.", 'الموقع قليل التوافق مع مدن الدراسة التي اخترتها.'],
    fr: "Localisation peu alignée avec vos villes d'études ciblées.",
    ar: 'الموقع قليل التوافق مع مدن الدراسة التي اخترتها.',
  },
  {
    key: 'type',
    tone: 'positive',
    needles: ["Type d'établissement correspondant à vos préférences.", 'نوع المؤسسة يوافق تفضيلاتك.'],
    fr: "Type d'établissement correspondant à vos préférences.",
    ar: 'نوع المؤسسة يوافق تفضيلاتك.',
  },
  {
    key: 'type-no',
    tone: 'negative',
    needles: ["Type d'établissement éloigné de vos préférences (public / privé / autre).", 'نوع المؤسسة بعيد عن تفضيلاتك (عمومي / خاص / آخر).'],
    fr: "Type d'établissement éloigné de vos préférences (public / privé / autre).",
    ar: 'نوع المؤسسة بعيد عن تفضيلاتك (عمومي / خاص / آخر).',
  },
  {
    key: 'bac',
    tone: 'positive',
    needles: ["Cohérence bac / filière ou spécialités avec l'établissement.", 'توافق الباك / الشعبة أو التخصصات مع المؤسسة.'],
    fr: "Cohérence bac / filière ou spécialités avec l'établissement.",
    ar: 'توافق الباك / الشعبة أو التخصصات مع المؤسسة.',
  },
  {
    key: 'bac-no',
    tone: 'negative',
    needles: ['Filière ou spécialités bac potentiellement moins alignées.', 'الشعبة أو تخصصات الباك قد تكون أقل توافقاً.'],
    fr: 'Filière ou spécialités bac potentiellement moins alignées.',
    ar: 'الشعبة أو تخصصات الباك قد تكون أقل توافقاً.',
  },
  {
    key: 'budget',
    tone: 'positive',
    needles: ['Fourchette de frais compatible avec votre budget indicatif.', 'نطاق الرسوم متوافق مع ميزانيتك التقريبية.'],
    fr: 'Fourchette de frais compatible avec votre budget indicatif.',
    ar: 'نطاق الرسوم متوافق مع ميزانيتك التقريبية.',
  },
  {
    key: 'budget-no',
    tone: 'negative',
    needles: ['Frais de scolarité potentiellement élevés par rapport à votre budget.', 'رسوم الدراسة قد تكون مرتفعة مقارنة بميزانيتك.'],
    fr: 'Frais de scolarité potentiellement élevés par rapport à votre budget.',
    ar: 'رسوم الدراسة قد تكون مرتفعة مقارنة بميزانيتك.',
  },
];

function norm(value: string): string {
  return value.replace(/[\u2019\u2018]/g, "'").replace(/\s+/g, ' ').trim();
}

function toTag(tag: (typeof TAGS)[number], locale: 'fr' | 'ar'): SchoolReasonTag {
  const palette = tag.tone === 'negative' ? NEGATIVE : POSITIVE;
  return {
    key: tag.key,
    label: locale === 'ar' ? tag.ar : tag.fr,
    background: palette.background,
    color: palette.color,
  };
}

export function schoolReasonTags(
  reasons: string[],
  locale: 'fr' | 'ar',
  tone: 'positive' | 'negative' = 'positive',
): SchoolReasonTag[] {
  const folded = reasons.map(norm);
  return TAGS.filter(
    (tag) => tag.tone === tone && folded.some((reason) => tag.needles.some((needle) => reason === norm(needle))),
  ).map((tag) => toTag(tag, locale));
}

export function collectSchoolReasonTags(
  yes: string[] | undefined,
  no: string[] | undefined,
  locale: 'fr' | 'ar',
): SchoolReasonTag[] {
  return [...schoolReasonTags(yes ?? [], locale, 'positive'), ...schoolReasonTags(no ?? [], locale, 'negative')];
}

export function isSchoolReasonTag(reason: string): boolean {
  const folded = norm(reason);
  return TAGS.some((tag) => tag.needles.some((needle) => folded === norm(needle)));
}
