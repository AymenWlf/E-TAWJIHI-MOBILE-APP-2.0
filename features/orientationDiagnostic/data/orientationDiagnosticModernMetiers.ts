/**
 * Métiers « marché actuel » (Maroc / international) — 8 à 10 par famille de secteur.
 * Utilisés pour compléter ou remplacer l’API si vide / indisponible.
 */

export type ModernMetierSeed = {
  /** id stable pour le diagnostic (préfixe mm_) */
  id: string;
  nom: string;
  nomArabe: string;
  descriptionAr: string;
  slug: string;
  salaireMin: number;
  salaireMax: number;
  niveauAccessibilite: string;
  description: string;
};

export type ModernSectorFamily = {
  key: string;
  /** Mots-clés matchés sur titre / code secteur API */
  match: string[];
  /** Libellé affiché quand le métier n’a pas de secteur API */
  titre: string;
  titreAr: string;
  metiers: ModernMetierSeed[];
};

const MAD = (min: number, max: number) => ({ salaireMin: min, salaireMax: max });

export const MODERN_SECTOR_METIERS: ModernSectorFamily[] = [
  {
    key: 'tech',
    titre: 'Technologies et numérique',
    titreAr: 'التكنولوجيا والرقمنة',
    match: [
      'tech',
      'technologie',
      'informatique',
      'numérique',
      'numerique',
      'digital',
      'ia',
      'intelligence',
      'software',
      'it',
    ],
    metiers: [
      { id: 'mm_tech_1', nom: 'Ingénieur IA / Machine Learning', nomArabe: 'مهندس الذكاء الاصطناعي / التعلم الآلي', descriptionAr: 'يصمم وينشر نماذج الذكاء الاصطناعي للمنتجات والعمليات. متابعة علمية وتجريب وإدخال إلى الإنتاج.', slug: 'ingenieur-ia-ml', ...MAD(18000, 35000), niveauAccessibilite: 'Sélectif', description: 'Conçoit et déploie des modèles d’IA pour produits et process.' },
      { id: 'mm_tech_2', nom: 'Data Scientist', nomArabe: 'عالم بيانات', descriptionAr: 'تحليل البيانات وبناء نماذج تنبؤية لدعم اتخاذ القرار في مختلف المهن.', slug: 'data-scientist', ...MAD(16000, 32000), niveauAccessibilite: 'Sélectif', description: 'Analyse de données, modèles prédictifs, aide à la décision.' },
      { id: 'mm_tech_3', nom: 'Développeur Full-Stack', nomArabe: 'مطوّر Full-Stack', descriptionAr: 'تطوير تطبيقات الويب والجوال وواجهات البرمجة والنشر السحابي ضمن فرق رشيقة.', slug: 'developpeur-fullstack', ...MAD(12000, 28000), niveauAccessibilite: 'Accessible', description: 'Applications web/mobile, APIs, cloud.' },
      { id: 'mm_tech_4', nom: 'Ingénieur Cloud / DevOps', nomArabe: 'مهندس سحابة / DevOps', descriptionAr: 'البنية السحابية، التكامل والنشر المستمر، الموثوقية والمراقبة وأمن الأنظمة.', slug: 'ingenieur-cloud-devops', ...MAD(15000, 30000), niveauAccessibilite: 'Sélectif', description: 'Infra cloud, CI/CD, fiabilité et sécurité des systèmes.' },
      { id: 'mm_tech_5', nom: 'Product Manager Tech', nomArabe: 'مدير منتج تقني', descriptionAr: 'قيادة المنتج الرقمي: خارطة الطريق، تحديد الأولويات، المستخدمون والتسليمات.', slug: 'product-manager-tech', ...MAD(14000, 28000), niveauAccessibilite: 'Sélectif', description: 'Pilotage produit numérique, roadmap, utilisateurs.' },
      { id: 'mm_tech_6', nom: 'Cybersécurité Analyst', nomArabe: 'محلل أمن سيبراني', descriptionAr: 'حماية نظم المعلومات، كشف الحوادث، اختبارات الثغرات والامتثال.', slug: 'cybersecurite-analyst', ...MAD(14000, 28000), niveauAccessibilite: 'Sélectif', description: 'Protection des SI, détection d’incidents, conformité.' },
      { id: 'mm_tech_7', nom: 'Ingénieur Data / Analytics Engineer', nomArabe: 'مهندس بيانات / تحليلات', descriptionAr: 'خطوط أنابيب البيانات ومستودعاتها وجودتها وتوافرها للتحليل.', slug: 'data-engineer', ...MAD(15000, 30000), niveauAccessibilite: 'Sélectif', description: 'Pipelines data, entrepôts, qualité des données.' },
      { id: 'mm_tech_8', nom: 'UX / UI Designer', nomArabe: 'مصمم تجربة وواجهة المستخدم', descriptionAr: 'تجربة وواجهات المنتجات الرقمية، النماذج الأولية واختبارات المستخدمين.', slug: 'ux-ui-designer', ...MAD(10000, 22000), niveauAccessibilite: 'Accessible', description: 'Expérience et interfaces produits digitaux.' },
      { id: 'mm_tech_9', nom: 'Architecte Logiciel', nomArabe: 'مهندس معماري للبرمجيات', descriptionAr: 'تصميم أنظمة قابلة للتوسع، الاختيارات التقنية ومعايير الفريق.', slug: 'architecte-logiciel', ...MAD(20000, 38000), niveauAccessibilite: 'Exigeant', description: 'Conception de systèmes scalables et durables.' },
    ],
  },
  {
    key: 'inge',
    titre: 'Ingénierie et industrie',
    titreAr: 'الهندسة والصناعة',
    match: ['ingénieur', 'ingenieur', 'industrie', 'industriel', 'mécanique', 'mecanique', 'électr', 'electr', 'génie', 'genie'],
    metiers: [
      { id: 'mm_inge_1', nom: 'Ingénieur Industriel / Lean', nomArabe: 'مهندس صناعي / Lean', descriptionAr: 'تحسين الإنتاج والجودة وسلسلة التوريد والتحسين المستمر.', slug: 'ingenieur-industriel', ...MAD(11000, 22000), niveauAccessibilite: 'Accessible', description: 'Optimisation production, qualité, supply.' },
      { id: 'mm_inge_2', nom: 'Ingénieur Énergies Renouvelables', nomArabe: 'مهندس الطاقات المتجددة', descriptionAr: 'مشاريع الطاقة الشمسية والريحية وكفاءة الطاقة.', slug: 'ingenieur-energies-renouvelables', ...MAD(12000, 24000), niveauAccessibilite: 'Sélectif', description: 'Projets solaire, éolien, efficacité énergétique.' },
      { id: 'mm_inge_3', nom: 'Ingénieur Automatisme / Robotique', nomArabe: 'مهندس أتمتة / روبوتيك', descriptionAr: 'أتمتة المصانع والأنظمة المدمجة والروبوتية.', slug: 'ingenieur-automatisme', ...MAD(12000, 25000), niveauAccessibilite: 'Sélectif', description: 'Automatisation d’usines et systèmes embarqués.' },
      { id: 'mm_inge_4', nom: 'Ingénieur Civil / BTP', nomArabe: 'مهندس مدني / بناء', descriptionAr: 'تصميم ومتابعة المنشآت والبنى التحتية.', slug: 'ingenieur-civil', ...MAD(10000, 22000), niveauAccessibilite: 'Accessible', description: 'Conception et suivi d’ouvrages / infrastructures.' },
      { id: 'mm_inge_5', nom: 'Ingénieur Qualité / HSE', nomArabe: 'مهندس جودة / صحة وسلامة', descriptionAr: 'الجودة والمعايير والصحة والسلامة والبيئة.', slug: 'ingenieur-qualite-hse', ...MAD(10000, 20000), niveauAccessibilite: 'Accessible', description: 'Qualité, normes, santé-sécurité environnement.' },
      { id: 'mm_inge_6', nom: 'Ingénieur Maintenance 4.0', nomArabe: 'مهندس صيانة 4.0', descriptionAr: 'الصيانة التنبؤية وإنترنت الأشياء الصناعي.', slug: 'ingenieur-maintenance-4-0', ...MAD(11000, 21000), niveauAccessibilite: 'Accessible', description: 'Maintenance prédictive, IoT industriel.' },
      { id: 'mm_inge_7', nom: 'Ingénieur Process / Chimie', nomArabe: 'مهندس عمليات / كيمياء', descriptionAr: 'العمليات الصناعية والتحسين المستمر للتدفقات.', slug: 'ingenieur-process', ...MAD(11000, 23000), niveauAccessibilite: 'Sélectif', description: 'Procédés industriels et amélioration continue.' },
      { id: 'mm_inge_8', nom: 'Chef de Projet Technique', nomArabe: 'رئيس مشروع تقني', descriptionAr: 'قيادة مشاريع الهندسة متعددة الفرق.', slug: 'chef-projet-technique', ...MAD(13000, 26000), niveauAccessibilite: 'Sélectif', description: 'Pilotage de projets d’ingénierie multi-équipes.' },
    ],
  },
  {
    key: 'data',
    titre: 'Data et analyse',
    titreAr: 'البيانات والتحليل',
    match: ['data', 'analyse', 'statistique', 'analytics', 'business intelligence', 'bi '],
    metiers: [
      { id: 'mm_data_1', nom: 'Data Analyst', nomArabe: 'محلل بيانات', descriptionAr: 'لوحات القيادة ورؤى الأعمال والتقارير الداعمة للقرار.', slug: 'data-analyst', ...MAD(11000, 22000), niveauAccessibilite: 'Accessible', description: 'Tableaux de bord, insights business.' },
      { id: 'mm_data_2', nom: 'Business Intelligence Developer', nomArabe: 'مطوّر ذكاء الأعمال', descriptionAr: 'Power BI / Looker وتصور البيانات في المؤسسات.', slug: 'bi-developer', ...MAD(12000, 24000), niveauAccessibilite: 'Sélectif', description: 'Power BI / Looker / data viz entreprise.' },
      { id: 'mm_data_3', nom: 'Data Scientist', nomArabe: 'عالم بيانات', descriptionAr: 'نمذجة متقدمة في خدمة القرارات المهنية.', slug: 'data-scientist-bi', ...MAD(16000, 32000), niveauAccessibilite: 'Sélectif', description: 'Modélisation avancée et expérimentation.' },
      { id: 'mm_data_4', nom: 'Analyste Produit / Growth', nomArabe: 'محلل منتج / نمو', descriptionAr: 'قياس الاكتساب والاحتفاظ وتجارب A/B.', slug: 'analyste-growth', ...MAD(12000, 24000), niveauAccessibilite: 'Sélectif', description: 'Mesure acquisition, rétention, A/B tests.' },
      { id: 'mm_data_5', nom: 'Actuaire / Risk Analyst', nomArabe: 'خبير اكتواري / محلل مخاطر', descriptionAr: 'المخاطر والتسعير والنماذج المالية والتأمينية.', slug: 'actuaire-risk', ...MAD(14000, 28000), niveauAccessibilite: 'Exigeant', description: 'Risque, pricing, modèles financiers.' },
      { id: 'mm_data_6', nom: 'Consultant Data', nomArabe: 'استشاري بيانات', descriptionAr: 'تحول البيانات ومرافقة العملاء.', slug: 'consultant-data', ...MAD(13000, 26000), niveauAccessibilite: 'Sélectif', description: 'Transformation data chez clients.' },
      { id: 'mm_data_7', nom: 'ML Ops Engineer', nomArabe: 'مهندس ML Ops', descriptionAr: 'إدخال نماذج الذكاء الاصطناعي إلى الإنتاج ومراقبتها.', slug: 'mlops-engineer', ...MAD(16000, 32000), niveauAccessibilite: 'Sélectif', description: 'Mise en production et monitoring de modèles IA.' },
      { id: 'mm_data_8', nom: 'Analyste Crédit / Scoring', nomArabe: 'محلل ائتمان / تقييم', descriptionAr: 'تقييم العملاء ومخاطر الائتمان البنكي.', slug: 'analyste-credit-scoring', ...MAD(11000, 22000), niveauAccessibilite: 'Accessible', description: 'Scoring clients, risque bancaire.' },
    ],
  },
  {
    key: 'finance',
    titre: 'Finance et gestion',
    titreAr: 'المالية والتدبير',
    match: ['finance', 'gestion', 'comptab', 'audit', 'banque', 'assurance', 'économ', 'econom'],
    metiers: [
      { id: 'mm_fin_1', nom: 'Analyste Financier', nomArabe: 'محلل مالي', descriptionAr: 'التحليل المالي والتقارير وقرارات الاستثمار.', slug: 'analyste-financier', ...MAD(11000, 24000), niveauAccessibilite: 'Accessible', description: 'Analyse financière, reporting, décisions d’investissement.' },
      { id: 'mm_fin_2', nom: 'Contrôleur de Gestion', nomArabe: 'مراقب تدبير', descriptionAr: 'الميزانيات ومؤشرات الأداء وقيادة الأداء.', slug: 'controleur-gestion', ...MAD(10000, 22000), niveauAccessibilite: 'Accessible', description: 'Budgets, KPIs, pilotage de la performance.' },
      { id: 'mm_fin_3', nom: 'Audit / Risk Consulting', nomArabe: 'تدقيق / استشارات المخاطر', descriptionAr: 'الرقابة الداخلية والامتثال ومهام التدقيق.', slug: 'audit-risk', ...MAD(12000, 25000), niveauAccessibilite: 'Sélectif', description: 'Contrôle interne, conformité, missions audit.' },
      { id: 'mm_fin_4', nom: 'Chargé d’Affaires Bancaires', nomArabe: 'مكلف بشؤون بنكية', descriptionAr: 'علاقة المقاولات والقروض والحلول البنكية.', slug: 'charge-affaires-bancaires', ...MAD(10000, 20000), niveauAccessibilite: 'Accessible', description: 'Relation entreprises, crédits, solutions bancaires.' },
      { id: 'mm_fin_5', nom: 'Fintech Product Analyst', nomArabe: 'محلل منتجات التكنولوجيا المالية', descriptionAr: 'المنتجات المالية الرقمية: الدفع والائتمان والادخار.', slug: 'fintech-product', ...MAD(12000, 24000), niveauAccessibilite: 'Sélectif', description: 'Produits financiers digitaux (paiement, crédit, épargne).' },
      { id: 'mm_fin_6', nom: 'Trésorier / Cash Manager', nomArabe: 'أمين خزينة / مدير سيولة', descriptionAr: 'السيولة ومخاطر الصرف والتمويلات.', slug: 'tresorier', ...MAD(12000, 24000), niveauAccessibilite: 'Sélectif', description: 'Liquidités, risques de change, financements.' },
      { id: 'mm_fin_7', nom: 'Expert-Comptable (parcours)', nomArabe: 'خبير محاسب (مسار)', descriptionAr: 'المحاسبة والجباية واستشارات المقاولات الصغرى والمتوسطة.', slug: 'expert-comptable', ...MAD(12000, 28000), niveauAccessibilite: 'Exigeant', description: 'Comptabilité, fiscalité, conseil PME.' },
      { id: 'mm_fin_8', nom: 'Investment Analyst', nomArabe: 'محلل استثمار', descriptionAr: 'الاستثمار الخاص والأسواق والعناية الواجبة.', slug: 'investment-analyst', ...MAD(14000, 30000), niveauAccessibilite: 'Sélectif', description: 'Private equity, marchés, due diligence.' },
      { id: 'mm_fin_9', nom: 'Compliance Officer', nomArabe: 'مسؤول امتثال', descriptionAr: 'التنظيم ومكافحة غسل الأموال والحوكمة.', slug: 'compliance-officer', ...MAD(12000, 25000), niveauAccessibilite: 'Sélectif', description: 'Réglementation, LCB-FT, gouvernance.' },
    ],
  },
  {
    key: 'conseil',
    titre: 'Conseil et gestion de projet',
    titreAr: 'الاستشارة وإدارة المشاريع',
    match: ['conseil', 'stratégie', 'strategie', 'consulting', 'management', 'organisation'],
    metiers: [
      { id: 'mm_cons_1', nom: 'Consultant Stratégie', nomArabe: 'استشاري استراتيجية', descriptionAr: 'استشارات الإدارة والتحول والنمو.', slug: 'consultant-strategie', ...MAD(14000, 30000), niveauAccessibilite: 'Sélectif', description: 'Conseil direction, transformation, growth.' },
      { id: 'mm_cons_2', nom: 'Consultant Transformation Digitale', nomArabe: 'استشاري تحول رقمي', descriptionAr: 'رقمنة العمليات ومسارات العملاء.', slug: 'consultant-transformation-digitale', ...MAD(13000, 28000), niveauAccessibilite: 'Sélectif', description: 'Digitalisation process et parcours clients.' },
      { id: 'mm_cons_3', nom: 'Business Analyst', nomArabe: 'محلل أعمال', descriptionAr: 'ترجمة احتياجات الأعمال إلى حلول معلوماتية وعملياتية.', slug: 'business-analyst', ...MAD(11000, 23000), niveauAccessibilite: 'Accessible', description: 'Besoins métier → solutions SI / process.' },
      { id: 'mm_cons_4', nom: 'Chef de Projet / PMO', nomArabe: 'رئيس مشروع / PMO', descriptionAr: 'قيادة المشاريع والآجال والميزانيات وأصحاب المصلحة.', slug: 'chef-projet-pmo', ...MAD(12000, 25000), niveauAccessibilite: 'Accessible', description: 'Pilotage projets, délais, budgets, parties prenantes.' },
      { id: 'mm_cons_5', nom: 'Product Owner', nomArabe: 'مالك المنتج', descriptionAr: 'قائمة المهام وتحديد الأولويات والتسليمات الرشيقة.', slug: 'product-owner', ...MAD(13000, 26000), niveauAccessibilite: 'Sélectif', description: 'Backlog, priorisation, livraisons agiles.' },
      { id: 'mm_cons_6', nom: 'Consultant RH / Talent', nomArabe: 'استشاري موارد بشرية / مواهب', descriptionAr: 'التوظيف والتنظيم وثقافة المؤسسة.', slug: 'consultant-rh', ...MAD(10000, 22000), niveauAccessibilite: 'Accessible', description: 'Recrutement, organisation, culture.' },
      { id: 'mm_cons_7', nom: 'Customer Success Manager', nomArabe: 'مدير نجاح العملاء', descriptionAr: 'الاحتفاظ بالعملاء وتطويرهم في B2B / SaaS.', slug: 'customer-success', ...MAD(10000, 22000), niveauAccessibilite: 'Accessible', description: 'Rétention clients B2B / SaaS.' },
      { id: 'mm_cons_8', nom: 'Entrepreneur / Fondateur', nomArabe: 'رائد أعمال / مؤسس', descriptionAr: 'إنشاء وتطوير شركة ناشئة أو مقاولة صغيرة ومتوسطة.', slug: 'entrepreneur-fondateur', ...MAD(0, 50000), niveauAccessibilite: 'Variable', description: 'Création et scale d’une startup / PME.' },
    ],
  },
  {
    key: 'marketing',
    titre: 'Marketing et communication',
    titreAr: 'التسويق والتواصل',
    match: ['marketing', 'communication', 'média', 'media', 'marque', 'brand', 'publicité', 'publicite'],
    metiers: [
      { id: 'mm_mkt_1', nom: 'Growth Marketer', nomArabe: 'مسوّق نمو', descriptionAr: 'الاكتساب الرقمي ومسارات التحويل والتسويق القائم على الأداء.', slug: 'growth-marketer', ...MAD(10000, 22000), niveauAccessibilite: 'Accessible', description: 'Acquisition digitale, funnels, performance.' },
      { id: 'mm_mkt_2', nom: 'Responsable Marketing Digital', nomArabe: 'مسؤول تسويق رقمي', descriptionAr: 'تحسين محركات البحث والإعلانات المدفوعة والشبكات الاجتماعية والمحتوى والتحليلات.', slug: 'responsable-marketing-digital', ...MAD(11000, 24000), niveauAccessibilite: 'Accessible', description: 'SEO/SEA, social, contenu, analytics.' },
      { id: 'mm_mkt_3', nom: 'Brand Manager', nomArabe: 'مدير علامة تجارية', descriptionAr: 'تموضع العلامة والحملات والهوية.', slug: 'brand-manager', ...MAD(11000, 23000), niveauAccessibilite: 'Sélectif', description: 'Positionnement marque, campagnes, identité.' },
      { id: 'mm_mkt_4', nom: 'Content / Social Media Strategist', nomArabe: 'استراتيجي محتوى / شبكات اجتماعية', descriptionAr: 'المحتويات والمجتمعات وسرد قصة العلامة.', slug: 'content-strategist', ...MAD(9000, 20000), niveauAccessibilite: 'Accessible', description: 'Contenus, communautés, storytelling.' },
      { id: 'mm_mkt_5', nom: 'CRM / Retention Manager', nomArabe: 'مدير علاقات العملاء / الاحتفاظ', descriptionAr: 'البريد الإلكتروني ومسارات العملاء وقيمة مدى الحياة.', slug: 'crm-manager', ...MAD(10000, 22000), niveauAccessibilite: 'Accessible', description: 'Emailing, parcours clients, lifetime value.' },
      { id: 'mm_mkt_6', nom: 'Performance Media Buyer', nomArabe: 'مشتري إعلانات أداء', descriptionAr: 'إعلانات Meta/Google وعائد الإنفاق وتحسين الميزانيات.', slug: 'media-buyer', ...MAD(9000, 20000), niveauAccessibilite: 'Accessible', description: 'Ads Meta/Google, ROAS, optimisation budgets.' },
      { id: 'mm_mkt_7', nom: 'Chef de Projet Événementiel', nomArabe: 'رئيس مشروع فعاليات', descriptionAr: 'الفعاليات والتفعيلات والشراكات.', slug: 'chef-projet-evenementiel', ...MAD(9000, 18000), niveauAccessibilite: 'Accessible', description: 'Événements, activations, partenariats.' },
      { id: 'mm_mkt_8', nom: 'Analyste Marketing / Insights', nomArabe: 'محلل تسويق / رؤى', descriptionAr: 'دراسات السوق والاستبيانات وبيانات التسويق.', slug: 'analyste-marketing', ...MAD(10000, 21000), niveauAccessibilite: 'Accessible', description: 'Études marché, panels, data marketing.' },
    ],
  },
  {
    key: 'design',
    titre: 'Design et création',
    titreAr: 'التصميم والإبداع',
    match: ['design', 'création', 'creation', 'créatif', 'creatif', 'arts', 'graphique', 'architecture'],
    metiers: [
      { id: 'mm_des_1', nom: 'Product Designer', nomArabe: 'مصمم منتج', descriptionAr: 'تصميم المنتجات الرقمية من البداية إلى النهاية.', slug: 'product-designer', ...MAD(11000, 24000), niveauAccessibilite: 'Sélectif', description: 'Design de produits digitaux end-to-end.' },
      { id: 'mm_des_2', nom: 'UX Researcher', nomArabe: 'باحث تجربة مستخدم', descriptionAr: 'بحث المستخدمين والاختبارات ورؤى التصميم.', slug: 'ux-researcher', ...MAD(10000, 22000), niveauAccessibilite: 'Sélectif', description: 'Recherche utilisateurs, tests, insights.' },
      { id: 'mm_des_3', nom: 'Motion / 3D Designer', nomArabe: 'مصمم موشن / ثلاثي الأبعاد', descriptionAr: 'الرسوم المتحركة والثلاثي الأبعاد والمحتويات الغامرة.', slug: 'motion-3d-designer', ...MAD(9000, 20000), niveauAccessibilite: 'Accessible', description: 'Animation, 3D, contenus immersifs.' },
      { id: 'mm_des_4', nom: 'Directeur Artistique Junior', nomArabe: 'مدير فني مبتدئ', descriptionAr: 'الإدارة الإبداعية للحملات والهويات.', slug: 'directeur-artistique', ...MAD(10000, 22000), niveauAccessibilite: 'Sélectif', description: 'Direction créative campagnes et identités.' },
      { id: 'mm_des_5', nom: 'Designer d’Espace / Intérieur', nomArabe: 'مصمم فضاءات / داخلي', descriptionAr: 'التأثيث والتجزئة والضيافة.', slug: 'designer-interieur', ...MAD(8000, 18000), niveauAccessibilite: 'Accessible', description: 'Aménagement, retail, hospitality.' },
      { id: 'mm_des_6', nom: 'Game / Interactive Designer', nomArabe: 'مصمم ألعاب / تفاعلي', descriptionAr: 'الألعاب والتجارب التفاعلية والألعاب الجادة.', slug: 'game-designer', ...MAD(9000, 20000), niveauAccessibilite: 'Sélectif', description: 'Jeux, expériences interactives, serious games.' },
      { id: 'mm_des_7', nom: 'Designer Produit Industriel', nomArabe: 'مصمم منتج صناعي', descriptionAr: 'الأغراض والتغليف والتصميم البيئي.', slug: 'designer-produit', ...MAD(9000, 20000), niveauAccessibilite: 'Sélectif', description: 'Objets, packaging, éco-conception.' },
      { id: 'mm_des_8', nom: 'Créateur de Contenu / Creator', nomArabe: 'صانع محتوى', descriptionAr: 'الفيديو والبودكاست والتأثير والعلامات التجارية.', slug: 'content-creator', ...MAD(7000, 25000), niveauAccessibilite: 'Variable', description: 'Vidéo, podcast, influence, brands.' },
    ],
  },
  {
    key: 'sante',
    titre: 'Santé',
    titreAr: 'الصحة',
    match: ['santé', 'sante', 'médic', 'medic', 'soin', 'pharma', 'bioméd', 'biomed', 'paraméd', 'paramed'],
    metiers: [
      { id: 'mm_san_1', nom: 'Médecin (parcours)', nomArabe: 'طبيب (مسار)', descriptionAr: 'الرعاية والتشخيص والتخصص طويل الأمد.', slug: 'medecin', ...MAD(15000, 40000), niveauAccessibilite: 'Très sélectif', description: 'Soins, diagnostic, spécialisation longue.' },
      { id: 'mm_san_2', nom: 'Pharmacien / Pharmacien d’officine', nomArabe: 'صيدلي / صيدلية', descriptionAr: 'استشارة الأدوية والصحة العمومية.', slug: 'pharmacien', ...MAD(12000, 25000), niveauAccessibilite: 'Sélectif', description: 'Conseil médicaments, santé publique.' },
      { id: 'mm_san_3', nom: 'Infirmier(ère) spécialisé(e)', nomArabe: 'ممرض(ة) متخصص(ة)', descriptionAr: 'الرعاية والطوارئ والتخصصات شبه الطبية.', slug: 'infirmier-specialise', ...MAD(7000, 14000), niveauAccessibilite: 'Accessible', description: 'Soins, urgences, spécialisations.' },
      { id: 'mm_san_4', nom: 'Data Health / e-Santé Analyst', nomArabe: 'محلل بيانات صحية / صحة رقمية', descriptionAr: 'بيانات الصحة وملفات المرضى والذكاء الاصطناعي الصحي.', slug: 'data-health', ...MAD(12000, 24000), niveauAccessibilite: 'Sélectif', description: 'Données de santé, dossiers patients, IA santé.' },
      { id: 'mm_san_5', nom: 'Ingénieur Biomédical', nomArabe: 'مهندس طب حيوي', descriptionAr: 'المعدات الطبية والابتكار الاستشفائي.', slug: 'ingenieur-biomedical', ...MAD(11000, 22000), niveauAccessibilite: 'Sélectif', description: 'Équipements médicaux, innovation hospitalière.' },
      { id: 'mm_san_6', nom: 'Kinésithérapeute', nomArabe: 'أخصائي علاج فيزيائي', descriptionAr: 'إعادة التأهيل والوقاية والرياضة والصحة.', slug: 'kinesitherapeute', ...MAD(8000, 18000), niveauAccessibilite: 'Sélectif', description: 'Rééducation, prévention, sport-santé.' },
      { id: 'mm_san_7', nom: 'Psychologue clinicien / du travail', nomArabe: 'أخصائي نفسي سريري / عمل', descriptionAr: 'المرافقة النفسية وجودة الحياة في العمل.', slug: 'psychologue', ...MAD(8000, 18000), niveauAccessibilite: 'Sélectif', description: 'Accompagnement psychologique, QVT.' },
      { id: 'mm_san_8', nom: 'Responsable Qualité Pharma', nomArabe: 'مسؤول جودة صيدلانية', descriptionAr: 'ممارسات التصنيع الجيدة والامتثال وصناعات الصحة.', slug: 'qualite-pharma', ...MAD(11000, 23000), niveauAccessibilite: 'Sélectif', description: 'BPF, conformité, industries de santé.' },
    ],
  },
  {
    key: 'edu',
    titre: 'Éducation et formation',
    titreAr: 'التعليم والتكوين',
    match: ['éduc', 'educ', 'formation', 'enseignement', 'pédagog', 'pedagog', 'rh ', 'ressources humaines'],
    metiers: [
      { id: 'mm_edu_1', nom: 'Enseignant / Formateur', nomArabe: 'أستاذ / مكوّن', descriptionAr: 'نقل المعرفة والبيداغوجيا ومتابعة المتعلمين.', slug: 'enseignant-formateur', ...MAD(7000, 16000), niveauAccessibilite: 'Accessible', description: 'Transmission, pédagogie, suivi élèves.' },
      { id: 'mm_edu_2', nom: 'Instructional Designer (EdTech)', nomArabe: 'مصمم تعليمي (EdTech)', descriptionAr: 'مسارات التعلم الإلكتروني ومنصات LMS وهندسة التعليم.', slug: 'instructional-designer', ...MAD(9000, 20000), niveauAccessibilite: 'Accessible', description: 'Parcours e-learning, LMS, ingénierie pédagogique.' },
      { id: 'mm_edu_3', nom: 'Conseiller d’Orientation', nomArabe: 'مستشار توجيه', descriptionAr: 'مرافقة مشاريع الدراسة والمسيرة المهنية.', slug: 'conseiller-orientation', ...MAD(8000, 16000), niveauAccessibilite: 'Accessible', description: 'Accompagnement projets d’études et de carrière.' },
      { id: 'mm_edu_4', nom: 'Responsable Formation Entreprise', nomArabe: 'مسؤول تكوين في المقاولة', descriptionAr: 'خطط التكوين والكفاءات والتعلم والتطوير.', slug: 'responsable-formation', ...MAD(10000, 22000), niveauAccessibilite: 'Accessible', description: 'Plans de formation, compétences, L&D.' },
      { id: 'mm_edu_5', nom: 'Product Manager EdTech', nomArabe: 'مدير منتج تعليمي', descriptionAr: 'المنتجات التعليمية الرقمية.', slug: 'pm-edtech', ...MAD(12000, 25000), niveauAccessibilite: 'Sélectif', description: 'Produits éducatifs numériques.' },
      { id: 'mm_edu_6', nom: 'Coach / Mentor académique', nomArabe: 'مدرب / مرشد أكاديمي', descriptionAr: 'مرافقة النجاح الدراسي والقبول.', slug: 'coach-academique', ...MAD(8000, 20000), niveauAccessibilite: 'Variable', description: 'Accompagnement réussite scolaire / admissions.' },
      { id: 'mm_edu_7', nom: 'Chargé de Mission Éducation', nomArabe: 'مكلف بمهمة تربوية', descriptionAr: 'مشاريع تربوية وجمعيات ومؤسسات.', slug: 'charge-mission-education', ...MAD(9000, 18000), niveauAccessibilite: 'Accessible', description: 'Projets éducatifs, associations, institutions.' },
      { id: 'mm_edu_8', nom: 'Talent Acquisition Specialist', nomArabe: 'أخصائي استقطاب مواهب', descriptionAr: 'التوظيف الحديث والبحث عن المرشحين والعلامة الموظفة.', slug: 'talent-acquisition', ...MAD(10000, 22000), niveauAccessibilite: 'Accessible', description: 'Recrutement moderne, sourcing, marque employeur.' },
    ],
  },
  {
    key: 'droit',
    titre: 'Droit et justice',
    titreAr: 'القانون والعدالة',
    match: ['droit', 'juridique', 'loi', 'notariat', 'avocat'],
    metiers: [
      { id: 'mm_dro_1', nom: 'Juriste d’entreprise', nomArabe: 'مستشار قانوني للمقاولة', descriptionAr: 'العقود والامتثال والاستشارة القانونية الداخلية.', slug: 'juriste-entreprise', ...MAD(11000, 24000), niveauAccessibilite: 'Sélectif', description: 'Contrats, conformité, conseil interne.' },
      { id: 'mm_dro_2', nom: 'Avocat (parcours)', nomArabe: 'محامٍ (مسار)', descriptionAr: 'الاستشارة والتقاضي.', slug: 'avocat', ...MAD(10000, 35000), niveauAccessibilite: 'Exigeant', description: 'Conseil et contentieux.' },
      { id: 'mm_dro_3', nom: 'Compliance / Legal Tech', nomArabe: 'امتثال / تكنولوجيا قانونية', descriptionAr: 'القانون وأدوات الامتثال الرقمية.', slug: 'legal-tech', ...MAD(12000, 25000), niveauAccessibilite: 'Sélectif', description: 'Droit + outils digitaux de conformité.' },
      { id: 'mm_dro_4', nom: 'Notaire / Collaborateur notarial', nomArabe: 'موثق / مساعد موثق', descriptionAr: 'العقود والعقار والذمة المالية.', slug: 'notaire', ...MAD(10000, 28000), niveauAccessibilite: 'Exigeant', description: 'Actes, immobilier, patrimoine.' },
      { id: 'mm_dro_5', nom: 'Juriste Droit du Numérique', nomArabe: 'مستشار قانون رقمي', descriptionAr: 'حماية البيانات والتجارة الإلكترونية والملكية الفكرية.', slug: 'juriste-numerique', ...MAD(12000, 26000), niveauAccessibilite: 'Sélectif', description: 'RGPD, e-commerce, propriété intellectuelle.' },
      { id: 'mm_dro_6', nom: 'Chargé de Contentieux', nomArabe: 'مكلف بالمنازعات', descriptionAr: 'النزاعات والملفات والإجراءات.', slug: 'charge-contentieux', ...MAD(10000, 20000), niveauAccessibilite: 'Accessible', description: 'Litiges, dossiers, procédures.' },
      { id: 'mm_dro_7', nom: 'Contract Manager', nomArabe: 'مدير عقود', descriptionAr: 'التفاوض ودورة حياة العقود.', slug: 'contract-manager', ...MAD(12000, 24000), niveauAccessibilite: 'Sélectif', description: 'Négociation et cycle de vie des contrats.' },
      { id: 'mm_dro_8', nom: 'Conseiller Fiscal', nomArabe: 'مستشار جبائي', descriptionAr: 'التحسين والامتثال الجبائي.', slug: 'conseiller-fiscal', ...MAD(11000, 24000), niveauAccessibilite: 'Sélectif', description: 'Optimisation et conformité fiscale.' },
    ],
  },
  {
    key: 'default',
    titre: 'Métiers transverses',
    titreAr: 'مهن متعددة القطاعات',
    match: [],
    metiers: [
      { id: 'mm_def_1', nom: 'Chef de Projet', nomArabe: 'رئيس مشروع', descriptionAr: 'تنسيق الفرق والتخطيط والمخرجات.', slug: 'chef-de-projet', ...MAD(11000, 23000), niveauAccessibilite: 'Accessible', description: 'Coordination d’équipes et livrables.' },
      { id: 'mm_def_2', nom: 'Analyste Métier', nomArabe: 'محلل مهني', descriptionAr: 'فهم الاحتياجات واقتراح الحلول.', slug: 'analyste-metier', ...MAD(10000, 22000), niveauAccessibilite: 'Accessible', description: 'Comprendre besoins et proposer des solutions.' },
      { id: 'mm_def_3', nom: 'Responsable Opérations', nomArabe: 'مسؤول عمليات', descriptionAr: 'الكفاءة التشغيلية اليومية.', slug: 'responsable-operations', ...MAD(11000, 24000), niveauAccessibilite: 'Accessible', description: 'Efficacité opérationnelle au quotidien.' },
      { id: 'mm_def_4', nom: 'Commercial B2B / Account Manager', nomArabe: 'تجاري B2B / مدير حسابات', descriptionAr: 'البيع العلائقي وتطوير العملاء.', slug: 'account-manager', ...MAD(9000, 25000), niveauAccessibilite: 'Accessible', description: 'Vente relationnelle et développement clients.' },
      { id: 'mm_def_5', nom: 'Community / Partnership Manager', nomArabe: 'مدير مجتمع / شراكات', descriptionAr: 'الشراكات والشبكات والظهور.', slug: 'partnership-manager', ...MAD(8000, 18000), niveauAccessibilite: 'Accessible', description: 'Partenariats, réseaux, visibilité.' },
      { id: 'mm_def_6', nom: 'Entrepreneur Social', nomArabe: 'رائد أعمال اجتماعي', descriptionAr: 'مشاريع ذات أثر اقتصادي واجتماعي.', slug: 'entrepreneur-social', ...MAD(0, 30000), niveauAccessibilite: 'Variable', description: 'Projets à impact économique et social.' },
      { id: 'mm_def_7', nom: 'Consultant Junior', nomArabe: 'استشاري مبتدئ', descriptionAr: 'مهام استشارية متعددة القطاعات.', slug: 'consultant-junior', ...MAD(10000, 20000), niveauAccessibilite: 'Accessible', description: 'Missions conseil multi-secteurs.' },
      { id: 'mm_def_8', nom: 'Chargé d’Études', nomArabe: 'مكلف بالدراسات', descriptionAr: 'البحث والتلخيص والتوصيات.', slug: 'charge-etudes', ...MAD(9000, 18000), niveauAccessibilite: 'Accessible', description: 'Recherche, synthèse, recommandations.' },
    ],
  },
];

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function matchModernFamily(secteurTitre: string, code?: string): ModernSectorFamily {
  const hay = `${norm(secteurTitre)} ${norm(code || '')}`;
  for (const fam of MODERN_SECTOR_METIERS) {
    if (fam.key === 'default') continue;
    if (fam.match.some((m) => hay.includes(norm(m)))) return fam;
  }
  return MODERN_SECTOR_METIERS.find((f) => f.key === 'default')!;
}

