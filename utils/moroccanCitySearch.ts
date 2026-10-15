/** Nom français plié : accents et ponctuation retirés. */
export function foldCityKey(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’'`]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Comparaison de recherche : français sans accents, arabe sans diacritiques. */
export function foldCityQuery(value: string): string {
  return value
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[\u064B-\u0652\u0670]/g, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’'`]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

const ARABIC_BY_KEY: Record<string, string> = {
  agadir: 'أكادير اكادير',
  'al hoceima': 'الحسيمة',
  azemmour: 'أزمور ازمور',
  azilal: 'أزيلال ازيلال',
  azrou: 'أزرو ازرو',
  'ben guerir': 'ابن جرير بن جرير',
  'beni mellal': 'بني ملال',
  benslimane: 'بنسليمان',
  berkane: 'بركان',
  berrechid: 'برشيد',
  boujdour: 'بوجدور',
  bouznika: 'بوزنيقة',
  casablanca: 'الدار البيضاء كازا',
  chefchaouen: 'شفشاون',
  dakhla: 'الداخلة',
  demnate: 'دمنات',
  'el hajeb': 'الحاجب',
  'el jadida': 'الجديدة',
  'el kelaa des sraghna': 'قلعة السراغنة',
  errachidia: 'الراشيدية',
  essaouira: 'الصويرة',
  fes: 'فاس',
  fnideq: 'الفنيدق',
  'fqih ben salah': 'الفقيه بن صالح',
  'fquih ben salah': 'الفقيه بن صالح',
  guelmim: 'كلميم',
  guercif: 'جرسيف',
  ifrane: 'إفران افران',
  inezgane: 'إنزكان انزكان',
  'ksar el kebir': 'القصر الكبير',
  kenitra: 'القنيطرة',
  khemisset: 'الخميسات',
  khenifra: 'خنيفرة',
  khouribga: 'خريبكة',
  laayoune: 'العيون',
  larache: 'العرائش',
  marrakech: 'مراكش',
  martil: 'مرتيل',
  meknes: 'مكناس',
  midelt: 'ميدلت',
  mohammadia: 'المحمدية',
  mohammedia: 'المحمدية',
  nador: 'الناظور',
  ouarzazate: 'ورزازات',
  oujda: 'وجدة',
  rabat: 'الرباط',
  safi: 'آسفي اسفي',
  saidia: 'السعيدية',
  sale: 'سلا',
  'sale commune bouknadel': 'سلا بوقنادل',
  sefrou: 'صفرو',
  settat: 'سطات',
  'sidi bennour': 'سيدي بنور',
  'sidi ifni': 'سيدي إفني سيدي افني',
  'sidi kacem': 'سيدي قاسم',
  'sidi slimane': 'سيدي سليمان',
  skhirate: 'الصخيرات',
  'tan tan': 'طانطان',
  tanger: 'طنجة',
  taounate: 'تاونات',
  taourirt: 'تاوريرت',
  tarfaya: 'طرفاية',
  taroudant: 'تارودانت',
  tata: 'طاطا',
  taza: 'تازة',
  temara: 'تمارة',
  tetouan: 'تطوان',
  tiflet: 'تيفلت',
  tiznit: 'تزنيت',
  youssoufia: 'اليوسفية',
  zagora: 'زاكورة',
  'ait melloul': 'أيت ملول ايت ملول',
  bouskoura: 'بوسكورة',
  mediouna: 'مديونة',
  nouaceur: 'النواصر',
  harhoura: 'هرهورة',
  'm diq': 'المضيق',
  mdiq: 'المضيق',
};

/** Texte arabe utilisé seulement pour la recherche. L’affichage reste le nom français. */
export function arabicCitySearchText(frenchTitle: string): string {
  return ARABIC_BY_KEY[foldCityKey(frenchTitle)] ?? '';
}
