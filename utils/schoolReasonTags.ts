export type SchoolReasonTag = {
  key: string;
  label: string;
  background: string;
  color: string;
};

const TAGS: Array<{
  key: string;
  needles: string[];
  fr: string;
  ar: string;
  background: string;
  color: string;
}> = [
  {
    key: 'secteur',
    needles: ["Secteur d'activité aligné avec vos centres d'intérêt.", 'قطاع النشاط متوافق مع ميولك.'],
    fr: "Secteur d'activité aligné avec vos centres d'intérêt.",
    ar: 'قطاع النشاط متوافق مع ميولك.',
    background: '#DBEAFE',
    color: '#1D4ED8',
  },
  {
    key: 'ville',
    needles: ['Ville compatible avec votre projet de mobilité.', 'المدينة متوافقة مع مشروع تنقلك.'],
    fr: 'Ville compatible avec votre projet de mobilité.',
    ar: 'المدينة متوافقة مع مشروع تنقلك.',
    background: '#CCFBF1',
    color: '#0F766E',
  },
  {
    key: 'type',
    needles: ["Type d'établissement correspondant à vos préférences.", 'نوع المؤسسة يوافق تفضيلاتك.'],
    fr: "Type d'établissement correspondant à vos préférences.",
    ar: 'نوع المؤسسة يوافق تفضيلاتك.',
    background: '#EDE9FE',
    color: '#6D28D9',
  },
  {
    key: 'bac',
    needles: ["Cohérence bac / filière ou spécialités avec l'établissement.", 'توافق الباك / الشعبة أو التخصصات مع المؤسسة.'],
    fr: "Cohérence bac / filière ou spécialités avec l'établissement.",
    ar: 'توافق الباك / الشعبة أو التخصصات مع المؤسسة.',
    background: '#FEF3C7',
    color: '#B45309',
  },
  {
    key: 'budget',
    needles: ['Fourchette de frais compatible avec votre budget indicatif.', 'نطاق الرسوم متوافق مع ميزانيتك التقريبية.'],
    fr: 'Fourchette de frais compatible avec votre budget indicatif.',
    ar: 'نطاق الرسوم متوافق مع ميزانيتك التقريبية.',
    background: '#D1FAE5',
    color: '#047857',
  },
];

function norm(value: string): string {
  return value.replace(/[\u2019\u2018]/g, "'").replace(/\s+/g, ' ').trim();
}

export function schoolReasonTags(reasons: string[], locale: 'fr' | 'ar'): SchoolReasonTag[] {
  const folded = reasons.map(norm);
  return TAGS.filter((tag) => folded.some((reason) => tag.needles.some((needle) => reason === norm(needle)))).map(
    (tag) => ({
      key: tag.key,
      label: locale === 'ar' ? tag.ar : tag.fr,
      background: tag.background,
      color: tag.color,
    }),
  );
}

export function isSchoolReasonTag(reason: string): boolean {
  const folded = norm(reason);
  return TAGS.some((tag) => tag.needles.some((needle) => folded === norm(needle)));
}