/** Retrouve le couple FR + AR d’un métier du catalogue, même si le libellé stocké n’a qu’une langue. */
export function findModernMetierName(
  id: string,
  label: string,
): { nom: string; nomArabe: string; secteurTitre: string; secteurTitreAr: string } | null {
  const raw = label.trim();
  const splitAt = raw.indexOf(' · ');
  const frPart = splitAt > 0 ? raw.slice(0, splitAt).trim() : raw;
  const arPart = splitAt > 0 ? raw.slice(splitAt + 3).trim() : raw;
  const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();
  for (const fam of MODERN_SECTOR_METIERS) {
    for (const m of fam.metiers) {
      const idHit = id === m.id || id.startsWith(`${m.id}_`);
      const nameHit =
        same(m.nom, frPart) ||
        same(m.nomArabe, arPart) ||
        same(m.nom, raw) ||
        same(m.nomArabe, raw);
      if (idHit || nameHit) {
        return {
          nom: m.nom,
          nomArabe: m.nomArabe,
          secteurTitre: fam.titre,
          secteurTitreAr: fam.titreAr,
        };
      }
    }
  }
  return null;
}

/** 7–10 métiers modernes pour un secteur (titre API). */
export function modernMetiersForSecteur(
  secteurId: string | number,
  titre: string,
  code?: string,
  count = 9,
): Array<ModernMetierSeed & { secteurId: string }> {
  const fam = matchModernFamily(titre, code);
  const n = Math.min(10, Math.max(7, count));
  return fam.metiers.slice(0, n).map((m) => ({
    ...m,
    id: `${m.id}_s${secteurId}`,
    secteurId: String(secteurId),
  }));
}
