/**
 * Fiches explicatives secteur / métier pour le diagnostic orientation.
 * Complète les données API avec des infos marché (par famille de secteur).
 */

import { formatPricingText, formatSalaryRange } from '../utils/formatAmount';
import { formatBilingualName } from './orientationDiagnosticI18n';
import { matchModernFamily } from './orientationDiagnosticModernMetiers';

export type SecteurDetailView = {
  titre: string;
  description: string;
  tendance: string;
  salaireLabel: string;
  softSkills: string[];
  avantages: string[];
  pointsAttention: string[];
  bacs: string[];
  exemplesMetiers: string[];
  nbMetiers?: number;
  nbEcoles?: number;
  source: 'api' | 'marche' | 'mixte';
};

export type MetierDetailView = {
  nom: string;
  secteurLabel?: string;
  description: string;
  missions: string[];
  competences: string[];
  formations: string[];
  debouches: string[];
  tendance: string;
  salaireLabel: string;
  niveauAccessibilite: string;
  source: 'api' | 'marche' | 'mixte';
};

type FamilyInsight = {
  description: string;
  tendance: string;
  softSkills: string[];
  avantages: string[];
  pointsAttention: string[];
  bacs: string[];
  missionsType: string[];
  competencesType: string[];
  formationsType: string[];
  debouchesType: string[];
};

