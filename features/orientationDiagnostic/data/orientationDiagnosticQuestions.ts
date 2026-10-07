import { SALARY_OPTIONS } from './orientationDiagnosticCatalog';
import type { DiagnosticStep, ModuleId } from '../types/orientationDiagnosticPrototype';

export const MODULE_META: Record<
  ModuleId,
  { label: string; short: string; duration: string; objective: string }
> = {
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
};

const RIASEC_OPTIONS = [
  { id: '1', label: 'Pas du tout' },
  { id: '2', label: 'Peu' },
  { id: '3', label: 'Moyennement' },
  { id: '4', label: 'Beaucoup' },
  { id: '5', label: 'Énormément' },
];

const ROLE_OPTIONS = [
  { id: 'R', label: 'Installer le matériel / aspects techniques', riasec: 'R' as const },
  { id: 'I', label: 'Analyser les données pour améliorer', riasec: 'I' as const },
  { id: 'A', label: 'Créer l’identité visuelle / contenus', riasec: 'A' as const },
  { id: 'S', label: 'Accueillir et accompagner les personnes', riasec: 'S' as const },
  { id: 'E', label: 'Convaincre partenaires / sponsors', riasec: 'E' as const },
  { id: 'C', label: 'Organiser planning, listes, inscriptions', riasec: 'C' as const },
];

