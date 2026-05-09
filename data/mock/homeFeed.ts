/** Données factices — à remplacer par l’API. */

import type { HeroEducationSlide } from '@/components/home/HeroEducationCarousel';
import type { HomeStackCard } from '@/components/home/HomeStackedPackCards';
import type { AppLocale } from '@/constants/i18n';
import { isStoryImageUri, resolvePublicMediaUrl } from '@/constants/storyMedia';

export const mockUser = {
  firstName: 'Aymen',
  subtitle: 'Pack Standard · Sciences Math A',
};

export const mockUnreadNotifications = 4;

/** Slide story (image plein écran dans le lecteur). */
export type StorySlide = {
  id: string;
  uri: string;
  durationMs?: number;
  caption?: string;
};

/** Chaîne type Instagram (plusieurs slides). */
export type StoryChannel = {
  id: string;
  label: string;
  slides: StorySlide[];
  /** Vignette rond ; sinon première slide. */
  coverUri?: string;
};

/** Vignettes & slides stories — CDN e-tawjihi (`1.png` … `5.png`). */
const CDN_STORY_IMG = (n: 1 | 2 | 3 | 4 | 5) => `https://cdn.e-tawjihi.ma/${n}.png`;

const RAW_STORY_CHANNELS: {
  id: string;
  label: string;
  coverPath?: string;
  slidePaths: string[];
  captions?: string[];
}[] = [
  {
    id: 'story-cdn-1',
    label: 'E‑Tawjihi',
    coverPath: CDN_STORY_IMG(1),
    slidePaths: [CDN_STORY_IMG(1)],
    captions: ['E‑Tawjihi'],
  },
  {
    id: 'story-cdn-2',
    label: 'Étapes',
    coverPath: CDN_STORY_IMG(2),
    slidePaths: [CDN_STORY_IMG(2)],
    captions: ['Votre parcours'],
  },
  {
    id: 'story-cdn-3',
    label: 'Concours',
    coverPath: CDN_STORY_IMG(3),
    slidePaths: [CDN_STORY_IMG(3)],
    captions: ['Concours & dates'],
  },
  {
    id: 'story-cdn-4',
    label: 'Écoles',
    coverPath: CDN_STORY_IMG(4),
    slidePaths: [CDN_STORY_IMG(4)],
    captions: ['Écoles supérieures'],
  },
  {
    id: 'story-cdn-5',
    label: 'Actus',
    coverPath: CDN_STORY_IMG(5),
    slidePaths: [CDN_STORY_IMG(5)],
    captions: ['Actualités'],
  },
];

export const mockStoryChannels: StoryChannel[] = RAW_STORY_CHANNELS.map((ch) => {
  const slides: StorySlide[] = ch.slidePaths
    .map((path, i) => ({
      id: `${ch.id}-s${i}`,
      uri: resolvePublicMediaUrl(path),
      durationMs: 5000,
      caption: ch.captions?.[i],
    }))
    .filter((s) => isStoryImageUri(s.uri));
  const rawCover = ch.coverPath ? resolvePublicMediaUrl(ch.coverPath) : slides[0]?.uri;
  const coverUri = rawCover && isStoryImageUri(rawCover) ? rawCover : slides[0]?.uri;
  return {
    id: ch.id,
    label: ch.label,
    coverUri,
    slides,
  };
}).filter((ch) => ch.slides.length > 0);

/** Cartes empilées accueil (swipe) — 1re carte : parcours orientation */
export const mockHomeStackCards: HomeStackCard[] = [
  {
    id: 'stack-1',
    eyebrow: 'Votre inscription',
    packName: "Votre parcours d'orientation",
    dailyActions: { playedToday: false, infoReadToday: false },
    orientationProgress: {
      percent: 62,
      label: "Progression d'orientation",
    },
    remainingOrientationTasks: [
      { id: 'o1', title: 'Compléter le questionnaire filière / ville', icon: 'clipboard' },
      { id: 'o2', title: 'Ajouter au moins 3 écoles à votre sélection', icon: 'university' },
      { id: 'o3', title: 'Téléverser les pièces du dossier type (PDF)', icon: 'file-text-o' },
      { id: 'o4', title: 'Valider votre calendrier de concours (dates limites)', icon: 'calendar' },
      { id: 'o5', title: 'Réserver un créneau avec un conseiller orientation', icon: 'phone' },
    ],
  },
  {
    id: 'stack-2',
    practicalLinkId: 'ecoles',
  },
  {
    id: 'stack-3',
    practicalLinkId: 'inscriptions',
  },
];

export const mockHeroEducationSlides = [
  {
    id: 'h1',
    title: 'Écoles supérieures au Maroc',
    subtitle: 'Explorez les établissements, filières, concours et dates clés d’admission.',
    tone: 'blue' as const,
  },
  {
    id: 'h2',
    title: 'Packs d’inscription',
    subtitle: 'Simple, Standard ou Premium : dossiers, rappels et accompagnement au choix.',
    tone: 'green' as const,
  },
  {
    id: 'h3',
    title: 'Ne manquez aucune ouverture',
    subtitle: 'Alertes inscriptions et veille sur les écoles que vous suivez.',
    tone: 'blue' as const,
  },
];