const FAMILY_INSIGHTS: Record<string, FamilyInsight> = {
  tech: {
    description:
      'Le numérique porte la transformation des entreprises au Maroc et à l’international : produits digitaux, data, cloud, cybersécurité et IA.',
    tendance:
      'Forte demande 2025–26 sur l’IA appliquée, le cloud, la cybersécurité et les profils full-stack / product.',
    softSkills: ['Résolution de problèmes', 'Curiosité technique', 'Travail en équipe agile', 'Communication claire'],
    avantages: ['Salaires attractifs', 'Évolution rapide', 'Opportunités remote / international'],
    pointsAttention: ['Veille permanente', 'Concurrence forte', 'Rythme parfois intense'],
    bacs: ['Sciences Math', 'Sciences Physique', 'SVT', 'Bac Mission scientifique'],
    missionsType: [
      'Concevoir et livrer des solutions numériques',
      'Collaborer avec produit, data et métiers',
      'Améliorer performance, qualité et sécurité',
    ],
    competencesType: ['Algorithmique', 'Cloud / DevOps', 'Analyse de données', 'Anglais technique'],
    formationsType: ['École d’ingénieurs', 'Licence/Master informatique', 'Bootcamps + projets portfolio'],
    debouchesType: ['SSII / ESN', 'Startups & scale-ups', 'Banques & telecom', 'Produit digital'],
  },
  inge: {
    description:
      'L’ingénierie industrielle et technique accompagne l’industrie, l’énergie, le BTP et la maintenance avancée.',
    tendance:
      'Croissance sur les énergies renouvelables, l’industrie 4.0, l’automatisation et la qualité / HSE.',
    softSkills: ['Rigueur', 'Esprit pratique', 'Gestion de projet', 'Sécurité'],
    avantages: ['Métiers concrets', 'Besoin durable des entreprises', 'Passerelles management technique'],
    pointsAttention: ['Contraintes terrain', 'Normes exigeantes', 'Mobilité parfois nécessaire'],
    bacs: ['Sciences Math', 'Sciences Physique', 'Sciences et technologies'],
    missionsType: [
      'Optimiser process et production',
      'Suivre projets techniques et normatifs',
      'Améliorer qualité, coûts et délais',
    ],
    competencesType: ['Génie industriel', 'Lecture de plans', 'Qualité / HSE', 'Outils CAO / ERP'],
    formationsType: ['Écoles d’ingénieurs', 'DUT/BTS + licence pro', 'Masters spécialisés industrie'],
    debouchesType: ['Industrie', 'BTP & infrastructures', 'Énergie', 'Cabinets techniques'],
  },
  data: {
    description:
      'La data transforme la décision business : analytics, BI, scoring, expérimentation et modèles prédictifs.',
    tendance: 'Besoin élevé en analystes, BI, data scientists et profils growth / scoring.',
    softSkills: ['Esprit analytique', 'Storytelling data', 'Curiosité business', 'Précision'],
    avantages: ['Transversalité sectorielle', 'Impact visible', 'Bonnes perspectives salariales'],
    pointsAttention: ['Qualité des données variable', 'Montée en compétences stats/outils'],
    bacs: ['Sciences Math', 'Sciences économique', 'Sciences Physique'],
    missionsType: [
      'Construire indicateurs et tableaux de bord',
      'Analyser comportements et performances',
      'Proposer des recommandations actionnables',
    ],
    competencesType: ['SQL', 'Python / R', 'Data viz', 'Statistiques'],
    formationsType: ['Licence/Master data', 'École d’ingénieurs', 'Double cursus business + data'],
    debouchesType: ['Banques & assurance', 'E-commerce', 'Conseil', 'Produit digital'],
  },
  finance: {
    description:
      'Finance, audit, banque et fintech : pilotage de la performance, risque, conformité et nouveaux services digitaux.',
    tendance: 'Stabilisation des métiers classiques + montée des profils fintech, compliance et data finance.',
    softSkills: ['Rigueur', 'Éthique', 'Esprit critique', 'Relation client'],
    avantages: ['Cadre structuré', 'Évolution claire', 'Rémunération compétitive'],
    pointsAttention: ['Pression des délais / clôtures', 'Réglementation dense'],
    bacs: ['Sciences économique', 'Sciences gestion comptable', 'Sciences Math'],
    missionsType: [
      'Analyser la performance financière',
      'Contrôler risques et conformité',
      'Accompagner décisions d’investissement',
    ],
    competencesType: ['Comptabilité / IFRS', 'Excel avancé', 'Analyse financière', 'Réglementation'],
    formationsType: ['Écoles de commerce', 'ISCAE / ENCGs', 'Masters finance / audit'],
    debouchesType: ['Banques', 'Audit Big 4', 'Entreprises (contrôle de gestion)', 'Fintech'],
  },
  conseil: {
    description:
      'Le conseil aide les organisations à se transformer : stratégie, opérations, digital et conduite du changement.',
    tendance: 'Demande soutenue en transformation digitale, efficacité opérationnelle et stratégie growth.',
    softSkills: ['Synthèse', 'Présentation', 'Adaptabilité', 'Leadership d’influence'],
    avantages: ['Courbe d’apprentissage rapide', 'Exposition multi-secteurs', 'Réseau professionnel'],
    pointsAttention: ['Rythme soutenu', 'Déplacements possibles', 'Exigence client'],
    bacs: ['Sciences Math', 'Sciences économique', 'Lettres / humaines (selon cabinet)'],
    missionsType: [
      'Diagnostiquer une problématique client',
      'Construire des recommandations actionnables',
      'Piloter la mise en œuvre avec les équipes',
    ],
    competencesType: ['Analyse business', 'PowerPoint / storytelling', 'Gestion de projet', 'Anglais'],
    formationsType: ['Écoles de commerce', 'Écoles d’ingénieurs', 'Masters management'],
    debouchesType: ['Cabinets de conseil', 'Directions stratégie', 'Startups scale-up', 'Private equity'],
  },
  sante: {
    description:
      'Santé et sciences de la vie : soins, pharma, biotech, e-santé et métiers paramédicaux en forte utilité sociale.',
    tendance: 'Besoin durable en soignants, pharmacie, qualité santé et digital health.',
    softSkills: ['Empathie', 'Rigueur', 'Résistance au stress', 'Écoute'],
    avantages: ['Impact humain fort', 'Stabilité relative', 'Sens du métier'],
    pointsAttention: ['Sélection parfois forte', 'Responsabilité élevée', 'Horaires variables'],
    bacs: ['SVT', 'Sciences Physique', 'Sciences Math'],
    missionsType: [
      'Prendre en charge ou accompagner des patients / usagers',
      'Respecter protocoles et qualité des soins',
      'Collaborer en équipe pluridisciplinaire',
    ],
    competencesType: ['Sciences du vivant', 'Relation d’aide', 'Hygiène / qualité', 'Communication'],
    formationsType: ['Faculté de médecine / pharma', 'Écoles paramédicales', 'Masters santé publique'],
    debouchesType: ['Hôpitaux / cliniques', 'Pharma', 'ONG santé', 'E-santé'],
  },
  design: {
    description:
      'Design, création et expérience utilisateur : produits, marques, contenus et interfaces.',
    tendance: 'Forte demande UX/UI, branding digital et contenus pour marques et produits.',
    softSkills: ['Créativité', 'Empathie utilisateur', 'Sens esthétique', 'Collaboration'],
    avantages: ['Expression créative', 'Projets variés', 'Portefeuille valorisable'],
    pointsAttention: ['Freelance fréquent', 'Subjectivité des briefs', 'Outils en évolution'],
    bacs: ['Arts Appliqués', 'Bac Mission arts', 'Sciences économiques (communication)'],
    missionsType: [
      'Comprendre besoins utilisateurs / marque',
      'Proposer concepts et prototypes',
      'Livrer des expériences cohérentes et attractives',
    ],
    competencesType: ['Figma / Adobe', 'Design thinking', 'Recherche utilisateur', 'Direction artistique'],
    formationsType: ['Écoles de design', 'Licences arts numériques', 'Bootcamps UX'],
    debouchesType: ['Agences', 'Produit digital', 'Marques', 'Freelance'],
  },
  marketing: {
    description:
      'Marketing et communication : acquisition, marque, contenus, performance et relation client.',
    tendance: 'Montée du marketing digital performance, CRM, content et growth.',
    softSkills: ['Créativité', 'Esprit client', 'Analyse', 'Organisation'],
    avantages: ['Métiers visibles', 'Créativité + data', 'Évolution vers product/growth'],
    pointsAttention: ['Objectifs chiffrés', 'Canaux en mutation permanente'],
    bacs: ['Sciences économique', 'Lettres', 'Arts Appliqués'],
    missionsType: [
      'Définir et exécuter des campagnes',
      'Analyser performance et ROI',
      'Faire grandir la marque et la communauté',
    ],
    competencesType: ['Ads / SEO', 'CRM', 'Content', 'Analytics'],
    formationsType: ['Écoles de commerce', 'ISMC / communication', 'Licences marketing digital'],
    debouchesType: ['Agences', 'E-commerce', 'Marques', 'Startups'],
  },
  edu: {
    description:
      'Éducation et formation : enseigner, accompagner, concevoir des parcours d’apprentissage (présentiel et digital).',
    tendance: 'Besoin en enseignants, ingénierie pédagogique et edtech.',
    softSkills: ['Pédagogie', 'Patience', 'Clarté', 'Empathie'],
    avantages: ['Impact sociétal', 'Sens du métier', 'Stabilité relative'],
    pointsAttention: ['Concours / sélection selon filière', 'Charge émotionnelle possible'],
    bacs: ['Selon discipline enseignée'],
    missionsType: [
      'Transmettre des savoirs et compétences',
      'Accompagner la progression des apprenants',
      'Concevoir des supports et évaluations',
    ],
    competencesType: ['Pédagogie', 'Animation de groupe', 'Évaluation', 'Outils numériques'],
    formationsType: ['Écoles normales / Facultés', 'Masters éducation', 'Certifications pédagogiques'],
    debouchesType: ['Éducation nationale', 'Écoles privées', 'Formation pro', 'Edtech'],
  },
  droit: {
    description:
      'Droit et justice : conseil juridique, conformité, contentieux et métiers du notariat / barreau.',
    tendance: 'Demande stable + montée du legal tech et de la compliance.',
    softSkills: ['Rigueur', 'Argumentation', 'Éthique', 'Écoute'],
    avantages: ['Prestige relatif', 'Expertise valorisable', 'Diversité de spécialités'],
    pointsAttention: ['Études longues', 'Sélection', 'Responsabilité élevée'],
    bacs: ['Lettres', 'Sciences humaines', 'Sciences économique'],
    missionsType: [
      'Analyser des situations juridiques',
      'Conseiller et rédiger des actes / mémoires',
      'Représenter ou accompagner des clients',
    ],
    competencesType: ['Droit', 'Rédaction', 'Recherche juridique', 'Négociation'],
    formationsType: ['Faculté de droit', 'Masters spécialisés', 'Écoles d’avocats / notariat'],
    debouchesType: ['Cabinets', 'Entreprises (juriste)', 'Institutions', 'Legal tech'],
  },
  default: {
    description:
      'Ce secteur regroupe des métiers en évolution sur le marché marocain et international, avec des parcours académiques variés.',
    tendance: 'Opportunités selon la spécialisation, les compétences numériques et la capacité à apprendre vite.',
    softSkills: ['Adaptabilité', 'Communication', 'Organisation', 'Esprit d’initiative'],
    avantages: ['Diversité de parcours', 'Possibilité de se spécialiser progressivement'],
    pointsAttention: ['Se renseigner sur les débouchés concrets', 'Construire un projet réaliste'],
    bacs: ['Selon spécialité visée'],
    missionsType: [
      'Contribuer à des projets métier',
      'Collaborer avec des équipes pluridisciplinaires',
      'Monter en compétences sur le terrain',
    ],
    competencesType: ['Compétences métier', 'Outils numériques', 'Travail collaboratif'],
    formationsType: ['Licence / Master', 'École spécialisée', 'Certification + expérience'],
    debouchesType: ['Entreprises', 'Institutions', 'Startups', 'Freelance / entrepreneuriat'],
  },
};