export const ORIENTATION_DIAGNOSTIC_STEPS: DiagnosticStep[] = [
  // ——— Module 0 — Profil (ancien personalInfo) ———
  {
    id: 'prof_identity',
    module: 'profile',
    kind: 'profile_identity',
    title: 'Tes informations personnelles',
    subtitle: 'Prénom, nom, date de naissance, téléphone et ville — comme dans l’ancien test.',
  },
  {
    id: 'prof_school',
    module: 'profile',
    kind: 'profile_school',
    title: 'Ton parcours scolaire',
    subtitle: 'Niveau, type de bac, filière / spécialités et année — données utilisées pour la faisabilité.',
  },
  {
    id: 'prof_grades',
    module: 'profile',
    kind: 'profile_grades',
    title: 'Tes notes académiques',
    subtitle: 'Notes réelles ou estimation (selon disponibilité), comme dans l’étape personalInfo.',
  },

  // ——— Module 1 — Contexte orientation ———
  {
    id: 'ctx_maturite',
    module: 'context',
    kind: 'single',
    title: 'Aujourd’hui, où en es-tu concernant ton orientation ?',
    subtitle: 'Cette réponse influence le diagnostic de clarté du projet.',
    options: [
      { id: 'exact', label: 'Je sais exactement ce que je veux faire', value: 92 },
      { id: 'hesite', label: 'J’ai 2 ou 3 idées mais j’hésite', value: 68 },
      { id: 'idee', label: 'J’ai une idée mais je ne suis pas sûr(e)', value: 52 },
      { id: 'indecis', label: 'Je suis complètement indécis(e)', value: 28 },
      { id: 'refus', label: 'Je sais surtout ce que je ne veux pas faire', value: 40 },
    ],
  },
  {
    id: 'ctx_connaissance_metiers',
    module: 'context',
    kind: 'single',
    title: 'À quel point connais-tu concrètement les métiers qui t’intéressent ?',
    options: [
      { id: '0', label: 'Très peu — je n’ai pas encore exploré', value: 20 },
      { id: '1', label: 'Un peu — j’ai lu ou entendu parler', value: 40 },
      { id: '2', label: 'Moyennement — j’ai quelques exemples clairs', value: 60 },
      { id: '3', label: 'Bien — j’ai rencontré des pro ou fait des recherches', value: 80 },
      { id: '4', label: 'Très bien — j’ai une vision réaliste du quotidien', value: 95 },
    ],
  },
  {
    id: 'ctx_connaissance_formations',
    module: 'context',
    kind: 'single',
    title: 'À quel point connais-tu les formations / écoles possibles au Maroc (ou à l’étranger) ?',
    options: [
      { id: '0', label: 'Très peu', value: 22 },
      { id: '1', label: 'Un peu', value: 42 },
      { id: '2', label: 'Moyennement', value: 62 },
      { id: '3', label: 'Bien', value: 82 },
      { id: '4', label: 'Très bien', value: 95 },
    ],
  },

  // ——— Module 2 RIASEC (lettres jamais affichées) ———
  {
    id: 'r1',
    module: 'riasec',
    kind: 'likert',
    riasecDim: 'R',
    title: 'J’aime comprendre comment fonctionnent les machines, les appareils ou les systèmes techniques.',
    options: RIASEC_OPTIONS,
  },
  {
    id: 'r2',
    module: 'riasec',
    kind: 'likert',
    riasecDim: 'R',
    title: 'Je préfère réaliser quelque chose de concret plutôt que discuter longuement d’une idée.',
    options: RIASEC_OPTIONS,
  },
  {
    id: 'r3',
    module: 'riasec',
    kind: 'likert',
    riasecDim: 'R',
    title: 'Les activités où je peux construire, manipuler, réparer ou expérimenter m’intéressent.',
    options: RIASEC_OPTIONS,
  },
  {
    id: 'i1',
    module: 'riasec',
    kind: 'likert',
    riasecDim: 'I',
    title: 'Quand quelque chose m’intrigue, j’aime chercher pourquoi et comment cela fonctionne.',
    options: RIASEC_OPTIONS,
  },
  {
    id: 'i2',
    module: 'riasec',
    kind: 'likert',
    riasecDim: 'I',
    title: 'Les problèmes difficiles que je dois analyser me motivent.',
    options: RIASEC_OPTIONS,
  },
  {
    id: 'i3',
    module: 'riasec',
    kind: 'likert',
    riasecDim: 'I',
    title: 'J’aime comprendre des phénomènes scientifiques, économiques, technologiques ou humains.',
    options: RIASEC_OPTIONS,
  },
  {
    id: 'a1',
    module: 'riasec',
    kind: 'likert',
    riasecDim: 'A',
    title: 'J’aime imaginer de nouvelles idées ou créer quelque chose d’original.',
    options: RIASEC_OPTIONS,
  },
  {
    id: 'a2',
    module: 'riasec',
    kind: 'likert',
    riasecDim: 'A',
    title: 'Je préfère avoir une certaine liberté plutôt que suivre exactement une méthode imposée.',
    options: RIASEC_OPTIONS,
  },
  {
    id: 'a3',
    module: 'riasec',
    kind: 'likert',
    riasecDim: 'A',
    title: 'Les domaines liés au design, à l’écriture, à la création ou à l’expression m’attirent.',
    options: RIASEC_OPTIONS,
  },
  {
    id: 's1',
    module: 'riasec',
    kind: 'likert',
    riasecDim: 'S',
    title: 'J’aime expliquer quelque chose à une personne qui ne comprend pas.',
    options: RIASEC_OPTIONS,
  },
  {
    id: 's2',
    module: 'riasec',
    kind: 'likert',
    riasecDim: 'S',
    title: 'Je me sens utile lorsque je peux conseiller, accompagner ou aider quelqu’un.',
    options: RIASEC_OPTIONS,
  },
  {
    id: 's3',
    module: 'riasec',
    kind: 'likert',
    riasecDim: 'S',
    title: 'J’apprécie les activités impliquant beaucoup de relations humaines.',
    options: RIASEC_OPTIONS,
  },
  {
    id: 'e1',
    module: 'riasec',
    kind: 'likert',
    riasecDim: 'E',
    title: 'J’aime convaincre les autres de soutenir une idée ou un projet.',
    options: RIASEC_OPTIONS,
  },
  {
    id: 'e2',
    module: 'riasec',
    kind: 'likert',
    riasecDim: 'E',
    title: 'Je pourrais aimer diriger une équipe ou prendre des responsabilités.',
    options: RIASEC_OPTIONS,
  },
  {
    id: 'e3',
    module: 'riasec',
    kind: 'likert',
    riasecDim: 'E',
    title: 'L’idée de développer un projet ou une entreprise m’attire.',
    options: RIASEC_OPTIONS,
  },
  {
    id: 'c1',
    module: 'riasec',
    kind: 'likert',
    riasecDim: 'C',
    title: 'J’aime lorsque les choses sont organisées et clairement structurées.',
    options: RIASEC_OPTIONS,
  },
  {
    id: 'c2',
    module: 'riasec',
    kind: 'likert',
    riasecDim: 'C',
    title: 'Je suis plutôt à l’aise avec les informations précises, les données ou les chiffres.',
    options: RIASEC_OPTIONS,
  },
  {
    id: 'c3',
    module: 'riasec',
    kind: 'likert',
    riasecDim: 'C',
    title: 'Je préfère généralement savoir clairement ce que l’on attend de moi.',
    options: RIASEC_OPTIONS,
  },

  // ——— Module 3 situations ———
  {
    id: 'sit_lycee',
    module: 'situations',
    kind: 'situation',
    title: 'Ton lycée organise un événement important. Quels rôles te correspondent ?',
    subtitle: 'Tu choisiras d’abord le PLUS, puis le MOINS — sur deux écrans séparés.',
    options: ROLE_OPTIONS,
  },
  {
    id: 'sit_app',
    module: 'situations',
    kind: 'situation',
    title: 'Des amis veulent lancer une application mobile. Que voudrais-tu principalement faire ?',
    options: [
      { id: 'R', label: 'Comprendre et développer le fonctionnement technique', riasec: 'R' },
      { id: 'I', label: 'Étudier le problème des utilisateurs', riasec: 'I' },
      { id: 'A', label: 'Concevoir l’identité et l’expérience visuelle', riasec: 'A' },
      { id: 'S', label: 'Échanger avec les utilisateurs et les accompagner', riasec: 'S' },
      { id: 'E', label: 'Présenter le projet et convaincre des investisseurs', riasec: 'E' },
      { id: 'C', label: 'Organiser le budget, les tâches et le calendrier', riasec: 'C' },
    ],
  },
  {
    id: 'sit_probleme',
    module: 'situations',
    kind: 'situation',
    title: 'Dans une organisation, quelque chose ne fonctionne plus. Ta première réaction ?',
    options: [
      { id: 'R', label: 'Regarder directement le fonctionnement concret', riasec: 'R' },
      { id: 'I', label: 'Chercher les causes du problème', riasec: 'I' },
      { id: 'A', label: 'Imaginer une autre manière de faire', riasec: 'A' },
      { id: 'S', label: 'Interroger les personnes concernées', riasec: 'S' },
      { id: 'E', label: 'Réunir les personnes et pousser vers une décision', riasec: 'E' },
      { id: 'C', label: 'Examiner les procédures et les informations existantes', riasec: 'C' },
    ],
  },
  {
    id: 'sit_asso',
    module: 'situations',
    kind: 'situation',
    title: 'Tu rejoins une association étudiante. Où te placerais-tu naturellement ?',
    options: [
      { id: 'R', label: 'Gérer logistique, matériel, lieux', riasec: 'R' },
      { id: 'I', label: 'Évaluer l’impact et analyser les résultats', riasec: 'I' },
      { id: 'A', label: 'Créer les campagnes et contenus', riasec: 'A' },
      { id: 'S', label: 'Animer, former, accompagner les membres', riasec: 'S' },
      { id: 'E', label: 'Négocier partenariats et lever des fonds', riasec: 'E' },
      { id: 'C', label: 'Tenir le planning, budgets et reporting', riasec: 'C' },
    ],
  },
  {
    id: 'sit_libre',
    module: 'situations',
    kind: 'situation',
    title: 'Après-midi libre pour un projet perso. Qu’est-ce qui t’attire le plus / le moins ?',
    options: [
      { id: 'R', label: 'Bricoler, prototyper, tester un objet / setup', riasec: 'R' },
      { id: 'I', label: 'Approfondir un sujet complexe (doc, data, science)', riasec: 'I' },
      { id: 'A', label: 'Créer (design, écriture, vidéo, musique…)', riasec: 'A' },
      { id: 'S', label: 'Aider / former quelqu’un', riasec: 'S' },
      { id: 'E', label: 'Lancer une idée et convaincre autour de soi', riasec: 'E' },
      { id: 'C', label: 'Mettre de l’ordre : plans, fichiers, organisation', riasec: 'C' },
    ],
  },
  {
    id: 'sit_mission',
    module: 'situations',
    kind: 'situation',
    title: 'Première mission professionnelle (stage). Quelle contribution te motive le plus / le moins ?',
    options: [
      { id: 'R', label: 'Mise en œuvre concrète sur le terrain / outil', riasec: 'R' },
      { id: 'I', label: 'Étude, recherche, diagnostic', riasec: 'I' },
      { id: 'A', label: 'Conception créative d’une solution', riasec: 'A' },
      { id: 'S', label: 'Relation client / accompagnement', riasec: 'S' },
      { id: 'E', label: 'Pitch, vente, développement commercial', riasec: 'E' },
      { id: 'C', label: 'Suivi process, qualité, reporting', riasec: 'C' },
    ],
  },

  // ——— Module 4 fonctionnement ———
  {
    id: 'fn_structure',
    module: 'functioning',
    kind: 'single',
    title: 'Pour travailler efficacement, je préfère…',
    options: [
      { id: 'a', label: 'Savoir précisément ce que je dois faire', value: 15 },
      { id: 'b', label: 'Avoir un objectif mais choisir moi-même comment l’atteindre', value: 85 },
    ],
  },
  {
    id: 'fn_collectif',
    module: 'functioning',
    kind: 'single',
    title: 'Sur un projet important, je préfère…',
    options: [
      { id: '1', label: 'Travailler principalement seul', value: 10 },
      { id: '2', label: 'Travailler seul avec quelques échanges', value: 30 },
      { id: '3', label: 'Alterner seul / groupe', value: 55 },
      { id: '4', label: 'Travailler avec plusieurs personnes', value: 75 },
      { id: '5', label: 'Être constamment entouré', value: 95 },
    ],
  },
  {
    id: 'fn_theorie',
    module: 'functioning',
    kind: 'single',
    title: 'Quand j’apprends quelque chose de nouveau, je préfère…',
    options: [
      { id: '1', label: 'Comprendre d’abord toute la théorie', value: 10 },
      { id: '2', label: 'Comprendre les principes principaux', value: 30 },
      { id: '3', label: 'Alterner théorie et exercices', value: 55 },
      { id: '4', label: 'Expérimenter rapidement', value: 75 },
      { id: '5', label: 'Apprendre principalement en pratiquant', value: 95 },
    ],
  },
  {
    id: 'fn_nouveaute',
    module: 'functioning',
    kind: 'dilemma',
    title: 'Quel environnement te correspond le mieux ?',
    subtitle: 'Choisis clairement l’option qui te parle le plus.',
    leftLabel: 'Prévisible, stable, organisé',
    rightLabel: 'Changeant, dynamique, avec de nouveaux défis',
  },
  {
    id: 'fn_reflexion',
    module: 'functioning',
    kind: 'single',
    title: 'Face à une décision importante…',
    options: [
      { id: '1', label: 'Je prends beaucoup de temps pour analyser', value: 10 },
      { id: '2', label: 'J’analyse avant de décider', value: 30 },
      { id: '3', label: 'Cela dépend', value: 50 },
      { id: '4', label: 'Je décide assez rapidement', value: 75 },
      { id: '5', label: 'Je préfère agir et ajuster ensuite', value: 95 },
    ],
  },
  {
    id: 'fn_incertitude',
    module: 'functioning',
    kind: 'likert',
    title: 'Un métier dont les missions changent régulièrement…',
    options: [
      { id: '1', label: 'Me stresserait beaucoup' },
      { id: '2', label: 'Me mettrait mal à l’aise' },
      { id: '3', label: 'Me conviendrait moyennement' },
      { id: '4', label: 'Me stimulerait' },
      { id: '5', label: 'Me motiverait fortement' },
    ],
  },
  {
    id: 'fn_leadership',
    module: 'functioning',
    kind: 'single',
    title: 'Dans un travail de groupe, spontanément…',
    options: [
      { id: '1', label: 'Je préfère recevoir une mission', value: 15 },
      { id: '2', label: 'Je contribue sans diriger', value: 35 },
      { id: '3', label: 'Cela dépend', value: 50 },
      { id: '4', label: 'Je coordonne souvent', value: 75 },
      { id: '5', label: 'Je prends naturellement le leadership', value: 95 },
    ],
  },
  {
    id: 'fn_contact',
    module: 'functioning',
    kind: 'likert',
    title: 'Passer une grande partie de ma journée à interagir avec des personnes serait…',
    options: [
      { id: '1', label: 'Très fatigant' },
      { id: '2', label: 'Assez fatigant' },
      { id: '3', label: 'Neutre' },
      { id: '4', label: 'Assez stimulant' },
      { id: '5', label: 'Très stimulant' },
    ],
  },

  // ——— Module 5 ambitions ———
  {
    id: 'amb_top3',
    module: 'ambitions',
    kind: 'multi_max',
    maxSelect: 3,
    title: 'Dans ton futur professionnel, qu’est-ce qui sera le plus important ?',
    subtitle: 'Sélectionne exactement 3 moteurs.',
    options: [
      { id: 'remuneration', label: 'Avoir un revenu élevé' },
      { id: 'stabilite', label: 'Avoir une carrière stable' },
      { id: 'entrepreneuriat', label: 'Entreprendre ou créer mes propres projets' },
      { id: 'apprentissage', label: 'Continuer à apprendre' },
      { id: 'impact', label: 'Aider les autres / avoir un impact' },
      { id: 'international', label: 'Travailler à l’international' },
      { id: 'progression', label: 'Avoir des responsabilités et évoluer rapidement' },
      { id: 'equilibre', label: 'Équilibre travail / vie personnelle' },
    ],
  },
  {
    id: 'amb_priorite',
    module: 'ambitions',
    kind: 'single',
    title: 'Parmi tes 3 choix, lequel est le plus important ?',
    subtitle: 'Tu pourras sélectionner uniquement parmi tes 3 moteurs.',
    options: [], // rempli dynamiquement dans l’UI
  },
  {
    id: 'amb_entreprise',
    module: 'ambitions',
    kind: 'likert',
    title: 'Te vois-tu un jour créer ton entreprise ?',
    options: [
      { id: '1', label: 'Certainement pas' },
      { id: '2', label: 'Peu probable' },
      { id: '3', label: 'Peut-être' },
      { id: '4', label: 'Probable' },
      { id: '5', label: 'Certainement' },
    ],
  },
  {
    id: 'amb_niveau_etudes',
    module: 'ambitions',
    kind: 'single',
    title: 'Jusqu’à quel niveau d’études serais-tu prêt(e) à aller ?',
    options: [
      { id: 'bac2', label: 'Bac+2' },
      { id: 'bac3', label: 'Bac+3' },
      { id: 'bac5', label: 'Bac+5' },
      { id: 'bac8', label: 'Bac+8 / doctorat' },
      { id: 'peuimporte', label: 'Peu importe — selon le projet' },
    ],
  },
  {
    id: 'amb_etranger',
    module: 'ambitions',
    kind: 'likert',
    title: 'Travailler ou étudier à l’étranger t’intéresse-t-il ?',
    options: [
      { id: '1', label: 'Pas du tout' },
      { id: '2', label: 'Peu' },
      { id: '3', label: 'Moyennement' },
      { id: '4', label: 'Beaucoup' },
      { id: '5', label: 'C’est un objectif fort' },
    ],
  },
  {
    id: 'amb_confiance',
    module: 'ambitions',
    kind: 'likert',
    title: 'Aujourd’hui, à quel point as-tu confiance dans ta capacité à réussir ton projet d’études ?',
    options: [
      { id: '1', label: 'Très peu' },
      { id: '2', label: 'Peu' },
      { id: '3', label: 'Moyennement' },
      { id: '4', label: 'Beaucoup' },
      { id: '5', label: 'Énormément' },
    ],
  },

  // ——— Module 6 réalité + dilemmes ———
  {
    id: 'real_villes',
    module: 'reality',
    kind: 'cities',
    title: 'Dans quelles villes pourrais-tu étudier ?',
    subtitle:
      'Choisis les grandes villes, ou cherche une autre ville (2 lettres mini). « Peu importe » = flexible partout.',
    options: [
      { id: 'casa', label: 'Casablanca' },
      { id: 'rabat', label: 'Rabat' },
      { id: 'marrakech', label: 'Marrakech' },
      { id: 'tanger', label: 'Tanger' },
      { id: 'fes', label: 'Fès' },
      { id: 'autres', label: 'Autres villes du Maroc' },
      { id: 'peuimporte', label: 'Peu importe — partout au Maroc' },
    ],
  },
  {
    id: 'real_etranger',
    module: 'reality',
    kind: 'single',
    title: 'Étudier à l’étranger est…',
    options: [
      { id: '1', label: 'Impossible actuellement', value: 10 },
      { id: '2', label: 'Difficile', value: 35 },
      { id: '3', label: 'Envisageable', value: 55 },
      { id: '4', label: 'Souhaité', value: 75 },
      { id: '5', label: 'Objectif prioritaire', value: 95 },
    ],
  },
  {
    id: 'real_budget',
    module: 'reality',
    kind: 'single',
    title: 'Budget annuel envisageable pour tes études (frais de scolarité) ?',
    subtitle: 'Si tu es mineur(e), tu peux indiquer l’ordre de grandeur familial.',
    options: [
      { id: 'public', label: 'Uniquement public / très faible' },
      { id: 'lt30', label: '< 30.000 DH' },
      { id: '30_60', label: '30.000–60.000 DH' },
      { id: '60_100', label: '60.000–100.000 DH' },
      { id: 'gt100', label: '> 100.000 DH' },
      { id: 'nsp', label: 'Je ne sais pas encore' },
    ],
  },
  {
    id: 'dil_stabilite',
    module: 'reality',
    kind: 'dilemma',
    title: 'Dilemme 1 — Quelle opportunité choisirais-tu ?',
    subtitle: 'Choisis clairement l’option qui te parle le plus.',
    leftLabel: 'Un métier stable, bien rémunéré, avec des missions prévisibles',
    rightLabel: 'Un métier plus risqué, créatif, avec beaucoup d’évolution',
  },
  {
    id: 'dil_passion',
    module: 'reality',
    kind: 'dilemma',
    title: 'Dilemme 2 — Quelle formation choisirais-tu ?',
    subtitle: 'Choisis clairement l’option qui te parle le plus.',
    leftLabel: 'Une formation qui me passionne, même si les débouchés sont incertains',
    rightLabel: 'Une formation moins passionnante, mais avec d’excellents débouchés',
  },
  {
    id: 'dil_rythme',
    module: 'reality',
    kind: 'dilemma',
    title: 'Dilemme 3 — Quel rythme te correspond ?',
    subtitle: 'Choisis clairement l’option qui te parle le plus.',
    leftLabel: 'Un parcours sécurisé, avec des étapes claires et peu de surprises',
    rightLabel: 'Un parcours ambitieux, compétitif et intense',
  },

  // ——— Module secteurs & métiers (dynamiques API) ———
  {
    id: 'car_secteurs',
    module: 'careers',
    kind: 'dynamic_sectors',
    maxSelect: 7,
    title: 'Quels secteurs t’intéressent le plus ?',
    subtitle: 'Sélectionne jusqu’à 7 secteurs (liste live E-TAWJIHI).',
  },
  /**
   * Placeholder remplacé à l’exécution par une étape par secteur sélectionné
   * (`buildOrientationCoreSteps` → `car_metiers__{secteurId}`, max 3 métiers / secteur).
   */
  {
    id: 'car_metiers',
    module: 'careers',
    kind: 'dynamic_metiers',
    maxSelect: 3,
    title: 'Quels métiers voudrais-tu explorer ?',
    subtitle: 'Une page par secteur — jusqu’à 3 métiers par secteur.',
  },
  {
    id: 'car_salaire',
    module: 'careers',
    kind: 'single',
    title: 'Quel salaire de début de carrière viserais-tu ?',
    subtitle: 'Ordre de grandeur mensuel net, au Maroc — ce n’est pas un engagement.',
    options: SALARY_OPTIONS.map((s) => ({ id: s.id, label: s.label })),
  },

  // ——— Module écoles ———
  {
    id: 'sch_types',
    module: 'schools',
    kind: 'multi_max',
    minSelect: 1,
    maxSelect: 4,
    title: 'Quels types d’établissements t’attirent ?',
    subtitle: 'Sélectionne un ou plusieurs types — tu peux tout cocher.',
    options: [
      { id: 'public', label: 'Public' },
      { id: 'semi_public', label: 'Semi-public' },
      { id: 'prive', label: 'Privé' },
      { id: 'militaire', label: 'Militaire' },
    ],
  },
  {
    id: 'sch_ecoles',
    module: 'schools',
    kind: 'dynamic_schools',
    maxSelect: 15,
    title: 'Quelles écoles voudrais-tu garder dans ton radar ?',
    subtitle:
      'Une page par type d’établissement — sélectionne jusqu’à 8 écoles par type (max 15 au total).',
  },

  // Versus : étapes injectées dynamiquement (voir orientationDiagnosticVersus.ts)
];

