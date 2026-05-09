export type AppLocale = 'fr' | 'ar';

export type HomeCopyKey =
  | 'notifications'
  | 'unreadSuffix'
  | 'help'
  | 'profile'
  | 'greeting'
  | 'userSubtitle'
  | 'packStandardLabel'
  | 'bacMissionLabel'
  | 'newsTitle'
  | 'languageSwitcher'
  | 'langFr'
  | 'langAr'
  | 'gameDailyTitle'
  | 'gameDailyBody'
  | 'infoDailyTitle'
  | 'infoDailyBody'
  | 'practicalTitle'
  | 'practicalSubtitle'
  | 'practicalSectionA11y'
  | 'practical_ecoles'
  | 'practical_inscriptions'
  | 'practical_candidatures'
  | 'practical_testsOrientation'
  | 'practical_resultatsOrientation'
  | 'practical_ecolesInscription'
  | 'practical_boutique'
  | 'practical_ecoles_desc'
  | 'practical_inscriptions_desc'
  | 'practical_candidatures_desc'
  | 'practical_testsOrientation_desc'
  | 'practical_resultatsOrientation_desc'
  | 'practical_ecolesInscription_desc'
  | 'practical_boutique_desc'
  | 'practicalCardEyebrow'
  | 'practicalCardTap'
  | 'practicalCardA11y'
  | 'schoolsTitle'
  | 'schoolsFilters'
  | 'schoolsFiltersA11y'
  | 'schoolsSearchPlaceholder'
  | 'schoolsTypeAll'
  | 'schoolsTypeLabel'
  | 'schoolsTypePublic'
  | 'schoolsTypePrivate'
  | 'schoolsTypeSemiPublic'
  | 'schoolsTypeMilitary'
  | 'schoolsFiltersTitle'
  | 'schoolsFiltersHint'
  | 'schoolsUniversityLabel'
  | 'schoolsUniversityPlaceholder'
  | 'schoolsRegionLabel'
  | 'schoolsAll'
  | 'schoolsCityLabel'
  | 'schoolsAllCities'
  | 'schoolsSectorLabel'
  | 'schoolsAllSectors'
  | 'schoolsSectorPickTitle'
  | 'schoolsSectorSearchPlaceholder'
  | 'schoolsSectorNoResults'
  | 'schoolsDiplomaLabel'
  | 'schoolsAllDiplomas'
  | 'schoolsFeesLabel'
  | 'schoolsMin'
  | 'schoolsMax'
  | 'schoolsToggleRecommended'
  | 'schoolsToggleSponsored'
  | 'schoolsToggleFeatured'
  | 'schoolsToggleAccreditationEtat'
  | 'schoolsToggleExchangeInternational'
  | 'schoolsToggleEtawjihiOnly'
  | 'schoolsFootnote'
  | 'schoolsReset'
  | 'schoolsApply'
  | 'schoolsRetry'
  | 'schoolsClearFilter'
  | 'schoolsErrorNetwork'
  | 'planOffersTitle'
  | 'planOffersLink'
  | 'storiesA11y'
  | 'newsCarouselA11y'
  | 'swipeCardsHint'
  | 'orientationTapHint'
  | 'orientationProgressLabel'
  | 'orientationTasksA11y'
  | 'orientationModalSubtitle'
  | 'modalClose'
  | 'closeOverlayA11y'
  | 'dailyPlay'
  | 'dailyPlayed'
  | 'dailyRead'
  | 'dailyReadDone'
  | 'storyRingSuffixRead'
  | 'storyRingSuffixUnread'
  | 'orientationStepA11yDone'
  | 'orientationStepA11yCurrent'
  | 'orientationStepA11yTodo'
  | 'loginTitle'
  | 'loginSubtitle'
  | 'loginPhoneLabel'
  | 'loginPhonePlaceholder'
  | 'loginPasswordLabel'
  | 'loginPasswordPlaceholder'
  | 'loginForgotPassword'
  | 'loginCta'
  | 'loginBack'
  | 'loginInvalidPhone'
  | 'loginInvalidPassword'
  | 'loginBadCredentials'
  | 'loginBrandSubtitle'
  | 'loginNoAccount'
  | 'loginCreateAccount'
  | 'registerTitle'
  | 'registerSubtitle'
  | 'registerPhoneLabel'
  | 'registerPhonePlaceholder'
  | 'registerPasswordLabel'
  | 'registerPasswordPlaceholder'
  | 'registerPasswordConfirmLabel'
  | 'registerPasswordConfirmPlaceholder'
  | 'registerCta'
  | 'registerHaveAccount'
  | 'registerLoginLink'
  | 'registerInvalidConfirm'
  | 'registerPasswordsMismatch'
  | 'forgotTitle'
  | 'forgotSubtitle'
  | 'forgotInstructionsTitle'
  | 'forgotInstructionsLine1'
  | 'forgotInstructionsLine2'
  | 'forgotInstructionsLine3'
  | 'forgotPhoneLabel'
  | 'forgotPhonePlaceholder'
  | 'forgotCta'
  | 'forgotSuccessTitle'
  | 'forgotSuccessBody'
  | 'forgotNewPasswordLabel'
  | 'forgotBackToLogin'
  | 'setupTitle'
  | 'setupStepPrefix'
  | 'setupStep1Title'
  | 'setupStep1Sub'
  | 'setupStep2Title'
  | 'setupStep2Sub'
  | 'setupStep3Title'
  | 'setupStep3Sub'
  | 'setupStep4Title'
  | 'setupStep4Sub'
  | 'setupStep5Title'
  | 'setupStep5Sub'
  | 'setupYouAre'
  | 'setupStudent'
  | 'setupTutor'
  | 'setupStudyLevel'
  | 'setupBacType'
  | 'setupFiliere'
  | 'setupBacAnnee'
  | 'setupBacAnneeHelp'
  | 'setupSpecialite1'
  | 'setupSpecialite2'
  | 'setupSpecialite3Optional'
  | 'setupDiplomeEnCours'
  | 'setupEtablissement'
  | 'setupLyceeType'
  | 'setupPublic'
  | 'setupPrivate'
  | 'setupPrefSchoolType'
  | 'setupPrefServices'
  | 'setupLastName'
  | 'setupFirstName'
  | 'setupEmail'
  | 'setupBirthDate'
  | 'setupBirthDatePlaceholder'
  | 'setupGender'
  | 'setupMale'
  | 'setupFemale'
  | 'setupCity'
  | 'setupLoading'
  | 'setupCityHint'
  | 'setupCityChoose'
  | 'setupCityModalTitle'
  | 'setupCitySearchPlaceholder'
  | 'setupCityNoResults'
  | 'setupOptional'
  | 'setupGuardian'
  | 'setupGuardianFather'
  | 'setupGuardianMother'
  | 'setupGuardianOther'
  | 'setupGuardianLastName'
  | 'setupGuardianFirstName'
  | 'setupGuardianPhone'
  | 'setupGuardianJob'
  | 'setupGuardianAddress'
  | 'setupConsent'
  | 'setupYes'
  | 'setupNo'
  | 'setupBack'
  | 'setupContinue'
  | 'setupFinish'
  | 'setupSaving'
  | 'setupErrPickUserType'
  | 'setupErrPickLevel'
  | 'setupErrPickBacType'
  | 'setupErrPickFiliere'
  | 'setupErrPickMissionSpecs'
  | 'setupErrMissionSpecsDistinct'
  | 'setupErrMissionSpec3Distinct'
  | 'setupErrPickDiplome'
  | 'setupErrEtablissement'
  | 'setupErrPickPrefSchoolType'
  | 'setupErrFillRequired'
  | 'errInvalidEmail'
  | 'setupDateCancel'
  | 'setupDateOk'
  | 'estDetailTitle'
  | 'estDetailSummary'
  | 'estDetailPresentation'
  | 'estDetailDegrees'
  | 'estDetailSectors'
  | 'estDetailScholarships'
  | 'estDetailEngagements'
  | 'estDetailCampus'
  | 'estDetailContact'
  | 'estDetailAnnouncements'
  | 'estDetailAnnouncementsEmpty'
  | 'estLabelSectors'
  | 'estLabelTuition'
  | 'estLabelDuration'
  | 'estLabelAdmission'
  | 'estAdmissionConcours'
  | 'estAdmissionDossier'
  | 'estLabelTracks'
  | 'estLabelStudents'
  | 'estLabelYears'
  | 'estBadgeStateRecognized'
  | 'estBadgeRecommended'
  | 'estBadgeSponsored'
  | 'estScholarshipsAvailable'
  | 'accountTitle'
  | 'accountSubtitle'
  | 'accountLoginCta'
  | 'accountSectionProfile'
  | 'accountSectionAcademic'
  | 'accountSectionTutor'
  | 'accountSelectPlaceholder'
  | 'accountSelectNoResults'
  | 'accountSectionAccount'
  | 'accountPhone'
  | 'accountSetupStatus'
  | 'accountSetupComplete'
  | 'accountSetupIncomplete'
  | 'accountSave'
  | 'accountUpdatedTitle'
  | 'accountUpdatedBody'
  | 'accountLogoutTitle'
  | 'accountLogoutMessage'
  | 'accountLogoutConfirm'
  | 'accountLogoutCancel'
  | 'accountCityPlaceholder'
  | 'accountCitiesLoading'
  | 'commonErrorTitle'
  | 'accountSectionOrders'
  | 'accountOrdersEmpty'
  | 'accountOrdersLoading'
  | 'accountOrdersError'
  | 'estNotFound'
  | 'shopEyebrow'
  | 'shopTitle'
  | 'shopSubtitle'
  | 'shopSearchPlaceholder'
  | 'shopClearSearchA11y'
  | 'shopCartA11y'
  | 'shopFilterAll'
  | 'shopFilterProducts'
  | 'shopFilterPacks'
  | 'shopErrorLoad'
  | 'shopLoading'
  | 'shopEmptyTitle'
  | 'shopEmptyDesc'
  | 'shopBadgeProduct'
  | 'shopBadgePack'
  | 'shopBadgeFree'
  | 'shopBadgeUnavailable'
  | 'shopOutOfStock'
  | 'shopAddA11y'
  | 'shopAddedA11y'
  | 'shopBuyNow'
  | 'shopBuyNowA11y'
  | 'shopViewProductA11y'
  | 'tabHome'
  | 'tabEcoles'
  | 'tabInscriptions'
  | 'tabBoutique'
  | 'tabCompte'

  // ── Inscriptions / suivi de candidatures ──
  | 'inscEyebrow'
  | 'inscTitle'
  | 'inscSubtitle'
  | 'inscTabNotifications'
  | 'inscTabCandidacies'
  | 'inscTabAnnouncements'
  | 'inscFilterSchoolLabel'
  | 'inscFilterSchoolAll'
  | 'inscFilterSchoolPickTitle'
  | 'inscFilterSchoolSearchPlaceholder'
  | 'inscFilterSchoolNoResults'
  | 'inscFilterReset'
  | 'inscFilterStatusLabel'
  | 'inscFilterStatusAll'
  | 'inscFilterStatusOpen'
  | 'inscFilterStatusClosed'
  | 'inscFilterEligibilityLabel'
  | 'inscFilterEligibilityAll'
  | 'inscFilterEligibilityEligible'
  | 'inscFilterEligibilityNotEligible'
  | 'inscSortLabel'
  | 'inscSortDefault'
  | 'inscSortClosingSoon'
  | 'inscLoading'
  | 'inscErrorLoad'
  | 'inscRetry'
  | 'inscRequireLogin'
  | 'inscRequireLoginCta'
  | 'inscNotifEmptyTitle'
  | 'inscNotifEmptyDesc'
  | 'inscNotifMarkAllRead'
  | 'inscNotifFilterAll'
  | 'inscNotifFilterUnread'
  | 'inscCandidaciesEmptyTitle'
  | 'inscCandidaciesEmptyDesc'
  | 'inscCandidaciesEmptyCta'
  | 'inscCandidaciesFilterAll'
  | 'inscAnnouncementsEmptyTitle'
  | 'inscAnnouncementsEmptyDesc'
  | 'inscAnnouncementsFollow'
  | 'inscAnnouncementsFollowing'
  | 'inscAnnouncementsOpenLink'
  | 'inscAnnouncementsAlreadyTracked'
  | 'inscAnnouncementsMarkApplied'
  | 'inscStatusInterested'
  | 'inscStatusApplied'
  | 'inscStatusPreAdmitted'
  | 'inscStatusAdmitted'
  | 'inscStatusEnrolled'
  | 'inscStatusRejected'
  | 'inscStatusWithdrawn'
  | 'inscStatusActionTitle'
  | 'inscStatusActionSubtitle'
  | 'inscStatusActionUpdate'
  | 'inscStatusActionUpdating'
  | 'inscOpenLinkBtn'
  | 'inscOpenLinkA11y'
  | 'inscOpenLinkBtnResult'
  | 'inscOpenLinkBtnScholarship'
  | 'inscOpenLinkBtnOffer'
  | 'inscOpenLinkBtnInfo'
  | 'inscOpenLinkBtnRegister'
  | 'inscRemoveCandidacy'
  | 'inscRemoveCandidacyConfirmTitle'
  | 'inscRemoveCandidacyConfirmMsg'
  | 'inscCancel'
  | 'inscDelete'
  | 'inscViewTimeline'
  | 'inscTimelineTitle'
  | 'inscTimelineEmpty'
  | 'inscTimelineRelatedAnnouncements'
  | 'inscEventCreated'
  | 'inscEventStatusChanged'
  | 'inscEventLinkVisited'
  | 'inscEventNoteAdded'
  | 'inscEventDeadlineReminder'
  | 'inscEventAnnouncementUpdate'
  | 'inscDateOpens'
  | 'inscDateCloses'
  | 'inscDeadlineSoon'
  | 'inscClosed'
  | 'inscOpen'
  | 'inscFreeRegistration'
  | 'inscPreRegFee'
  | 'inscNoLink'
  | 'inscMarkAsCandidateConfirmTitle'
  | 'inscMarkAsCandidateConfirmMsg'
  | 'inscFollow'
  | 'inscUnfollow'
  | 'inscDetailLoading'
  | 'inscDetailNotFound'
  | 'inscDetailRetry'
  | 'inscDetailAboutSchool'
  | 'inscDetailAnnouncementDescription'
  | 'inscDetailEligibility'
  | 'inscDetailFilieresBacNormal'
  | 'inscDetailFilieresBacMission'
  | 'inscDetailAnneesBac'
  | 'inscDetailNoEligibilityCriteria'
  /* Éligibilité personnalisée (basée sur le profil étudiant) */
  | 'eligibilityYouEligible'
  | 'eligibilityYouNotEligible'
  | 'eligibilityProfileIncomplete'
  | 'eligibilityProfileIncompleteCta'
  | 'eligibilityLoginCta'
  | 'eligibilityYourFiliere'
  | 'eligibilityYourSpecialites'
  | 'eligibilityYourYear'
  | 'eligibilityFiliereAccepted'
  | 'eligibilityFiliereNotAccepted'
  | 'eligibilitySpecialiteAccepted'
  | 'eligibilitySpecialiteNotAccepted'
  | 'eligibilityYearAccepted'
  | 'eligibilityYearNotAccepted'
  | 'eligibilityNotProvided'
  | 'eligibilityBadgeEligible'
  | 'eligibilityBadgeNotEligible'
  | 'eligibilityBadgeIncomplete'
  | 'eligibilityBacTypeMismatchLabel'
  | 'eligibilityBacTypeOnlyNormal'
  | 'eligibilityBacTypeOnlyMission'
  | 'inscDetailDocuments'
  | 'inscDetailDocumentView'
  | 'inscDetailDocumentDownload'
  | 'inscDetailDocumentDownloading'
  | 'inscDetailDocumentDownloadErrorTitle'
  | 'inscDetailDocumentDownloadErrorMsg'
  | 'inscDetailDocumentSharingUnavailableTitle'
  | 'inscDetailDocumentSharingUnavailableMsg'
  | 'inscDetailUsefulLinks'
  | 'inscDetailKeyDates'
  | 'inscDetailFees'
  | 'inscDetailFreeRegistration'
  /* Suivi école-niveau */
  | 'followSchoolBtn'
  | 'followSchoolUnfollowBtn'
  | 'followSchoolUnfollowConfirmTitle'
  | 'followSchoolUnfollowConfirmMsg'
  | 'followedSchoolsTitle'
  | 'followedSchoolStatTotalAnnouncements'
  | 'followedSchoolStatOpenAnnouncements'
  | 'followedSchoolStatCandidacies'
  | 'followedSchoolLatestAnnouncement'
  | 'followedSchoolNoAnnouncements'
  | 'followedSchoolNoAnnouncementsTitle'
  | 'followedSchoolNoAnnouncementsHint'
  | 'followedSchoolViewSchoolBtn'
  | 'followedSchoolTimelineTitle'
  | 'followedSchoolTimelineNoEvents'
  | 'followedSchoolTimelineNoAnnouncements'
  | 'followedSchoolHistoricalAnnouncements'
  | 'followedSchoolViewSchool'
  | 'followedSchoolBackToList';