/** Insights marché en arabe — mots-clés techniques (Figma, SQL, UX…) conservés. */
const FAMILY_INSIGHTS_AR: Record<string, FamilyInsight> = {
  tech: {
    description:
      'يقود القطاع الرقمي تحول المؤسسات في المغرب والعالم، ويشمل المنتجات الرقمية والبيانات والحوسبة السحابية والأمن السيبراني والذكاء الاصطناعي.',
    tendance:
      'يوجد طلب قوي على الذكاء الاصطناعي التطبيقي والحوسبة السحابية والأمن السيبراني وتطوير التطبيقات وإدارة المنتجات.',
    softSkills: ['حل المشكلات', 'الفضول التقني', 'العمل الجماعي', 'التواصل الواضح'],
    avantages: ['أجور جيدة', 'تطور سريع', 'فرص للعمل عن بعد أو دولياً'],
    pointsAttention: ['يقظة مستمرة', 'منافسة قوية', 'إيقاع مكثف أحياناً'],
    bacs: ['علوم رياضية', 'علوم فيزيائية', 'علوم الحياة والأرض', 'باك مهمة علمية'],
    missionsType: [
      'تصميم وتسليم حلول رقمية',
      'التعاون مع فرق المنتجات والبيانات والأعمال',
      'تحسين الأداء والجودة والأمن',
    ],
    competencesType: ['الخوارزميات', 'الحوسبة السحابية وDevOps', 'تحليل البيانات', 'الإنجليزية التقنية'],
    formationsType: ['مدارس المهندسين', 'إجازة أو ماستر في المعلوميات', 'تكوينات تطبيقية مع مشاريع شخصية'],
    debouchesType: ['شركات الخدمات الرقمية', 'الشركات الناشئة', 'البنوك والاتصالات', 'المنتجات الرقمية'],
  },
  inge: {
    description:
      'ترافق الهندسة الصناعية والتقنية الصناعة والطاقة والبناء والصيانة المتقدمة.',
    tendance: 'ينمو الطلب في الطاقات المتجددة والصناعة 4.0 والأتمتة والجودة والسلامة المهنية.',
    softSkills: ['صرامة', 'روح عملية', 'إدارة مشاريع', 'سلامة'],
    avantages: ['مهن ملموسة', 'حاجة دائمة للمقاولات', 'مسارات نحو تدبير تقني'],
    pointsAttention: ['قيود ميدانية', 'معايير صارمة', 'تنقل أحياناً ضروري'],
    bacs: ['علوم رياضية', 'علوم فيزيائية', 'علوم وتقنيات'],
    missionsType: [
      'تحسين العمليات والإنتاج',
      'متابعة مشاريع تقنية ومعيارية',
      'تحسين الجودة والتكاليف والآجال',
    ],
    competencesType: ['الهندسة الصناعية', 'قراءة المخططات', 'الجودة والسلامة', 'أدوات التصميم والتدبير'],
    formationsType: ['مدارس المهندسين', 'دبلوم تقني مع إجازة مهنية', 'ماستر متخصص في الصناعة'],
    debouchesType: ['صناعة', 'بناء وبنى تحتية', 'طاقة', 'مكاتب تقنية'],
  },
  data: {
    description:
      'تساعد البيانات المؤسسات على اتخاذ قرارات أفضل من خلال التحليل ولوحات القيادة والنماذج التنبؤية.',
    tendance: 'يوجد طلب مرتفع على محللي البيانات وخبراء ذكاء الأعمال وعلماء البيانات.',
    softSkills: ['التفكير التحليلي', 'شرح النتائج بوضوح', 'فهم الأعمال', 'الدقة'],
    avantages: ['العمل في قطاعات متعددة', 'أثر واضح', 'آفاق أجر جيدة'],
    pointsAttention: ['تفاوت جودة البيانات', 'ضرورة تطوير مهارات الإحصاء والأدوات'],
    bacs: ['علوم رياضية', 'علوم اقتصادية', 'علوم فيزيائية'],
    missionsType: [
      'بناء مؤشرات ولوحات قيادة',
      'تحليل السلوكيات والأداء',
      'اقتراح توصيات قابلة للتنفيذ',
    ],
    competencesType: ['SQL', 'Python / R', 'Data viz', 'إحصاء'],
    formationsType: ['إجازة أو ماستر في البيانات', 'مدارس المهندسين', 'مسار يجمع الأعمال والبيانات'],
    debouchesType: ['بنوك وتأمين', 'E-commerce', 'استشارة', 'منتج رقمي'],
  },
  finance: {
    description:
      'يشمل القطاع المالي التدقيق والبنوك والتكنولوجيا المالية وتدبير الأداء والمخاطر والامتثال.',
    tendance: 'المهن التقليدية مستقرة، مع نمو التكنولوجيا المالية والامتثال وتحليل البيانات المالية.',
    softSkills: ['صرامة', 'أخلاق', 'روح نقدية', 'علاقة بالزبون'],
    avantages: ['إطار منظم', 'تطور واضح', 'أجر تنافسي'],
    pointsAttention: ['ضغط المواعيد وفترات إغلاق الحسابات', 'قواعد تنظيمية كثيرة'],
    bacs: ['علوم اقتصادية', 'علوم التدبير المحاسبي', 'علوم رياضية'],
    missionsType: [
      'تحليل الأداء المالي',
      'مراقبة المخاطر والامتثال',
      'مرافقة قرارات الاستثمار',
    ],
    competencesType: ['المحاسبة ومعايير IFRS', 'Excel المتقدم', 'التحليل المالي', 'فهم القوانين'],
    formationsType: ['مدارس التجارة والتدبير', 'ISCAE وENCG', 'ماستر في المالية أو التدقيق'],
    debouchesType: ['بنوك', 'تدقيق Big 4', 'مقاولات (مراقبة التدبير)', 'Fintech'],
  },
  conseil: {
    description:
      'تساعد الاستشارة المنظمات على التحول: استراتيجية، عمليات، رقمي وقيادة التغيير.',
    tendance: 'طلب مستمر في التحول الرقمي والكفاءة التشغيلية واستراتيجية النمو.',
    softSkills: ['التلخيص', 'العرض', 'التكيف', 'التأثير الإيجابي'],
    avantages: ['منحنى تعلم سريع', 'انفتاح متعدد القطاعات', 'شبكة مهنية'],
    pointsAttention: ['إيقاع مكثف', 'تنقلات محتملة', 'متطلبات الزبون'],
    bacs: ['علوم رياضية', 'علوم اقتصادية', 'آداب أو علوم إنسانية حسب المؤسسة'],
    missionsType: [
      'تشخيص إشكالية الزبون',
      'بناء توصيات قابلة للتنفيذ',
      'قيادة التنفيذ مع الفرق',
    ],
    competencesType: ['تحليل الأعمال', 'إعداد العروض وشرح الأفكار', 'إدارة المشاريع', 'اللغة الإنجليزية'],
    formationsType: ['مدارس تجارة', 'مدارس مهندسين', 'ماستر تدبير'],
    debouchesType: ['مكاتب الاستشارة', 'مديريات الاستراتيجية', 'الشركات الناشئة', 'الاستثمار الخاص'],
  },
  sante: {
    description:
      'الصحة وعلوم الحياة: رعاية، صيدلة، بيوتك، صحة رقمية ومهن شبه طبية ذات نفع اجتماعي قوي.',
    tendance: 'حاجة مستدامة للعاملين الصحيين والصيدلة وجودة الصحة والصحة الرقمية.',
    softSkills: ['تعاطف', 'صرامة', 'مقاومة الضغط', 'إنصات'],
    avantages: ['أثر إنساني قوي', 'استقرار نسبي', 'معنى المهنة'],
    pointsAttention: ['انتقاء قوي أحياناً', 'مسؤولية عالية', 'أوقات متغيرة'],
    bacs: ['علوم الحياة والأرض', 'علوم فيزيائية', 'علوم رياضية'],
    missionsType: [
      'رعاية المرضى أو مرافقة المستفيدين',
      'احترام البروتوكولات وجودة الرعاية',
      'التعاون ضمن فريق متعدد التخصصات',
    ],
    competencesType: ['علوم الحياة', 'مساعدة الآخرين', 'النظافة والجودة', 'التواصل'],
    formationsType: ['كليات الطب والصيدلة', 'مدارس المهن شبه الطبية', 'ماستر في الصحة العمومية'],
    debouchesType: ['المستشفيات والعيادات', 'الصيدلة', 'المنظمات الصحية', 'الصحة الرقمية'],
  },
  design: {
    description: 'التصميم والإبداع وتجربة المستخدم: منتجات، علامات، محتويات وواجهات.',
    tendance: 'يوجد طلب قوي على تصميم تجربة المستخدم والواجهات والهوية الرقمية والمحتوى.',
    softSkills: ['إبداع', 'تعاطف مع المستخدم', 'حس جمالي', 'تعاون'],
    avantages: ['التعبير الإبداعي', 'مشاريع متنوعة', 'إمكانية بناء معرض أعمال قوي'],
    pointsAttention: ['العمل الحر شائع', 'تقييم العمل قد يكون شخصياً', 'الأدوات تتطور باستمرار'],
    bacs: ['فنون تطبيقية', 'باك مهمة فنون', 'علوم اقتصادية (تواصل)'],
    missionsType: [
      'فهم احتياجات المستخدمين والعلامة التجارية',
      'اقتراح مفاهيم ونماذج أولية',
      'تسليم تجارب متسقة وجذابة',
    ],
    competencesType: ['Figma / Adobe', 'Design thinking', 'بحث المستخدم', 'إخراج فني'],
    formationsType: ['مدارس التصميم', 'إجازات الفنون الرقمية', 'تكوينات تطبيقية في تجربة المستخدم'],
    debouchesType: ['الوكالات', 'المنتجات الرقمية', 'العلامات التجارية', 'العمل الحر'],
  },
  marketing: {
    description: 'يشمل التسويق والتواصل جذب العملاء وبناء العلامة التجارية وصناعة المحتوى وتحليل الأداء.',
    tendance: 'ينمو التسويق الرقمي وإدارة علاقات العملاء وصناعة المحتوى وتسويق النمو.',
    softSkills: ['الإبداع', 'فهم العميل', 'التحليل', 'التنظيم'],
    avantages: ['نتائج عمل واضحة', 'الجمع بين الإبداع والبيانات', 'فرص تطور متنوعة'],
    pointsAttention: ['أهداف رقمية', 'قنوات في تحول دائم'],
    bacs: ['علوم اقتصادية', 'آداب', 'فنون تطبيقية'],
    missionsType: [
      'تحديد وتنفيذ الحملات',
      'تحليل الأداء وROI',
      'تنمية العلامة والمجتمع',
    ],
    competencesType: ['Ads / SEO', 'CRM', 'Content', 'Analytics'],
    formationsType: ['مدارس التجارة والتدبير', 'معاهد التواصل', 'إجازات في التسويق الرقمي'],
    debouchesType: ['الوكالات', 'التجارة الإلكترونية', 'العلامات التجارية', 'الشركات الناشئة'],
  },
  edu: {
    description:
      'التربية والتكوين: التدريس والمرافقة وتصميم مسارات التعلم (حضوري ورقمي).',
    tendance: 'يوجد طلب على الأساتذة وتصميم البرامج التعليمية والتقنيات التعليمية.',
    softSkills: ['مهارات التعليم', 'الصبر', 'الوضوح', 'التعاطف'],
    avantages: ['أثر مجتمعي', 'معنى المهنة', 'استقرار نسبي'],
    pointsAttention: ['مباراة أو انتقاء حسب المسار', 'ضغط نفسي محتمل'],
    bacs: ['حسب المادة المدرّسة'],
    missionsType: [
      'نقل المعارف والكفاءات',
      'مرافقة تقدّم المتعلمين',
      'تصميم دعائم وتقويمات',
    ],
    competencesType: ['بيداغوجيا', 'تنشيط مجموعات', 'تقويم', 'أدوات رقمية'],
    formationsType: ['المدارس العليا والكليات', 'ماستر في التربية', 'شهادات في طرق التعليم'],
    debouchesType: ['التربية الوطنية', 'المدارس الخاصة', 'التكوين المهني', 'التقنيات التعليمية'],
  },
  droit: {
    description: 'يشمل القانون والعدالة الاستشارة القانونية والامتثال والمنازعات والتوثيق والمحاماة.',
    tendance: 'الطلب مستقر، مع نمو التقنيات القانونية ومهن الامتثال.',
    softSkills: ['صرامة', 'حجاج', 'أخلاق', 'إنصات'],
    avantages: ['مكانة نسبية', 'خبرة قابلة للتثمين', 'تنوع التخصصات'],
    pointsAttention: ['دراسات طويلة', 'انتقاء', 'مسؤولية عالية'],
    bacs: ['آداب', 'علوم إنسانية', 'علوم اقتصادية'],
    missionsType: [
      'تحليل وضعيات قانونية',
      'تقديم الاستشارة وتحرير العقود والمذكرات',
      'تمثيل أو مرافقة الزبناء',
    ],
    competencesType: ['قانون', 'تحرير', 'بحث قانوني', 'تفاوض'],
    formationsType: ['كلية الحقوق', 'ماستر متخصص', 'تكوينات المحاماة أو التوثيق'],
    debouchesType: ['المكاتب القانونية', 'المؤسسات', 'الإدارات', 'التقنيات القانونية'],
  },
  default: {
    description:
      'يجمع هذا القطاع مهناً متطورة في السوق المغربي والدولي، بمسارات أكاديمية متنوعة.',
    tendance: 'فرص حسب التخصص والكفاءات الرقمية والقدرة على التعلم السريع.',
    softSkills: ['تكيّف', 'تواصل', 'تنظيم', 'روح مبادرة'],
    avantages: ['تنوع المسارات', 'إمكانية التخصص تدريجياً'],
    pointsAttention: ['الاستعلام عن المنافذ الفعلية', 'بناء مشروع واقعي'],
    bacs: ['حسب التخصص المستهدف'],
    missionsType: [
      'المساهمة في مشاريع مهنية',
      'التعاون مع فرق متعددة التخصصات',
      'تطوير الكفاءات في الميدان',
    ],
    competencesType: ['كفاءات مهنية', 'أدوات رقمية', 'عمل تعاوني'],
    formationsType: ['إجازة أو ماستر', 'مدرسة متخصصة', 'شهادة مع خبرة تطبيقية'],
    debouchesType: ['المقاولات', 'المؤسسات', 'الشركات الناشئة', 'العمل الحر وريادة الأعمال'],
  },
};