/** Étapes fixes (sans Versus — les duels sont ajoutés au runtime). */
export const TOTAL_STEPS_BASE = ORIENTATION_DIAGNOSTIC_STEPS.length;

/** @deprecated utiliser quizSteps.length côté page (Versus dynamique) */
export const TOTAL_STEPS = TOTAL_STEPS_BASE;

/** Préfixe des étapes métiers (une par secteur). */
export const METIER_STEP_PREFIX = 'car_metiers__';
export const METIERS_PER_SECTOR_MAX = 3;

/** Préfixe des étapes écoles (une par type). */
export const SCHOOL_STEP_PREFIX = 'sch_ecoles__';
export const SCHOOLS_PER_TYPE_MAX = 8;
export const SCHOOLS_TOTAL_MAX = 15;

/** Ordre d’affichage des pages type. */
export const SCHOOL_TYPE_PAGE_ORDER = [
  { key: 'public', label: 'Public', match: 'Public' },
  { key: 'semi_public', label: 'Semi-public', match: 'Semi-Public' },
  { key: 'militaire', label: 'Militaire', match: 'Militaire' },
  { key: 'prive', label: 'Privé', match: 'Privé' },
] as const;

export type SchoolTypePageKey = (typeof SCHOOL_TYPE_PAGE_ORDER)[number]['key'];