export const HOME_COPY: Record<AppLocale, Record<HomeCopyKey, string>> = {
  fr: {
    notifications: 'Notifications',
    unreadSuffix: 'non lues',
    help: 'Aide',
    profile: 'Profil',
    greeting: 'Bonjour',
    userSubtitle: 'Pack Standard · Sciences Math A',
    packStandardLabel: 'Pack Standard',
    bacMissionLabel: 'BAC MISSION',
    newsTitle: 'Actualités',
    languageSwitcher: 'Langue',
    langFr: 'FR',
    langAr: 'AR',
    gameDailyTitle: 'Jeu quotidien',
    gameDailyBody: 'À brancher sur le mini-jeu (shell).',
    infoDailyTitle: 'Information du jour',
    infoDailyBody: 'À brancher sur le bulletin du jour (shell).',
    practicalTitle: 'Liens pratiques',
    practicalSubtitle: 'Accès rapides à vos services',
    practicalSectionA11y: 'Liens pratiques',
    practical_ecoles: 'Écoles supérieures',
    practical_inscriptions: 'Inscriptions et dates',
    practical_candidatures: 'Suivi de mes candidatures',
    practical_testsOrientation: "Test d'orientations",
    practical_resultatsOrientation: "Résultats d'orientations",
    practical_ecolesInscription: "Mes écoles d'inscriptions",
    practical_boutique: 'Boutique',
    practical_ecoles_desc:
      'Explorer les établissements, les filières et les critères d’admission pour construire votre projet.',
    practical_inscriptions_desc:
      'Calendriers des concours, dossiers à fournir et dates limites pour ne rien manquer.',
    practical_candidatures_desc:
      'Suivez l’état de vos dossiers et les prochaines étapes de vos candidatures.',
    practical_testsOrientation_desc:
      'Questionnaires et outils pour affiner votre orientation et vos préférences.',
    practical_resultatsOrientation_desc:
      'Consultez vos résultats et les pistes proposées selon votre profil.',
    practical_ecolesInscription_desc:
      'La liste des établissements pour lesquels vous déposez ou suivrez une candidature.',
    practical_boutique_desc:
      'Formules d’accompagnement et services pour sécuriser votre parcours.',
    practicalCardEyebrow: 'Liens utiles',
    practicalCardTap: 'Toucher pour ouvrir',
    practicalCardA11y: 'Ouvrir le lien pratique',
    schoolsTitle: 'Écoles supérieures',
    schoolsFilters: 'Filtres',
    schoolsFiltersA11y: 'Filtres détaillés',
    schoolsSearchPlaceholder: 'Rechercher (nom, ville, université...)',
    schoolsTypeAll: 'Tous',
    schoolsTypeLabel: "Type d'établissement",
    schoolsTypePublic: 'Public',
    schoolsTypePrivate: 'Privé',
    schoolsTypeSemiPublic: 'Semi‑Public',
    schoolsTypeMilitary: 'Militaire',
    schoolsFiltersTitle: 'Filtres détaillés',
    schoolsFiltersHint:
      'Aligné sur la page web `/etablissements` : secteur, région, ville, diplôme, fourchette de frais, etc.',
    schoolsUniversityLabel: 'Recherche',
    schoolsUniversityPlaceholder: "Nom d’université…",
    schoolsRegionLabel: 'Région',
    schoolsAll: 'Toutes',
    schoolsCityLabel: 'Ville',
    schoolsAllCities: 'Toutes les villes',
    schoolsSectorLabel: 'Secteur métier',
    schoolsAllSectors: 'Tous les secteurs',
    schoolsSectorPickTitle: 'Secteur métier',
    schoolsSectorSearchPlaceholder: 'Rechercher un secteur…',
    schoolsSectorNoResults: 'Aucun secteur trouvé',
    schoolsDiplomaLabel: 'Diplôme délivré',
    schoolsAllDiplomas: 'Tous',
    schoolsFeesLabel: 'Frais scolarité (MAD / an)',
    schoolsMin: 'Min',
    schoolsMax: 'Max',
    schoolsToggleRecommended: 'Recommandées uniquement',
    schoolsToggleSponsored: 'Sponsorisé uniquement',
    schoolsToggleFeatured: 'Mis en avant',
    schoolsToggleAccreditationEtat: 'Reconnaissance État',
    schoolsToggleExchangeInternational: 'Échange international',
    schoolsToggleEtawjihiOnly: 'Inscription gérée par E‑Tawjihi',
    schoolsFootnote: 'Filtre « Compatible mon bac » du web nécessite le profil connecté — à brancher plus tard.',
    schoolsReset: 'Réinitialiser',
    schoolsApply: 'Appliquer',
    schoolsRetry: 'Réessayer',
    schoolsClearFilter: 'Effacer la sélection',
    schoolsErrorNetwork: 'Erreur réseau',
    planOffersTitle: 'Packs d’inscription & écoles',
    planOffersLink: 'Voir les packs',
    storiesA11y: 'Stories',
    newsCarouselA11y: 'Actualités — défilement horizontal',
    swipeCardsHint: 'Glissez les cartes',
    orientationTapHint: 'Toucher pour afficher les tâches restantes',
    orientationProgressLabel: "Progression d'orientation",
    orientationTasksA11y: "Voir les tâches restantes du parcours d'orientation",
    orientationModalSubtitle: 'Tâches restantes du parcours',
    modalClose: 'Fermer',
    closeOverlayA11y: 'Fermer',
    dailyPlay: 'Jouer',
    dailyPlayed: 'Joué',
    dailyRead: 'Lire',
    dailyReadDone: 'Lu',
    storyRingSuffixRead: ', déjà vue',
    storyRingSuffixUnread: ', non lue',
    orientationStepA11yDone: ', fait',
    orientationStepA11yCurrent: ', en cours',
    orientationStepA11yTodo: ', à faire',
    loginTitle: 'Se connecter',
    loginSubtitle: 'Accédez à votre espace E‑Tawjihi.',
    loginPhoneLabel: 'Numéro de téléphone',
    loginPhonePlaceholder: 'Numéro de téléphone',
    loginPasswordLabel: 'Mot de passe',
    loginPasswordPlaceholder: 'Mot de passe',
    loginForgotPassword: 'Mot de passe oublié ?',
    loginCta: 'Se connecter',
    loginBack: 'Retour',
    loginInvalidPhone: 'Numéro invalide',
    loginInvalidPassword: 'Mot de passe invalide',
    loginBadCredentials: 'Identifiants incorrects.',
    loginBrandSubtitle: 'Votre tableau de bord post‑bac : orientation, inscriptions et accompagnement.',
    loginNoAccount: "Vous n'avez pas encore un compte ?",
    loginCreateAccount: 'Créer un compte',
    registerTitle: 'Créer un compte',
    registerSubtitle: 'Créez votre compte E‑Tawjihi en quelques secondes.',
    registerPhoneLabel: 'Numéro de téléphone',
    registerPhonePlaceholder: 'Numéro de téléphone',
    registerPasswordLabel: 'Mot de passe',
    registerPasswordPlaceholder: 'Mot de passe',
    registerPasswordConfirmLabel: 'Confirmer le mot de passe',
    registerPasswordConfirmPlaceholder: 'Confirmer le mot de passe',
    registerCta: 'Créer mon compte',
    registerHaveAccount: 'Vous avez déjà un compte ?',
    registerLoginLink: 'Se connecter',
    registerInvalidConfirm: 'Confirmation invalide',
    registerPasswordsMismatch: 'Les mots de passe ne correspondent pas.',
    forgotTitle: 'Mot de passe oublié',
    forgotSubtitle: 'Récupérez l’accès à votre compte.',
    forgotInstructionsTitle: 'Instructions',
    forgotInstructionsLine1: '1) Cliquez sur le bouton WhatsApp.',
    forgotInstructionsLine2: '2) Envoyez “Mot de passe oublié” depuis le même numéro WhatsApp du compte.',
    forgotInstructionsLine3: '3) Le support vous aidera à générer un nouveau mot de passe.',
    forgotPhoneLabel: 'Numéro de téléphone',
    forgotPhonePlaceholder: 'Numéro de téléphone',
    forgotCta: 'Ouvrir WhatsApp',
    forgotSuccessTitle: 'Nouveau mot de passe',
    forgotSuccessBody: 'Utilisez ce mot de passe pour vous reconnecter, puis changez-le depuis votre compte.',
    forgotNewPasswordLabel: 'Mot de passe généré',
    forgotBackToLogin: 'Retour à la connexion',
    setupTitle: 'Configuration du compte',
    setupStepPrefix: 'Étape',
    setupStep1Title: 'Informations académiques',
    setupStep1Sub: 'Aidez‑nous à comprendre votre parcours pour mieux vous orienter.',
    setupStep2Title: 'Préférences',
    setupStep2Sub: 'Choisissez vos types d’écoles et services préférés.',
    setupStep3Title: 'Informations personnelles',
    setupStep3Sub: 'Renseignez vos informations de base.',
    setupStep4Title: 'Informations tuteur',
    setupStep4Sub: 'Optionnel — si un parent/tuteur gère le compte.',
    setupStep5Title: 'Accord',
    setupStep5Sub: 'Optionnel — autorisez le contact pour vous aider.',
    setupYouAre: 'Vous êtes',
    setupStudent: 'Étudiant',
    setupTutor: 'Tuteur',
    setupStudyLevel: "Niveau d'étude",
    setupBacType: 'Type de bac',
    setupFiliere: 'Filière',
    setupBacAnnee: 'Année du bac',
    setupBacAnneeHelp:
      'Année scolaire d’obtention (ou en cours) — utilisée pour vérifier votre éligibilité aux annonces et écoles.',
    setupSpecialite1: 'Spécialité 1',
    setupSpecialite2: 'Spécialité 2',
    setupSpecialite3Optional: 'Spécialité 3 (optionnel)',
    setupDiplomeEnCours: 'Diplôme en cours',
    setupEtablissement: "Nom de l'établissement",
    setupLyceeType: 'Type de lycée',
    setupPublic: 'Public',
    setupPrivate: 'Privé',
    setupPrefSchoolType: "Type d'école préféré",
    setupPrefServices: 'Services préférés',
    setupLastName: 'Nom',
    setupFirstName: 'Prénom',
    setupEmail: 'Email',
    setupBirthDate: 'Date de naissance',
    setupBirthDatePlaceholder: 'JJ-MM-AAAA',
    setupGender: 'Genre',
    setupMale: 'Homme',
    setupFemale: 'Femme',
    setupCity: 'Ville',
    setupLoading: 'Chargement…',
    setupCityHint: 'Astuce : appuyez sur le champ pour ouvrir la liste et rechercher votre ville.',
    setupCityChoose: 'Choisir une ville…',
    setupCityModalTitle: 'Sélectionnez votre ville',
    setupCitySearchPlaceholder: 'Rechercher une ville…',
    setupCityNoResults: 'Aucune ville trouvée',
    setupOptional: 'Optionnel',
    setupGuardian: 'Tuteur',
    setupGuardianFather: 'Père',
    setupGuardianMother: 'Mère',
    setupGuardianOther: 'Autre',
    setupGuardianLastName: 'Nom tuteur',
    setupGuardianFirstName: 'Prénom tuteur',
    setupGuardianPhone: 'Téléphone tuteur',
    setupGuardianJob: 'Profession',
    setupGuardianAddress: 'Adresse',
    setupConsent: 'Acceptez-vous d’être contacté ?',
    setupYes: 'Oui',
    setupNo: 'Non',
    setupBack: 'Retour',
    setupContinue: 'Continuer',
    setupFinish: 'Terminer',
    setupSaving: 'Enregistrement…',
    setupErrPickUserType: 'Veuillez sélectionner si vous êtes étudiant ou tuteur',
    setupErrPickLevel: 'Veuillez sélectionner votre niveau d’étude',
    setupErrPickBacType: 'Veuillez sélectionner le type de baccalauréat',
    setupErrPickFiliere: 'Veuillez sélectionner votre filière',
    setupErrPickMissionSpecs: 'Veuillez sélectionner les deux premières spécialités pour le bac mission',
    setupErrMissionSpecsDistinct: 'Les deux premières spécialités doivent être différentes',
    setupErrMissionSpec3Distinct: 'La 3ème spécialité doit être différente des deux premières',
    setupErrPickDiplome: 'Veuillez sélectionner votre diplôme en cours',
    setupErrEtablissement: 'Veuillez renseigner le nom de votre établissement',
    setupErrPickPrefSchoolType: "Veuillez sélectionner au moins un type d'établissement préféré",
    setupErrFillRequired: 'Veuillez remplir tous les champs obligatoires',
    errInvalidEmail: 'Adresse e-mail invalide',
    setupDateCancel: 'Annuler',
    setupDateOk: 'OK',
    estDetailTitle: 'Fiche école',
    estDetailSummary: 'Synthèse',
    estDetailPresentation: 'Présentation',
    estDetailDegrees: 'Diplômes délivrés',
    estDetailSectors: 'Secteurs métiers',
    estDetailScholarships: 'Bourses',
    estDetailEngagements: 'Engagements',
    estDetailCampus: 'Campus',
    estDetailContact: 'Contact',
    estDetailAnnouncements: 'Annonces de l\'école',
    estDetailAnnouncementsEmpty: 'Aucune annonce publiée pour cette école pour le moment.',
    estLabelSectors: 'Secteurs',
    estLabelTuition: 'Scolarité',
    estLabelDuration: 'Durée',
    estLabelAdmission: 'Admission',
    estAdmissionConcours: 'Concours',
    estAdmissionDossier: 'Étude de dossier',
    estLabelTracks: 'Filières',
    estLabelStudents: 'Étudiants',
    estLabelYears: 'Années études',
    estBadgeStateRecognized: 'Reconnu État',
    estBadgeRecommended: 'Recommandé',
    estBadgeSponsored: 'Sponsorisé',
    estScholarshipsAvailable: 'Bourses disponibles',
    accountTitle: 'Mon compte',
    accountSubtitle: 'Consultez et mettez à jour vos informations.',
    accountLoginCta: 'Se connecter',
    accountSectionProfile: 'Profil',
    accountSectionAcademic: 'Infos académiques',
    accountSectionTutor: 'Tuteur',
    accountSelectPlaceholder: 'Sélectionner…',
    accountSelectNoResults: 'Aucun résultat',
    accountSectionAccount: 'Compte et accès',
    accountPhone: 'Téléphone',
    accountSetupStatus: 'État du profil',
    accountSetupComplete: 'Complet',
    accountSetupIncomplete: 'À compléter',
    accountSave: 'Enregistrer',
    accountUpdatedTitle: 'Mon compte',
    accountUpdatedBody: 'Vos informations ont été mises à jour.',
    accountLogoutTitle: 'Déconnexion',
    accountLogoutMessage: 'Voulez-vous vraiment vous déconnecter ?',
    accountLogoutConfirm: 'Se déconnecter',
    accountLogoutCancel: 'Annuler',
    accountCityPlaceholder: 'Choisir une ville…',
    accountCitiesLoading: 'Chargement des villes…',
    commonErrorTitle: 'Erreur',
    accountSectionOrders: 'Mes commandes',
    accountOrdersEmpty: 'Aucune commande pour l\'instant.',
    accountOrdersLoading: 'Chargement des commandes…',
    accountOrdersError: 'Impossible de charger les commandes.',
    estNotFound: 'Introuvable',
    shopEyebrow: 'E-Tawjihi',
    shopTitle: 'Boutique',
    shopSubtitle: 'Commandez en ligne · Paiement à la livraison',
    shopSearchPlaceholder: 'Rechercher un produit, pack…',
    shopClearSearchA11y: 'Effacer la recherche',
    shopCartA11y: 'Panier',
    shopFilterAll: 'Tout',
    shopFilterProducts: 'Produits',
    shopFilterPacks: 'Packs',
    shopErrorLoad: 'Impossible de charger la boutique.',
    shopLoading: 'Chargement…',
    shopEmptyTitle: 'Aucun produit',
    shopEmptyDesc: 'Modifiez vos filtres ou revenez plus tard.',
    shopBadgeProduct: 'Produit',
    shopBadgePack: 'Pack',
    shopBadgeFree: 'Livraison offerte',
    shopBadgeUnavailable: 'Indisponible',
    shopOutOfStock: 'Rupture de stock',
    shopAddA11y: 'Ajouter au panier',
    shopAddedA11y: 'Déjà au panier',
    shopBuyNow: 'Commander',
    shopBuyNowA11y: 'Commander maintenant',
    shopViewProductA11y: 'Voir le produit',
    tabHome: 'Accueil',
    tabEcoles: 'Écoles',
    tabInscriptions: 'Inscriptions',
    tabBoutique: 'Boutique',
    tabCompte: 'Compte',

    // ── Inscriptions / suivi de candidatures ──
    inscEyebrow: 'Inscriptions & candidatures',
    inscTitle: 'Mes inscriptions',
    inscSubtitle: 'Suivez vos candidatures et restez informé des ouvertures.',
    inscTabNotifications: 'Notifications',
    inscTabCandidacies: 'Candidatures',
    inscTabAnnouncements: 'Annonces',
    inscFilterSchoolLabel: 'École',
    inscFilterSchoolAll: 'Toutes les écoles',
    inscFilterSchoolPickTitle: 'Filtrer par école',
    inscFilterSchoolSearchPlaceholder: 'Rechercher une école…',
    inscFilterSchoolNoResults: 'Aucune école trouvée',
    inscFilterReset: 'Réinitialiser',
    inscFilterStatusLabel: 'Statut',
    inscFilterStatusAll: 'Tous',
    inscFilterStatusOpen: 'Ouvert',
    inscFilterStatusClosed: 'Fermé',
    inscFilterEligibilityLabel: 'Éligibilité',
    inscFilterEligibilityAll: 'Toutes',
    inscFilterEligibilityEligible: 'Éligible',
    inscFilterEligibilityNotEligible: 'Non éligible',
    inscSortLabel: 'Trier',
    inscSortDefault: 'Par défaut',
    inscSortClosingSoon: 'Dernier délai',
    inscLoading: 'Chargement…',
    inscErrorLoad: 'Impossible de charger les données.',
    inscRetry: 'Réessayer',
    inscRequireLogin: 'Connectez-vous pour suivre vos candidatures.',
    inscRequireLoginCta: 'Se connecter',
    inscNotifEmptyTitle: 'Aucune notification',
    inscNotifEmptyDesc: 'Vos alertes d\'inscription, résultats et orientation apparaîtront ici.',
    inscNotifMarkAllRead: 'Tout marquer lu',
    inscNotifFilterAll: 'Toutes',
    inscNotifFilterUnread: 'Non lues',
    inscCandidaciesEmptyTitle: 'Aucune candidature suivie',
    inscCandidaciesEmptyDesc: 'Suivez une annonce ci-contre pour démarrer le suivi.',
    inscCandidaciesEmptyCta: 'Voir les annonces',
    inscCandidaciesFilterAll: 'Toutes',
    inscAnnouncementsEmptyTitle: 'Aucune annonce',
    inscAnnouncementsEmptyDesc: 'Aucune annonce d\'inscription publiée pour l\'instant.',
    inscAnnouncementsFollow: 'Suivre',
    inscAnnouncementsFollowing: 'Suivi',
    inscAnnouncementsOpenLink: 'Lien d\'inscription',
    inscAnnouncementsAlreadyTracked: 'Déjà suivi',
    inscAnnouncementsMarkApplied: 'J\'ai postulé',
    inscStatusInterested: 'Intéressé',
    inscStatusApplied: 'Candidature déposée',
    inscStatusPreAdmitted: 'Pré-sélectionné',
    inscStatusAdmitted: 'Admis',
    inscStatusEnrolled: 'Inscrit',
    inscStatusRejected: 'Refusé',
    inscStatusWithdrawn: 'Abandonné',
    inscStatusActionTitle: 'Mettre à jour le statut',
    inscStatusActionSubtitle: 'Choisissez la nouvelle étape de votre candidature.',
    inscStatusActionUpdate: 'Mettre à jour',
    inscStatusActionUpdating: 'Mise à jour…',
    inscOpenLinkBtn: 'Ouvrir le lien',
    inscOpenLinkA11y: 'Ouvrir le lien d\'inscription officiel',
    inscOpenLinkBtnResult: 'Voir le résultat',
    inscOpenLinkBtnScholarship: 'Postuler à la bourse',
    inscOpenLinkBtnOffer: 'Profiter de l\'offre',
    inscOpenLinkBtnInfo: 'En savoir plus',
    inscOpenLinkBtnRegister: 'Lien d\'inscription',
    inscRemoveCandidacy: 'Retirer du suivi',
    inscRemoveCandidacyConfirmTitle: 'Retirer cette candidature ?',
    inscRemoveCandidacyConfirmMsg: 'Le suivi et la timeline de cette candidature seront supprimés.',
    inscCancel: 'Annuler',
    inscDelete: 'Supprimer',
    inscViewTimeline: 'Voir la timeline',
    inscTimelineTitle: 'Timeline de la candidature',
    inscTimelineEmpty: 'Aucun évènement pour le moment.',
    inscTimelineRelatedAnnouncements: 'Annonces liées à l\'établissement',
    inscEventCreated: 'Candidature créée',
    inscEventStatusChanged: 'Changement de statut',
    inscEventLinkVisited: 'Lien d\'inscription ouvert',
    inscEventNoteAdded: 'Note ajoutée',
    inscEventDeadlineReminder: 'Rappel d\'échéance',
    inscEventAnnouncementUpdate: 'Mise à jour de l\'annonce',
    inscDateOpens: 'Ouverture',
    inscDateCloses: 'Clôture',
    inscDeadlineSoon: 'Bientôt clos',
    inscClosed: 'Clos',
    inscOpen: 'Ouvert',
    inscFreeRegistration: 'Inscription gratuite',
    inscPreRegFee: 'Frais',
    inscNoLink: 'Aucun lien officiel',
    inscMarkAsCandidateConfirmTitle: 'Suivre cette annonce ?',
    inscMarkAsCandidateConfirmMsg: 'Vous serez notifié des mises à jour et pourrez suivre votre candidature.',
    inscFollow: 'Suivre',
    inscUnfollow: 'Ne plus suivre',
    inscDetailLoading: 'Chargement de l\'annonce…',
    inscDetailNotFound: 'Annonce introuvable.',
    inscDetailRetry: 'Réessayer',
    inscDetailAboutSchool: 'À propos de l\'école',
    inscDetailAnnouncementDescription: 'Description',
    inscDetailEligibility: 'Critères d\'éligibilité',
    inscDetailFilieresBacNormal: 'Filières (Bac Normal)',
    inscDetailFilieresBacMission: 'Filières (Bac Mission)',
    inscDetailAnneesBac: 'Années du Bac acceptées',
    inscDetailNoEligibilityCriteria: 'Annonce ouverte à tous (aucun critère restrictif).',
    eligibilityYouEligible: 'Vous êtes éligible',
    eligibilityYouNotEligible: 'Vous n’êtes pas éligible',
    eligibilityProfileIncomplete:
      'Complétez votre profil (filière, année du bac…) pour vérifier votre éligibilité.',
    eligibilityProfileIncompleteCta: 'Compléter mon profil',
    eligibilityLoginCta: 'Connectez-vous pour voir votre éligibilité',
    eligibilityYourFiliere: 'Votre filière',
    eligibilityYourSpecialites: 'Vos spécialités',
    eligibilityYourYear: 'Votre année du bac',
    eligibilityFiliereAccepted: 'Filière acceptée',
    eligibilityFiliereNotAccepted: 'Filière non acceptée',
    eligibilitySpecialiteAccepted: 'Spécialité acceptée',
    eligibilitySpecialiteNotAccepted: 'Spécialité non acceptée',
    eligibilityYearAccepted: 'Année acceptée',
    eligibilityYearNotAccepted: 'Année non acceptée',
    eligibilityNotProvided: 'Non renseigné',
    eligibilityBadgeEligible: 'Éligible',
    eligibilityBadgeNotEligible: 'Non éligible',
    eligibilityBadgeIncomplete: 'Profil à compléter',
    eligibilityBacTypeMismatchLabel: 'Type de baccalauréat',
    eligibilityBacTypeOnlyNormal: "Cette annonce s'adresse aux étudiants du Bac Normal",
    eligibilityBacTypeOnlyMission: "Cette annonce s'adresse aux étudiants du Bac Mission",
    inscDetailDocuments: 'Documents utiles',
    inscDetailDocumentView: 'Aperçu',
    inscDetailDocumentDownload: 'Télécharger',
    inscDetailDocumentDownloading: 'Téléchargement…',
    inscDetailDocumentDownloadErrorTitle: 'Téléchargement impossible',
    inscDetailDocumentDownloadErrorMsg:
      "Impossible de télécharger ce document. Vérifiez votre connexion puis réessayez.",
    inscDetailDocumentSharingUnavailableTitle: 'Partage indisponible',
    inscDetailDocumentSharingUnavailableMsg:
      "Le partage de fichiers n'est pas disponible sur cet appareil.",
    inscDetailUsefulLinks: 'Liens utiles',
    inscDetailKeyDates: 'Dates clés',
    inscDetailFees: 'Frais de préinscription',
    inscDetailFreeRegistration: 'Inscription gratuite',
    followSchoolBtn: 'Suivre cette école',
    followSchoolUnfollowBtn: 'Ne plus suivre',
    followSchoolUnfollowConfirmTitle: 'Ne plus suivre cette école ?',
    followSchoolUnfollowConfirmMsg:
      'Toutes les annonces et candidatures liées à cette école seront retirées de votre suivi. Cette action est irréversible.',
    followedSchoolsTitle: 'Écoles suivies',
    followedSchoolStatTotalAnnouncements: 'Annonces',
    followedSchoolStatOpenAnnouncements: 'Ouvertes',
    followedSchoolStatCandidacies: 'Candidatures',
    followedSchoolLatestAnnouncement: 'Dernière annonce',
    followedSchoolNoAnnouncements: 'Aucune annonce récente pour cette école.',
    followedSchoolNoAnnouncementsTitle: 'Pas encore d’annonce',
    followedSchoolNoAnnouncementsHint:
      'Vous serez notifié dès qu’une nouvelle annonce sera publiée par cette école (ouverture d’inscription, résultats, bourses…).',
    followedSchoolViewSchoolBtn: 'Voir la fiche école',
    followedSchoolTimelineTitle: 'Suivi de l\'école',
    followedSchoolTimelineNoEvents: 'Aucun évènement récent.',
    followedSchoolTimelineNoAnnouncements: 'Aucune annonce ne concerne cette école sur la période.',
    followedSchoolHistoricalAnnouncements: 'Annonces de l\'école',
    followedSchoolViewSchool: 'Voir la fiche école',
    followedSchoolBackToList: 'Retour aux écoles suivies',
  },
  ar: {
    notifications: 'الإشعارات',
    unreadSuffix: 'غير مقروءة',
    help: 'المساعدة',
    profile: 'الملف الشخصي',
    greeting: 'مرحبا',
    userSubtitle: 'الباقة القياسية · علوم رياضية أ',
    packStandardLabel: 'الباقة القياسية',
    bacMissionLabel: 'بكالوريا البعثة',
    newsTitle: 'الأخبار',
    languageSwitcher: 'اللغة',
    langFr: 'FR',
    langAr: 'عربي',
    gameDailyTitle: 'لعبة اليوم',
    gameDailyBody: 'سيتم ربطها باللعبة المصغرة (shell).',
    infoDailyTitle: 'معلومة اليوم',
    infoDailyBody: 'سيتم ربطها بنشرة اليوم (shell).',
    practicalTitle: 'روابط مفيدة',
    practicalSubtitle: 'وصول سريع إلى خدماتك',
    practicalSectionA11y: 'روابط مفيدة',
    practical_ecoles: 'المدارس العليا',
    practical_inscriptions: 'التسجيلات والمواعيد',
    practical_candidatures: 'متابعة طلباتي',
    practical_testsOrientation: 'اختبار التوجيه',
    practical_resultatsOrientation: 'نتائج التوجيه',
    practical_ecolesInscription: 'مدارس تسجيلي',
    practical_boutique: 'المتجر',
    practical_ecoles_desc:
      'استكشاف المؤسسات والمسارات ومعايير القبول لصياغة مشروعك الدراسي.',
    practical_inscriptions_desc:
      'تقاويم المسابقات والملفات المطلوبة والآجال حتى لا يفوتك أي موعد.',
    practical_candidatures_desc:
      'تتبّع حالة ملفاتك والخطوات القادمة في طلباتك.',
    practical_testsOrientation_desc:
      'استبيانات وأدوات لتحسين توجهك وتفضيلاتك.',
    practical_resultatsOrientation_desc:
      'اطّلع على نتائجك والمسارات المقترحة حسب ملفك.',
    practical_ecolesInscription_desc:
      'المؤسسات التي تقدّم لها طلبًا أو تتابع معها التسجيل.',
    practical_boutique_desc:
      'باقات المرافقة والخدمات لتأمين مسارك.',
    practicalCardEyebrow: 'روابط مفيدة',
    practicalCardTap: 'المس للفتح',
    practicalCardA11y: 'فتح الرابط المفيد',
    schoolsTitle: 'المدارس العليا',
    schoolsFilters: 'التصفية',
    schoolsFiltersA11y: 'فلاتر مفصلة',
    schoolsSearchPlaceholder: 'بحث (الاسم، المدينة، الجامعة...)',
    schoolsTypeAll: 'الكل',
    schoolsTypeLabel: 'نوع المؤسسة',
    schoolsTypePublic: 'عمومي',
    schoolsTypePrivate: 'خصوصي',
    schoolsTypeSemiPublic: 'شبه عمومي',
    schoolsTypeMilitary: 'عسكري',
    schoolsFiltersTitle: 'فلاتر مفصلة',
    schoolsFiltersHint:
      'تصفية المدارس المعروضة حسب: القطاع، الجهة، المدينة، الدبلوم، نطاق الرسوم، وغيرها.',
    schoolsUniversityLabel: 'بحث',
    schoolsUniversityPlaceholder: 'اسم الجامعة…',
    schoolsRegionLabel: 'الجهة',
    schoolsAll: 'الكل',
    schoolsCityLabel: 'المدينة',
    schoolsAllCities: 'جميع المدن',
    schoolsSectorLabel: 'قطاع المهنة',
    schoolsAllSectors: 'كل القطاعات',
    schoolsSectorPickTitle: 'قطاع المهنة',
    schoolsSectorSearchPlaceholder: 'ابحث عن قطاع…',
    schoolsSectorNoResults: 'لا يوجد قطاع مطابق',
    schoolsDiplomaLabel: 'الدبلوم',
    schoolsAllDiplomas: 'الكل',
    schoolsFeesLabel: 'رسوم الدراسة (درهم / سنة)',
    schoolsMin: 'الحد الأدنى',
    schoolsMax: 'الحد الأقصى',
    schoolsToggleRecommended: 'الموصى بها فقط',
    schoolsToggleSponsored: 'الممولة فقط',
    schoolsToggleFeatured: 'مميزة',
    schoolsToggleAccreditationEtat: 'اعتراف الدولة',
    schoolsToggleExchangeInternational: 'تبادل دولي',
    schoolsToggleEtawjihiOnly: 'ضمن خدمات تسجيل إي‑توجيهي',
    schoolsFootnote: 'فلتر «متوافق مع الباك» يحتاج ملفًا متصلًا — سيتم ربطه لاحقًا.',
    schoolsReset: 'إعادة الضبط',
    schoolsApply: 'تطبيق',
    schoolsRetry: 'إعادة المحاولة',
    schoolsClearFilter: 'إلغاء الاختيار',
    schoolsErrorNetwork: 'خطأ في الشبكة',
    planOffersTitle: 'باقات التسجيل والمدارس',
    planOffersLink: 'عرض الباقات',
    storiesA11y: 'القصص',
    newsCarouselA11y: 'الأخبار — تمرير أفقي',
    swipeCardsHint: 'اسحب البطاقات',
    orientationTapHint: 'المس لعرض المهام المتبقية',
    orientationProgressLabel: 'تقدّم التوجيه',
    orientationTasksA11y: 'عرض المهام المتبقية في المسار',
    orientationModalSubtitle: 'المهام المتبقية في المسار',
    modalClose: 'إغلاق',
    closeOverlayA11y: 'إغلاق',
    dailyPlay: 'العب',
    dailyPlayed: 'تم اللعب',
    dailyRead: 'اقرأ',
    dailyReadDone: 'مقروء',
    storyRingSuffixRead: '، تمت المشاهدة',
    storyRingSuffixUnread: '، غير مقروءة',
    orientationStepA11yDone: '، مكتمل',
    orientationStepA11yCurrent: '، قيد التقدم',
    orientationStepA11yTodo: '، للقيام به',
    loginTitle: 'تسجيل الدخول',
    loginSubtitle: 'ادخل إلى فضاء E‑Tawjihi الخاص بك.',
    loginPhoneLabel: 'رقم الهاتف',
    loginPhonePlaceholder: 'رقم الهاتف',
    loginPasswordLabel: 'كلمة المرور',
    loginPasswordPlaceholder: 'كلمة المرور',
    loginForgotPassword: 'نسيت كلمة المرور؟',
    loginCta: 'تسجيل الدخول',
    loginBack: 'رجوع',
    loginInvalidPhone: 'رقم غير صحيح',
    loginInvalidPassword: 'كلمة مرور غير صحيحة',
    loginBadCredentials: 'بيانات الدخول غير صحيحة.',
    loginBrandSubtitle: 'لوحتك بعد البكالوريا: التوجيه، التسجيلات، والمرافقة.',
    loginNoAccount: 'ليس لديك حساب بعد؟',
    loginCreateAccount: 'إنشاء حساب',
    registerTitle: 'إنشاء حساب',
    registerSubtitle: 'أنشئ حسابك في E‑Tawjihi في ثوانٍ.',
    registerPhoneLabel: 'رقم الهاتف',
    registerPhonePlaceholder: 'رقم الهاتف',
    registerPasswordLabel: 'كلمة المرور',
    registerPasswordPlaceholder: 'كلمة المرور',
    registerPasswordConfirmLabel: 'تأكيد كلمة المرور',
    registerPasswordConfirmPlaceholder: 'تأكيد كلمة المرور',
    registerCta: 'إنشاء الحساب',
    registerHaveAccount: 'لديك حساب بالفعل؟',
    registerLoginLink: 'تسجيل الدخول',
    registerInvalidConfirm: 'تأكيد غير صحيح',
    registerPasswordsMismatch: 'كلمتا المرور غير متطابقتين.',
    forgotTitle: 'نسيت كلمة المرور',
    forgotSubtitle: 'استرجع الوصول إلى حسابك.',
    forgotInstructionsTitle: 'تعليمات',
    forgotInstructionsLine1: '1) اضغط على زر واتساب.',
    forgotInstructionsLine2: '2) أرسل “Mot de passe oublié” من نفس رقم واتساب الخاص بالحساب.',
    forgotInstructionsLine3: '3) سيساعدك الدعم في إنشاء كلمة مرور جديدة.',
    forgotPhoneLabel: 'رقم الهاتف',
    forgotPhonePlaceholder: 'رقم الهاتف',
    forgotCta: 'فتح واتساب',
    forgotSuccessTitle: 'كلمة مرور جديدة',
    forgotSuccessBody: 'استخدم هذه الكلمة لتسجيل الدخول ثم قم بتغييرها من حسابك.',
    forgotNewPasswordLabel: 'كلمة المرور المُنشأة',
    forgotBackToLogin: 'العودة لتسجيل الدخول',
    setupTitle: 'إعداد الحساب',
    setupStepPrefix: 'المرحلة',
    setupStep1Title: 'المعلومات الدراسية',
    setupStep1Sub: 'ساعدنا على فهم مسارك لنقترح لك توجيهاً أفضل.',
    setupStep2Title: 'التفضيلات',
    setupStep2Sub: 'اختر أنواع المؤسسات والخدمات المفضلة لديك.',
    setupStep3Title: 'المعلومات الشخصية',
    setupStep3Sub: 'أدخل معلوماتك الأساسية.',
    setupStep4Title: 'معلومات وليّ الأمر',
    setupStep4Sub: 'اختياري — إذا كان وليّ الأمر يدير الحساب.',
    setupStep5Title: 'الموافقة',
    setupStep5Sub: 'اختياري — السماح بالتواصل لمساعدتك.',
    setupYouAre: 'أنت',
    setupStudent: 'تلميذ/طالب',
    setupTutor: 'ولي الأمر',
    setupStudyLevel: 'المستوى الدراسي',
    setupBacType: 'نوع البكالوريا',
    setupFiliere: 'الشعبة',
    setupBacAnnee: 'السنة الدراسية للباكالوريا',
    setupBacAnneeHelp:
      'السنة الدراسية للحصول على البكالوريا (أو الجارية) — تُستعمَل للتحقق من أهليتك للإعلانات والمدارس.',
    setupSpecialite1: 'التخصص 1',
    setupSpecialite2: 'التخصص 2',
    setupSpecialite3Optional: 'التخصص 3 (اختياري)',
    setupDiplomeEnCours: 'الدبلوم الحالي',
    setupEtablissement: 'اسم المؤسسة',
    setupLyceeType: 'نوع الثانوية',
    setupPublic: 'عمومي',
    setupPrivate: 'خصوصي',
    setupPrefSchoolType: 'نوع المؤسسة المفضل',
    setupPrefServices: 'الخدمات المفضلة',
    setupLastName: 'الاسم',
    setupFirstName: 'النسب',
    setupEmail: 'البريد الإلكتروني',
    setupBirthDate: 'تاريخ الازدياد',
    setupBirthDatePlaceholder: 'يوم-شهر-سنة',
    setupGender: 'الجنس',
    setupMale: 'ذكر',
    setupFemale: 'أنثى',
    setupCity: 'المدينة',
    setupLoading: 'جارٍ التحميل…',
    setupCityHint: 'نصيحة: اضغط على الحقل لفتح القائمة والبحث عن مدينتك.',
    setupCityChoose: 'اختر مدينة…',
    setupCityModalTitle: 'اختر مدينتك',
    setupCitySearchPlaceholder: 'ابحث عن مدينة…',
    setupCityNoResults: 'لا توجد مدينة مطابقة',
    setupOptional: 'اختياري',
    setupGuardian: 'ولي الأمر',
    setupGuardianFather: 'الأب',
    setupGuardianMother: 'الأم',
    setupGuardianOther: 'آخر',
    setupGuardianLastName: 'اسم ولي الأمر',
    setupGuardianFirstName: 'النسب ولي الأمر',
    setupGuardianPhone: 'هاتف ولي الأمر',
    setupGuardianJob: 'المهنة',
    setupGuardianAddress: 'العنوان',
    setupConsent: 'هل توافق أن يتم التواصل معك؟',
    setupYes: 'نعم',
    setupNo: 'لا',
    setupBack: 'رجوع',
    setupContinue: 'متابعة',
    setupFinish: 'إنهاء',
    setupSaving: 'جارٍ الحفظ…',
    setupErrPickUserType: 'يرجى تحديد هل أنت طالب أم ولي أمر',
    setupErrPickLevel: 'يرجى اختيار المستوى الدراسي',
    setupErrPickBacType: 'يرجى اختيار نوع البكالوريا',
    setupErrPickFiliere: 'يرجى اختيار الشعبة',
    setupErrPickMissionSpecs: 'يرجى اختيار التخصصين الأولين لباك Mission',
    setupErrMissionSpecsDistinct: 'يجب أن يكون التخصصان الأولان مختلفين',
    setupErrMissionSpec3Distinct: 'يجب أن يكون التخصص الثالث مختلفًا عن الأولين',
    setupErrPickDiplome: 'يرجى إدخال الدبلوم الحالي',
    setupErrEtablissement: 'يرجى إدخال اسم المؤسسة',
    setupErrPickPrefSchoolType: 'يرجى اختيار نوع مؤسسة مفضل واحد على الأقل',
    setupErrFillRequired: 'يرجى ملء جميع الحقول الإلزامية',
    errInvalidEmail: 'البريد الإلكتروني غير صالح',
    setupDateCancel: 'إلغاء',
    setupDateOk: 'حسناً',
    estDetailTitle: 'ملف المدرسة',
    estDetailSummary: 'ملخص',
    estDetailPresentation: 'نبذة',
    estDetailDegrees: 'الشهادات الممنوحة',
    estDetailSectors: 'قطاعات المهن',
    estDetailScholarships: 'المنح',
    estDetailEngagements: 'الالتزامات',
    estDetailCampus: 'الحرم الجامعي',
    estDetailContact: 'التواصل',
    estDetailAnnouncements: 'إعلانات المؤسسة',
    estDetailAnnouncementsEmpty: 'لا توجد إعلانات منشورة لهذه المؤسسة حاليًا.',
    estLabelSectors: 'القطاعات',
    estLabelTuition: 'الدراسة',
    estLabelDuration: 'المدة',
    estLabelAdmission: 'الولوج',
    estAdmissionConcours: 'مباراة',
    estAdmissionDossier: 'دراسة الملف',
    estLabelTracks: 'الشُّعب',
    estLabelStudents: 'الطلبة',
    estLabelYears: 'سنوات الدراسة',
    estBadgeStateRecognized: 'معترف بها من الدولة',
    estBadgeRecommended: 'موصى بها',
    estBadgeSponsored: 'مموّلة',
    estScholarshipsAvailable: 'منح متاحة',
    accountTitle: 'حسابي',
    accountSubtitle: 'اطّلع على معلوماتك وقم بتحديثها.',
    accountLoginCta: 'تسجيل الدخول',
    accountSectionProfile: 'الملف الشخصي',
    accountSectionAcademic: 'المعلومات الأكاديمية',
    accountSectionTutor: 'وليّ الأمر',
    accountSelectPlaceholder: 'اختر…',
    accountSelectNoResults: 'لا توجد نتائج',
    accountSectionAccount: 'الحساب والوصول',
    accountPhone: 'رقم الهاتف',
    accountSetupStatus: 'حالة الملف',
    accountSetupComplete: 'مكتمل',
    accountSetupIncomplete: 'غير مكتمل',
    accountSave: 'حفظ',
    accountUpdatedTitle: 'حسابي',
    accountUpdatedBody: 'تم تحديث معلوماتك.',
    accountLogoutTitle: 'تسجيل الخروج',
    accountLogoutMessage: 'هل تريد حقاً تسجيل الخروج؟',
    accountLogoutConfirm: 'تسجيل الخروج',
    accountLogoutCancel: 'إلغاء',
    accountCityPlaceholder: 'اختر مدينة…',
    accountCitiesLoading: 'جارٍ تحميل المدن…',
    commonErrorTitle: 'خطأ',
    accountSectionOrders: 'طلباتي',
    accountOrdersEmpty: 'لا توجد طلبات حتى الآن.',
    accountOrdersLoading: 'جارٍ تحميل الطلبات…',
    accountOrdersError: 'تعذّر تحميل الطلبات.',
    estNotFound: 'غير موجود',
    shopEyebrow: 'E-Tawjihi',
    shopTitle: 'المتجر',
    shopSubtitle: 'اطلب عبر الإنترنت · الدفع عند التسليم',
    shopSearchPlaceholder: 'ابحث عن منتج أو باقة…',
    shopClearSearchA11y: 'مسح البحث',
    shopCartA11y: 'السلة',
    shopFilterAll: 'الكل',
    shopFilterProducts: 'منتجات',
    shopFilterPacks: 'باقات',
    shopErrorLoad: 'تعذّر تحميل المتجر.',
    shopLoading: 'جارٍ التحميل…',
    shopEmptyTitle: 'لا يوجد منتج',
    shopEmptyDesc: 'غيّر الفلاتر أو عد لاحقًا.',
    shopBadgeProduct: 'منتج',
    shopBadgePack: 'باقة',
    shopBadgeFree: 'توصيل مجاني',
    shopBadgeUnavailable: 'غير متوفر',
    shopOutOfStock: 'نفدت الكمية',
    shopAddA11y: 'أضف إلى السلة',
    shopAddedA11y: 'موجود في السلة',
    shopBuyNow: 'اطلب الآن',
    shopBuyNowA11y: 'اطلب الآن',
    shopViewProductA11y: 'عرض المنتج',
    tabHome: 'الرئيسية',
    tabEcoles: 'المدارس',
    tabInscriptions: 'التسجيلات',
    tabBoutique: 'المتجر',
    tabCompte: 'حسابي',

    // ── التسجيلات / تتبع الترشيحات ──
    inscEyebrow: 'التسجيلات والترشيحات',
    inscTitle: 'تسجيلاتي',
    inscSubtitle: 'تابع ترشيحاتك وابقَ على اطلاع بفترات التسجيل.',
    inscTabNotifications: 'الإشعارات',
    inscTabCandidacies: 'الترشيحات',
    inscTabAnnouncements: 'الإعلانات',
    inscFilterSchoolLabel: 'المؤسسة',
    inscFilterSchoolAll: 'جميع المؤسسات',
    inscFilterSchoolPickTitle: 'تصفية حسب المؤسسة',
    inscFilterSchoolSearchPlaceholder: 'ابحث عن مؤسسة…',
    inscFilterSchoolNoResults: 'لا توجد مؤسسة مطابقة',
    inscFilterReset: 'إعادة تعيين',
    inscFilterStatusLabel: 'الحالة',
    inscFilterStatusAll: 'الكل',
    inscFilterStatusOpen: 'مفتوح',
    inscFilterStatusClosed: 'مغلق',
    inscFilterEligibilityLabel: 'الأهلية',
    inscFilterEligibilityAll: 'الكل',
    inscFilterEligibilityEligible: 'مؤهل',
    inscFilterEligibilityNotEligible: 'غير مؤهل',
    inscSortLabel: 'ترتيب',
    inscSortDefault: 'افتراضي',
    inscSortClosingSoon: 'الأقرب إلى الإغلاق',
    inscLoading: 'جارٍ التحميل…',
    inscErrorLoad: 'تعذّر تحميل البيانات.',
    inscRetry: 'إعادة المحاولة',
    inscRequireLogin: 'سجّل الدخول لمتابعة ترشيحاتك.',
    inscRequireLoginCta: 'تسجيل الدخول',
    inscNotifEmptyTitle: 'لا توجد إشعارات',
    inscNotifEmptyDesc: 'ستظهر هنا تنبيهات التسجيل والنتائج والتوجيه.',
    inscNotifMarkAllRead: 'وسم الكل كمقروء',
    inscNotifFilterAll: 'الكل',
    inscNotifFilterUnread: 'غير المقروءة',
    inscCandidaciesEmptyTitle: 'لا توجد ترشيحات متابَعة',
    inscCandidaciesEmptyDesc: 'تابع إعلانًا بجانب لتبدأ تتبع ترشيحك.',
    inscCandidaciesEmptyCta: 'استكشاف الإعلانات',
    inscCandidaciesFilterAll: 'الكل',
    inscAnnouncementsEmptyTitle: 'لا توجد إعلانات',
    inscAnnouncementsEmptyDesc: 'لم يُنشر أي إعلان تسجيل في الوقت الحالي.',
    inscAnnouncementsFollow: 'متابعة',
    inscAnnouncementsFollowing: 'مُتابَع',
    inscAnnouncementsOpenLink: 'رابط التسجيل',
    inscAnnouncementsAlreadyTracked: 'مُتابَع بالفعل',
    inscAnnouncementsMarkApplied: 'لقد تقدّمت',
    inscStatusInterested: 'مهتم',
    inscStatusApplied: 'تم الترشّح',
    inscStatusPreAdmitted: 'انتقاء أوّلي',
    inscStatusAdmitted: 'مقبول',
    inscStatusEnrolled: 'مسجَّل',
    inscStatusRejected: 'غير مقبول',
    inscStatusWithdrawn: 'انسحاب',
    inscStatusActionTitle: 'تحديث الحالة',
    inscStatusActionSubtitle: 'اختر المرحلة الجديدة لترشّحك.',
    inscStatusActionUpdate: 'تحديث',
    inscStatusActionUpdating: 'جارٍ التحديث…',
    inscOpenLinkBtn: 'فتح الرابط',
    inscOpenLinkA11y: 'فتح رابط التسجيل الرسمي',
    inscOpenLinkBtnResult: 'عرض النتيجة',
    inscOpenLinkBtnScholarship: 'التقديم للمنحة',
    inscOpenLinkBtnOffer: 'الاستفادة من العرض',
    inscOpenLinkBtnInfo: 'معرفة المزيد',
    inscOpenLinkBtnRegister: 'رابط التسجيل',
    inscRemoveCandidacy: 'إزالة من المتابعة',
    inscRemoveCandidacyConfirmTitle: 'إزالة هذا الترشّح؟',
    inscRemoveCandidacyConfirmMsg: 'ستُحذف المتابعة والسجل الزمني لهذا الترشّح.',
    inscCancel: 'إلغاء',
    inscDelete: 'حذف',
    inscViewTimeline: 'عرض السجل الزمني',
    inscTimelineTitle: 'السجل الزمني للترشّح',
    inscTimelineEmpty: 'لا توجد أحداث بعد.',
    inscTimelineRelatedAnnouncements: 'الإعلانات المتعلقة بالمؤسسة',
    inscEventCreated: 'تم إنشاء الترشّح',
    inscEventStatusChanged: 'تغيير الحالة',
    inscEventLinkVisited: 'تم فتح رابط التسجيل',
    inscEventNoteAdded: 'تمت إضافة ملاحظة',
    inscEventDeadlineReminder: 'تذكير بالأجل',
    inscEventAnnouncementUpdate: 'تحديث الإعلان',
    inscDateOpens: 'الافتتاح',
    inscDateCloses: 'الإغلاق',
    inscDeadlineSoon: 'يقترب الإغلاق',
    inscClosed: 'مغلق',
    inscOpen: 'مفتوح',
    inscFreeRegistration: 'تسجيل مجاني',
    inscPreRegFee: 'الرسوم',
    inscNoLink: 'لا يوجد رابط رسمي',
    inscMarkAsCandidateConfirmTitle: 'متابعة هذا الإعلان؟',
    inscMarkAsCandidateConfirmMsg: 'ستتلقى إشعارات بالتحديثات وستتمكن من متابعة ترشّحك.',
    inscFollow: 'متابعة',
    inscUnfollow: 'إلغاء المتابعة',
    inscDetailLoading: 'جارٍ تحميل الإعلان…',
    inscDetailNotFound: 'الإعلان غير موجود.',
    inscDetailRetry: 'إعادة المحاولة',
    inscDetailAboutSchool: 'حول المؤسسة',
    inscDetailAnnouncementDescription: 'الوصف',
    inscDetailEligibility: 'شروط الأهلية',
    inscDetailFilieresBacNormal: 'الشُّعب (الباكالوريا العادية)',
    inscDetailFilieresBacMission: 'الشُّعب (الباكالوريا البعثة)',
    inscDetailAnneesBac: 'سنوات الباكالوريا المقبولة',
    inscDetailNoEligibilityCriteria: 'الإعلان مفتوح للجميع (لا توجد شروط مقيدة).',
    eligibilityYouEligible: 'أنت مؤهَّل',
    eligibilityYouNotEligible: 'أنت غير مؤهَّل',
    eligibilityProfileIncomplete:
      'أكمل ملفك الشخصي (الشعبة، سنة الباكالوريا…) للتحقق من أهليتك.',
    eligibilityProfileIncompleteCta: 'أكمل ملفي',
    eligibilityLoginCta: 'سجِّل الدخول لمعرفة أهليتك',
    eligibilityYourFiliere: 'شعبتك',
    eligibilityYourSpecialites: 'تخصصاتك',
    eligibilityYourYear: 'سنة الباكالوريا الخاصة بك',
    eligibilityFiliereAccepted: 'الشعبة مقبولة',
    eligibilityFiliereNotAccepted: 'الشعبة غير مقبولة',
    eligibilitySpecialiteAccepted: 'التخصص مقبول',
    eligibilitySpecialiteNotAccepted: 'التخصص غير مقبول',
    eligibilityYearAccepted: 'السنة مقبولة',
    eligibilityYearNotAccepted: 'السنة غير مقبولة',
    eligibilityNotProvided: 'غير محدد',
    eligibilityBadgeEligible: 'مؤهَّل',
    eligibilityBadgeNotEligible: 'غير مؤهَّل',
    eligibilityBadgeIncomplete: 'الملف غير مكتمل',
    eligibilityBacTypeMismatchLabel: 'نوع البكالوريا',
    eligibilityBacTypeOnlyNormal: 'هذا الإعلان موجّه لطلاب البكالوريا العادية',
    eligibilityBacTypeOnlyMission: 'هذا الإعلان موجّه لطلاب البكالوريا الفرنسية (Mission)',
    inscDetailDocuments: 'الوثائق المفيدة',
    inscDetailDocumentView: 'معاينة',
    inscDetailDocumentDownload: 'تحميل',
    inscDetailDocumentDownloading: 'جارٍ التحميل…',
    inscDetailDocumentDownloadErrorTitle: 'تعذّر التحميل',
    inscDetailDocumentDownloadErrorMsg:
      'تعذّر تحميل هذه الوثيقة. تحقّق من اتصالك ثم أعد المحاولة.',
    inscDetailDocumentSharingUnavailableTitle: 'المشاركة غير متاحة',
    inscDetailDocumentSharingUnavailableMsg:
      'مشاركة الملفات غير متاحة على هذا الجهاز.',
    inscDetailUsefulLinks: 'روابط مفيدة',
    inscDetailKeyDates: 'تواريخ مهمّة',
    inscDetailFees: 'رسوم التسجيل المسبق',
    inscDetailFreeRegistration: 'التسجيل مجاني',
    followSchoolBtn: 'متابعة هذه المؤسسة',
    followSchoolUnfollowBtn: 'إلغاء المتابعة',
    followSchoolUnfollowConfirmTitle: 'إلغاء متابعة هذه المؤسسة؟',
    followSchoolUnfollowConfirmMsg:
      'سيتم إزالة جميع الإعلانات والترشيحات المرتبطة بهذه المؤسسة من متابعتك. هذا الإجراء لا يمكن التراجع عنه.',
    followedSchoolsTitle: 'المؤسسات المتابَعة',
    followedSchoolStatTotalAnnouncements: 'الإعلانات',
    followedSchoolStatOpenAnnouncements: 'مفتوحة',
    followedSchoolStatCandidacies: 'الترشيحات',
    followedSchoolLatestAnnouncement: 'آخر إعلان',
    followedSchoolNoAnnouncements: 'لا توجد إعلانات حديثة لهذه المؤسسة.',
    followedSchoolNoAnnouncementsTitle: 'لا توجد إعلانات بعد',
    followedSchoolNoAnnouncementsHint:
      'سيتم إشعارك بمجرد نشر هذه المؤسسة لإعلان جديد (فتح التسجيل، النتائج، المنح…).',
    followedSchoolViewSchoolBtn: 'عرض بطاقة المؤسسة',
    followedSchoolTimelineTitle: 'متابعة المؤسسة',
    followedSchoolTimelineNoEvents: 'لا توجد أحداث حديثة.',
    followedSchoolTimelineNoAnnouncements: 'لا توجد إعلانات لهذه المؤسسة في الفترة.',
    followedSchoolHistoricalAnnouncements: 'إعلانات المؤسسة',
    followedSchoolViewSchool: 'عرض بطاقة المؤسسة',
    followedSchoolBackToList: 'العودة إلى المؤسسات المتابَعة',
  },
};