function insightFor(titre: string, code?: string, locale: 'fr' | 'ar' = 'fr'): FamilyInsight {
  const fam = matchModernFamily(titre, code);
  const key = fam.key;
  if (locale === 'ar') {
    return FAMILY_INSIGHTS_AR[key] || FAMILY_INSIGHTS_AR.default;
  }
  return FAMILY_INSIGHTS[key] || FAMILY_INSIGHTS.default;
}

function localizeAccessibilite(value: string | undefined | null, locale: 'fr' | 'ar'): string {
  const v = (value || '').trim();
  if (!v) return locale === 'ar' ? 'حسب المسار' : 'Selon parcours';
  if (locale !== 'ar') return v;
  const map: Record<string, string> = {
    'Sélectif': 'انتقائي',
    'Accessible': 'في المتناول',
    'Exigeant': 'صعب الولوج',
    'Variable': 'متغير',
    'Très sélectif': 'انتقائي جداً',
    'Selon parcours': 'حسب المسار',
  };
  return map[v] || v;
}

function uniq(list: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const x of list) {
    const t = (x || '').trim();
    if (!t || seen.has(t.toLowerCase())) continue;
    seen.add(t.toLowerCase());
    out.push(t);
  }
  return out;
}

function salaryFrom(
  salaire?: string | null,
  min?: string | number | null,
  max?: string | number | null,
  locale: 'fr' | 'ar' = 'fr',
): string {
  if (salaire && String(salaire).trim()) {
    return formatPricingText(String(salaire).trim(), locale);
  }
  const label = formatSalaryRange(min ?? null, max ?? null, locale);
  return (
    label ||
    (locale === 'ar'
      ? 'حسب الملف والخبرة (سوق المغرب)'
      : 'Selon profil et expérience (marché Maroc)')
  );
}