export function metierStepIdForSector(sectorId: string): string {
  return `${METIER_STEP_PREFIX}${sectorId}`;
}

export function isMetierSectorStepId(stepId: string): boolean {
  return stepId.startsWith(METIER_STEP_PREFIX);
}

export function sectorIdFromMetierStepId(stepId: string): string | null {
  if (!isMetierSectorStepId(stepId)) return null;
  return stepId.slice(METIER_STEP_PREFIX.length) || null;
}

/** Une étape métiers par secteur sélectionné (max 3 choix chacune). */
export function buildMetierStepsForSectors(
  sectorIds: string[],
  labels: Record<string, string> = {},
): import('../types/orientationDiagnosticPrototype').DiagnosticStep[] {
  const total = sectorIds.length;
  return sectorIds.map((sid, index) => {
    const titre = labels[sid] || `Secteur ${index + 1}`;
    return {
      id: metierStepIdForSector(sid),
      module: 'careers' as const,
      kind: 'dynamic_metiers' as const,
      maxSelect: METIERS_PER_SECTOR_MAX,
      secteurId: sid,
      title: `Métiers · ${titre}`,
      subtitle: `Secteur ${index + 1} / ${total || 1} — sélectionne jusqu’à ${METIERS_PER_SECTOR_MAX} métiers (marché actuel, classés par salaire).`,
    };
  });
}