/** Packs type CDC — contenus orientation / écoles, pas télécom */
export const mockPackOffers = [
  {
    id: 'p1',
    primaryStat: '8',
    primaryTag: 'écoles incluses',
    feature: 'Fiches + calendrier concours',
    name: 'Pack Simple',
    price: '199 DH',
    period: '/ an',
  },
  {
    id: 'p2',
    primaryStat: '20',
    primaryTag: 'écoles & filières',
    feature: 'Inscriptions assistées + vidéos',
    name: 'Pack Standard',
    price: '349 DH',
    period: '/ an',
  },
  {
    id: 'p3',
    primaryStat: '40+',
    primaryTag: 'écoles & concours',
    feature: 'Lives + priorité dossiers',
    name: 'Pack Premium',
    price: '499 DH',
    period: '/ an',
  },
];

export const mockNews = [
  {
    id: 'n1',
    title: 'Inscription EMI prolongée',
    date: 'Aujourd’hui',
    tag: 'Inscription',
  },
  {
    id: 'n2',
    title: 'Nouveau guide : stratégie grandes écoles',
    date: 'Hier',
    tag: 'Guide',
  },
  {
    id: 'n3',
    title: 'Rappel : concours ISCAE',
    date: '3 j',
    tag: 'Concours',
  },
];

const mockHeroEducationSlidesAr: HeroEducationSlide[] = [
  {
    id: 'h1',
    title: 'المدارس العليا في المغرب',
    subtitle: 'استكشف المؤسسات والمسارات والمسابقات وتواريخ التسجيل المهمة.',
    tone: 'blue',
  },
  {
    id: 'h2',
    title: 'باقات التسجيل',
    subtitle: 'بسيط، قياسي أو متميز : ملفات وتذكيرات ومرافقة حسب اختيارك.',
    tone: 'green',
  },
  {
    id: 'h3',
    title: 'لا تفوّت أي موعد',
    subtitle: 'تنبيهات التسجيل ومتابعة المدارس التي تهتم بها.',
    tone: 'blue',
  },
];

const mockPackOffersAr = [
  {
    id: 'p1',
    primaryStat: '8',
    primaryTag: 'مدارس مشمولة',
    feature: 'بطاقات + تقويم المسابقات',
    name: 'الباقة البسيطة',
    price: '199 DH',
    period: '/ سنة',
  },
  {
    id: 'p2',
    primaryStat: '20',
    primaryTag: 'مدارس ومسارات',
    feature: 'تسجيلات بمساعدة + فيديوهات',
    name: 'الباقة القياسية',
    price: '349 DH',
    period: '/ سنة',
  },
  {
    id: 'p3',
    primaryStat: '40+',
    primaryTag: 'مدارس ومسابقات',
    feature: 'بث مباشر + أولوية للملفات',
    name: 'الباقة المتميزة',
    price: '499 DH',
    period: '/ سنة',
  },
];

const mockNewsAr = [
  { id: 'n1', title: 'تمديد تسجيل EMI', date: 'اليوم', tag: 'تسجيل' },
  { id: 'n2', title: 'دليل جديد : استراتيجية المدارس الكبرى', date: 'أمس', tag: 'دليل' },
  { id: 'n3', title: 'تذكير : مسابقة ISCAE', date: '3 أيام', tag: 'مسابقة' },
];

const mockHomeStackCardsAr: HomeStackCard[] = [
  {
    id: 'stack-1',
    eyebrow: 'تسجيلك',
    packName: 'مسار التوجيه الخاص بك',
    dailyActions: { playedToday: false, infoReadToday: false },
    orientationProgress: {
      percent: 62,
      label: 'تقدّم التوجيه',
    },
    remainingOrientationTasks: [
      { id: 'o1', title: 'إكمال استبيان المسار / المدينة', icon: 'clipboard' },
      { id: 'o2', title: 'إضافة 3 مدارس على الأقل إلى اختيارك', icon: 'university' },
      { id: 'o3', title: 'رفع وثائق الملف النموذجي (PDF)', icon: 'file-text-o' },
      { id: 'o4', title: 'تأكيد تقويم المسابقات (الآجال)', icon: 'calendar' },
      { id: 'o5', title: 'حجز موعد مع مستشار التوجيه', icon: 'phone' },
    ],
  },
  {
    id: 'stack-2',
    practicalLinkId: 'ecoles',
  },
  {
    id: 'stack-3',
    practicalLinkId: 'inscriptions',
  },
];

const STORY_LABEL_AR: Record<string, string> = {
  'story-cdn-1': 'إي-توجيهي',
  'story-cdn-2': 'المراحل',
  'story-cdn-3': 'المسابقات',
  'story-cdn-4': 'المدارس',
  'story-cdn-5': 'الأخبار',
};

export function heroSlidesForLocale(locale: AppLocale): HeroEducationSlide[] {
  return locale === 'ar' ? mockHeroEducationSlidesAr : mockHeroEducationSlides;
}

export function packOffersForLocale(locale: AppLocale) {
  return locale === 'ar' ? mockPackOffersAr : mockPackOffers;
}

export function newsForLocale(locale: AppLocale) {
  return locale === 'ar' ? mockNewsAr : mockNews;
}

export function homeStackCardsForLocale(locale: AppLocale): HomeStackCard[] {
  return locale === 'ar' ? mockHomeStackCardsAr : mockHomeStackCards;
}

export function storyChannelsForLocale(locale: AppLocale): StoryChannel[] {
  if (locale !== 'ar') return mockStoryChannels;
  return mockStoryChannels.map((ch) => ({
    ...ch,
    label: STORY_LABEL_AR[ch.id] ?? ch.label,
  }));
}