export function buildSecteurDetailView(
  s: {
    titre: string;
    titreAr?: string | null;
    code?: string;
    description?: string;
    salaire?: string;
    salaireMin?: string | null;
    salaireMax?: string | null;
    softSkills?: string[];
    avantages?: string[];
    inconvenients?: string[];
    bacs?: string[];
    typeBacs?: string[];
    metiers?: string[];
    nbMetiers?: number;
    nbEcoles?: number;
  },
  locale: 'fr' | 'ar' = 'fr',
): SecteurDetailView {
  const insight = insightFor(s.titre, s.code, locale);
  const apiDesc =
    locale === 'ar' ? '' : (s.description || '').trim(); // descriptions API souvent FR → insights AR
  const frDesc = (s.description || '').trim();
  const hasApiExtra = Boolean(
    frDesc ||
      (s.avantages && s.avantages.length) ||
      (s.softSkills && s.softSkills.length),
  );
  const titre = formatBilingualName(s.titre, s.titreAr);
  return {
    titre,
    description: apiDesc || insight.description,
    tendance: insight.tendance,
    salaireLabel: salaryFrom(s.salaire, s.salaireMin, s.salaireMax, locale),
    softSkills: uniq([
      ...(locale === 'ar' ? [] : s.softSkills || []),
      ...insight.softSkills,
    ]).slice(0, 8),
    avantages: uniq([
      ...(locale === 'ar' ? [] : s.avantages || []),
      ...insight.avantages,
    ]).slice(0, 6),
    pointsAttention: uniq([
      ...(locale === 'ar' ? [] : s.inconvenients || []),
      ...insight.pointsAttention,
    ]).slice(0, 6),
    bacs: uniq([
      ...(locale === 'ar' ? [] : [...(s.bacs || []), ...(s.typeBacs || [])]),
      ...insight.bacs,
    ]).slice(0, 8),
    exemplesMetiers: uniq([...(s.metiers || [])]).slice(0, 8),
    nbMetiers: s.nbMetiers,
    nbEcoles: s.nbEcoles,
    source:
      locale === 'ar'
        ? 'marche'
        : frDesc && hasApiExtra
          ? 'mixte'
          : frDesc
            ? 'api'
            : 'marche',
  };
}