export function schoolStepIdForType(typeKey: string): string {
  return `${SCHOOL_STEP_PREFIX}${typeKey}`;
}

export function isSchoolTypeStepId(stepId: string): boolean {
  return stepId.startsWith(SCHOOL_STEP_PREFIX);
}

export function schoolTypeKeyFromStepId(stepId: string): string | null {
  if (!isSchoolTypeStepId(stepId)) return null;
  return stepId.slice(SCHOOL_STEP_PREFIX.length) || null;
}

/** Une étape écoles par type sélectionné (sch_types). */
export function buildSchoolStepsForTypes(
  typeKeys: string[],
): import('../types/orientationDiagnosticPrototype').DiagnosticStep[] {
  const ordered = SCHOOL_TYPE_PAGE_ORDER.filter((t) => typeKeys.includes(t.key));
  const total = ordered.length;
  return ordered.map((t, index) => ({
    id: schoolStepIdForType(t.key),
    module: 'schools' as const,
    kind: 'dynamic_schools' as const,
    maxSelect: SCHOOLS_PER_TYPE_MAX,
    schoolType: t.match,
    schoolTypeKey: t.key,
    title: `Écoles · ${t.label}`,
    subtitle: `Type ${index + 1} / ${total || 1} — jusqu’à ${SCHOOLS_PER_TYPE_MAX} établissements ${t.label.toLowerCase()} (max ${SCHOOLS_TOTAL_MAX} au total sur tous les types).`,
  }));
}

/**
 * Étapes du quiz hors Versus : remplace les placeholders
 * `car_metiers` (par secteur) et `sch_ecoles` (par type).
 */
export function buildOrientationCoreSteps(answers: {
  multi: Record<string, string[]>;
  labels?: Record<string, string>;
}): import('../types/orientationDiagnosticPrototype').DiagnosticStep[] {
  const sectorIds = answers.multi.car_secteurs ?? [];
  const schoolTypes = answers.multi.sch_types ?? [];
  const labels = answers.labels ?? {};
  const out: import('../types/orientationDiagnosticPrototype').DiagnosticStep[] = [];
  for (const step of ORIENTATION_DIAGNOSTIC_STEPS) {
    if (step.id === 'car_metiers') {
      if (sectorIds.length) {
        out.push(...buildMetierStepsForSectors(sectorIds, labels));
      } else {
        out.push({
          ...step,
          title: 'Métiers par secteur',
          subtitle: 'Sélectionne d’abord des secteurs à l’étape précédente.',
        });
      }
      continue;
    }
    if (step.id === 'sch_ecoles') {
      if (schoolTypes.length) {
        out.push(...buildSchoolStepsForTypes(schoolTypes));
      } else {
        out.push({
          ...step,
          title: 'Écoles par type',
          subtitle: 'Sélectionne d’abord au moins un type d’établissement à l’étape précédente.',
        });
      }
      continue;
    }
    out.push(step);
  }
  return out;
}