export function buildMetierDetailView(
  m: {
    nom: string;
    nomArabe?: string | null;
    description?: string;
    descriptionAr?: string | null;
    competences?: string[];
    formations?: string[];
    salaireMin?: string | number | null;
    salaireMax?: string | number | null;
    niveauAccessibilite?: string;
    secteur?: { titre?: string; titreAr?: string | null; code?: string };
  },
  secteurTitre?: string,
  secteurCode?: string,
  locale: 'fr' | 'ar' = 'fr',
): MetierDetailView {
  const rawSecteur = secteurTitre || m.secteur?.titre || '';
  const titreFr = rawSecteur.split(' · ')[0];
  const titreArFromLabel = rawSecteur.includes(' · ')
    ? rawSecteur.split(' · ').slice(1).join(' · ')
    : '';
  const titre = formatBilingualName(
    titreFr,
    m.secteur?.titreAr || titreArFromLabel,
  );
  const code = secteurCode || m.secteur?.code || '';
  const insight = insightFor(titreFr || m.nom, code, locale);
  const displayNom = formatBilingualName(m.nom, m.nomArabe);
  const apiDesc =
    locale === 'ar'
      ? (m.descriptionAr || '').trim()
      : (m.description || '').trim();
  const hasApiLists = Boolean(
    (m.competences && m.competences.length) || (m.formations && m.formations.length),
  );

  const missions = insight.missionsType.slice(0, 4);

  // En AR : listes API souvent en FR → on privilégie les insights AR (mots-clés techniques gardés).
  const competences =
    locale === 'ar'
      ? uniq([...insight.competencesType]).slice(0, 8)
      : uniq([...(m.competences || []), ...insight.competencesType]).slice(0, 8);
  const formations =
    locale === 'ar'
      ? uniq([...insight.formationsType]).slice(0, 6)
      : uniq([...(m.formations || []), ...insight.formationsType]).slice(0, 6);

  return {
    nom: displayNom,
    secteurLabel: titre || undefined,
    description:
      apiDesc ||
      (locale === 'ar'
        ? `${m.nomArabe?.trim() || m.nom} مهنة مطلوبة في السوق الحالي. ${insight.description}`
        : `${m.nom} est un métier recherché sur le marché actuel. ${insight.description}`),
    missions,
    competences,
    formations,
    debouches: insight.debouchesType.slice(0, 6),
    tendance: insight.tendance,
    salaireLabel: salaryFrom(null, m.salaireMin, m.salaireMax, locale),
    niveauAccessibilite: localizeAccessibilite(m.niveauAccessibilite, locale),
    source:
      locale === 'ar'
        ? apiDesc
          ? 'mixte'
          : 'marche'
        : apiDesc && hasApiLists
          ? 'mixte'
          : apiDesc || hasApiLists
            ? 'api'
            : 'marche',
  };
}