/** Agrège les métiers choisis sur toutes les pages secteurs (+ legacy `car_metiers`). */
export function flattenSelectedMetierIds(multi: Record<string, string[]>): string[] {
  const sectorKeys = Object.keys(multi)
    .filter((k) => k.startsWith(METIER_STEP_PREFIX))
    .sort();
  const source = sectorKeys.length
    ? sectorKeys.flatMap((k) => multi[k] ?? [])
    : multi.car_metiers ?? [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of source) {
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

/** Met à jour `car_metiers` agrégé + retire les clés des secteurs désélectionnés. */
export function syncMetierMultiKeys(
  multi: Record<string, string[]>,
  sectorIds: string[],
): Record<string, string[]> {
  const allowed = new Set(sectorIds.map((id) => metierStepIdForSector(id)));
  const next: Record<string, string[]> = { ...multi };
  for (const key of Object.keys(next)) {
    if (key.startsWith(METIER_STEP_PREFIX) && !allowed.has(key)) {
      delete next[key];
    }
  }
  next.car_metiers = flattenSelectedMetierIds(next);
  return next;
}

/** Agrège les écoles choisies sur toutes les pages type (+ legacy `sch_ecoles`). */
export function flattenSelectedEcoleIds(multi: Record<string, string[]>): string[] {
  const typeKeys = Object.keys(multi)
    .filter((k) => k.startsWith(SCHOOL_STEP_PREFIX))
    .sort();
  const source = typeKeys.length
    ? typeKeys.flatMap((k) => multi[k] ?? [])
    : multi.sch_ecoles ?? [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of source) {
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

/** Met à jour `sch_ecoles` agrégé + retire les clés des types désélectionnés. */
export function syncEcoleMultiKeys(
  multi: Record<string, string[]>,
  typeKeys: string[],
): Record<string, string[]> {
  const allowed = new Set(typeKeys.map((k) => schoolStepIdForType(k)));
  const next: Record<string, string[]> = { ...multi };
  for (const key of Object.keys(next)) {
    if (key.startsWith(SCHOOL_STEP_PREFIX) && !allowed.has(key)) {
      delete next[key];
    }
  }
  next.sch_ecoles = flattenSelectedEcoleIds(next);
  return next;
}

export const RIASEC_LABELS: Record<string, string> = {
  R: 'Réaliste',
  I: 'Investigateur',
  A: 'Artistique',
  S: 'Social',
  E: 'Entreprenant',
  C: 'Conventionnel',
};

export const AMBITION_LABELS: Record<string, string> = {
  remuneration: 'Rémunération',
  stabilite: 'Stabilité',
  entrepreneuriat: 'Entrepreneuriat',
  apprentissage: 'Apprentissage',
  impact: 'Impact / aide',
  international: 'International',
  progression: 'Progression',
  equilibre: 'Équilibre de vie',
};
