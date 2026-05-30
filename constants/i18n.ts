export type AppLocale = 'fr' | 'ar';

export type HomeCopyKey =
  | 'notifications'
  | 'notifDrawerTitle'
  | 'notifDrawerClose'
  | 'notifDrawerSubtitle'
  | 'notifDrawerEmpty'
  | 'notifDrawerOpenLink'
  | 'notifDrawerSeeRecommendations'
  | 'notifDrawerContinueParcours'
  | 'unreadSuffix'
  | 'help'
  | 'profile'
  | 'greeting'
  | 'userSubtitle'
  | 'homePackLabel'
  | 'packStandardLabel'
  | 'bacMissionLabel'
  | 'newsTitle'
  | 'languageSwitcher'
  | 'langFr'
  | 'langAr'
  | 'gameDailyTitle'
  | 'orientation1BacHomeButton'
  | 'orientation1BacHomeLocked'
  | 'orientation1BacHomeLockedA11y'
  | 'homePackAcademicLine'
  | 'gameDailyBody'
  | 'dailyChallengeTitle'
  | 'dailyChallengeClose'
  | 'dailyChallengeNoChallenge'
  | 'dailyChallengeLoginHint'
  | 'dailyChallengeLoginCta'
  | 'dailyChallengeTestButton'
  | 'dailyChallengeRetry'
  | 'dailyChallengeStreak'
  | 'dailyChallengeStart'
  | 'dailyChallengeSubmit'
  | 'dailyChallengeNext'
  | 'dailyChallengeResult'
  | 'dailyChallengeRank'
  | 'dailyChallengePlayers'
  | 'dailyChallengeBadges'
  | 'dailyChallengeLeaderboard'
  | 'dailyChallengePlayed'
  | 'dailyChallengeMicroLearn'
  | 'dailyChallengeMicroLearnTeaser'
  | 'dailyChallengeMicroLearnModalSubtitle'
  | 'dailyChallengeMicroLearnModalIntro'
  | 'dailyChallengeMicroLearnGotIt'
  | 'dailyChallengeMicroLearnReopen'
  | 'dailyChallengePickGames'
  | 'dailyChallengePlayThis'
  | 'dailyChallengeGameDone'
  | 'dailyChallengeSeeScore'
  | 'dailyChallengeBackToGames'
  | 'dailyChallengeAllDone'
  | 'dailyChallengeZipHint'
  | 'dailyChallengeZipValidate'
  | 'dailyChallengeZipOrder'
  | 'dailyChallengeZipOrderError'
  | 'dailyChallengeZipPathError'
  | 'dailyChallengeZipPracticeTitle'
  | 'dailyChallengeZipPracticeHint'
  | 'dailyChallengeZipPracticeTag'
  | 'dailyChallengeZipPracticeResult'
  | 'dailyChallengeZipPracticeAgain'
  | 'dailyChallengeZipUndo'
  | 'dailyChallengeZipHelpBtn'
  | 'dailyChallengeZipHelpCooldown'
  | 'dailyChallengeZipHelpNoHint'
  | 'dailyChallengeZipReset'
  | 'dailyChallengeZipInteractionHint'
  | 'dailyChallengeZipHowToPlay'
  | 'dailyChallengeZipRulesCta'
  | 'dailyChallengeZipRulesTitle'
  | 'dailyChallengeZipSeeResults'
  | 'dailyChallengeYourTime'
  | 'dailyChallengeCongratsTitle'
  | 'dailyChallengeCongratsPracticeLine'
  | 'dailyChallengeFlawlessBadge'
  | 'dailyChallengeSolvedIn'
  | 'dailyChallengeResultCardTitle'
  | 'dailyChallengeBeatPlayersPrefix'
  | 'dailyChallengeBeatPlayersSuffix'
  | 'dailyChallengeLeaderboardModalTitle'
  | 'dailyChallengeLeaderboardTopToday'
  | 'dailyChallengeLeaderboardLoadMore'
  | 'dailyChallengeYouLabel'
  | 'dailyChallengePremiumBadge'
  | 'dailyChallengePremiumBadgeA11y'
  | 'dailyChallengeScoreLabel'
  | 'dailyChallengeHubHeroLine'
  | 'dailyChallengeMissionsTitle'
  | 'dailyChallengeProgressSectionTitle'
  | 'dailyChallengeProgressBannerKicker'
  | 'dailyChallengeProgressLevelShort'
  | 'dailyChallengeProgressXpCaption'
  | 'dailyChallengeProgressXpMaxed'
  | 'dailyChallengeProgressBadgeQuest'
  | 'dailyChallengeProgressRecordShort'
  | 'dailyChallengeProgressBestScoreShort'
  | 'dailyChallengeProgressBestTimeShort'
  | 'dailyChallengeProgressIceShort'
  | 'dailyChallengeStreakRecord'
  | 'dailyChallengeIceStock'
  | 'dailyChallengeYearProgressTitle'
  | 'dailyChallengeYearProgressFromTitle'
  | 'dailyChallengeLegendPlayed'
  | 'dailyChallengeLegendMissed'
  | 'dailyChallengeLegendIce'
  | 'dailyChallengeLegendFuture'
  | 'dailyChallengeMilestonesTitle'
  | 'dailyChallengeIceUsedTitle'
  | 'dailyChallengeIceUsedBody'
  | 'dailyChallengeIceUnlockedTitle'
  | 'dailyChallengeIceUnlockedBody'
  | 'dailyChallengeIceExplainTitle'
  | 'dailyChallengeIceExplainBody'
  | 'dailyChallengeIceExplainCta'
  | 'infoDailyTitle'
  | 'infoDailyBody'
  | 'practicalTitle'
  | 'practicalSubtitle'
  | 'practicalSectionA11y'
  | 'homeSeeMore'
  | 'homeMostVisitedSchoolsTitle'
  | 'homeMostVisitedSchoolsSubtitle'
  | 'homeMostVisitedSchoolsA11y'
  | 'homeLatestAnnouncementsTitle'
  | 'homeLatestAnnouncementsSubtitle'
  | 'homeLatestAnnouncementsA11y'
  | 'homeAnnouncementOpen'
  | 'homeAnnouncementClosed'
  | 'homeAnnouncementDatesLocked'
  | 'homeRefresh'
  | 'homeRefreshA11y'
  | 'homeRefreshing'
  | 'home_orientation_access_eyebrow'
  | 'home_orientation_access_title'
  | 'practical_orientation_section'
  | 'practical_services_section'
  | 'practical_diagnostic_ecoles'
  | 'sidebarOrientation1Bac'
  | 'practical_diagnostic_rapport'
  | 'practical_diagnostic_recommandations'
  | 'practical_diagnostic_ecoles_desc'
  | 'practical_diagnostic_rapport_desc'
  | 'practical_diagnostic_recommandations_desc'
  | 'practical_recommandations_locked_account'
  | 'practical_recommandations_locked_diagnostic'
  | 'practical_orientation_locked_title'
  | 'practical_orientation_loading'
  | 'practical_diagnostic_locked_account'
  | 'practical_rapport_locked_account'
  | 'practical_rapport_locked_diagnostic'
  | 'practical_ecoles'
  | 'practical_inscriptions'
  | 'practical_candidatures'
  | 'practical_evenements_desc'
  | 'practical_ecolesInscription'
  | 'practical_boutique'
  | 'practical_ecoles_desc'
  | 'practical_inscriptions_desc'
  | 'practical_candidatures_desc'
  | 'practical_evenements_desc'
  | 'practical_ecolesInscription_desc'
  | 'practical_boutique_desc'
  | 'practicalCardEyebrow'
  | 'practicalCardTap'
  | 'practicalCardA11y'
  | 'schoolsTitle'
  | 'schoolsHeroEyebrow'
  | 'schoolsHeroTitle'
  | 'schoolsFilters'
  | 'schoolsFiltersA11y'
  | 'schoolsFollowedOnlyA11y'
  | 'schoolsSearchPlaceholder'
  | 'schoolsSearchPlaceholderLocked'
  | 'schoolsSearchFiltersLockedHint'
  | 'schoolsTypeAll'
  | 'schoolsTypeLabel'
  | 'schoolsTypePublic'
  | 'schoolsTypePrivate'
  | 'schoolsTypeSemiPublic'
  | 'schoolsTypeMilitary'
  | 'schoolsFiltersTitle'
  | 'schoolsFiltersHint'
  | 'schoolsFilterAcceptedStudyLabel'
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
  | 'schoolsRefreshing'
  | 'estCardQnaOpenA11y'
  | 'estCardBtnComment'
  | 'estCardBadgeSponsored'
  | 'estCardStatsClusterA11y'
  | 'estCardStatsLoadingA11y'
  | 'schoolsClearFilter'
  | 'schoolsErrorNetwork'
  | 'planOffersTitle'
  | 'planOffersLink'
  | 'storiesA11y'
  | 'newsCarouselA11y'
  | 'swipeCardsHint'
  | 'bacCardEyebrow'
  | 'bacCardTitle'
  | 'bacCardDateLabel'
  | 'bacStatusNotYet'
  | 'bacStatusPublished'
  | 'bacCountdownKicker'
  | 'bacCountdownDays'
  | 'bacCountdownHours'
  | 'bacCountdownMinutes'
  | 'bacJourJTitle'
  | 'bacWaitingResult'
  | 'bacOutletsTitle'
  | 'bacOutletOutlook'
  | 'bacOutletSms'
  | 'bacOutletMenResults'
  | 'bacSiteStatusLabel'
  | 'bacSiteOnline'
  | 'bacSiteOffline'
  | 'bacLinkOutlook'
  | 'bacLinkMen'
  | 'bacLinkOutlookA11y'
  | 'bacLinkMenA11y'
  | 'bacTapForGuide'
  | 'bacOutletGuideA11y'
  | 'bacVerifyModalTitleOutlook'
  | 'bacVerifyModalTitleMen'
  | 'bacVerifyModalTitleSms'
  | 'bacVerifyStepsTitle'
  | 'bacMassarSectionTitle'
  | 'bacMassarSectionHint'
  | 'bacMassarPlaceholder'
  | 'bacMassarConfirm'
  | 'bacMassarEdit'
  | 'bacMassarSaved'
  | 'bacOutlookEmailLabel'
  | 'bacOutlookPasswordLabel'
  | 'bacOutlookPasswordHint'
  | 'bacOutlookStep1'
  | 'bacOutlookStep2'
  | 'bacOutlookStep3'
  | 'bacOutlookStep4'
  | 'bacOutlookStep5'
  | 'bacMenStep1'
  | 'bacMenStep2'
  | 'bacMenStep3'
  | 'bacMenStep4'
  | 'bacMenStep5'
  | 'bacMenStep6'
  | 'bacSmsStep1'
  | 'bacSmsStep2'
  | 'bacSmsStep3'
  | 'bacOpenOutlook'
  | 'bacOpenMenSite'
  | 'bacModalClose'
  | 'bacThresholdsEyebrow'
  | 'bacThresholdsTitle'
  | 'bacThresholdsSubtitle'
  | 'bacThresholdsTip'
  | 'bacThresholdsSectionNotes'
  | 'bacThresholdsSectionHint'
  | 'bacThresholdsRegional'
  | 'bacThresholdsNational'
  | 'bacThresholdsContinuous'
  | 'bacThresholdsOverall'
  | 'bacThresholdsPlaceholder'
  | 'bacThresholdsSave'
  | 'bacThresholdsSaved'
  | 'bacThresholdsResultsTitle'
  | 'bacThresholdsFormula7525'
  | 'bacThresholdsFormula5050'
  | 'bacThresholdsFormulaMajorBadge'
  | 'bacThresholdsOverallLabel'
  | 'bacThresholdsDisclaimer'
  | 'bacThresholdsOutOf20'
  | 'bacThresholdsCtaTitle'
  | 'bacThresholdsCtaSub'
  | 'bacThresholdsLockedSub'
  | 'orientationTapHint'
  | 'orientationProgressLabel'
  | 'orientationTasksA11y'
  | 'orientationModalSubtitle'
  | 'orientationFranchisedEmpty'
  | 'orientationContinueCta'
  | 'orientationSeeAllSteps'
  | 'orientationStepCountLabel'
  | 'orientationStepAccountSetup'
  | 'orientationStepAccountSetupShort'
  | 'orientationStepBadgeDone'
  | 'orientationStepBadgeCurrent'
  | 'orientationStepBadgeTodo'
  | 'orientationStepOrientationDiagnostic'
  | 'orientationStepOrientationDiagnosticShort'
  | 'orientationStepRecommendation'
  | 'orientationStepRecommendationShort'
  | 'orientationStepRecommendationHint'
  | 'diagnosticRecoFollowBanner'
  | 'diagnosticRecoFollowBannerDone'
  | 'practical_diagnostic_recommandations_follow_hint'
  | 'orientationStepFeedback'
  | 'orientationStepFeedbackShort'
  | 'appFeedbackTitle'
  | 'appFeedbackIntro'
  | 'appFeedbackEyebrow'
  | 'appFeedbackProgress'
  | 'appFeedbackScaleHint'
  | 'appFeedbackOptionTresBien'
  | 'appFeedbackOptionBien'
  | 'appFeedbackOptionMoyen'
  | 'appFeedbackCatDesign'
  | 'appFeedbackCatDesignDesc'
  | 'appFeedbackCatSimplicity'
  | 'appFeedbackCatSimplicityDesc'
  | 'appFeedbackCatTranslations'
  | 'appFeedbackCatTranslationsDesc'
  | 'appFeedbackCatRecommendations'
  | 'appFeedbackCatRecommendationsDesc'
  | 'appFeedbackCatSchools'
  | 'appFeedbackCatSchoolsDesc'
  | 'appFeedbackCatContent'
  | 'appFeedbackCatContentDesc'
  | 'appFeedbackCatTechnical'
  | 'appFeedbackCatTechnicalDesc'
  | 'appFeedbackCatShop'
  | 'appFeedbackCatShopDesc'
  | 'appFeedbackCatComments'
  | 'appFeedbackCatCommentsDesc'
  | 'appFeedbackQDesignOverall'
  | 'appFeedbackQDesignOverallDesc'
  | 'appFeedbackQDesignNav'
  | 'appFeedbackQDesignNavDesc'
  | 'appFeedbackQDesignRead'
  | 'appFeedbackQDesignReadDesc'
  | 'appFeedbackQEaseFirst'
  | 'appFeedbackQEaseFirstDesc'
  | 'appFeedbackQEaseFind'
  | 'appFeedbackQEaseFindDesc'
  | 'appFeedbackQEaseForms'
  | 'appFeedbackQEaseFormsDesc'
  | 'appFeedbackQTransFr'
  | 'appFeedbackQTransFrDesc'
  | 'appFeedbackQTransAr'
  | 'appFeedbackQTransArDesc'
  | 'appFeedbackQTransConsist'
  | 'appFeedbackQTransConsistDesc'
  | 'appFeedbackQRecoRel'
  | 'appFeedbackQRecoRelDesc'
  | 'appFeedbackQRecoClear'
  | 'appFeedbackQRecoClearDesc'
  | 'appFeedbackQRecoDiag'
  | 'appFeedbackQRecoDiagDesc'
  | 'appFeedbackQSchoolSearch'
  | 'appFeedbackQSchoolSearchDesc'
  | 'appFeedbackQSchoolAnn'
  | 'appFeedbackQSchoolAnnDesc'
  | 'appFeedbackQSchoolFollow'
  | 'appFeedbackQSchoolFollowDesc'
  | 'appFeedbackQContentHome'
  | 'appFeedbackQContentHomeDesc'
  | 'appFeedbackQContentNotif'
  | 'appFeedbackQContentNotifDesc'
  | 'appFeedbackQTechSpeed'
  | 'appFeedbackQTechSpeedDesc'
  | 'appFeedbackQTechStable'
  | 'appFeedbackQTechStableDesc'
  | 'appFeedbackQTechBugs'
  | 'appFeedbackQTechBugsDesc'
  | 'appFeedbackQShop'
  | 'appFeedbackQShopDesc'
  | 'appFeedbackTextImprove'
  | 'appFeedbackTextImprovePh'
  | 'appFeedbackTextBugs'
  | 'appFeedbackTextBugsPh'
  | 'appFeedbackTextFeatures'
  | 'appFeedbackTextFeaturesPh'
  | 'appFeedbackSubmit'
  | 'appFeedbackThanks'
  | 'appFeedbackThanksSub'
  | 'appFeedbackThanksEyebrow'
  | 'appFeedbackThanksCardTitle'
  | 'appFeedbackThanksCardSub'
  | 'appFeedbackError'
  | 'appFeedbackLoginRequired'
  | 'appFeedbackRequiredRatings'
  | 'appFeedbackRequiredComment'
  | 'appFeedbackOpenCta'
  | 'appUpdateEyebrow'
  | 'appUpdateTitleRequired'
  | 'appUpdateTitleRecommended'
  | 'appUpdateCta'
  | 'appUpdateLater'
  | 'appUpdateVersionHint'
  | 'pushPermissionModalTitle'
  | 'pushPermissionModalBody'
  | 'pushPermissionModalHint'
  | 'pushPermissionModalOpenSettings'
  | 'pushPermissionModalLater'
  | 'orientationStepApplyToSchools'
  | 'orientationStepApplyToSchoolsShort'
  | 'applySchoolsTourEyebrow'
  | 'applySchoolsTourTitle'
  | 'applySchoolsTourNext'
  | 'applySchoolsTourBack'
  | 'applySchoolsTourTapNotif'
  | 'applySchoolsTourTapFollow'
  | 'applySchoolsTourTapStatus'
  | 'applySchoolsTourFocusTap'
  | 'applySchoolsTourFocusLearn'
  | 'applySchoolsTourTrackerStep'
  | 'applySchoolsTourTrackerActionTitle'
  | 'applySchoolsTourTrackerPending'
  | 'applySchoolsTourTrackerDone'
  | 'applySchoolsTourActionTapNotification'
  | 'applySchoolsTourActionTapContinue'
  | 'applySchoolsTourActionTapFollow'
  | 'applySchoolsTourActionTapStatus'
  | 'applySchoolsTourActionTapCandidaciesTab'
  | 'applySchoolsTourActionTapRegistrationLink'
  | 'applySchoolsTourTabsLegend'
  | 'applySchoolsTourTabsAnnouncementsPlaceholder'
  | 'applySchoolsTourTabsTapCandidaciesHint'
  | 'applySchoolsTourGoInscriptions'
  | 'applySchoolsTourTeaseTitle'
  | 'applySchoolsTourTeaseSub'
  | 'applySchoolsTourTeaseHint'
  | 'applySchoolsTourPushHint'
  | 'applySchoolsTourCardTypeHint'
  | 'applySchoolsTourCardFollowHint'
  | 'applySchoolsTourCardStatusHint'
  | 'applySchoolsTourFollowHint'
  | 'applySchoolsTourStatusHint'
  | 'applySchoolsTourCandidacyHint'
  | 'applySchoolsTourBravoTitle'
  | 'applySchoolsTourBravoSub'
  | 'applySchoolsTourStep_notification_tease_title'
  | 'applySchoolsTourStep_notification_tease_body'
  | 'applySchoolsTourStep_push_preview_title'
  | 'applySchoolsTourStep_push_preview_body'
  | 'applySchoolsTourStep_announcement_card_title'
  | 'applySchoolsTourStep_announcement_card_body'
  | 'applySchoolsTourRegistrationLinkHint'
  | 'applySchoolsTourStep_registration_link_title'
  | 'applySchoolsTourStep_registration_link_body'
  | 'applySchoolsTourStep_follow_action_title'
  | 'applySchoolsTourStep_follow_action_body'
  | 'applySchoolsTourStep_status_action_title'
  | 'applySchoolsTourStep_status_action_body'
  | 'applySchoolsTourStep_inscriptions_tabs_title'
  | 'applySchoolsTourStep_inscriptions_tabs_body'
  | 'applySchoolsTourStep_candidacies_tab_title'
  | 'applySchoolsTourStep_candidacies_tab_body'
  | 'applySchoolsTourStep_candidacy_card_title'
  | 'applySchoolsTourStep_candidacy_card_body'
  | 'applySchoolsTourStep_bravo_title'
  | 'applySchoolsTourStep_bravo_body'
  | 'inscCandidaciesEmptyTourCta'
  | 'orientationStepAppDiscovery'
  | 'orientationStepAppDiscoveryShort'
  | 'orientationStepInviteFriend'
  | 'orientationStepInviteFriendShort'
  | 'modalClose'
  | 'closeOverlayA11y'
  | 'dailyPlay'
  | 'dailyPlayed'
  | 'homeDailyStreakOne'
  | 'homeDailyStreakMany'
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
  | 'registerPasswordRulesTitle'
  | 'registerPasswordRuleMinLength'
  | 'registerPasswordRuleUpper'
  | 'registerPasswordRuleLower'
  | 'registerPasswordRuleNumber'
  | 'registerPasswordRuleSpecial'
  | 'registerPasswordWeak'
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
  | 'forgotSubtitleWhatsapp'
  | 'forgotSuccessWhatsappTitle'
  | 'forgotSuccessWhatsappBody'
  | 'forgotCtaWhatsapp'
  | 'forgotCtaCheckPhone'
  | 'forgotAccountNotFound'
  | 'forgotAccountFoundTitle'
  | 'forgotAccountFoundIntro'
  | 'forgotWhatsappMessageLabel'
  | 'forgotWhatsappContactLabel'
  | 'forgotWhatsappMessage'
  | 'forgotCopyWhatsappMessage'
  | 'forgotCopied'
  | 'forgotOpenWhatsappCta'
  | 'deviceTransferTitle'
  | 'deviceTransferSubtitle'
  | 'deviceTransferIntro'
  | 'deviceTransferIntroMulti'
  | 'deviceTransferPickSubtitle'
  | 'deviceTransferPickIntro'
  | 'deviceTransferPickLabel'
  | 'deviceTransferSecurityHint'
  | 'deviceTransferCta'
  | 'deviceTransferSupportLabel'
  | 'deviceTransferSupportHint'
  | 'deviceTransferOpenSupportWhatsapp'
  | 'deviceTransferErrInvalid'
  | 'forgotWhatsappStepsTitle'
  | 'forgotWhatsappStepSend'
  | 'forgotWhatsappStepSameNumber'
  | 'forgotWhatsappStepFollow'
  | 'verifyOtpTitle'
  | 'verifyOtpSubtitle'
  | 'verifyOtpCta'
  | 'verifyOtpResend'
  | 'verifyOtpErrInvalid'
  | 'verifyOtpErrMissingPhone'
  | 'verifyOtpCodeLabel'
  | 'verifyOtpHint'
  | 'forgotInfoWhatsapp'
  | 'forgotWhatsappNotSent'
  | 'forgotSuccessManychatTitle'
  | 'forgotSuccessManychatIntro'
  | 'forgotSuccessManychatStep1'
  | 'forgotSuccessManychatStep2'
  | 'forgotSuccessManychatStep3'
  | 'forgotSuccessManychatStep4'
  | 'forgotSuccessManychatSamePhone'
  | 'forgotSuccessManychatAltApp'
  | 'forgotSuccessCtaEnterCodeInApp'
  | 'resetFlowStep1'
  | 'resetFlowStep2'
  | 'resetFlowStep3'
  | 'resetPasswordTitle'
  | 'resetPasswordSubtitle'
  | 'resetPasswordNew'
  | 'resetPasswordConfirm'
  | 'resetPasswordCta'
  | 'resetPasswordDoneTitle'
  | 'resetPasswordDoneBody'
  | 'resetPasswordErrToken'
  | 'resetPasswordErrMatch'
  | 'loginShowPassword'
  | 'loginHidePassword'
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
  | 'setupFiliere1Bac'
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
  | 'estDetailMediaPhotos'
  | 'estDetailMediaVideo'
  | 'estDetailMediaVideoOpen'
  | 'estDetailMediaBrochure'
  | 'estDetailMediaBrochureOpen'
  | 'estDetailDegrees'
  | 'estDetailSectors'
  | 'estDetailScholarships'
  | 'estDetailEngagements'
  | 'estDetailCampus'
  | 'estDetailCampusNoMapsUrl'
  | 'estDetailContact'
  | 'estDetailAnnouncements'
  | 'estDetailAnnouncementsEmpty'
  | 'estLabelSectors'
  | 'estLabelTuition'
  | 'estLabelSchoolType'
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
  | 'accountSectionActiveServices'
  | 'accountActiveServicesLoading'
  | 'accountActiveServicesError'
  | 'accountActiveServicesEmpty'
  | 'accountActiveServicesEndDate'
  | 'accountActiveServicesNoEndDate'
  | 'accountActiveServicesDaysRemaining'
  | 'accountActiveServicesOneDayLeft'
  | 'accountActiveServicesEndsToday'
  | 'accountActiveServicesContract'
  | 'accountActiveServicesPrice'
  | 'accountActiveServicesPromo'
  | 'accountActiveServicesPaymentComplete'
  | 'accountActiveServicesPaymentIncomplete'
  | 'accountActiveServicesRemaining'
  | 'accountActiveServicesPaid'
  | 'accountActiveServicesTotal'
  | 'accountActiveServicesTransactions'
  | 'accountActiveServicesNoTransactions'
  | 'accountActiveServicesTxDate'
  | 'accountActiveServicesTxMethod'
  | 'accountActiveServicesTxStatus'
  | 'accountActiveServicesDownloadReceipt'
  | 'accountActiveServicesReceiptSoonTitle'
  | 'accountActiveServicesReceiptSoonBody'
  | 'accountActiveServicesReceiptError'
  | 'accountActiveServicesReceiptShareUnavailable'
  | 'referralTeaserTitle'
  | 'referralTeaserSubtitle'
  | 'referralTeaserCta'
  | 'referralPageTitle'
  | 'referralBalanceLabel'
  | 'referralPointsUnit'
  | 'referralPendingPoints'
  | 'referralYourCode'
  | 'referralYourLink'
  | 'referralCopyCode'
  | 'referralCopyLink'
  | 'referralCopied'
  | 'referralShareWhatsApp'
  | 'referralHowItWorks'
  | 'referralStep1Title'
  | 'referralStep1Body'
  | 'referralStep2Title'
  | 'referralStep2Body'
  | 'referralStep3Title'
  | 'referralStep3Body'
  | 'referralStep4Title'
  | 'referralStep4Body'
  | 'referralInvitesTitle'
  | 'referralInviteCompleted'
  | 'referralInviteNotCompleted'
  | 'referralPointsEarned'
  | 'referralPointsPendingLabel'
  | 'referralHistoryTitle'
  | 'referralLedgerProfile'
  | 'referralLedgerOrder'
  | 'referralLedgerBonus'
  | 'referralLedgerSpend'
  | 'referralPartnersTitle'
  | 'referralPartnersHint'
  | 'referralRedeemSoon'
  | 'referralShareMessage'
  | 'referralInvitesEmpty'
  | 'referralViewAllInvites'
  | 'referralPointsSoonNote'
  | 'referralPageSubtitle'
  | 'referralReferredDiscountHint'
  | 'referralReferredDiscountBadge'
  | 'referralReferredDiscountShopLine'
  | 'referralLockedTitle'
  | 'referralLockedBody'
  | 'referralLockedCta'
  | 'referralTiersTitle'
  | 'referralTiersSubtitle'
  | 'referralQualifiedCount'
  | 'referralTierBadge'
  | 'referralTierUnlocked'
  | 'referralTierRemaining'
  | 'referralTierThreshold'
  | 'referralTeaserQualifiedLabel'
  | 'referralTeaserAllUnlocked'
  | 'referralStep3BodyNew'
  | 'referralStep4BodyNew'
  | 'referralTierPickReward'
  | 'referralTierYourReward'
  | 'referralTierPickProduct'
  | 'referralTierChoiceHint'
  | 'referralTierGeneratePromo'
  | 'referralTierRewardFree'
  | 'referralTierPromoTitle'
  | 'referralTierPromoUsed'
  | 'referralTierPromoAvailable'
  | 'referralTierPromoHint'
  | 'referralTierPromoError'
  | 'referralTierGoShop'
  | 'referralSingleRewardHint'
  | 'referralRewardTakenBadge'
  | 'referralRewardTakenOnOtherTier'
  | 'loyaltyTeaserTitle'
  | 'loyaltyTeaserSubtitle'
  | 'loyaltyTeaserCta'
  | 'loyaltyTeaserNextReward'
  | 'loyaltyPageTitle'
  | 'loyaltyBalanceLabel'
  | 'loyaltyPointsUnit'
  | 'loyaltyPendingPoints'
  | 'loyaltyHowItWorks'
  | 'loyaltyEarnRate'
  | 'loyaltyRateBadge'
  | 'loyaltyStep1Title'
  | 'loyaltyStep1Body'
  | 'loyaltyStep2Title'
  | 'loyaltyStep2Body'
  | 'loyaltyStep3Title'
  | 'loyaltyStep3Body'
  | 'loyaltyStep4Title'
  | 'loyaltyStep4Body'
  | 'loyaltyRewardsTitle'
  | 'loyaltyRewardsHint'
  | 'loyaltyTierLabel'
  | 'loyaltyRedeemCta'
  | 'loyaltyRedeemLocked'
  | 'loyaltyRedeemInactive'
  | 'loyaltyRedeemSoonTitle'
  | 'loyaltyRedeemSoonBody'
  | 'loyaltyRedeemConfirmTitle'
  | 'loyaltyRedeemConfirmBody'
  | 'loyaltyRedeemSuccessTitle'
  | 'loyaltyRedeemSuccessBody'
  | 'loyaltyRedeemAlreadyUsed'
  | 'loyaltyRedeemInsufficient'
  | 'loyaltyRedeemError'
  | 'loyaltyRedeemCancel'
  | 'loyaltyAlreadyRedeemedLabel'
  | 'loyaltyPointsToUnlock'
  | 'loyaltyNextRewardBar'
  | 'loyaltyGroupProducts'
  | 'loyaltyGroupServices'
  | 'loyaltyCatalogLoading'
  | 'loyaltyCatalogError'
  | 'loyaltyCatalogRetry'
  | 'loyaltyCatalogEmpty'
  | 'loyaltyHistoryTitle'
  | 'loyaltyLedgerEarn'
  | 'loyaltyLedgerSpend'
  | 'loyaltyLedgerWelcome'
  | 'loyaltyPointsGoal'
  | 'loyaltyViewAllRewards'
  | 'loyaltyViewAllCount'
  | 'loyaltyCatalogPageTitle'
  | 'loyaltyCatalogPageSubtitle'
  | 'loyaltyTimelineBalanceFoot'
  | 'loyaltyEarnRulesTitle'
  | 'loyaltyEarnRulesSelf'
  | 'loyaltyEarnRulesReferrer'
  | 'loyaltyPerMadSuffix'
  | 'accountSectionAcademic'
  | 'accountMassarCode'
  | 'accountStudentCode'
  | 'accountMassarCodeHint'
  | 'accountStudentCodeHint'
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
  | 'commonLoadError'
  | 'commonRetry'
  | 'apiErrNetwork'
  | 'apiErrTimeout'
  | 'apiErrUnauthorized'
  | 'apiErrForbidden'
  | 'apiErrNotFound'
  | 'apiErrValidation'
  | 'apiErrConflict'
  | 'apiErrServer'
  | 'apiErrRateLimit'
  | 'apiErrGeneric'
  | 'apiErrAuth'
  | 'apiErrDiagnostic'
  | 'apiErrDailyChallenge'
  | 'qnaErrorGeneric'
  | 'accountSectionOrders'
  | 'accountOrdersEmpty'
  | 'accountOrdersEmptyProducts'
  | 'accountOrdersEmptyServices'
  | 'accountOrdersLoading'
  | 'accountOrdersError'
  | 'accountTabProfile'
  | 'accountRefreshing'
  | 'accountTabOrders'
  | 'accountOrdersOpenBadgeA11y'
  | 'accountOrdersOpenCount'
  | 'accountOrdersSegmentAll'
  | 'accountOrdersSegmentProducts'
  | 'accountOrdersSegmentServices'
  | 'accountOrderViewDetail'
  | 'accountOrderDetailTitle'
  | 'accountOrderDetailNotFound'
  | 'accountOrderPhysicalSection'
  | 'accountOrderServicesSection'
  | 'accountOrderPaymentSection'
  | 'accountOrderRecapSection'
  | 'accountOrderCompletedNote'
  | 'accountOrderPromoAddTitle'
  | 'accountOrderPromoPlaceholder'
  | 'accountOrderPromoApply'
  | 'accountOrderPromoApplying'
  | 'accountOrderPromoHint'
  | 'accountOrderPromoLockedHint'
  | 'accountOrderPromoDiscount'
  | 'accountOrderPromoApplied'
  | 'estNotFound'
  | 'shopEyebrow'
  | 'shopTitle'
  | 'shopSubtitle'
  | 'shopSearchPlaceholder'
  | 'shopClearSearchA11y'
  | 'shopCartA11y'
  | 'shopCartPayMethodsTitle'
  | 'shopCartPayMethodCashDelivery'
  | 'shopCartPayMethodOffice'
  | 'shopCartPayMethodBankTransfer'
  | 'shopCartPayMethodCashplus'
  | 'shopCartPayDisclaimer'
  | 'shopCartEyebrowBoutique'
  | 'shopCartTitle'
  | 'shopCartItemsOne'
  | 'shopCartItemsMany'
  | 'shopCartEmptyTitle'
  | 'shopCartEmptyDesc'
  | 'shopCartEmptyCta'
  | 'shopCartPerUnit'
  | 'shopCartQtyLabel'
  | 'shopCartRemove'
  | 'shopCartSummaryTitle'
  | 'shopCartSubtotal'
  | 'shopCartShippingLbl'
  | 'shopCartShippingFreeAll'
  | 'shopCartShippingNext'
  | 'shopCartTotalEstimated'
  | 'shopCartFooterTotal'
  | 'shopCartGoCheckout'
  | 'shopCartReplaceServiceTitle'
  | 'shopCartReplaceServiceMessage'
  | 'shopCartReplaceServiceMessageMany'
  | 'shopCartReplaceServiceAccept'
  | 'shopCartReplaceServiceCancel'
  | 'shopCheckoutEyebrowBoutique'
  | 'shopCheckoutTitle'
  | 'shopCheckoutItemsSummary'
  | 'shopCheckoutErrSubmit'
  | 'shopCheckoutErrGeneric'
  | 'shopCheckoutDeliveryTitle'
  | 'shopCheckoutDeliveryDesc'
  | 'shopCheckoutDeliveryInfo'
  | 'shopCheckoutDeliveryInfoFree'
  | 'shopCheckoutContactTitle'
  | 'shopCheckoutContactDesc'
  | 'shopCheckoutLblEmail'
  | 'shopCheckoutLblFullName'
  | 'shopCheckoutLblPhone'
  | 'shopCheckoutPhEmail'
  | 'shopCheckoutPhName'
  | 'shopCheckoutPhPhone'
  | 'shopCheckoutLblStudentCity'
  | 'shopCheckoutPickCity'
  | 'shopCheckoutPaymentTitle'
  | 'shopCheckoutPaymentDescMixed'
  | 'shopCheckoutPaymentDescServices'
  | 'shopCheckoutPayBank'
  | 'shopCheckoutPayCashplus'
  | 'shopCheckoutPayOffice'
  | 'shopCheckoutPayOnDelivery'
  | 'shopCheckoutAddrTitle'
  | 'shopCheckoutAddrDesc'
  | 'shopCheckoutLblCityShip'
  | 'shopCheckoutLblAddress'
  | 'shopCheckoutPhAddress'
  | 'shopCheckoutNotesTitle'
  | 'shopCheckoutNotesDesc'
  | 'shopCheckoutPhNotes'
  | 'shopCheckoutRecapTitle'
  | 'shopCheckoutUpgradeCatalog'
  | 'shopCheckoutUpgradeCredit'
  | 'shopCheckoutLblSubtotal'
  | 'shopCheckoutPromoTitle'
  | 'shopCheckoutPromoHint'
  | 'shopCheckoutPromoPh'
  | 'shopCheckoutPromoApply'
  | 'shopCheckoutPromoRemove'
  | 'shopCheckoutLblDiscount'
  | 'shopCheckoutLblDiscountPercent'
  | 'shopCheckoutLblArticlesNet'
  | 'shopCheckoutPromoAppliedPercent'
  | 'shopCheckoutPromoAppliedFixed'
  | 'shopCheckoutPromoScopedHint'
  | 'shopCheckoutPromoErrEnter'
  | 'shopCheckoutPromoErrValidate'
  | 'shopCheckoutLblShipping'
  | 'shopCheckoutShipNoPhysical'
  | 'shopCheckoutShipFree'
  | 'shopCheckoutShipPickCity'
  | 'shopCheckoutLblTotal'
  | 'shopCheckoutConfirmBtn'
  | 'shopCheckoutDisclaimerPod'
  | 'shopCheckoutDisclaimerInstr'
  | 'shopCheckoutDisclaimerSecure'
  | 'shopCheckoutSheetCityShip'
  | 'shopCheckoutSheetCityResidence'
  | 'shopCheckoutStudentHintFree'
  | 'shopCheckoutStudentHint'
  | 'shopCheckoutStudentHintFreeShort'
  | 'shopCheckoutVilleMetaFree'
  | 'shopCheckoutVilleMetaFixed'
  | 'shopCheckoutVilleMetaCatalog'
  | 'shopCheckoutShipFreeBanner'
  | 'shopCheckoutErrEmail'
  | 'shopCheckoutErrFullName'
  | 'shopCheckoutErrPhone'
  | 'shopCheckoutErrStudyLevel'
  | 'shopCheckoutErrBacType'
  | 'shopCheckoutErrMissionSpecs'
  | 'shopCheckoutErrFiliere'
  | 'shopCheckoutErrStudentVille'
  | 'shopCheckoutErrPayment'
  | 'shopCheckoutErrShipCity'
  | 'shopCheckoutErrAddress'
  | 'shopThankEyebrowBoutique'
  | 'shopThankCashplusCodeLbl'
  | 'shopThankPaymentHeading'
  | 'shopThankModalityBank'
  | 'shopThankModalityCashplus'
  | 'shopThankModalityOffice'
  | 'shopThankModalityPayOnDelivery'
  | 'shopThankLevelLine'
  | 'shopThankBacLine'
  | 'shopThankFiliereLine'
  | 'shopThankMissionLine'
  | 'shopThankStudentCityLine'
  | 'shopThankDelayIndicative'
  | 'shopThankCodCashTip'
  | 'shopThankPickupPayOnSite'
  | 'shopThankSummarySubtotalItems'
  | 'shopThankSummaryShipLbl'
  | 'shopThankSummaryShipFeesLbl'
  | 'shopThankPickupBase'
  | 'shopThankPickupTimePart'
  | 'shopFilterAll'
  | 'shopFilterProducts'
  | 'shopFilterPacks'
  | 'shopFilterServices'
  | 'shopServicesError'
  | 'shopServicesEmpty'
  | 'shopServicesSectionTitle'
  | 'shopServicesSeeAll'
  | 'shopServicesOpenWeb'
  | 'shopServicesPopular'
  | 'shopServicesFiliereAll'
  | 'shopServicesEligibleYou'
  | 'shopServicesFiliereMission'
  | 'shopServicesFiliereReste'
  | 'shopSearchServicesPlaceholder'
  | 'shopServiceDetail'
  | 'shopServicePromoChip'
  | 'shopEntitlementAlreadyOwned'
  | 'shopEntitlementIncluded'
  | 'shopEntitlementIncludedVia'
  | 'shopEntitlementBlocked'
  | 'shopEntitlementRequiresPrerequisite'
  | 'shopEntitlementUpgradeAvailable'
  | 'shopEntitlementNotPurchasable'
  | 'shopEntitlementChecking'
  | 'shopEntitlementIncludedNoPurchase'
  | 'shopEntitlementIncludedPriceHint'
  | 'shopErrorLoad'
  | 'shopLoading'
  | 'shopEmptyTitle'
  | 'shopRefreshing'
  | 'shopEmptyDesc'
  | 'shopEstablishmentsConcernedNotice'
  | 'shopBadgeProduct'
  | 'shopBadgePack'
  | 'shopBadgeService'
  | 'shopBadgeFree'
  | 'shopBadgeBestseller'
  | 'shopBadgeUnavailable'
  | 'shopOutOfStock'
  | 'shopAddA11y'
  | 'shopAddedA11y'
  | 'shopRemoveFromCartA11y'
  | 'shopBuyNow'
  | 'shopBuyNowA11y'
  | 'shopViewProductA11y'
  | 'shopViewServiceA11y'
  | 'shopThankHeroTitle'
  | 'shopThankHeroDesc'
  | 'shopThankRefLabel'
  | 'shopThankTotalLabel'
  | 'shopThankNextStepsTitle'
  | 'shopThankOrderNotFound'
  | 'shopThankBankSectionTitle'
  | 'shopThankBankNameLbl'
  | 'shopThankBankRibLbl'
  | 'shopThankBankHolderLbl'
  | 'shopThankBankInstructionsTitle'
  | 'shopThankBankUploadTitle'
  | 'shopThankBankUploadHint'
  | 'shopThankBankUploadPick'
  | 'shopThankBankUploadBusy'
  | 'shopThankBankUploadOk'
  | 'shopThankBankUploadErr'
  | 'shopThankBankViewReceipt'
  | 'shopThankBankWhatsappHint'
  | 'shopThankBankWhatsappOpen'
  | 'shopThankCopy'
  | 'shopThankCopied'
  | 'shopThankCopyAllBank'
  | 'shopThankCopyInstructions'
  | 'shopThankBankCoordinTitle'
  | 'shopThankWhatsappPrefill'
  | 'shopThankCashplusAgencyHint'
  | 'shopThankCashplusActivationHint'
  | 'shopThankCashplusDelayHint'
  | 'shopThankCashplusGotoAccountCta'
  | 'shopThankWhatsappPrefillCashplus'
  | 'shopThankPaymentHelpWhatsappTitle'
  | 'shopThankWhatsappHintHelp'
  | 'shopThankNextStep1Bank'
  | 'shopThankNextStep2Bank'
  | 'shopThankNextStep1Followup'
  | 'shopThankNextStep2Followup'
  | 'shopThankNextStep1Cod'
  | 'shopThankNextStep2Cod'
  | 'shopThankNextStep3Cod'
  | 'shopThankBackShop'
  | 'accountOrderReceiptLink'
  | 'shopThankContactTitle'
  | 'shopThankItemsTitle'
  | 'shopThankDeliveryTitle'
  | 'shopThankPickupTitle'
  | 'shopThankOfficeMapsBtn'
  | 'shopThankOfficeAddressLbl'
  | 'shopThankOfficeHoursLbl'
  | 'shopThankOfficePhoneLbl'
  | 'shopThankOfficeCallHint'
  | 'shopThankInstructionsTitle'
  | 'shopEstCategoryPublic'
  | 'shopEstCategoryMilitary'
  | 'shopEstCategorySemiPublic'
  | 'shopEstCategoryPrivate'
  | 'shopEstCategoryOther'
  | 'tabHome'
  | 'tabEcoles'
  | 'tabInscriptions'
  | 'tabBoutique'
  | 'tabCompte'
  | 'hubWhatsAppA11y'
  | 'hubWhatsAppPrefill'
  | 'hubGlobalWallUnreadBadgeA11y'
  | 'globalWallTitle'
  | 'globalWallIntro'
  | 'globalWallEmpty'
  | 'globalWallPullToRefresh'
  | 'globalWallReplies'
  | 'globalWallReplyPlaceholder'
  | 'globalWallLoginToReply'
  | 'globalWallError'
  | 'globalWallBubbleA11y'
  | 'globalWallComposerPlaceholder'
  | 'globalWallPublishMainFeed'
  | 'globalWallPublishAsReply'
  | 'globalWallReplyHere'
  | 'globalWallReplyingToBanner'
  | 'globalWallCancelReplyTarget'
  | 'globalWallAttachPage'
  | 'globalWallPickPageTitle'
  | 'globalWallPickSchoolsSection'
  | 'globalWallPickAnnouncementsSection'
  | 'globalWallSearchSchoolsPlaceholder'
  | 'globalWallPickClose'
  | 'globalWallCustomPathHint'
  | 'globalWallCustomPathLabel'
  | 'globalWallCustomPathPlaceholder'
  | 'globalWallCustomTitleLabel'
  | 'globalWallCustomTitlePlaceholder'
  | 'globalWallApplyCustomLink'
  | 'globalWallCustomLinkMissing'
  | 'globalWallClearAttachedPage'
  | 'globalWallSenderViews'
  | 'globalWallScrollToBottom'
  | 'globalWallNewMessagesCount'
  | 'globalWallReactionPick'
  | 'globalWallAttachMainPagesSection'
  | 'globalWallAttachBack'
  | 'globalWallAttachSchoolsListing'
  | 'globalWallAttachAnnouncementsListing'
  | 'globalWallAttachSeeDetails'
  | 'globalWallAttachBoutiqueListing'
  | 'globalWallAttachEventsListing'
  | 'globalWallPickBoutiqueSection'
  | 'globalWallPickEventsSection'
  | 'globalWallSearchBoutiquePlaceholder'
  | 'globalWallSearchEventsPlaceholder'
  | 'globalWallPresetHome'
  | 'globalWallPresetSchools'
  | 'globalWallPresetFilieres'
  | 'globalWallPresetContestAnnouncements'
  | 'globalWallPresetInscriptions'
  | 'globalWallPresetBoutique'
  | 'globalWallPresetEvents'
  | 'globalWallPresetBlog'
  | 'globalWallPresetSecteurs'
  | 'globalWallPresetServices'
  | 'globalWallPresetCommunity'
  | 'chatbotDestExternal'
  | 'chatbotDestWebPage'
  | 'chatbotBubbleA11y'
  | 'chatbotTitle'
  | 'chatbotWelcome'
  | 'chatbotPlaceholder'
  | 'chatbotSendA11y'
  | 'chatbotCloseA11y'
  | 'chatbotNewChat'
  | 'chatbotError'
  | 'chatbotRecoHeading'
  | 'chatbotBoutiqueCardsHeading'
  | 'chatbotOpenWebsite'
  | 'chatbotTooltip'
  | 'chatbotSuggEcoles'
  | 'chatbotSuggContestAnnouncements'
  | 'chatbotSuggBoutique'
  | 'chatbotShortcutMsgEcoles'
  | 'chatbotShortcutMsgContestAnnouncements'
  | 'chatbotShortcutMsgBoutique'
  | 'chatbotThinkingHeader'
  | 'chatbotLoadingSubtitle'
  | 'chatbotPrepHint1'
  | 'chatbotPrepHint2'
  | 'chatbotPrepHint3'
  | 'chatbotPrepHint4'
  | 'chatbotThinkingAnalyze'
  | 'chatbotThinkingContext'
  | 'chatbotThinkingSuggestions'
  | 'shareSheetTitle'
  | 'shareSheetPreviewHint'
  | 'shareLinkPreviewLoading'
  | 'shareCopyLink'
  | 'shareNativeShare'
  | 'shareCopiedFeedback'
  | 'shareOpenSheetA11y'
  | 'shareKindHome'
  | 'shareKindSchools'
  | 'shareKindSchool'
  | 'shareKindAnnouncement'
  | 'shareKindAnnouncements'
  | 'shareKindEvent'
  | 'shareKindEvents'
  | 'shareKindCommunity'
  | 'shareKindBoutique'
  | 'shareKindBoutiqueProduct'
  | 'sidebarTitle'
  | 'sidebarSubtitle'
  | 'sidebarOpen'
  | 'sidebarClose'
  | 'sidebarCart'
  | 'sidebarEvents'
  | 'sidebarSectionDiscover'
  | 'sidebarSectionTools'
  | 'sidebarSectionShop'
  | 'sidebarSectionAccount'
  | 'eventsAgendaTitle'
  | 'eventsDetailPractical'
  | 'eventsDetailDescription'
  | 'eventsDetailStatus'
  | 'eventsDetailVenue'
  | 'eventsDetailLocationLabel'
  | 'eventsDetailRegistrationInfo'
  | 'eventsTabUpcoming'
  | 'eventsTabLive'
  | 'eventsTabPast'
  | 'eventsEmpty'
  | 'eventsEmptyLive'
  | 'eventsRegister'
  | 'eventsRegFormTitle'
  | 'eventsRegFirstName'
  | 'eventsRegLastName'
  | 'eventsRegEmail'
  | 'eventsRegPhone'
  | 'eventsRegPhoneHint'
  | 'eventsRegSubmit'
  | 'eventsRegCancel'
  | 'eventsRegMissingPhone'
  | 'eventsRegError'
  | 'eventsRegisterExternalLink'
  | 'eventsConnectionPending'
  | 'eventsExternalRegClosed'
  | 'eventsExternalDefaultInfo'
  | 'eventsUnregister'
  | 'eventsConfirmPresence'
  | 'eventsFull'
  | 'eventsLoadError'
  | 'eventsRefreshing'
  | 'eventsOnlineLink'
  | 'eventsMapsLink'
  | 'eventsOpenDetail'
  | 'eventsKindWebinar'
  | 'eventsKindLive'
  | 'eventsKindEvent'
  | 'eventsPastBadge'
  | 'eventsRegisteredLabel'
  | 'eventsPlacesLabel'
  | 'eventsFillLabel'
  | 'eventsLiveNow'
  | 'eventsDateStart'
  | 'eventsDateEnd'
  | 'eventsDuration'
  | 'eventsRegOpen'
  | 'eventsRegClosed'
  | 'eventsRegClosedHint'
  | 'eventsLiveBannerTitle'
  | 'eventsLiveBannerSubtitle'
  | 'eventsFollowUpTitle'
  | 'eventsContactNew'
  | 'eventsContactUnreachable'
  | 'eventsContactWhatsapp'
  | 'eventsContactConfirmed'
  | 'eventsContactCancelled'
  | 'eventsContactAbandoned'
  | 'eventsAttendanceAttended'
  | 'eventsAttendanceAbsent'
  | 'eventsContactStatusPrefix'
  | 'eventsAttendancePrefix'

  // ── Inscriptions / suivi de candidatures ──
  | 'inscEyebrow'
  | 'inscTitle'
  | 'inscSubtitle'
  | 'inscTabNotifications'
  | 'inscTabCandidacies'
  | 'inscTabAnnouncements'
  | 'inscCandidaciesActiveShort'
  | 'inscCandidaciesActiveBadgeA11y'
  | 'inscCandidaciesTabBadgeA11y'
  | 'inscCandidaciesActionsRequiredShort'
  | 'inscCandidaciesAttentionFilterAll'
  | 'inscCandidaciesAttentionFilterRequired'
  | 'inscCandidaciesActionRequiredBanner'
  | 'inscCandidaciesLatestAnnouncementActionTag'
  | 'inscCandidaciesActionRequiredEmpty'
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
  | 'inscTawjihPlusUpgradeCta'
  | 'inscTawjihPlusLockTitle'
  | 'inscTawjihPlusLockHint'
  | 'diagnosticAnswersSavedHint'
  | 'diagnosticRecoGateEyebrow'
  | 'diagnosticRecoGateHeaderTitle'
  | 'diagnosticRecoGateHeaderSub'
  | 'diagnosticRecoGateCardBadge'
  | 'diagnosticRecoGateCardTitle'
  | 'diagnosticRecoGateCardDesc'
  | 'diagnosticRecoGateFeature1'
  | 'diagnosticRecoGateFeature2'
  | 'diagnosticRecoGateFeature3'
  | 'diagnosticRecoGateSavedBox'
  | 'inscNotifEmptyTitle'
  | 'inscNotifEmptyDesc'
  | 'inscNotifMarkAllRead'
  | 'inscNotifFilterAll'
  | 'inscNotifFilterUnread'
  | 'inscCandidaciesEmptyTitle'
  | 'inscCandidaciesEmptyDesc'
  | 'inscCandidaciesEmptyCta'
  | 'inscCandidaciesFilterAll'
  | 'inscCandidaciesFilterStatusLabel'
  | 'inscCandidaciesFilterStatusPickTitle'
  | 'inscCandidaciesFilterStatusSearchPlaceholder'
  | 'inscCandidaciesFilterStatusNoResults'
  | 'inscCandidaciesFilteredEmptyTitle'
  | 'inscCandidaciesFilteredEmptyDesc'
  | 'inscAnnouncementsEmptyTitle'
  | 'inscAnnouncementsEmptyDesc'
  | 'inscAnnouncementsFilteredEmptyTitle'
  | 'inscAnnouncementsFilteredEmptyDesc'
  | 'inscAnnouncementsFollow'
  | 'inscAnnouncementsFollowing'
  | 'inscAnnouncementsOpenLink'
  | 'inscAnnouncementsAlreadyTracked'
  | 'inscAnnouncementsMarkApplied'
  | 'inscAnnouncementUnseen'
  | 'inscAnnouncementUnread'
  | 'inscStatusUnknown'
  | 'inscStatusNone'
  | 'inscStatusActionTitle'
  | 'inscStatusActionClear'
  | 'inscStatusActionSubtitle'
  | 'inscStatusActionUpdate'
  | 'inscStatusActionUpdating'
  | 'inscStatusBlockTitle'
  | 'inscStatusUnavailable'
  | 'inscStatusSectionInProgress'
  | 'inscStatusSectionFinalized'
  | 'inscOpenLinkBtn'
  | 'inscOpenLinkA11y'
  | 'inscOpenLinkBtnResult'
  | 'inscOpenLinkBtnScholarship'
  | 'inscOpenLinkBtnOffer'
  | 'inscOpenLinkBtnInfo'
  | 'inscOpenLinkBtnRegister'
  | 'inscAnnTypeOpening'
  | 'inscAnnTypeImportant'
  | 'inscAnnTypeOffer'
  | 'inscAnnTypeResult'
  | 'inscAnnTypeScholarshipMa'
  | 'inscAnnTypeScholarshipForeign'
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
  | 'inscDetailTutorialTitle'
  | 'inscDetailTutorialPlaybackError'
  | 'inscDetailTutorialRetry'
  | 'inscDetailSiblingHistoryTitle'
  | 'inscDetailSiblingsNewer'
  | 'inscDetailSiblingsOlder'
  | 'inscDetailSiblingHistoryHint'
  | 'inscDetailSiblingUpcoming'
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
  | 'followedSchoolBackToList'
  /* Questions & réponses communautaires */
  | 'qnaSectionTitle'
  | 'qnaIntro'
  | 'qnaRefresh'
  | 'qnaEmpty'
  | 'qnaBodyTooShort'
  | 'qnaPrivateBadge'
  | 'qnaPrivateHint'
  | 'qnaMeToo'
  | 'qnaOfficialBadge'
  | 'qnaAnswerPlaceholder'
  | 'qnaSendAnswer'
  | 'qnaTapToReply'
  | 'qnaReplyDockTitle'
  | 'qnaAskTitle'
  | 'qnaLoginToParticipate'
  | 'qnaVisibilityPublic'
  | 'qnaVisibilityPrivate'
  | 'qnaHintPublic'
  | 'qnaHintPrivate'
  | 'qnaPlaceholder'
  | 'qnaSubmit'
  | 'qnaCommunityAnswerBadge'
  | 'qnaVerdictCorrect'
  | 'qnaVerdictIncorrect'
  | 'qnaVerdictIncomplete'
  | 'qnaVerdictTeamLabel'
  | 'qnaLoadingComments'
  | 'qnaShowRepliesOne'
  | 'qnaShowRepliesMany'
  | 'qnaShowRemainingRepliesOne'
  | 'qnaShowRemainingRepliesMany';

export const HOME_COPY: Record<AppLocale, Record<HomeCopyKey, string>> = {
  fr: {
    notifications: 'Notifications',
    notifDrawerTitle: 'Notifications',
    notifDrawerClose: 'Fermer',
    notifDrawerSubtitle: 'Alertes inscriptions, annonces et questions-réponses.',
    notifDrawerEmpty: 'Aucune notification pour le moment.',
    notifDrawerOpenLink: 'Voir',
    notifDrawerSeeRecommendations: 'Voir mes recommandations',
    notifDrawerContinueParcours: 'Continuer le parcours',
    unreadSuffix: 'non lues',
    help: 'Aide',
    profile: 'Profil',
    greeting: 'Bonjour',
    userSubtitle: 'TAWJIH PLUS · Sciences Math A · 2ème Bac',
    homePackLabel: 'Pack :',
    packStandardLabel: 'Pack Standard',
    bacMissionLabel: 'BAC MISSION',
    newsTitle: 'Actualités',
    languageSwitcher: 'Langue',
    langFr: 'FR',
    langAr: 'عربي',
    gameDailyTitle: 'Jeu quotidien',
    orientation1BacHomeButton: 'Test d’orientation 1ère bac',
    orientation1BacHomeLocked: 'Ouverture le {date}',
    orientation1BacHomeLockedA11y: 'Test d’orientation 1ère bac — disponible à partir du {date}',
    homePackAcademicLine: '{filiere} · {niveau}',
    gameDailyBody: 'À brancher sur le mini-jeu (shell).',
    dailyChallengeTitle: 'Défi du jour',
    dailyChallengeClose: 'Fermer',
    dailyChallengeNoChallenge: 'Aucun défi publié pour aujourd’hui. Revenez plus tard.',
    dailyChallengeLoginHint: 'Connectez-vous pour enregistrer votre score et le classement.',
    dailyChallengeLoginCta: 'Connexion',
    dailyChallengeTestButton: 'Tester le jeu quotidien',
    dailyChallengeRetry: 'Réessayer',
    dailyChallengeStreak: 'Série',
    dailyChallengeStart: 'Commencer',
    dailyChallengeSubmit: 'Valider',
    dailyChallengeNext: 'Question suivante',
    dailyChallengeResult: 'Résultat',
    dailyChallengeRank: 'Classement',
    dailyChallengePlayers: 'joueurs',
    dailyChallengeBadges: 'Badges',
    dailyChallengeLeaderboard: 'Voir le classement',
    dailyChallengePlayed: 'Tu as déjà joué aujourd’hui.',
    dailyChallengeMicroLearn: 'Le saviez-vous ?',
    dailyChallengeMicroLearnTeaser:
      'Astuce du jour — touche pour découvrir un complément utile en quelques secondes.',
    dailyChallengeMicroLearnModalSubtitle: 'Un complément court pour aller plus loin',
    dailyChallengeMicroLearnModalIntro:
      'Ce bloc résume une idée clé liée au défi d’aujourd’hui. Tu peux le relire à tout moment depuis cet écran ; une fois lu, le rappel devient discret.',
    dailyChallengeMicroLearnGotIt: 'C’est noté',
    dailyChallengeMicroLearnReopen: 'Revoir l’astuce',
    dailyChallengePickGames: 'Choisis une mission ci-dessous (ordre libre).',
    dailyChallengePlayThis: 'Jouer',
    dailyChallengeGameDone: 'Terminé',
    dailyChallengeSeeScore: 'Classement (ce jeu)',
    dailyChallengeBackToGames: 'Retour aux jeux',
    dailyChallengeAllDone: 'Bravo, tu as fini tous les jeux du jour !',
    dailyChallengeZipHint:
      'Glisser pour tracer ; touche une case déjà sur le tracé pour raccourcir (pas en plein glissé).',
    dailyChallengeZipValidate: 'Valider l’ordre',
    dailyChallengeZipOrder: 'Ton ordre',
    dailyChallengeZipOrderError: 'Problème d’ordre : passe par les numéros 1, 2, 3… dans l’ordre sur ton tracé.',
    dailyChallengeZipPathError: 'Parcours invalide (mur ou case inaccessible).',
    dailyChallengeZipPracticeTitle: 'Entraînement SNAKE — 10 grilles',
    dailyChallengeZipPracticeHint: 'Tailles 5×5 à 12×12 — score local, rejouable.',
    dailyChallengeZipPracticeTag: 'Entraînement',
    dailyChallengeZipPracticeResult: 'Mode entraînement — score non enregistré sur le classement.',
    dailyChallengeZipPracticeAgain: 'Rejouer cette grille',
    dailyChallengeZipUndo: 'Annuler le dernier pas',
    dailyChallengeZipHelpBtn: 'Aide — prochaine case',
    dailyChallengeZipHelpCooldown: 'Patience {{s}} s',
    dailyChallengeZipHelpNoHint: 'Indice indisponible pour cette position.',
    dailyChallengeZipReset: 'Recommencer',
    dailyChallengeZipInteractionHint:
      'Astuce : tu peux glisser sur la grille ; pour raccourcir, touche une case déjà sur ton tracé (hors glisser).',
    dailyChallengeZipHowToPlay:
      'Commence sur la case 1, puis 2, 3… dans l’ordre. Chaque case une fois. Les murs bloquent. Grille complète = envoi automatique.',
    dailyChallengeZipRulesCta: 'Règles',
    dailyChallengeZipRulesTitle: 'SNAKE — règles',
    dailyChallengeZipSeeResults: 'Voir résultats & classement',
    dailyChallengeYourTime: 'Temps',
    dailyChallengeCongratsTitle: 'Bravo !',
    dailyChallengeCongratsPracticeLine: 'Entraînement — score local, hors classement officiel.',
    dailyChallengeFlawlessBadge: 'Sans faute',
    dailyChallengeSolvedIn: 'Réussi en',
    dailyChallengeResultCardTitle: 'Ton résultat',
    dailyChallengeBeatPlayersPrefix: 'Tu devances environ',
    dailyChallengeBeatPlayersSuffix: '% des participants aujourd’hui.',
    dailyChallengeLeaderboardModalTitle: 'Classement du jour',
    dailyChallengeLeaderboardTopToday: 'Meilleurs temps',
    dailyChallengeLeaderboardLoadMore: 'Charger plus',
    dailyChallengeYouLabel: 'Toi',
    dailyChallengePremiumBadge: 'Premium',
    dailyChallengePremiumBadgeA11y: 'Client avec au moins un service acquis',
    dailyChallengeScoreLabel: 'Score',
    dailyChallengeHubHeroLine: 'Une session courte, chaque jour, pour avancer pas à pas.',
    dailyChallengeMissionsTitle: 'Missions du jour',
    dailyChallengeProgressSectionTitle: 'Ta progression',
    dailyChallengeProgressBannerKicker: 'Zone joueur',
    dailyChallengeProgressLevelShort: 'Trophées {{n}} / {{total}}',
    dailyChallengeProgressXpCaption: '{{pct}} % vers le palier {{next}} j.',
    dailyChallengeProgressXpMaxed: 'Tous les paliers débloqués — maintiens ta série !',
    dailyChallengeProgressBadgeQuest: 'Quête badges',
    dailyChallengeProgressRecordShort: 'Record série',
    dailyChallengeProgressBestScoreShort: 'Record score',
    dailyChallengeProgressBestTimeShort: 'Record chrono',
    dailyChallengeProgressIceShort: 'Gels (ICE)',
    dailyChallengeStreakRecord: 'Record : {{n}}',
    dailyChallengeIceStock: 'ICE × {{n}}',
    dailyChallengeYearProgressTitle: 'Année {{year}}',
    dailyChallengeYearProgressFromTitle: '{{year}} — depuis le {{date}}',
    dailyChallengeLegendPlayed: 'Joué',
    dailyChallengeLegendMissed: 'Manqué',
    dailyChallengeLegendIce: 'ICE',
    dailyChallengeLegendFuture: 'À venir',
    dailyChallengeMilestonesTitle: 'Paliers série',
    dailyChallengeIceUsedTitle: 'ICE utilisé',
    dailyChallengeIceUsedBody:
      'Hier sans partie : un ICE a été utilisé automatiquement pour garder ta série (jour {{date}}).',
    dailyChallengeIceUnlockedTitle: 'ICE débloqué',
    dailyChallengeIceUnlockedBody:
      '{{streak}} jours de série : tu gagnes un ICE (tu en as {{freezes}}).',
    dailyChallengeIceExplainTitle: 'Les ICE (gels)',
    dailyChallengeIceExplainBody:
      'Un ICE protège ta série si tu ne joues pas un jour : sans partie la veille, un ICE est utilisé automatiquement pour ne pas remettre ta série à zéro.\n\n' +
      'Tu gagnes des ICE en atteignant certains paliers de jours consécutifs. Le chiffre affiché est ton stock disponible.\n\n' +
      'Sur le calendrier, un jour marqué ICE correspond à un gel utilisé ou enregistré pour ce jour.',
    dailyChallengeIceExplainCta: 'Compris',
    infoDailyTitle: 'Information du jour',
    infoDailyBody: 'À brancher sur le bulletin du jour (shell).',
    practicalTitle: 'Liens pratiques',
    practicalSubtitle: 'Accès rapides à vos services',
    practicalSectionA11y: 'Liens pratiques',
    homeSeeMore: 'Voir plus',
    homeMostVisitedSchoolsTitle: 'Écoles les plus visitées',
    homeMostVisitedSchoolsSubtitle: 'Les établissements consultés par la communauté',
    homeMostVisitedSchoolsA11y: 'Écoles les plus visitées',
    homeLatestAnnouncementsTitle: 'Dernières annonces',
    homeLatestAnnouncementsSubtitle: 'Concours et inscriptions récemment publiés',
    homeLatestAnnouncementsA11y: 'Dernières annonces',
    homeAnnouncementOpen: 'Ouvert',
    homeAnnouncementClosed: 'Clôturé',
    homeAnnouncementDatesLocked: 'Dates — TAWJIH PLUS',
    homeRefresh: 'Actualiser',
    homeRefreshA11y: 'Actualiser la page d’accueil',
    homeRefreshing: 'Actualisation',
    home_orientation_access_eyebrow: 'Orientation',
    home_orientation_access_title: 'Diagnostic et recommandations',
    practical_orientation_section: 'Parcours orientation',
    practical_services_section: 'Services',
    practical_diagnostic_ecoles: 'Diagnostic écoles',
    sidebarOrientation1Bac: 'Test orientation 1ère bac',
    practical_diagnostic_rapport: 'Rapport diagnostic',
    practical_diagnostic_recommandations: 'Recommandations écoles',
    practical_diagnostic_ecoles_desc:
      'Questionnaire rapide pour personnaliser vos recommandations d’établissements.',
    practical_diagnostic_rapport_desc:
      'Parcourez vos réponses et la synthèse étape par étape.',
    practical_diagnostic_recommandations_desc:
      'Liste personnalisée et suivi d’au moins 3 établissements pour valider le parcours.',
    practical_recommandations_locked_account:
      'Complétez la configuration de votre compte pour voir vos recommandations.',
    practical_recommandations_locked_diagnostic:
      'Terminez d’abord le diagnostic écoles pour débloquer vos recommandations.',
    practical_orientation_locked_title: 'Étape verrouillée',
    practical_orientation_loading: 'Chargement du parcours…',
    practical_diagnostic_locked_account:
      'Complétez la configuration de votre compte pour lancer le diagnostic.',
    practical_rapport_locked_account:
      'Complétez la configuration de votre compte pour accéder au rapport.',
    practical_rapport_locked_diagnostic:
      'Terminez d’abord le diagnostic écoles pour débloquer le rapport.',
    practical_ecoles: 'Écoles supérieures',
    practical_inscriptions: 'Inscriptions et dates',
    practical_candidatures: 'Suivi de mes candidatures',
    practical_ecolesInscription: "Mes écoles d'inscriptions",
    practical_boutique: 'Boutique',
    practical_ecoles_desc:
      'Explorer les établissements, les filières et les critères d’admission pour construire votre projet.',
    practical_inscriptions_desc:
      'Calendriers des concours, dossiers à fournir et dates limites pour ne rien manquer.',
    practical_candidatures_desc:
      'Suivez l’état de vos dossiers et les prochaines étapes de vos candidatures.',
    practical_evenements_desc:
      'Salons, ateliers et webinaires pour avancer dans votre orientation.',
    practical_ecolesInscription_desc:
      'La liste des établissements pour lesquels vous déposez ou suivrez une candidature.',
    practical_boutique_desc:
      'Formules d’accompagnement et services pour sécuriser votre parcours.',
    practicalCardEyebrow: 'Liens utiles',
    practicalCardTap: 'Toucher pour ouvrir',
    practicalCardA11y: 'Ouvrir le lien pratique',
    schoolsTitle: 'Écoles supérieures',
    schoolsHeroEyebrow: 'Écoles supérieures',
    schoolsHeroTitle: 'ÉCOLES SUP',
    schoolsFilters: 'Filtres',
    schoolsFiltersA11y: 'Filtres détaillés',
    schoolsFollowedOnlyA11y: 'Uniquement les écoles que je suis',
    schoolsSearchPlaceholder: 'Rechercher (nom, ville, université...)',
    schoolsSearchPlaceholderLocked: 'Recherche réservée aux clients TAWJIH PLUS',
    schoolsSearchFiltersLockedHint:
      'Recherche et filtres détaillés réservés aux clients TAWJIH PLUS.',
    schoolsTypeAll: 'Tous',
    schoolsTypeLabel: "Type d'établissement",
    schoolsTypePublic: 'Public',
    schoolsTypePrivate: 'Privé',
    schoolsTypeSemiPublic: 'Semi‑Public',
    schoolsTypeMilitary: 'Militaire',
    schoolsFiltersTitle: 'Filtres détaillés',
    schoolsFilterAcceptedStudyLabel: "Filière d'étude acceptée",
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
    schoolsFeesLabel: 'Frais scolarité (Dhs / an)',
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
    schoolsRefreshing: 'Actualisation…',
    estCardQnaOpenA11y: 'Ouvrir les questions et réponses',
    estCardBtnComment: 'Commentaire',
    estCardBadgeSponsored: 'Sponsorisé',
    estCardStatsClusterA11y: '{{followers}} personnes suivent cette école, {{comments}} messages dans la communauté',
    estCardStatsLoadingA11y: 'Chargement des statistiques de la communauté',
    schoolsClearFilter: 'Effacer la sélection',
    schoolsErrorNetwork: 'Erreur réseau',
    planOffersTitle: 'Packs d’inscription & écoles',
    planOffersLink: 'Voir les packs',
    storiesA11y: 'Stories',
    newsCarouselA11y: 'Actualités — défilement horizontal',
    swipeCardsHint: 'Glissez les cartes',
    bacCardEyebrow: 'Baccalauréat 2026',
    bacCardTitle: 'Résultat du baccalauréat',
    bacCardDateLabel: 'Publication prévue',
    bacStatusNotYet: 'Pas encore',
    bacStatusPublished: 'Publié',
    bacCountdownKicker: 'Compte à rebours',
    bacCountdownDays: 'j',
    bacCountdownHours: 'h',
    bacCountdownMinutes: 'min',
    bacJourJTitle: 'Jour J',
    bacWaitingResult: 'En attente du résultat',
    bacOutletsTitle: 'Sorties des résultats',
    bacOutletOutlook: 'Outlook (courriel)',
    bacOutletSms: 'SMS',
    bacOutletMenResults: 'bac.men.gov.ma (notes)',
    bacSiteStatusLabel: 'Site bac.men.gov.ma',
    bacSiteOnline: 'En ligne',
    bacSiteOffline: 'Hors ligne',
    bacLinkOutlook: 'Vérifier Outlook',
    bacLinkMen: 'bac.men.gov.ma',
    bacLinkOutlookA11y: 'Ouvrir Outlook pour vérifier vos résultats',
    bacLinkMenA11y: 'Ouvrir le site officiel bac.men.gov.ma',
    bacTapForGuide: 'Instructions',
    bacOutletGuideA11y: 'Voir les instructions de vérification',
    bacVerifyModalTitleOutlook: 'Vérifier via Outlook',
    bacVerifyModalTitleMen: 'Consulter sur bac.men.gov.ma',
    bacVerifyModalTitleSms: 'Résultat par SMS',
    bacVerifyStepsTitle: 'Étapes',
    bacMassarSectionTitle: 'Code Massar',
    bacMassarSectionHint:
      'Confirmez ou corrigez votre code. Il sert à vous connecter sur le site officiel et à former votre adresse @taalim.ma.',
    bacMassarPlaceholder: 'Ex. A123456789',
    bacMassarConfirm: 'Confirmer',
    bacMassarEdit: 'Modifier',
    bacMassarSaved: 'Enregistré',
    bacOutlookEmailLabel: 'Identifiant Outlook',
    bacOutlookPasswordLabel: 'Mot de passe',
    bacOutlookPasswordHint: 'Même mot de passe que Massar',
    bacOutlookStep1: 'Ouvrez Outlook (courriel) ou l’application mail sur votre téléphone.',
    bacOutlookStep2: 'Connectez-vous avec votre adresse {email} (code Massar + @taalim.ma).',
    bacOutlookStep3: 'Saisissez le mot de passe Massar (identique à celui du portail Massar).',
    bacOutlookStep4: 'Consultez votre boîte de réception : un message officiel annonce votre résultat.',
    bacOutlookStep5: 'Si rien n’apparaît, attendez quelques minutes et actualisez la boîte de réception.',
    bacMenStep1: 'Ouvrez bac.men.gov.ma depuis le bouton ci-dessous.',
    bacMenStep2: 'Saisissez votre code Massar dans le formulaire.',
    bacMenStep3: 'Cochez « Je ne suis pas un robot » (captcha).',
    bacMenStep4: 'Validez le formulaire pour afficher votre note et votre mention.',
    bacMenStep5: 'En cas de réussite : note et mention s’affichent. En cas d’échec sans rattrapage : message adapté.',
    bacMenStep6: 'Si vous êtes admis au rattrapage, le site l’indique clairement.',
    bacSmsStep1: 'Aucune action dans l’application : le SMS est envoyé par le système officiel.',
    bacSmsStep2: 'Le message arrive sur le numéro de téléphone enregistré sur votre compte Massar.',
    bacSmsStep3: 'Le SMS vous annonce directement votre résultat le jour de publication.',
    bacOpenOutlook: 'Ouvrir Outlook',
    bacOpenMenSite: 'Ouvrir bac.men.gov.ma',
    bacModalClose: 'Fermer',
    bacThresholdsEyebrow: 'Admission supérieure',
    bacThresholdsTitle: 'Calcul des seuils',
    bacThresholdsSubtitle:
      'Saisis tes notes du bulletin pour estimer ton score d’admission aux écoles.',
    bacThresholdsTip:
      'Les formules ci-dessous servent à comparer ton profil aux seuils affichés sur les fiches établissements.',
    bacThresholdsSectionNotes: 'Notes du bulletin',
    bacThresholdsSectionHint: 'Reprends les notes de ton relevé officiel (sur 20).',
    bacThresholdsRegional: 'Régional',
    bacThresholdsNational: 'National',
    bacThresholdsContinuous: 'Contrôles continus',
    bacThresholdsOverall: 'Note générale',
    bacThresholdsPlaceholder: '0,00',
    bacThresholdsSave: 'Enregistrer et calculer',
    bacThresholdsSaved: 'Notes enregistrées',
    bacThresholdsResultsTitle: 'Tes scores estimés',
    bacThresholdsFormula7525: '75 % national + 25 % régional',
    bacThresholdsFormula5050: '50 % national + 50 % régional',
    bacThresholdsFormulaMajorBadge: 'Formule majoritaire',
    bacThresholdsOverallLabel: 'Note générale (bulletin)',
    bacThresholdsDisclaimer:
      'Chaque établissement peut appliquer sa propre formule. En pratique, environ 90 % des écoles supérieures utilisent 75 % national et 25 % régional — détail indiqué sur les fiches écoles.',
    bacThresholdsOutOf20: '/20',
    bacThresholdsCtaTitle: 'Calculer les seuils des écoles',
    bacThresholdsCtaSub: 'Saisis tes notes du bulletin · formules 75/25 et 50/50',
    bacThresholdsLockedSub: 'Disponible en 2ème bac',
    orientationTapHint: 'Toucher pour voir les étapes',
    orientationProgressLabel: "Progression d'orientation",
    orientationTasksA11y: "Parcours d'orientation — 6 étapes",
    orientationModalSubtitle: 'Votre plan en 6 étapes',
    orientationFranchisedEmpty: 'Aucune étape franchie pour le moment.',
    orientationContinueCta: 'Continuer',
    orientationSeeAllSteps: 'Voir le détail',
    orientationStepCountLabel: '6 étapes',
    orientationStepAccountSetup: 'Configuration du compte',
    orientationStepAccountSetupShort: 'Compte',
    orientationStepBadgeDone: 'Fait',
    orientationStepBadgeCurrent: 'En cours',
    orientationStepBadgeTodo: 'À faire',
    orientationStepOrientationDiagnostic: "Diagnostic d'orientation",
    orientationStepOrientationDiagnosticShort: 'Diagnostic',
    orientationStepRecommendation: "Recommandation et suivi d'écoles",
    orientationStepRecommendationShort: 'Reco. & suivi',
    orientationStepRecommendationHint:
      'Suivez 3 écoles recommandées pour valider cette étape.',
    diagnosticRecoFollowBanner:
      'Pour valider le parcours, suivez 3 écoles recommandées.',
    diagnosticRecoFollowBannerDone:
      'Étape validée — vous suivez vos écoles recommandées.',
    practical_diagnostic_recommandations_follow_hint:
      'Suivez au moins 3 écoles dans la liste de recommandations.',
    orientationStepFeedback: 'Feedback',
    orientationStepFeedbackShort: 'Feedback',
    appFeedbackTitle: 'Votre avis sur l’application',
    appFeedbackEyebrow: 'Amélioration continue',
    appFeedbackIntro:
      'Vos retours orientent nos priorités. Merci de prendre 2–3 minutes pour évaluer chaque thème.',
    appFeedbackProgress: '{{done}} / {{total}} critères notés',
    appFeedbackScaleHint: 'Choisissez : Très bien, Bien ou Moyen pour chaque question.',
    appFeedbackOptionTresBien: 'Très bien',
    appFeedbackOptionBien: 'Bien',
    appFeedbackOptionMoyen: 'Moyen',
    appFeedbackCatDesign: 'Design & interface',
    appFeedbackCatDesignDesc: 'Apparence, navigation et lisibilité des écrans.',
    appFeedbackCatSimplicity: 'Simplicité',
    appFeedbackCatSimplicityDesc: 'Facilité à démarrer, trouver une info et remplir les formulaires.',
    appFeedbackCatTranslations: 'Langues & traductions',
    appFeedbackCatTranslationsDesc: 'Qualité du français, de l’arabe et cohérence entre les pages.',
    appFeedbackCatRecommendations: 'Orientation & recommandations',
    appFeedbackCatRecommendationsDesc: 'Diagnostic, scores et pertinence des écoles proposées.',
    appFeedbackCatSchools: 'Écoles & inscriptions',
    appFeedbackCatSchoolsDesc: 'Recherche d’établissements, annonces et suivi de candidature.',
    appFeedbackCatContent: 'Accueil & parcours',
    appFeedbackCatContentDesc: 'Page d’accueil, plan de réussite et notifications.',
    appFeedbackCatTechnical: 'Performance & fiabilité',
    appFeedbackCatTechnicalDesc: 'Vitesse, stabilité et bugs éventuels.',
    appFeedbackCatShop: 'Boutique & services',
    appFeedbackCatShopDesc: 'Découverte des offres et expérience d’achat.',
    appFeedbackCatComments: 'Vos commentaires',
    appFeedbackCatCommentsDesc: 'Détaillez ce qui pourrait être amélioré.',
    appFeedbackQDesignOverall: 'Aspect général de l’application',
    appFeedbackQDesignOverallDesc: 'Couleurs, identité visuelle, impression globale.',
    appFeedbackQDesignNav: 'Navigation entre les sections',
    appFeedbackQDesignNavDesc: 'Onglets, menus, retour arrière, clarté des parcours.',
    appFeedbackQDesignRead: 'Lisibilité des contenus',
    appFeedbackQDesignReadDesc: 'Taille des textes, contrastes, hiérarchie visuelle.',
    appFeedbackQEaseFirst: 'Prise en main',
    appFeedbackQEaseFirstDesc: 'Compte, profil, première visite sans aide extérieure.',
    appFeedbackQEaseFind: 'Trouver une information',
    appFeedbackQEaseFindDesc: 'Écoles, annonces, diagnostic, boutique, compte…',
    appFeedbackQEaseForms: 'Formulaires & filtres',
    appFeedbackQEaseFormsDesc: 'Diagnostic, filtres écoles, mise à jour du profil.',
    appFeedbackQTransFr: 'Qualité du français',
    appFeedbackQTransFrDesc: 'Formulations, fautes, ton adapté au lycée.',
    appFeedbackQTransAr: 'Qualité de l’arabe',
    appFeedbackQTransArDesc: 'Formulations, sens, affichage RTL.',
    appFeedbackQTransConsist: 'Cohérence FR / AR',
    appFeedbackQTransConsistDesc: 'Même niveau de qualité sur tous les écrans.',
    appFeedbackQRecoRel: 'Pertinence des écoles recommandées',
    appFeedbackQRecoRelDesc: 'Adéquation avec votre profil et vos choix.',
    appFeedbackQRecoClear: 'Clarté des explications',
    appFeedbackQRecoClearDesc: 'Scores, tiers, texte du rapport de diagnostic.',
    appFeedbackQRecoDiag: 'Parcours du diagnostic',
    appFeedbackQRecoDiagDesc: 'Étapes, durée, compréhension des questions.',
    appFeedbackQSchoolSearch: 'Liste et fiches écoles',
    appFeedbackQSchoolSearchDesc: 'Filtres, fiches établissement, informations utiles.',
    appFeedbackQSchoolAnn: 'Annonces d’inscription',
    appFeedbackQSchoolAnnDesc: 'Lisibilité, dates, liens, détail annonce.',
    appFeedbackQSchoolFollow: 'Suivi & statuts',
    appFeedbackQSchoolFollowDesc: 'Candidatures suivies, mise à jour du statut.',
    appFeedbackQContentHome: 'Accueil & parcours d’orientation',
    appFeedbackQContentHomeDesc: 'Cartes, plan de réussite, étapes franchies.',
    appFeedbackQContentNotif: 'Notifications',
    appFeedbackQContentNotifDesc: 'Pertinence, fréquence, clarté des messages.',
    appFeedbackQTechSpeed: 'Rapidité & chargements',
    appFeedbackQTechSpeedDesc: 'Listes, images, changement d’écran.',
    appFeedbackQTechStable: 'Stabilité générale',
    appFeedbackQTechStableDesc: 'Plantages, écrans bloqués, fermetures inattendues.',
    appFeedbackQTechBugs: 'Bugs rencontrés',
    appFeedbackQTechBugsDesc: 'Fréquence et gravité des dysfonctionnements.',
    appFeedbackQShop: 'Boutique & commandes',
    appFeedbackQShopDesc: 'Produits, services, panier et suivi commande.',
    appFeedbackTextImprove: 'Comment améliorer l’application ?',
    appFeedbackTextImprovePh:
      'Ce qui vous a plu, ce qui manque, ce qui vous a bloqué… (facultatif)',
    appFeedbackTextBugs: 'Bugs, lenteurs ou blocages précis',
    appFeedbackTextBugsPh: 'Écran concerné, action effectuée, message d’erreur éventuel…',
    appFeedbackTextFeatures: 'Fonctionnalités souhaitées',
    appFeedbackTextFeaturesPh: 'Idées pour les prochaines versions (optionnel)',
    appFeedbackSubmit: 'Envoyer mon avis',
    appFeedbackThanks: 'Merci pour votre contribution',
    appFeedbackThanksSub: 'Votre avis aide toute la communauté E-Tawjihi.',
    appFeedbackThanksEyebrow: 'Envoyé',
    appFeedbackThanksCardTitle: 'Votre avis est bien enregistré',
    appFeedbackThanksCardSub:
      'Nous le prenons en compte pour améliorer l’application. Vous pouvez fermer cette fenêtre.',
    appFeedbackError: 'Envoi impossible. Réessayez dans un instant.',
    appFeedbackLoginRequired: 'Connectez-vous pour envoyer votre avis.',
    appFeedbackRequiredRatings: 'Merci de répondre à toutes les questions (Très bien, Bien ou Moyen).',
    appFeedbackRequiredComment: 'Merci de décrire comment améliorer l’app (10 caractères min.).',
    appFeedbackOpenCta: 'Donner mon avis sur l’app',
    appUpdateEyebrow: 'Mise à jour',
    appUpdateTitleRequired: 'Mise à jour obligatoire',
    appUpdateTitleRecommended: 'Nouvelle version disponible',
    appUpdateCta: 'Mettre à jour depuis le store',
    appUpdateLater: 'Plus tard',
    appUpdateVersionHint: 'Votre version : {current} — dernière : {latest}',
    pushPermissionModalTitle: 'Activez les notifications',
    pushPermissionModalBody:
      'Recevez les alertes d’ouverture d’inscriptions, les annonces concours et les messages importants d’E-Tawjihi.',
    pushPermissionModalHint:
      'Les notifications sont désactivées sur cet appareil. Ouvrez les réglages pour les autoriser (Réglages → Notifications → E-Tawjihi sur iPhone, ou Paramètres → Applications → E-Tawjihi sur Android).',
    pushPermissionModalOpenSettings: 'Ouvrir les réglages',
    pushPermissionModalLater: 'Plus tard',
    orientationStepApplyToSchools: 'Gestion des inscriptions',
    orientationStepApplyToSchoolsShort: 'Inscriptions',
    applySchoolsTourEyebrow: 'Guide',
    applySchoolsTourTitle: 'Gestion des inscriptions',
    applySchoolsTourNext: 'Continuer',
    applySchoolsTourBack: 'Retour',
    applySchoolsTourTapNotif: 'Voir la notification',
    applySchoolsTourTapFollow: 'Suivre cette annonce',
    applySchoolsTourTapStatus: 'Mettre à jour mon statut',
    applySchoolsTourFocusTap: 'Appuyez ici',
    applySchoolsTourFocusLearn: 'À découvrir',
    applySchoolsTourTrackerStep: 'Étape {current} / {total}',
    applySchoolsTourTrackerActionTitle: 'Action à faire',
    applySchoolsTourTrackerPending: 'À faire',
    applySchoolsTourTrackerDone: 'Terminée',
    applySchoolsTourActionTapNotification: 'Appuyez sur l’alerte concours ci-dessous',
    applySchoolsTourActionTapContinue: 'Appuyez sur Continuer en bas',
    applySchoolsTourActionTapFollow: 'Appuyez sur le cœur « Suivre » sur la carte',
    applySchoolsTourActionTapStatus: 'Appuyez sur « Mettre à jour » sur la carte',
    applySchoolsTourActionTapCandidaciesTab: 'Appuyez sur l’onglet Candidatures',
    applySchoolsTourActionTapRegistrationLink: 'Appuyez sur le lien d’inscription',
    applySchoolsTourTabsLegend:
      'Pastille verte : {{active}} candidatures actives · pastille rouge : {{attention}} action(s) requise(s).',
    applySchoolsTourTabsAnnouncementsPlaceholder:
      'Onglet Annonces : toutes les publications des écoles (concours, inscriptions…).',
    applySchoolsTourTabsTapCandidaciesHint:
      'Appuyez sur l’onglet Candidatures pour voir vos suivis et les actions à traiter.',
    applySchoolsTourGoInscriptions: 'Aller aux inscriptions',
    applySchoolsTourTeaseTitle: 'Alerte concours {school}',
    applySchoolsTourTeaseSub: 'Appuyez pour recevoir une notification sur votre téléphone',
    applySchoolsTourTeaseHint: 'Comme sur votre téléphone : vous êtes prévenu dès qu’une école publie une annonce.',
    applySchoolsTourPushHint: 'La notification ouvre l’annonce dans l’app. Ici, c’est un exemple pour {school}.',
    applySchoolsTourCardTypeHint: 'Le bandeau indique le type d’annonce (ici : ouverture d’inscription).',
    applySchoolsTourCardFollowHint: 'Le cœur permet de suivre l’école et recevoir les prochaines annonces.',
    applySchoolsTourCardStatusHint: '« Mettre à jour » sert à indiquer où vous en êtes (intéressé, candidaté, inscrit…).',
    applySchoolsTourFollowHint: 'Appuyez sur le cœur : vous suivez {school} et activez les alertes.',
    applySchoolsTourStatusHint: 'Choisissez votre statut de candidature — comme dans l’onglet Inscriptions.',
    applySchoolsTourCandidacyHint: 'Dans Candidatures : la carte devient rose si une nouvelle annonce demande votre attention.',
    applySchoolsTourBravoTitle: 'Bravo !',
    applySchoolsTourBravoSub: 'Vous savez suivre une annonce, mettre à jour votre statut et retrouver vos écoles.',
    applySchoolsTourStep_notification_tease_title: '1. Les alertes concours',
    applySchoolsTourStep_notification_tease_body:
      'Quand une école publie une annonce (concours, ouverture d’inscription…), vous pouvez recevoir une notification.',
    applySchoolsTourStep_push_preview_title: '2. Exemple de notification',
    applySchoolsTourStep_push_preview_body:
      'Voici à quoi ressemble une alerte pour l’ouverture des inscriptions à {school}.',
    applySchoolsTourStep_announcement_card_title: '3. L’annonce {school}',
    applySchoolsTourStep_announcement_card_body:
      'Même présentation que dans l’onglet Annonces : dates, lien d’inscription, éligibilité et actions.',
    applySchoolsTourRegistrationLinkHint:
      'En conditions réelles, ce bouton vous mène vers la page d’inscription officielle de l’école (site ou formulaire). Ici, on ne l’ouvre pas : c’est une démonstration.',
    applySchoolsTourStep_registration_link_title: '4. Lien d’inscription',
    applySchoolsTourStep_registration_link_body:
      'Le bouton avec la flèche ouvre la page d’inscription de l’établissement. Utilisez-le quand vous êtes prêt à candidater sur le site de l’école.',
    applySchoolsTourStep_follow_action_title: '5. Suivre l’école',
    applySchoolsTourStep_follow_action_body:
      'En suivant, vous centralisez le suivi de candidature pour cette école.',
    applySchoolsTourStep_status_action_title: '6. Statut de candidature',
    applySchoolsTourStep_status_action_body:
      'Appuyez sur « Mettre à jour » et choisissez « Inscrit » ou « Non intéressé » pour cette école.',
    applySchoolsTourStep_inscriptions_tabs_title: '7. Onglets Annonces / Candidatures',
    applySchoolsTourStep_inscriptions_tabs_body:
      'Deux onglets : les annonces à découvrir et vos candidatures suivies. Les pastilles indiquent combien de suivis sont actifs et combien demandent une action.',
    applySchoolsTourStep_candidacies_tab_title: '8. Ouvrir Candidatures',
    applySchoolsTourStep_candidacies_tab_body:
      'Appuyez sur Candidatures pour afficher vos écoles suivies. Le filtre « Action requise » (pastille rouge) ne garde que les cartes à mettre à jour.',
    applySchoolsTourStep_candidacy_card_title: '9. Mettre à jour une candidature',
    applySchoolsTourStep_candidacy_card_body:
      'Carte en « action requise » : appuyez sur « Mettre à jour » et indiquez « Admis au concours » ou « Non admis au concours ».',
    applySchoolsTourStep_bravo_title: '10. C’est parti !',
    applySchoolsTourStep_bravo_body: 'Explorez les vraies annonces et lancez vos candidatures.',
    inscCandidaciesEmptyTourCta: 'Voir le guide',
    orientationStepAppDiscovery: "Découverte de l'application",
    orientationStepAppDiscoveryShort: 'Découverte',
    orientationStepInviteFriend: 'Inviter un ami',
    orientationStepInviteFriendShort: 'Parrainage',
    modalClose: 'Fermer',
    closeOverlayA11y: 'Fermer',
    dailyPlay: 'Jouer',
    dailyPlayed: 'Joué',
    homeDailyStreakOne: 'Série : 1 jour',
    homeDailyStreakMany: 'Série : {{n}} jours',
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
    loginPhonePlaceholder: '06XXXXXXXX',
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
    registerPhonePlaceholder: '06XXXXXXXX',
    registerPasswordLabel: 'Mot de passe',
    registerPasswordPlaceholder: 'Mot de passe',
    registerPasswordConfirmLabel: 'Confirmer le mot de passe',
    registerPasswordConfirmPlaceholder: 'Confirmer le mot de passe',
    registerCta: 'Créer mon compte',
    registerHaveAccount: 'Vous avez déjà un compte ?',
    registerLoginLink: 'Se connecter',
    registerInvalidConfirm: 'Confirmation invalide',
    registerPasswordsMismatch: 'Les mots de passe ne correspondent pas.',
    registerPasswordRulesTitle: 'Le mot de passe doit contenir :',
    registerPasswordRuleMinLength: 'Au moins 8 caractères',
    registerPasswordRuleUpper: 'Une majuscule (A-Z)',
    registerPasswordRuleLower: 'Une minuscule (a-z)',
    registerPasswordRuleNumber: 'Un chiffre (0-9)',
    registerPasswordRuleSpecial: 'Un caractère spécial (!@#$…)',
    registerPasswordWeak: 'Mot de passe trop faible',
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
    forgotSubtitleWhatsapp:
      'Indiquez le numéro de téléphone enregistré sur votre compte (le même que sur WhatsApp).',
    forgotSuccessWhatsappTitle: 'Vérifiez WhatsApp',
    forgotSuccessWhatsappBody:
      'Si un compte existe pour ce numéro, un code vous sera envoyé sous peu. Saisissez-le pour choisir un nouveau mot de passe.',
    forgotCtaWhatsapp: 'Envoyer la demande par WhatsApp',
    forgotCtaCheckPhone: 'Vérifier mon numéro',
    forgotAccountNotFound:
      'Aucun compte E-Tawjihi actif pour ce numéro. Vérifiez le 06 ou 07 enregistré sur votre compte.',
    forgotAccountFoundTitle: 'Compte trouvé',
    forgotAccountFoundIntro:
      'Envoyez le message ci-dessous depuis le même numéro WhatsApp que votre compte, vers le numéro officiel E-Tawjihi.',
    forgotWhatsappMessageLabel: 'Message à envoyer',
    forgotWhatsappContactLabel: 'Numéro WhatsApp E-Tawjihi à contacter',
    forgotWhatsappMessage:
      'Mot de passe oublié E-Tawjihi\nMon numéro de compte : {{phone}}\nMerci de m’aider à récupérer mon accès.',
    forgotCopyWhatsappMessage: 'Copier le message',
    forgotCopied: 'Message copié',
    forgotOpenWhatsappCta: 'Ouvrir WhatsApp',
    deviceTransferTitle: 'Transférer le compte',
    deviceTransferSubtitle: 'Appareils connectés',
    deviceTransferIntro:
      'Ce compte est déjà actif sur un autre appareil. Choisissez l’appareil à déconnecter pour activer celui-ci.',
    deviceTransferIntroMulti:
      'La limite de {{max}} appareils connectés en même temps est atteinte. Déconnectez un appareil ci-dessous pour continuer sur celui-ci.',
    deviceTransferPickSubtitle: 'Choisir un appareil',
    deviceTransferPickIntro:
      'Sélectionnez l’appareil à déconnecter pour libérer une place sur ce compte.',
    deviceTransferPickLabel: 'Appareils connectés',
    deviceTransferSecurityHint:
      'Si l’un de ces appareils ne vous appartient pas, contactez le support pour sécuriser votre compte.',
    deviceTransferCta: 'Déconnecter et continuer',
    deviceTransferSupportLabel: 'Appareil inconnu ?',
    deviceTransferSupportHint:
      'Contactez le support E-Tawjihi sur WhatsApp (0655690632). Le message inclura votre numéro de compte.',
    deviceTransferOpenSupportWhatsapp: 'Sécuriser mon compte (WhatsApp)',
    deviceTransferErrInvalid: 'Impossible de compléter le transfert. Réessayez ou contactez le support.',
    forgotWhatsappStepsTitle: 'Étapes',
    forgotWhatsappStepSend: '1. Copiez le message ou appuyez sur « Ouvrir WhatsApp » (le texte est déjà rempli).',
    forgotWhatsappStepSameNumber:
      '2. Envoyez-le depuis le téléphone du numéro {{phone}} — celui de votre compte.',
    forgotWhatsappStepFollow:
      '3. Suivez les instructions d’E-Tawjihi dans la conversation pour recevoir votre nouveau mot de passe.',
    forgotSuccessManychatTitle: 'Message envoyé',
    forgotSuccessManychatIntro:
      'Si un compte existe pour ce numéro, E-Tawjihi vous enverra un WhatsApp depuis notre numéro officiel.',
    forgotSuccessManychatSamePhone:
      'Important : le message arrive sur le même numéro que celui saisi (06 ou 07 de votre compte).',
    forgotSuccessManychatStep1:
      '1. Ouvrez WhatsApp sur ce téléphone et attendez le message « Mot de passe oublié » d’E-Tawjihi.',
    forgotSuccessManychatStep2:
      '2. Notez le code de récupération à 6 chiffres indiqué dans le message.',
    forgotSuccessManychatStep3:
      '3. Appuyez sur le lien du message et saisissez ce code dans la conversation.',
    forgotSuccessManychatStep4:
      '4. Un nouveau mot de passe vous sera renvoyé par WhatsApp. Utilisez-le pour vous connecter.',
    forgotSuccessManychatAltApp: 'Vous préférez choisir vous-même un mot de passe ?',
    forgotSuccessCtaEnterCodeInApp: 'Saisir le code dans l’application',
    verifyOtpTitle: 'Code de vérification',
    verifyOtpSubtitle: 'Saisissez le code à 6 chiffres reçu sur WhatsApp au {phone}.',
    verifyOtpCta: 'Vérifier le code',
    verifyOtpResend: 'Renvoyer un code',
    verifyOtpErrInvalid: 'Code invalide ou expiré.',
    verifyOtpErrMissingPhone: 'Numéro manquant. Recommencez la procédure.',
    verifyOtpCodeLabel: 'Code à 6 chiffres',
    verifyOtpHint:
      'Option : saisissez ici le code reçu sur WhatsApp pour choisir votre mot de passe. Sinon, suivez le lien du message pour recevoir un mot de passe généré.',
    forgotInfoWhatsapp:
      'Le numéro doit être celui de votre compte E-Tawjihi. Le WhatsApp part du numéro officiel E-Tawjihi.',
    forgotWhatsappNotSent:
      'Le message WhatsApp n’a pas pu être envoyé. Vérifiez que ce numéro est bien inscrit sur E-Tawjihi, ou réessayez plus tard.',
    resetFlowStep1: 'Étape 1 / 3',
    resetFlowStep2: 'Étape 2 / 3',
    resetFlowStep3: 'Étape 3 / 3',
    resetPasswordTitle: 'Nouveau mot de passe',
    resetPasswordSubtitle: 'Choisissez un mot de passe fort (8 caractères minimum, majuscule, minuscule, chiffre, caractère spécial).',
    resetPasswordNew: 'Nouveau mot de passe',
    resetPasswordConfirm: 'Confirmer le mot de passe',
    resetPasswordCta: 'Enregistrer',
    resetPasswordDoneTitle: 'Mot de passe mis à jour',
    resetPasswordDoneBody: 'Redirection vers la connexion…',
    resetPasswordErrToken: 'Session expirée. Recommencez la procédure (nouveau code WhatsApp).',
    resetPasswordErrMatch: 'Les mots de passe ne correspondent pas.',
    loginShowPassword: 'Afficher',
    loginHidePassword: 'Masquer',
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
    setupFiliere1Bac: 'Filière en 1ère bac',
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
    estDetailMediaPhotos: 'Photos',
    estDetailMediaVideo: 'Vidéo',
    estDetailMediaVideoOpen: 'Voir la vidéo',
    estDetailMediaBrochure: 'Brochure',
    estDetailMediaBrochureOpen: 'Ouvrir la brochure',
    estDetailDegrees: 'Diplômes délivrés',
    estDetailSectors: 'Secteurs métiers',
    estDetailScholarships: 'Bourses',
    estDetailEngagements: 'Engagements',
    estDetailCampus: 'Campus',
    estDetailCampusNoMapsUrl: 'Aucun lien Google Maps pour ce campus.',
    estDetailContact: 'Contact',
    estDetailAnnouncements: 'Annonces de l\'école',
    estDetailAnnouncementsEmpty: 'Aucune annonce publiée pour cette école pour le moment.',
    estLabelSectors: 'Secteurs',
    estLabelTuition: 'Scolarité',
    estLabelSchoolType: 'Type',
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
    accountSectionActiveServices: 'Mes services actifs',
    accountActiveServicesLoading: 'Chargement de vos services…',
    accountActiveServicesError: 'Impossible de charger vos services.',
    accountActiveServicesEmpty: 'Aucun service actif pour le moment.',
    accountActiveServicesEndDate: 'Fin d\'accès',
    accountActiveServicesNoEndDate: 'Accès sans date de fin',
    accountActiveServicesDaysRemaining: '{{count}} jours restants',
    accountActiveServicesOneDayLeft: '1 jour restant',
    accountActiveServicesEndsToday: 'Se termine aujourd\'hui',
    accountActiveServicesContract: 'Contrat',
    accountActiveServicesPrice: 'Montant',
    accountActiveServicesPromo: 'Promo',
    accountActiveServicesPaymentComplete: 'Paiement complet',
    accountActiveServicesPaymentIncomplete: 'Paiement non complet',
    accountActiveServicesRemaining: 'Reste à payer',
    accountActiveServicesPaid: 'Payé',
    accountActiveServicesTotal: 'Total',
    accountActiveServicesTransactions: 'Paiements enregistrés',
    accountActiveServicesNoTransactions: 'Aucun paiement enregistré pour ce service.',
    accountActiveServicesTxDate: 'Date',
    accountActiveServicesTxMethod: 'Moyen',
    accountActiveServicesTxStatus: 'Statut',
    accountActiveServicesDownloadReceipt: 'Télécharger le reçu',
    accountActiveServicesReceiptSoonTitle: 'Reçu de paiement',
    accountActiveServicesReceiptSoonBody:
      'Aucun paiement enregistré pour générer un reçu. Contactez votre conseiller si vous avez besoin d’une attestation.',
    accountActiveServicesReceiptError:
      'Une erreur est survenue lors de la génération du reçu. Réessayez plus tard.',
    accountActiveServicesReceiptShareUnavailable:
      'Impossible d’ouvrir le menu de partage sur cet appareil.',
    referralTeaserTitle: 'Programme parrainage & cadeaux',
    referralTeaserSubtitle: 'Invitez vos proches et débloquez des cadeaux à chaque palier.',
    referralTeaserCta: 'Voir le programme parrainage & cadeaux',
    referralPageTitle: 'Programme parrainage & cadeaux',
    referralPageSubtitle:
      'Invitez vos proches : chaque achat TAWJIH PLUS compte pour débloquer vos récompenses.',
    referralReferredDiscountHint:
      'Vos parrainés bénéficient de {{percent}} de réduction sur les services avec votre code (pas sur les produits).',
    referralReferredDiscountBadge: '{{percent}} sur les services',
    referralReferredDiscountShopLine: 'sur les services',
    referralLockedTitle: 'Programme parrainage & cadeaux verrouillé',
    referralLockedBody:
      'Un service {{service}} actif est requis pour partager votre code et débloquer vos récompenses.',
    referralLockedCta: 'Voir les services',
    referralTiersTitle: 'Vos paliers récompenses',
    referralTiersSubtitle: 'Parrainés ayant acheté {{service}}',
    referralQualifiedCount: '{{count}} parrainé(s) qualifié(s)',
    referralTierBadge: 'Palier {{n}}',
    referralTierUnlocked: 'Débloqué',
    referralTierRemaining: 'Encore {{count}}',
    referralTierThreshold: 'Objectif : {{count}} parrainés',
    referralTeaserQualifiedLabel: 'parrainés qualifiés',
    referralTeaserAllUnlocked: 'Tous les paliers débloqués',
    referralTierPickReward: 'Choisissez votre récompense',
    referralTierYourReward: 'Votre récompense',
    referralTierPickProduct: 'Sélectionnez un produit avant de générer le code.',
    referralTierChoiceHint: '{{count}} récompenses au choix une fois le palier débloqué',
    referralTierGeneratePromo: 'Générer mon code promo 100 %',
    referralTierRewardFree: 'Gratuit',
    referralTierPromoTitle: 'Votre code promo',
    referralTierPromoUsed: 'Code utilisé',
    referralTierPromoAvailable: 'Code disponible — 1 utilisation',
    referralTierPromoHint: 'Code à 100 % sur le produit sélectionné, valable une seule fois en boutique.',
    referralTierPromoError: 'Impossible de générer le code. Réessayez.',
    referralTierGoShop: 'Utiliser en boutique',
    referralSingleRewardHint: 'Une récompense distincte par palier débloqué.',
    referralRewardTakenBadge: 'Récompense prise',
    referralRewardTakenOnOtherTier: 'Récompense déjà prise sur le palier {{tier}}',
    referralBalanceLabel: 'Mes points',
    referralPointsUnit: 'pts',
    referralPendingPoints: '{{count}} pts en attente de validation',
    referralYourCode: 'Mon code',
    referralYourLink: 'Mon lien',
    referralCopyCode: 'Copier le code',
    referralCopyLink: 'Copier le lien',
    referralCopied: 'Copié dans le presse-papiers',
    referralShareWhatsApp: 'Partager sur WhatsApp',
    referralHowItWorks: 'Comment ça marche',
    referralStep1Title: 'Partagez',
    referralStep1Body: 'Envoyez votre code ou lien à un ami ou un membre de votre famille.',
    referralStep2Title: 'Il s’inscrit',
    referralStep2Body: 'Votre parrainé crée son compte avec votre code et complète son profil.',
    referralStep3Title: 'Il achète',
    referralStep3Body: 'Points bonus quand il passe une commande ou un service orientation.',
    referralStep3BodyNew:
      'Lorsque votre parrainé achète TAWJIH PLUS, il est comptabilisé pour vos paliers.',
    referralStep4Title: 'Récompenses',
    referralStep4Body: 'Utilisez vos points sur la boutique E-Tawjihi ou chez nos partenaires.',
    referralStep4BodyNew:
      '5 parrainés → livre concours · 10 → pack complet (selon la configuration active).',
    referralInvitesTitle: 'Mes parrainés',
    referralInviteCompleted: 'Parrainage complété',
    referralInviteNotCompleted: 'Pas encore complété',
    referralPointsEarned: '+{{count}} pts',
    referralPointsPendingLabel: '{{count}} pts en attente',
    referralHistoryTitle: 'Historique des points',
    referralLedgerProfile: 'Profil parrainé complété',
    referralLedgerOrder: 'Commande parrainé',
    referralLedgerBonus: 'Bonus parrainage',
    referralLedgerSpend: 'Utilisation boutique',
    referralPartnersTitle: 'Récompenses partenaires',
    referralPartnersHint: 'Échangez vos points contre des offres chez nos partenaires.',
    referralRedeemSoon: 'Bientôt disponible',
    referralShareMessage:
      'Salut ! Je t’invite sur E-Tawjihi pour ton orientation. Utilise mon code {{code}} ({{percent}}% de remise boutique) ou ce lien : {{link}}',
    referralInvitesEmpty:
      'Aucun parrainé pour le moment. Partagez votre code pour inviter vos amis.',
    referralViewAllInvites: 'Voir tous mes parrainés',
    referralPointsSoonNote:
      'Parrainage actif : votre code et le suivi des parrainés sont en ligne. Le crédit des points de récompense arrive dans une prochaine mise à jour.',
    loyaltyTeaserTitle: 'Programme parrainage & cadeaux',
    loyaltyTeaserSubtitle: 'Invitez vos proches et débloquez des cadeaux à chaque palier.',
    loyaltyTeaserCta: 'Voir le programme parrainage & cadeaux',
    loyaltyTeaserNextReward: 'Prochain palier',
    loyaltyPageTitle: 'Fidélité',
    loyaltyBalanceLabel: 'Mes points',
    loyaltyPointsUnit: 'pts',
    loyaltyPendingPoints: '{{count}} pts en attente après vos commandes',
    loyaltyHowItWorks: 'Comment ça marche',
    loyaltyEarnRate: '{{rate}} pts / Dhs — chaque dirham dépensé en boutique (commande confirmée).',
    loyaltyRateBadge: '{{rate}} pts / Dhs',
    loyaltyStep1Title: 'Achetez',
    loyaltyStep1Body: 'Passez commande sur la boutique E-Tawjihi (livres, packs, etc.).',
    loyaltyStep2Title: 'Cumulez',
    loyaltyStep2Body: 'Vos points sont crédités après validation du paiement.',
    loyaltyStep3Title: 'Débloquez',
    loyaltyStep3Body: 'Atteignez les paliers pour échanger contre un produit ou un service réel.',
    loyaltyStep4Title: 'Parrainez',
    loyaltyStep4Body: 'Invitez vos proches avec votre code : leur progression est suivie dans votre espace parrainage.',
    loyaltyRewardsTitle: 'Paliers récompenses',
    loyaltyRewardsHint: 'Produits et services de votre catalogue, classés par points requis.',
    loyaltyTierLabel: 'P{{n}}',
    loyaltyRedeemCta: 'Échanger',
    loyaltyRedeemLocked: 'Verrouillé',
    loyaltyRedeemInactive: 'Déblocage suspendu',
    loyaltyRedeemSoonTitle: 'Bientôt disponible',
    loyaltyRedeemSoonBody:
      'L’échange de points sera activé prochainement. En attendant, explorez le produit ou le service.',
    loyaltyRedeemConfirmTitle: 'Échanger cette récompense ?',
    loyaltyRedeemConfirmBody:
      '« {{title}} » sera débloquée pour {{count}} {{unit}}. Cette récompense ne peut être utilisée qu’une seule fois.',
    loyaltyRedeemSuccessTitle: 'Récompense échangée',
    loyaltyRedeemSuccessBody:
      '« {{title}} » est débloquée. {{count}} {{unit}} ont été déduits de votre solde.',
    loyaltyRedeemAlreadyUsed: 'Vous avez déjà échangé cette récompense.',
    loyaltyRedeemInsufficient: 'Solde de points insuffisant.',
    loyaltyRedeemError: 'Impossible d’échanger cette récompense. Réessayez plus tard.',
    loyaltyRedeemCancel: 'Annuler',
    loyaltyAlreadyRedeemedLabel: 'Déjà échangé',
    loyaltyPointsToUnlock: 'Encore {{count}} pts',
    loyaltyNextRewardBar: 'Prochain : {{title}} — encore {{count}} pts',
    loyaltyGroupProducts: 'Produits boutique',
    loyaltyGroupServices: 'Services orientation',
    loyaltyCatalogLoading: 'Chargement du catalogue…',
    loyaltyCatalogError: 'Impossible de charger les récompenses.',
    loyaltyCatalogRetry: 'Réessayer',
    loyaltyCatalogEmpty: 'Aucune récompense disponible pour le moment.',
    loyaltyHistoryTitle: 'Historique des points',
    loyaltyLedgerEarn: 'Points gagnés (achat)',
    loyaltyLedgerSpend: 'Échange récompense',
    loyaltyLedgerWelcome: 'Bonus de bienvenue',
    loyaltyPointsGoal: 'Objectif : {{count}} {{unit}}',
    loyaltyViewAllRewards: 'Voir tout le catalogue',
    loyaltyViewAllCount: '{{count}} récompenses',
    loyaltyCatalogPageTitle: 'Catalogue récompenses',
    loyaltyCatalogPageSubtitle:
      'Débloquez chaque palier en cumulant des points. Les récompenses verrouillées s’activent à l’objectif indiqué.',
    loyaltyTimelineBalanceFoot: 'Vous avez {{balance}} {{unit}}',
    loyaltyEarnRulesTitle: 'Comment gagner des points',
    loyaltyEarnRulesSelf: 'Vos actions',
    loyaltyEarnRulesReferrer: 'Quand vos parrainés avancent (1/5 des points de l’action)',
    loyaltyPerMadSuffix: '/ Dhs',
    accountSectionAcademic: 'Infos académiques',
    accountMassarCode: 'Code Massar',
    accountStudentCode: 'Code étudiant',
    accountMassarCodeHint: 'Identifiant Massar (bac marocain).',
    accountStudentCodeHint: 'Code étudiant (bac mission / français).',
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
    commonLoadError: 'Problème sur le serveur. Réessayez.',
    commonRetry: 'Réessayer',
    apiErrNetwork: 'Connexion impossible. Vérifiez votre réseau et réessayez.',
    apiErrTimeout: 'Le serveur met trop de temps à répondre. Réessayez dans un instant.',
    apiErrUnauthorized: 'Session expirée. Reconnectez-vous.',
    apiErrForbidden: 'Vous n’avez pas accès à cette action.',
    apiErrNotFound: 'Contenu introuvable.',
    apiErrValidation: 'Certaines informations sont invalides. Vérifiez et réessayez.',
    apiErrConflict: 'Cette action n’est plus possible (déjà effectuée ou en conflit).',
    apiErrServer: 'Le serveur rencontre un problème. Réessayez plus tard.',
    apiErrRateLimit: 'Trop de tentatives. Patientez un moment.',
    apiErrGeneric: 'Une erreur est survenue. Réessayez.',
    apiErrAuth: 'Identifiants incorrects ou compte indisponible.',
    apiErrDiagnostic: 'Impossible de traiter le diagnostic. Réessayez.',
    apiErrDailyChallenge: 'Impossible de charger le défi du jour. Réessayez.',
    qnaErrorGeneric: 'Impossible d’envoyer votre message. Réessayez.',
    accountSectionOrders: 'Mes commandes',
    accountOrdersEmpty: 'Aucune commande pour l\'instant.',
    accountOrdersEmptyProducts: 'Aucun produit commandé. Consultez l\'onglet Services.',
    accountOrdersEmptyServices: 'Aucun service commandé. Consultez l\'onglet Produits.',
    accountOrdersLoading: 'Chargement des commandes…',
    accountOrdersError: 'Impossible de charger les commandes.',
    accountTabProfile: 'Mes informations',
    accountTabOrders: 'Mes commandes',
    accountOrdersOpenBadgeA11y: '{{count}} commandes en cours',
    accountOrdersOpenCount: '{{count}} en cours',
    accountOrdersSegmentAll: 'Tous',
    accountOrdersSegmentProducts: 'Produits',
    accountOrdersSegmentServices: 'Services',
    accountOrderViewDetail: 'Voir le détail',
    accountOrderDetailTitle: 'Détail commande',
    accountOrderDetailNotFound: 'Commande introuvable.',
    accountOrderPhysicalSection: 'Produits & livraison',
    accountOrderServicesSection: 'Services orientation',
    accountOrderPaymentSection: 'Paiement des services',
    accountOrderRecapSection: 'Récapitulatif',
    accountOrderCompletedNote: 'Commande terminée — récapitulatif ci-dessous.',
    accountOrderPromoAddTitle: 'Code promo',
    accountOrderPromoPlaceholder: 'Saisir le code',
    accountOrderPromoApply: 'Appliquer',
    accountOrderPromoApplying: 'Application…',
    accountOrderPromoHint:
      'Vous pouvez ajouter un code tant que la commande est en attente ou en cours de traitement.',
    accountOrderPromoLockedHint:
      'Code promo verrouillé : la commande n’est plus en attente ni en cours de traitement.',
    accountOrderPromoDiscount: 'Remise code promo',
    accountOrderPromoApplied: 'Code promo appliqué.',
    estNotFound: 'Introuvable',
    shopEyebrow: 'E-Tawjihi',
    shopTitle: 'Boutique',
    shopSubtitle: 'Commandez en ligne · Paiement à la livraison',
    shopSearchPlaceholder: 'Rechercher un produit, pack…',
    shopClearSearchA11y: 'Effacer la recherche',
    shopCartA11y: 'Panier',
    shopCartPayMethodsTitle: 'Moyens de paiement possibles',
    shopCartPayMethodCashDelivery: 'Espèces à la livraison (Dhs)',
    shopCartPayMethodOffice: 'Paiement au bureau',
    shopCartPayMethodBankTransfer: 'Virement bancaire',
    shopCartPayMethodCashplus: 'Cashplus',
    shopCartPayDisclaimer:
      'Carte bancaire non proposée en ligne — le choix du moyen de paiement se fait à la commande, après validation par E-Tawjihi.',
    shopCartEyebrowBoutique: 'Boutique',
    shopCartTitle: 'Panier',
    shopCartItemsOne: '1 article',
    shopCartItemsMany: '{n} articles',
    shopCartEmptyTitle: 'Votre panier est vide',
    shopCartEmptyDesc:
      'Parcourez les produits et packs orientation, puis revenez ici pour passer commande.',
    shopCartEmptyCta: 'Découvrir la boutique',
    shopCartPerUnit: 'l’unité',
    shopCartQtyLabel: 'Quantité',
    shopCartRemove: 'Supprimer',
    shopCartSummaryTitle: 'Récapitulatif',
    shopCartSubtotal: 'Sous-total',
    shopCartShippingLbl: 'Livraison',
    shopCartShippingFreeAll: 'Offerte sur tout le panier',
    shopCartShippingNext: 'À l’étape suivante',
    shopCartTotalEstimated: 'Total estimé',
    shopCartFooterTotal: 'Total',
    shopCartGoCheckout: 'Passer à la caisse',
    shopCartReplaceServiceTitle: 'Service non cumulable',
    shopCartReplaceServiceMessage:
      'Si vous ajoutez {newService} au panier, {removed} sera retiré du panier car vous ne pouvez pas cumuler les deux services.',
    shopCartReplaceServiceMessageMany:
      'Si vous ajoutez {newService} au panier, {removed} seront retirés du panier car vous ne pouvez pas cumuler ces services.',
    shopCartReplaceServiceAccept: 'J’accepte',
    shopCartReplaceServiceCancel: 'Annuler',
    shopCheckoutEyebrowBoutique: 'Boutique',
    shopCheckoutTitle: 'Commande',
    shopCheckoutItemsSummary: '{n} article(s)',
    shopCheckoutErrSubmit: 'Impossible de finaliser la commande. Réessayez.',
    shopCheckoutErrGeneric: 'Une erreur est survenue.',
    shopCheckoutDeliveryTitle: 'Livraison',
    shopCheckoutDeliveryDesc: 'Livraison à domicile — paiement en espèces à la réception (Dhs).',
    shopCheckoutDeliveryInfo:
      'Indiquez la ville de livraison et l’adresse pour calculer les frais de port.',
    shopCheckoutDeliveryInfoFree: ' (livraison offerte sur ce panier).',
    shopCheckoutContactTitle: 'Coordonnées',
    shopCheckoutContactDesc: 'Pour vous contacter au sujet de la commande.',
    shopCheckoutLblEmail: 'Email',
    shopCheckoutLblFullName: 'Nom complet',
    shopCheckoutLblPhone: 'Téléphone',
    shopCheckoutPhEmail: 'vous@exemple.com',
    shopCheckoutPhName: 'Prénom et nom',
    shopCheckoutPhPhone: '06…',
    shopCheckoutLblStudentCity: 'Ville de résidence',
    shopCheckoutPickCity: 'Choisir une ville…',
    shopCheckoutPaymentTitle: 'Modalité de paiement',
    shopCheckoutPaymentDescMixed:
      'Choisissez comment régler les services : virement, Cashplus, bureau, ou tout (services + produits) en espèces à la livraison.',
    shopCheckoutPaymentDescServices:
      'Après confirmation, les instructions détaillées s’affichent sur l’écran de remerciement selon votre choix.',
    shopCheckoutPayBank: 'Virement bancaire',
    shopCheckoutPayCashplus: 'Cashplus',
    shopCheckoutPayOffice: 'Paiement au bureau',
    shopCheckoutPayOnDelivery: 'Paiement à la livraison',
    shopCheckoutAddrTitle: 'Adresse de livraison',
    shopCheckoutAddrDesc: 'Pour l’envoi des produits physiques.',
    shopCheckoutLblCityShip: 'Ville de livraison',
    shopCheckoutLblAddress: 'Adresse complète',
    shopCheckoutPhAddress: 'Rue, quartier, complément…',
    shopCheckoutNotesTitle: 'Notes',
    shopCheckoutNotesDesc: 'Optionnel — précisions pour l’équipe E-Tawjihi.',
    shopCheckoutPhNotes: 'Précisions utiles…',
    shopCheckoutRecapTitle: 'Récapitulatif',
    shopCheckoutUpgradeCatalog: 'Prix catalogue :',
    shopCheckoutUpgradeCredit: 'Service déjà acheté ({service}) : −{amount}',
    shopCheckoutLblSubtotal: 'Sous-total',
    shopCheckoutPromoTitle: 'Code promo',
    shopCheckoutPromoHint:
      'Un seul code par commande. Si le code est lié à certains articles, la remise ne s’applique qu’à ceux-ci.',
    shopCheckoutPromoPh: 'ETW-XXXX',
    shopCheckoutPromoApply: 'Appliquer',
    shopCheckoutPromoRemove: 'Retirer',
    shopCheckoutLblDiscount: 'Remise ({code})',
    shopCheckoutLblDiscountPercent: 'Remise {pct} % ({code})',
    shopCheckoutLblArticlesNet: 'Total articles',
    shopCheckoutPromoAppliedPercent: '−{pct} % appliqué sur {base} (articles éligibles).',
    shopCheckoutPromoAppliedFixed: 'Remise fixe de {amount} sur les articles éligibles.',
    shopCheckoutPromoScopedHint: 'La remise ne porte que sur {base} (articles liés au code).',
    shopCheckoutPromoErrEnter: 'Saisissez un code promo',
    shopCheckoutPromoErrValidate: 'Impossible de valider le code',
    shopCheckoutLblShipping: 'Livraison',
    shopCheckoutShipNoPhysical: 'Sans envoi (services)',
    shopCheckoutShipFree: 'Offert',
    shopCheckoutShipPickCity: 'Choisir une ville',
    shopCheckoutLblTotal: 'Total',
    shopCheckoutConfirmBtn: 'Confirmer la commande',
    shopCheckoutDisclaimerPod:
      'Règlement prévu en espèces (Dhs) à la livraison (produits physiques et services) — l’équipe peut vous confirmer par téléphone ou email.',
    shopCheckoutDisclaimerInstr: 'Les instructions de paiement (RIB, Cashplus ou bureau) s’affichent après validation.',
    shopCheckoutDisclaimerSecure: 'Données transmises de façon sécurisée — pas de paiement carte.',
    shopCheckoutSheetCityShip: 'Ville de livraison',
    shopCheckoutSheetCityResidence: 'Ville de résidence',
    shopCheckoutStudentHintFree:
      'Réf. tarifaire zone : {price} · {delais}. Livraison commande : offerte sur tout le panier.',
    shopCheckoutStudentHint:
      'Indicatif livraison pour cette zone : {price} · {delais}',
    shopCheckoutStudentHintFreeShort: 'Livraison offerte sur tout le panier (au moins un article éligible).',
    shopCheckoutVilleMetaFree:
      'Tarif catalogue zone : {price} · délai indicatif : {delais} · frais facturés : offerts (panier éligible).',
    shopCheckoutVilleMetaFixed:
      'Tarif catalogue zone : {price} · délai indicatif : {delais} · frais facturés au panier : {fee} Dhs (mode fixe boutique).',
    shopCheckoutVilleMetaCatalog:
      'Frais de livraison facturés : {fee} · délai indicatif : {delais}',
    shopCheckoutShipFreeBanner: 'Livraison offerte sur tout le panier (au moins un article éligible).',
    shopCheckoutErrEmail: 'Email invalide.',
    shopCheckoutErrFullName: 'Indiquez votre nom complet.',
    shopCheckoutErrPhone: 'Indiquez un numéro de téléphone.',
    shopCheckoutErrStudyLevel: 'Indiquez votre niveau d’études.',
    shopCheckoutErrBacType: 'Choisissez le type de bac.',
    shopCheckoutErrMissionSpecs: 'Pour le Bac Mission, renseignez au moins deux spécialités.',
    shopCheckoutErrFiliere: 'Indiquez la filière.',
    shopCheckoutErrStudentVille: 'Sélectionnez votre ville dans la liste (référentiel livraison).',
    shopCheckoutErrPayment: 'Choisissez une modalité de paiement.',
    shopCheckoutErrShipCity: 'Sélectionnez votre ville de livraison.',
    shopCheckoutErrAddress: 'Renseignez une adresse de livraison.',
    shopThankEyebrowBoutique: 'Boutique',
    shopThankCashplusCodeLbl: 'Code Cashplus',
    shopThankPaymentHeading: 'Paiement — {label}',
    shopThankModalityBank: 'Virement bancaire',
    shopThankModalityCashplus: 'Cashplus',
    shopThankModalityOffice: 'Paiement au bureau',
    shopThankModalityPayOnDelivery: 'Paiement à la livraison',
    shopThankLevelLine: 'Niveau : {v}',
    shopThankBacLine: 'Bac : {v}',
    shopThankFiliereLine: 'Filière / spécialité : {v}',
    shopThankMissionLine: 'Spé. Mission : {v}',
    shopThankStudentCityLine: 'Ville : {v}',
    shopThankDelayIndicative: 'Délai indicatif : {delay}',
    shopThankCodCashTip: 'Paiement en espèces (Dhs) à la réception.',
    shopThankPickupPayOnSite: 'Règlement sur place lors du retrait.',
    shopThankSummarySubtotalItems: 'Sous-total articles',
    shopThankSummaryShipLbl: 'Livraison',
    shopThankSummaryShipFeesLbl: 'Frais de livraison',
    shopThankPickupBase: 'Passage prévu : {date}',
    shopThankPickupTimePart: ' à {time}',
    shopFilterAll: 'Tout',
    shopFilterProducts: 'Produits',
    shopFilterPacks: 'Packs',
    shopFilterServices: 'Services',
    shopServicesError: 'Impossible de charger les services.',
    shopServicesEmpty: 'Aucun service à afficher pour le moment.',
    shopServicesSectionTitle: 'Nos accompagnements',
    shopServicesSeeAll: 'Voir tous les services',
    shopServicesOpenWeb: 'Détails sur le site',
    shopServicesPopular: 'Populaire',
    shopServicesFiliereAll: 'Toutes filières',
    shopServicesEligibleYou: 'Vous êtes éligible',
    shopServicesFiliereMission: 'Bac Mission',
    shopServicesFiliereReste: 'Autres filières',
    shopSearchServicesPlaceholder: 'Rechercher un service…',
    shopServiceDetail: 'Détail',
    shopServicePromoChip: 'Promo',
    shopEntitlementAlreadyOwned: 'Déjà actif sur votre compte',
    shopEntitlementIncluded: 'Déjà inclus dans votre offre',
    shopEntitlementIncludedVia: 'Inclus avec {name}',
    shopEntitlementBlocked: 'Non disponible à l’achat',
    shopEntitlementRequiresPrerequisite: 'Prérequis requis',
    shopEntitlementUpgradeAvailable: 'Upgrade possible',
    shopEntitlementNotPurchasable: 'Achat indisponible',
    shopEntitlementChecking: 'Vérification de votre éligibilité…',
    shopEntitlementIncludedNoPurchase: 'Inclus dans votre offre — sans achat séparé',
    shopEntitlementIncludedPriceHint: 'Déjà inclus dans votre offre — pas d’achat séparé',
    shopErrorLoad: 'Impossible de charger la boutique.',
    shopLoading: 'Chargement…',
    shopEmptyTitle: 'Aucun produit',
    shopRefreshing: 'Actualisation…',
    shopEmptyDesc: 'Modifiez vos filtres ou revenez plus tard.',
    shopEstablishmentsConcernedNotice:
      'Vous pourrez personnaliser vos choix d’écoles parmi la liste proposée. Pour les écoles qui exigent le paiement de frais de préinscription, vous devez régler ces frais pour finaliser l’inscription. Pour les écoles soumises à des critères d’éligibilité, l’inscription n’est effectuée qu’en cas d’éligibilité.',
    shopBadgeProduct: 'Produit',
    shopBadgePack: 'Pack',
    shopBadgeService: 'Service',
    shopBadgeFree: 'Livraison offerte',
    shopBadgeBestseller: 'Best seller',
    shopBadgeUnavailable: 'Indisponible',
    shopOutOfStock: 'Rupture de stock',
    shopAddA11y: 'Ajouter au panier',
    shopAddedA11y: 'Déjà au panier',
    shopRemoveFromCartA11y: 'Retirer du panier',
    shopBuyNow: 'Commander',
    shopBuyNowA11y: 'Commander maintenant',
    shopViewProductA11y: 'Voir le produit',
    shopViewServiceA11y: 'Voir le service',
    shopThankHeroTitle: 'Merci pour votre commande',
    shopThankHeroDesc:
      'Votre demande est bien prise en charge. Nous vous recontactons très bientôt sur les coordonnées indiquées.',
    shopThankRefLabel: 'Référence',
    shopThankTotalLabel: 'Total TTC',
    shopThankNextStepsTitle: 'Prochaines étapes',
    shopThankOrderNotFound: 'Commande introuvable ou session expirée.',
    shopThankBankSectionTitle: 'Paiement par virement bancaire',
    shopThankBankNameLbl: 'Banque',
    shopThankBankRibLbl: 'RIB',
    shopThankBankHolderLbl: 'Titulaire',
    shopThankBankInstructionsTitle: 'Comment payer',
    shopThankBankUploadTitle: 'Envoyer le justificatif (reçu)',
    shopThankBankUploadHint:
      'Après votre virement, joignez ici une photo ou un PDF du reçu. Il sera enregistré sur votre commande et visible dans Mon compte.',
    shopThankBankUploadPick: 'Choisir un fichier (PDF, JPEG, PNG)',
    shopThankBankUploadBusy: 'Envoi en cours…',
    shopThankBankUploadOk: 'Justificatif enregistré.',
    shopThankBankUploadErr: 'Envoi impossible. Réessayez ou utilisez WhatsApp.',
    shopThankBankViewReceipt: 'Voir le justificatif',
    shopThankBankWhatsappHint:
      'Vous pouvez aussi nous envoyer le reçu sur WhatsApp au {phone}.',
    shopThankBankWhatsappOpen: 'Ouvrir WhatsApp',
    shopThankCopy: 'Copier',
    shopThankCopied: 'Copié dans le presse-papiers.',
    shopThankCopyAllBank: 'Copier toutes les coordonnées',
    shopThankCopyInstructions: 'Copier les instructions',
    shopThankBankCoordinTitle: 'Coordonnées pour le virement',
    shopThankWhatsappPrefill:
      'Bonjour, je joins le justificatif de virement pour ma commande n° {orderNumber}. Merci.',
    shopThankCashplusAgencyHint:
      'Présentez le code ci-dessous dans une agence Cashplus — idéalement la plus proche de chez vous — pour régler le montant de votre commande.',
    shopThankCashplusActivationHint:
      'Une fois le paiement effectué en agence, l’activation de votre accès se fera automatiquement dès que le paiement est pris en compte.',
    shopThankCashplusDelayHint:
      'Si l’activation tarde : ouvrez Mon compte → Mes commandes, puis téléversez le reçu Cashplus. Vous pouvez aussi nous écrire sur WhatsApp ci-dessous en indiquant votre n° de commande.',
    shopThankCashplusGotoAccountCta: 'Ouvrir Mon compte — Mes commandes',
    shopThankWhatsappPrefillCashplus:
      'Bonjour, paiement Cashplus effectué pour la commande {orderNumber}. Merci de confirmer la réception ou d’indiquer la suite. Cordialement.',
    shopThankPaymentHelpWhatsappTitle: 'Besoin d’aide ?',
    shopThankWhatsappHintHelp:
      'Écrivez-nous sur WhatsApp au {phone} en indiquant votre numéro de commande si besoin.',
    shopThankNextStep1Bank: 'Conservez votre numéro de commande pour tout suivi.',
    shopThankNextStep2Bank:
      'Effectuez le virement puis déposez le reçu ci-dessus ou envoyez-le sur WhatsApp ; notre équipe validera votre paiement.',
    shopThankNextStep1Followup: 'Conservez votre numéro de commande pour tout suivi.',
    shopThankNextStep2Followup:
      'Suivez les instructions de paiement ci-dessous ; l’équipe peut vous recontacter si besoin.',
    shopThankNextStep1Cod: 'Nous vérifions votre commande et préparons la suite (livraison ou retrait).',
    shopThankNextStep2Cod: "L'équipe E-Tawjihi vous contacte par téléphone ou email pour confirmer.",
    shopThankNextStep3Cod: "Règlement en espèces à la livraison — pas de paiement carte dans l'app.",
    shopThankBackShop: 'Retour à la boutique',
    accountOrderReceiptLink: 'Reçu virement',
    shopThankContactTitle: 'Coordonnées',
    shopThankItemsTitle: 'Articles & montants',
    shopThankDeliveryTitle: 'Livraison',
    shopThankPickupTitle: 'Retrait au bureau',
    shopThankOfficeMapsBtn: 'Voir sur Google Maps',
    shopThankOfficeAddressLbl: 'Adresse du bureau',
    shopThankOfficeHoursLbl: 'Horaires',
    shopThankOfficePhoneLbl: 'Téléphone',
    shopThankOfficeCallHint: 'Appelez pour confirmer votre date de passage.',
    shopThankInstructionsTitle: 'Instructions',
    shopEstCategoryPublic: 'Public',
    shopEstCategoryMilitary: 'Militaire',
    shopEstCategorySemiPublic: 'Semi-public',
    shopEstCategoryPrivate: 'Privé',
    shopEstCategoryOther: 'Autres',
    tabHome: 'Accueil',
    tabEcoles: 'Écoles',
    tabInscriptions: 'Inscriptions',
    tabBoutique: 'Boutique',
    tabCompte: 'Compte',
    hubWhatsAppA11y: 'Nous contacter sur WhatsApp pour des informations',
    hubWhatsAppPrefill: 'Salam, j’aurais besoin d’informations sur E-TAWJIHI.',
    hubGlobalWallUnreadBadgeA11y: '{{count}} nouveau(x) message(s) sur le groupe BAC 2026',
    globalWallTitle: 'Groupe BAC 2026',
    globalWallIntro:
      'Messages de l’équipe E‑TAWJIHI et échanges. Répondez sous chaque publication (comme un groupe de discussion).',
    globalWallEmpty: 'Aucune publication pour le moment.',
    globalWallPullToRefresh: 'Tirez pour actualiser',
    globalWallReplies: 'Réponses',
    globalWallReplyPlaceholder: 'Votre message…',
    globalWallLoginToReply: 'Connectez-vous pour répondre.',
    globalWallError: 'Impossible de charger le groupe. Réessayez.',
    globalWallBubbleA11y: 'Ouvrir le groupe BAC 2026',
    globalWallComposerPlaceholder: 'Écrire un message au groupe…',
    globalWallPublishMainFeed: 'Publication principale',
    globalWallPublishAsReply: 'Réponse au dernier message',
    globalWallReplyHere: 'Répondre ici',
    globalWallReplyingToBanner: 'Réponse à · {{snippet}}',
    globalWallCancelReplyTarget: 'Publication principale',
    globalWallAttachPage: 'Page à partager',
    globalWallPickPageTitle: 'Choisir une page',
    globalWallPickSchoolsSection: 'Écoles',
    globalWallPickAnnouncementsSection: 'Annonces concours',
    globalWallSearchSchoolsPlaceholder: 'Rechercher une école…',
    globalWallPickClose: 'Fermer',
    globalWallCustomPathHint: 'Chemin du site (comme sur le web), ex. /filieres ou /boutique',
    globalWallCustomPathLabel: 'Chemin',
    globalWallCustomPathPlaceholder: '/ma-page',
    globalWallCustomTitleLabel: 'Titre affiché',
    globalWallCustomTitlePlaceholder: 'Ex. Voir les filières',
    globalWallApplyCustomLink: 'Ajouter',
    globalWallCustomLinkMissing: 'Indiquez un chemin (ex. /filieres) et un titre affiché.',
    globalWallClearAttachedPage: 'Retirer la page',
    globalWallSenderViews: '{{count}} vues',
    globalWallScrollToBottom: 'Derniers messages',
    globalWallNewMessagesCount: '{{count}} nouveaux',
    globalWallReactionPick: 'Choisir une réaction',
    globalWallAttachMainPagesSection: 'Pages du site',
    globalWallAttachBack: 'Retour',
    globalWallAttachSchoolsListing: 'Voir l’annuaire des écoles',
    globalWallAttachAnnouncementsListing: 'Voir toutes les annonces concours',
    globalWallAttachSeeDetails: 'Voir les détails',
    globalWallAttachListingPageLink: 'Joindre le lien de la page (liste complète)',
    globalWallAttachSearchPickDetail: 'Ou rechercher et choisir une fiche précise :',
    globalWallSearchAnnouncementsPlaceholder: 'Rechercher une annonce (titre, école…)…',
    globalWallAttachBoutiqueListing: 'Voir le catalogue boutique',
    globalWallAttachEventsListing: 'Voir l’agenda des événements',
    globalWallPickBoutiqueSection: 'Choisir un produit',
    globalWallPickEventsSection: 'Choisir un événement',
    globalWallSearchBoutiquePlaceholder: 'Rechercher un produit ou pack…',
    globalWallSearchEventsPlaceholder: 'Filtrer par titre…',
    globalWallPresetHome: 'Accueil',
    globalWallPresetSchools: 'Écoles supérieures',
    globalWallPresetFilieres: 'Filières',
    globalWallPresetContestAnnouncements: 'Annonces concours',
    globalWallPresetInscriptions: 'Mes inscriptions',
    globalWallPresetBoutique: 'Boutique',
    globalWallPresetEvents: 'Événements & webinaires',
    globalWallPresetBlog: 'Blog',
    globalWallPresetSecteurs: 'Secteurs & métiers',
    globalWallPresetServices: 'Nos services',
    globalWallPresetCommunity: 'Groupe BAC 2026',
    chatbotDestExternal: 'Lien',
    chatbotDestWebPage: 'Page web',
    chatbotBubbleA11y: 'Ouvrir E‑MOWAJIH, assistant orientation',
    chatbotTitle: 'E‑MOWAJIH',
    chatbotWelcome:
      'Bienvenue dans **cette version** de l’app E‑TAWJIHI.\n\nJe suis **E‑MOWAJIH** : orientation, **écoles**, **annonces concours**, **boutique**, services **TAWJIH PLUS** et **TASSJIL**, tout depuis le chat.\n\nQuand c’est utile, des **cartes** apparaissent sous ma réponse — touche une carte pour ouvrir la fiche école, l’annonce ou le produit.\n\nEn bas, les **raccourcis** te font gagner du temps ; sinon écris ta question librement.',
    chatbotPlaceholder: 'Votre message…',
    chatbotSendA11y: 'Envoyer',
    chatbotCloseA11y: 'Fermer le chat',
    chatbotNewChat: 'Nouvelle conversation',
    chatbotError: 'Impossible d’envoyer le message. Réessayez.',
    chatbotRecoHeading: 'Aller plus loin',
    chatbotBoutiqueCardsHeading: 'Produits & packs',
    chatbotOpenWebsite: 'Voir sur le site',
    chatbotTooltip: 'Une question ? Parle avec E‑MOWAJIH',
    chatbotSuggEcoles: 'Écoles',
    chatbotSuggContestAnnouncements: 'Annonces concours',
    chatbotSuggBoutique: 'Boutique',
    chatbotShortcutMsgEcoles:
      'Je voudrais des informations sur les écoles et établissements au Maroc.',
    chatbotShortcutMsgContestAnnouncements:
      'Où trouver les annonces de concours et les dates limites d’inscription aux établissements ?',
    chatbotShortcutMsgBoutique:
      'Quels produits ou packs me recommandez-vous sur la boutique, et comment passer commande ?',
    chatbotThinkingHeader: 'E‑MOWAJIH prépare votre réponse',
    chatbotLoadingSubtitle: 'Quelques secondes — merci de patienter.',
    chatbotPrepHint1: 'Analyse de votre question et des mots-clés…',
    chatbotPrepHint2: 'Consultation du contexte E‑TAWJIHI (écoles, filières, services, boutique)…',
    chatbotPrepHint3: 'Vérification des informations à jour sur la plateforme…',
    chatbotPrepHint4: 'Rédaction de votre réponse personnalisée…',
    chatbotThinkingAnalyze: 'Analyse de votre question',
    chatbotThinkingContext: 'Préparation du contexte',
    chatbotThinkingSuggestions: 'Préparation des suggestions',
    shareSheetTitle: 'Partager',
    shareSheetPreviewHint:
      'Aperçu enrichi (Open Graph) comme dans WhatsApp lorsque la page le permet — lien public e-tawjihi.ma.',
    shareLinkPreviewLoading: 'Chargement de l’aperçu…',
    shareCopyLink: 'Copier le lien',
    shareNativeShare: 'Partager…',
    shareCopiedFeedback: 'Lien copié dans le presse-papiers.',
    shareOpenSheetA11y: 'Partager cette page',
    shareKindHome: 'Accueil',
    shareKindSchools: 'Écoles supérieures',
    shareKindSchool: 'Fiche école',
    shareKindAnnouncement: 'Annonce concours',
    shareKindAnnouncements: 'Annonces concours',
    shareKindEvent: 'Événement / webinaire',
    shareKindEvents: 'Agenda événements',
    shareKindCommunity: 'Groupe BAC 2026',
    shareKindBoutique: 'Boutique',
    shareKindBoutiqueProduct: 'Fiche produit',
    sidebarTitle: 'Menu',
    sidebarSubtitle: 'Parcours, outils & communauté',
    sidebarOpen: 'Ouvrir le menu',
    sidebarClose: 'Fermer',
    sidebarCart: 'Panier',
    sidebarEvents: 'Événements',
    sidebarSectionDiscover: 'Découvrir',
    sidebarSectionTools: 'Outils & orientation',
    sidebarSectionShop: 'Boutique',
    sidebarSectionAccount: 'Mon espace',
    eventsAgendaTitle: 'Événements & webinaires',
    eventsDetailPractical: 'Informations',
    eventsDetailDescription: 'À propos',
    eventsDetailStatus: 'Statut',
    eventsDetailVenue: 'Lieu & capacité',
    eventsDetailLocationLabel: 'Lieu',
    eventsDetailRegistrationInfo: "Informations d'inscription",
    eventsTabUpcoming: 'À venir',
    eventsTabLive: 'En cours',
    eventsTabPast: 'Passés',
    eventsEmpty: 'Aucun événement dans cette liste.',
    eventsEmptyLive: 'Aucun événement en direct pour le moment.',
    eventsRefreshing: 'Actualisation…',
    eventsRegister: "S'inscrire",
    eventsRegFormTitle: "Coordonnées d'inscription",
    eventsRegFirstName: 'Prénom',
    eventsRegLastName: 'Nom',
    eventsRegEmail: 'E-mail',
    eventsRegPhone: 'Téléphone',
    eventsRegPhoneHint: 'Rattaché à votre compte (connexion).',
    eventsRegSubmit: "Confirmer l'inscription",
    eventsRegCancel: 'Annuler',
    eventsRegMissingPhone: 'Votre compte doit avoir un numéro de téléphone pour vous inscrire.',
    eventsRegError: "Impossible de s'inscrire.",
    eventsRegisterExternalLink: "Lien d'inscription",
    eventsConnectionPending:
      'Le lien de connexion (visio) sera affiché après déblocage manuel. Utilisez le lien d’inscription externe si disponible.',
    eventsExternalRegClosed: 'Inscription externe non disponible.',
    eventsExternalDefaultInfo:
      'Les inscriptions se font via une page externe (bouton ci-dessous), pas via le formulaire E-TAWJIHI.',
    eventsUnregister: 'Me désinscrire',
    eventsConfirmPresence: 'Confirmer ma présence',
    eventsFull: 'Complet',
    eventsLoadError: 'Impossible de charger les événements.',
    eventsOnlineLink: 'Lien de connexion',
    eventsMapsLink: 'Ouvrir dans Google Maps',
    eventsOpenDetail: 'Détails',
    eventsKindWebinar: 'Webinaire',
    eventsKindLive: 'Live',
    eventsKindEvent: 'Événement',
    eventsPastBadge: 'Terminé',
    eventsRegisteredLabel: 'inscrits',
    eventsPlacesLabel: 'Places',
    eventsFillLabel: 'Taux',
    eventsLiveNow: 'En direct',
    eventsDateStart: 'Début',
    eventsDateEnd: 'Fin',
    eventsDuration: 'Durée',
    eventsRegOpen: 'Inscriptions ouvertes',
    eventsRegClosed: 'Inscriptions fermées',
    eventsRegClosedHint: 'Les inscriptions ne sont plus acceptées.',
    eventsLiveBannerTitle: 'Événement en direct',
    eventsLiveBannerSubtitle: 'La session est en cours.',
    eventsFollowUpTitle: 'Suivi de votre inscription',
    eventsContactNew: 'Nouveau',
    eventsContactUnreachable: 'Injoignable',
    eventsContactWhatsapp: 'WhatsApp envoyé',
    eventsContactConfirmed: 'Confirmé',
    eventsContactCancelled: 'Annulé',
    eventsContactAbandoned: 'Abandonné',
    eventsAttendanceAttended: 'Assisté',
    eventsAttendanceAbsent: 'Absent',
    eventsContactStatusPrefix: 'Statut contact',
    eventsAttendancePrefix: 'Présence',

  // ── Inscriptions / suivi de candidatures ──
    inscEyebrow: 'Inscriptions & candidatures',
    inscTitle: 'Mes inscriptions',
    inscSubtitle: 'Suivez vos candidatures et restez informé des ouvertures.',
    inscTabNotifications: 'Notifications',
    inscTabCandidacies: 'Candidatures',
    inscTabAnnouncements: 'Annonces',
    inscCandidaciesActiveShort: 'actives',
    inscCandidaciesActiveBadgeA11y: '{{count}} candidatures actives',
    inscCandidaciesTabBadgeA11y: '{{active}} candidatures actives, {{attention}} actions requises',
    inscCandidaciesActionsRequiredShort: 'actions requises',
    inscCandidaciesAttentionFilterAll: 'Toutes',
    inscCandidaciesAttentionFilterRequired: 'Action requise',
    inscCandidaciesActionRequiredBanner:
      'Action requise : consultez la dernière annonce et mettez à jour votre statut si l’école le prévoit (ex. passage à « admis au concours »).',
    inscCandidaciesLatestAnnouncementActionTag: 'À traiter',
    inscCandidaciesActionRequiredEmpty: 'Aucune candidature ne demande votre attention pour le moment.',
    inscFilterSchoolLabel: 'École',
    inscFilterSchoolAll: 'Toutes les écoles',
    inscFilterSchoolPickTitle: 'Filtrer par école',
    inscFilterSchoolSearchPlaceholder: 'Nom, nom arabe ou sigle…',
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
    inscTawjihPlusUpgradeCta: 'Passer à TAWJIH PLUS',
    inscTawjihPlusLockTitle: 'Contenu réservé aux clients TAWJIH PLUS',
    inscTawjihPlusLockHint:
      'Annonces détaillées, liens d’inscription, filtres avancés et suivi complet de statut.',
    diagnosticAnswersSavedHint:
      'Vos réponses au diagnostic sont enregistrées. Passez à TAWJIH PLUS pour générer vos recommandations personnalisées.',
    diagnosticRecoGateEyebrow: 'Diagnostic écoles',
    diagnosticRecoGateHeaderTitle: 'Recommandations IA d’écoles',
    diagnosticRecoGateHeaderSub:
      'Classement personnalisé et synthèse de profil selon vos réponses au diagnostic.',
    diagnosticRecoGateCardBadge: 'TAWJIH PLUS',
    diagnosticRecoGateCardTitle: 'Contenu réservé aux clients TAWJIH PLUS',
    diagnosticRecoGateCardDesc:
      'Cette page affiche vos établissements recommandés par intelligence artificielle, avec commentaires détaillés et synthèse de profil.',
    diagnosticRecoGateFeature1: 'Classement des écoles (recommandé, possible, dernier choix…)',
    diagnosticRecoGateFeature2: 'Synthèse IA et commentaire global adapté à votre profil',
    diagnosticRecoGateFeature3: 'Suivi des établissements recommandés pour votre parcours',
    diagnosticRecoGateSavedBox:
      'Vos réponses au diagnostic sont déjà enregistrées. Dès votre passage à TAWJIH PLUS, la génération de cette page se lancera automatiquement.',
    inscNotifEmptyTitle: 'Aucune notification',
    inscNotifEmptyDesc: 'Vos alertes d\'inscription, résultats et orientation apparaîtront ici.',
    inscNotifMarkAllRead: 'Tout marquer lu',
    inscNotifFilterAll: 'Toutes',
    inscNotifFilterUnread: 'Non lues',
    inscCandidaciesEmptyTitle: 'Aucune candidature suivie',
    inscCandidaciesEmptyDesc: 'Suivez une annonce ci-contre pour démarrer le suivi.',
    inscCandidaciesEmptyCta: 'Voir les annonces',
    inscCandidaciesFilterAll: 'Toutes',
    inscCandidaciesFilterStatusLabel: 'Statut',
    inscCandidaciesFilterStatusPickTitle: 'Filtrer par statut',
    inscCandidaciesFilterStatusSearchPlaceholder: 'Rechercher un statut…',
    inscCandidaciesFilterStatusNoResults: 'Aucun statut trouvé',
    inscCandidaciesFilteredEmptyTitle: 'Aucune candidature pour ce statut',
    inscCandidaciesFilteredEmptyDesc: 'Modifiez le filtre ou réinitialisez pour tout afficher.',
    inscAnnouncementsEmptyTitle: 'Aucune annonce',
    inscAnnouncementsEmptyDesc: 'Aucune annonce d\'inscription publiée pour l\'instant.',
    inscAnnouncementsFilteredEmptyTitle: 'Aucune annonce pour ces filtres',
    inscAnnouncementsFilteredEmptyDesc:
      'Modifiez l’école ou les filtres avancés, ou réinitialisez pour afficher toutes les annonces.',
    inscAnnouncementsFollow: 'Suivre',
    inscAnnouncementsFollowing: 'Suivi',
    inscAnnouncementsOpenLink: 'Lien d\'inscription',
    inscAnnouncementsAlreadyTracked: 'Déjà suivi',
    inscAnnouncementsMarkApplied: 'J\'ai postulé',
    inscAnnouncementUnseen: 'Non vue',
    inscAnnouncementUnread: 'Non lue',
    inscStatusUnknown: 'Statut inconnu',
    inscStatusNone: 'Aucun statut',
    inscStatusActionClear: 'Retirer le statut',
    inscStatusActionTitle: 'Mettre à jour le statut',
    inscStatusActionSubtitle: 'Choisissez la nouvelle étape de votre candidature.',
    inscStatusActionUpdate: 'Mettre à jour',
    inscStatusActionUpdating: 'Mise à jour…',
    inscStatusBlockTitle: 'Statut de candidature',
    inscStatusUnavailable: 'Non disponible pour le moment',
    inscStatusSectionInProgress: 'En cours',
    inscStatusSectionFinalized: 'Résultat final',
    inscOpenLinkBtn: 'Ouvrir le lien',
    inscOpenLinkA11y: 'Ouvrir le lien d\'inscription officiel',
    inscOpenLinkBtnResult: 'Voir le résultat',
    inscOpenLinkBtnScholarship: 'Postuler à la bourse',
    inscOpenLinkBtnOffer: 'Profiter de l\'offre',
    inscOpenLinkBtnInfo: 'En savoir plus',
    inscOpenLinkBtnRegister: 'Lien d\'inscription',
    inscAnnTypeOpening: 'Ouverture d\'inscription',
    inscAnnTypeImportant: 'Message important',
    inscAnnTypeOffer: 'Offre',
    inscAnnTypeResult: 'Résultat d\'inscription',
    inscAnnTypeScholarshipMa: 'Bourse maroc',
    inscAnnTypeScholarshipForeign: 'Bourse étrangère',
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
    inscDetailTutorialTitle: 'Tutoriel d’inscription (vidéo)',
    inscDetailTutorialPlaybackError: 'Lecture intégrée indisponible sur cet appareil.',
    inscDetailTutorialRetry: 'Réessayer',
    inscDetailSiblingHistoryTitle: 'Autres annonces de l’établissement',
    inscDetailSiblingsNewer: 'Annonces plus récentes',
    inscDetailSiblingsOlder: 'Annonces plus anciennes',
    inscDetailSiblingHistoryHint:
      'Par rapport à cette annonce : fenêtres plus récentes ou déjà passées, même école.',
    inscDetailSiblingUpcoming: 'À venir',
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
    qnaSectionTitle: 'Questions & réponses',
    qnaIntro:
      'Posez une question publique (visible par la communauté) ou privée (réservée à l’équipe E-Tawjihi). Les réponses officielles sont signalées.',
    qnaRefresh: 'Actualiser',
    qnaEmpty: 'Aucune question pour le moment. Soyez le premier à en poser une.',
    qnaBodyTooShort: 'Votre texte doit contenir au moins 3 caractères.',
    qnaPrivateBadge: 'Privée · équipe E-Tawjihi',
    qnaPrivateHint: 'Seule l’équipe E-Tawjihi peut répondre aux questions privées.',
    qnaMeToo: 'Moi aussi',
    qnaOfficialBadge: 'E-Tawjihi',
    qnaAnswerPlaceholder: 'Votre réponse ou expérience…',
    qnaSendAnswer: 'Publier la réponse',
    qnaTapToReply: 'Répondre',
    qnaReplyDockTitle: 'Réponse',
    qnaAskTitle: 'Poser une question',
    qnaLoginToParticipate: 'Connectez-vous pour poser une question ou répondre.',
    qnaVisibilityPublic: 'Publique',
    qnaVisibilityPrivate: 'Privée (équipe)',
    qnaHintPublic: 'Visible par les autres étudiants ; ils peuvent répondre. L’équipe peut valider une réponse officielle.',
    qnaHintPrivate: 'Visible uniquement par vous et l’équipe E-Tawjihi (situation personnelle ou sensible).',
    qnaPlaceholder:
      'Ex. : votre question sur l’école, les inscriptions, une information ou autre…',
    qnaSubmit: 'Envoyer la question',
    qnaCommunityAnswerBadge: 'Étudiant',
    qnaVerdictCorrect: 'Correct',
    qnaVerdictIncorrect: 'Incorrecte',
    qnaVerdictIncomplete: 'Incomplète',
    qnaVerdictTeamLabel: 'Évaluation équipe',
    qnaLoadingComments: 'Chargement des échanges…',
    qnaShowRepliesOne: 'Voir la réponse',
    qnaShowRepliesMany: 'Voir les {{count}} réponses',
    qnaShowRemainingRepliesOne: 'Voir la réponse restante',
    qnaShowRemainingRepliesMany: 'Voir les {{count}} réponses restantes',
  },
  ar: {
    notifications: 'الإشعارات',
    notifDrawerTitle: 'الإشعارات',
    notifDrawerClose: 'إغلاق',
    notifDrawerSubtitle: 'تنبيهات التسجيل والإعلانات والأسئلة والأجوبة.',
    notifDrawerEmpty: 'لا توجد إشعارات حالياً.',
    notifDrawerOpenLink: 'عرض',
    notifDrawerSeeRecommendations: 'عرض توصياتي',
    notifDrawerContinueParcours: 'متابعة المسار',
    unreadSuffix: 'غير مقروءة',
    help: 'المساعدة',
    profile: 'الملف الشخصي',
    greeting: 'مرحبا',
    userSubtitle: 'TAWJIH PLUS · علوم رياضية أ · الثانية باك',
    homePackLabel: 'الباقة :',
    packStandardLabel: 'الباقة القياسية',
    bacMissionLabel: 'بكالوريا البعثة',
    newsTitle: 'الأخبار',
    languageSwitcher: 'اللغة',
    langFr: 'FR',
    langAr: 'عربي',
    gameDailyTitle: 'لعبة اليوم',
    orientation1BacHomeButton: 'توجيه 1ère باك',
    orientation1BacHomeLocked: 'يفتح في {date}',
    orientation1BacHomeLockedA11y: 'اختبار التوجيه 1ère باك — متاح من {date}',
    homePackAcademicLine: '{filiere} · {niveau}',
    gameDailyBody: 'سيتم ربطها باللعبة المصغرة (shell).',
    dailyChallengeTitle: 'تحدي اليوم',
    dailyChallengeClose: 'إغلاق',
    dailyChallengeNoChallenge: 'لا يوجد تحدٍ اليوم. عد لاحقًا.',
    dailyChallengeLoginHint: 'سجّل الدخول لحفظ النتيجة والتصنيف.',
    dailyChallengeLoginCta: 'تسجيل الدخول',
    dailyChallengeTestButton: 'تجربة لعبة اليوم',
    dailyChallengeRetry: 'إعادة المحاولة',
    dailyChallengeStreak: 'سلسلة',
    dailyChallengeStart: 'ابدأ',
    dailyChallengeSubmit: 'تأكيد',
    dailyChallengeNext: 'السؤال التالي',
    dailyChallengeResult: 'النتيجة',
    dailyChallengeRank: 'الترتيب',
    dailyChallengePlayers: 'لاعبين',
    dailyChallengeBadges: 'شارات',
    dailyChallengeLeaderboard: 'عرض التصنيف',
    dailyChallengePlayed: 'لعبت اليوم بالفعل.',
    dailyChallengeMicroLearn: 'هل تعلم؟',
    dailyChallengeMicroLearnTeaser:
      'نصيحة اليوم — المس لقراءة معلومة مفيدة في ثوانٍ.',
    dailyChallengeMicroLearnModalSubtitle: 'مكمل قصير للتعمق قليلًا',
    dailyChallengeMicroLearnModalIntro:
      'يلخص هذا القسم فكرة مرتبطة بتحدي اليوم. يمكنك إعادة فتحه متى شئت؛ بعد القراءة يصبح التذكير أقل ظهورًا.',
    dailyChallengeMicroLearnGotIt: 'تم',
    dailyChallengeMicroLearnReopen: 'إعادة عرض النصيحة',
    dailyChallengePickGames: 'اختر مهمة أدناه (الترتيب حرّ).',
    dailyChallengePlayThis: 'العب',
    dailyChallengeGameDone: 'منتهية',
    dailyChallengeSeeScore: 'التصنيف (هذه اللعبة)',
    dailyChallengeBackToGames: 'العودة إلى الألعاب',
    dailyChallengeAllDone: 'أحسنت، أنهيت كل ألعاب اليوم!',
    dailyChallengeZipHint:
      'اسحب لرسم المسار؛ المس خلية على المسار لتقصيره (ليس أثناء السحب).',
    dailyChallengeZipValidate: 'تأكيد الترتيب',
    dailyChallengeZipOrder: 'ترتيبك',
    dailyChallengeZipOrderError: 'مشكلة في الترتيب: مرّ على الأرقام ١، ٢، ٣… بالترتيب على مسارك.',
    dailyChallengeZipPathError: 'مسار غير صالح (جدار أو خلية غير متاحة).',
    dailyChallengeZipPracticeTitle: 'تدريب SNAKE — 10 شبكات',
    dailyChallengeZipPracticeHint: 'شبكات ٥×٥ إلى ١٢×١٢ — نتيجة محليّة.',
    dailyChallengeZipPracticeTag: 'تدريب',
    dailyChallengeZipPracticeResult: 'وضع تدريب — لا يُحفظ في التصنيف.',
    dailyChallengeZipPracticeAgain: 'إعادة هذه الشبكة',
    dailyChallengeZipUndo: 'تراجع عن آخر خطوة',
    dailyChallengeZipHelpBtn: 'مساعدة — الخلية التالية',
    dailyChallengeZipHelpCooldown: 'انتظر {{s}} ث',
    dailyChallengeZipHelpNoHint: 'لا يتوفر تلميح لهذا الوضع.',
    dailyChallengeZipReset: 'إعادة البدء',
    dailyChallengeZipInteractionHint:
      'نصيحة: اسحب على الشبكة؛ للاختصار المسار المس خلية كانت على المسار الحالي (ليس أثناء السحب).',
    dailyChallengeZipHowToPlay:
      'ابدأ من ١ ثم ٢، ٣… بالترتيب. كل خلية مرة. الجدران تمنع المرور. إكمال الشبكة يرسل المحاولة تلقائيًا.',
    dailyChallengeZipRulesCta: 'القواعد',
    dailyChallengeZipRulesTitle: 'SNAKE — القواعد',
    dailyChallengeZipSeeResults: 'عرض النتيجة والتصنيف',
    dailyChallengeYourTime: 'الوقت',
    dailyChallengeCongratsTitle: 'أحسنت!',
    dailyChallengeCongratsPracticeLine: 'تدريب — النتيجة محليّة وليست في التصنيف الرسمي.',
    dailyChallengeFlawlessBadge: 'بدون أخطاء',
    dailyChallengeSolvedIn: 'أُنجز في',
    dailyChallengeResultCardTitle: 'نتيجتك',
    dailyChallengeBeatPlayersPrefix: 'تتقدّم على نحو',
    dailyChallengeBeatPlayersSuffix: '% من المشاركين اليوم.',
    dailyChallengeLeaderboardModalTitle: 'تصنيف اليوم',
    dailyChallengeLeaderboardTopToday: 'أفضل الأزمنة',
    dailyChallengeLeaderboardLoadMore: 'تحميل المزيد',
    dailyChallengeYouLabel: 'أنت',
    dailyChallengePremiumBadge: 'Premium',
    dailyChallengePremiumBadgeA11y: 'عميل اقتنى خدمة واحدة على الأقل',
    dailyChallengeScoreLabel: 'النقاط',
    dailyChallengeHubHeroLine: 'جلسة قصيرة كل يوم للتقدّم خطوة بخطوة.',
    dailyChallengeMissionsTitle: 'مهام اليوم',
    dailyChallengeProgressSectionTitle: 'تقدّمك',
    dailyChallengeProgressBannerKicker: 'منطقة اللاعب',
    dailyChallengeProgressLevelShort: 'الأوسمة {{n}} / {{total}}',
    dailyChallengeProgressXpCaption: '{{pct}}٪ نحو هدف {{next}} يومًا',
    dailyChallengeProgressXpMaxed: 'كل المراحل مفتوحة — حافظ على سلسلتك!',
    dailyChallengeProgressBadgeQuest: 'مسار الشارات',
    dailyChallengeProgressRecordShort: 'أفضل سلسلة',
    dailyChallengeProgressBestScoreShort: 'أفضل نتيجة',
    dailyChallengeProgressBestTimeShort: 'أفضل زمان',
    dailyChallengeProgressIceShort: 'تجميدات ICE',
    dailyChallengeStreakRecord: 'الأرقام القياسية: {{n}}',
    dailyChallengeIceStock: 'ICE × {{n}}',
    dailyChallengeYearProgressTitle: 'سنة {{year}}',
    dailyChallengeYearProgressFromTitle: '{{year}} — منذ {{date}}',
    dailyChallengeLegendPlayed: 'لُعب',
    dailyChallengeLegendMissed: 'فائت',
    dailyChallengeLegendIce: 'ICE',
    dailyChallengeLegendFuture: 'قادم',
    dailyChallengeMilestonesTitle: 'مراحل السلسلة',
    dailyChallengeIceUsedTitle: 'تم استخدام ICE',
    dailyChallengeIceUsedBody:
      'لم تلعب أمس؛ تم استخدام ICE تلقائيًا للحفاظ على سلسلتك (اليوم {{date}}).',
    dailyChallengeIceUnlockedTitle: 'ICE جديد',
    dailyChallengeIceUnlockedBody:
      '{{streak}} يومًا متتاليًا: ربحت ICE (لديك الآن {{freezes}}).',
    dailyChallengeIceExplainTitle: 'ما هو ICE؟',
    dailyChallengeIceExplainBody:
      'ICE يحمي سلسلتك إذا لم تلعب يومًا: بدون لعب أمس، يُستهلك ICE تلقائيًا حتى لا تُصفّر سلسلتك.\n\n' +
      'تربح ICE عند بلوغ بعض مراحل الأيام المتتالية. الرقم المعروض هو رصيدك المتاح.\n\n' +
      'في التقويم، يوم بعلامة ICE يعني أن تجميدًا استُخدم أو سُجّل لهذا اليوم.',
    dailyChallengeIceExplainCta: 'فهمت',
    infoDailyTitle: 'معلومة اليوم',
    infoDailyBody: 'سيتم ربطها بنشرة اليوم (shell).',
    practicalTitle: 'روابط مفيدة',
    practicalSubtitle: 'وصول سريع إلى خدماتك',
    practicalSectionA11y: 'روابط مفيدة',
    homeSeeMore: 'عرض المزيد',
    homeMostVisitedSchoolsTitle: 'المدارس الأكثر زيارة',
    homeMostVisitedSchoolsSubtitle: 'المؤسسات التي يتصفحها المجتمع',
    homeMostVisitedSchoolsA11y: 'المدارس الأكثر زيارة',
    homeLatestAnnouncementsTitle: 'آخر الإعلانات',
    homeLatestAnnouncementsSubtitle: 'مسابقات وتسجيلات منشورة حديثًا',
    homeLatestAnnouncementsA11y: 'آخر الإعلانات',
    homeAnnouncementOpen: 'مفتوح',
    homeAnnouncementClosed: 'مغلق',
    homeAnnouncementDatesLocked: 'التواريخ — TAWJIH PLUS',
    homeRefresh: 'تحديث',
    homeRefreshA11y: 'تحديث الصفحة الرئيسية',
    homeRefreshing: 'جاري التحديث…',
    home_orientation_access_eyebrow: 'التوجيه',
    home_orientation_access_title: 'التشخيص والتوصيات',
    practical_orientation_section: 'مسار التوجيه',
    practical_services_section: 'الخدمات',
    practical_diagnostic_ecoles: 'تشخيص المدارس',
    sidebarOrientation1Bac: 'اختبار التوجيه 1ère باك',
    practical_diagnostic_rapport: 'تقرير التشخيص',
    practical_diagnostic_recommandations: 'توصيات المدارس',
    practical_diagnostic_ecoles_desc:
      'استبيان سريع لتخصيص توصيات المؤسسات.',
    practical_diagnostic_rapport_desc:
      'استعرض إجاباتك والملخص مرحلة بمرحلة.',
    practical_diagnostic_recommandations_desc:
      'قائمة مخصصة ومتابعة 3 مؤسسات على الأقل لإتمام المسار.',
    practical_recommandations_locked_account:
      'أكمل إعداد حسابك لعرض توصياتك.',
    practical_recommandations_locked_diagnostic:
      'أنهِ تشخيص المدارس أولاً لفتح التوصيات.',
    practical_orientation_locked_title: 'الخطوة مقفلة',
    practical_orientation_loading: 'جاري تحميل المسار…',
    practical_diagnostic_locked_account:
      'أكمل إعداد حسابك لبدء التشخيص.',
    practical_rapport_locked_account:
      'أكمل إعداد حسابك للوصول إلى التقرير.',
    practical_rapport_locked_diagnostic:
      'أنهِ تشخيص المدارس أولاً لفتح التقرير.',
    practical_ecoles: 'المدارس العليا',
    practical_inscriptions: 'التسجيلات والمواعيد',
    practical_candidatures: 'متابعة طلباتي',
    practical_ecolesInscription: 'مدارس تسجيلي',
    practical_boutique: 'المتجر',
    practical_ecoles_desc:
      'استكشاف المؤسسات والمسارات ومعايير القبول لصياغة مشروعك الدراسي.',
    practical_inscriptions_desc:
      'تقاويم المسابقات والملفات المطلوبة والآجال حتى لا يفوتك أي موعد.',
    practical_candidatures_desc:
      'تتبّع حالة ملفاتك والخطوات القادمة في طلباتك.',
    practical_evenements_desc:
      'معارض وورش عمل وندوات عبر الويب لتطوير توجهك.',
    practical_ecolesInscription_desc:
      'المؤسسات التي تقدّم لها طلبًا أو تتابع معها التسجيل.',
    practical_boutique_desc:
      'باقات المرافقة والخدمات لتأمين مسارك.',
    practicalCardEyebrow: 'روابط مفيدة',
    practicalCardTap: 'المس للفتح',
    practicalCardA11y: 'فتح الرابط المفيد',
    schoolsTitle: 'المدارس العليا',
    schoolsHeroEyebrow: 'المدارس العليا',
    schoolsHeroTitle: 'مدارس عليا',
    schoolsFilters: 'التصفية',
    schoolsFiltersA11y: 'فلاتر مفصلة',
    schoolsFollowedOnlyA11y: 'المدارس التي أتابعها فقط',
    schoolsSearchPlaceholder: 'بحث (الاسم، المدينة، الجامعة...)',
    schoolsSearchPlaceholderLocked: 'البحث مخصّص لعملاء TAWJIH PLUS',
    schoolsSearchFiltersLockedHint: 'البحث والفلاتر التفصيلية مخصّصة لعملاء TAWJIH PLUS.',
    schoolsTypeAll: 'الكل',
    schoolsTypeLabel: 'نوع المؤسسة',
    schoolsTypePublic: 'عمومي',
    schoolsTypePrivate: 'خصوصي',
    schoolsTypeSemiPublic: 'شبه عمومي',
    schoolsTypeMilitary: 'عسكري',
    schoolsFiltersTitle: 'فلاتر مفصلة',
    schoolsFilterAcceptedStudyLabel: 'شعبة الدراسة المقبولة',
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
    schoolsRefreshing: 'جاري التحديث…',
    estCardQnaOpenA11y: 'فتح الأسئلة والأجوبة',
    estCardBtnComment: 'تعليقات',
    estCardBadgeSponsored: 'برعاية',
    estCardStatsClusterA11y: '{{followers}} يتابعون هذه المدرسة، {{comments}} رسالة في المجتمع',
    estCardStatsLoadingA11y: 'جارٍ تحميل إحصائيات المجتمع',
    schoolsClearFilter: 'إلغاء الاختيار',
    schoolsErrorNetwork: 'خطأ في الشبكة',
    planOffersTitle: 'باقات التسجيل والمدارس',
    planOffersLink: 'عرض الباقات',
    storiesA11y: 'القصص',
    newsCarouselA11y: 'الأخبار — تمرير أفقي',
    swipeCardsHint: 'اسحب البطاقات',
    bacCardEyebrow: 'البكالوريا 2026',
    bacCardTitle: 'نتيجة البكالوريا',
    bacCardDateLabel: 'النشر المتوقع',
    bacStatusNotYet: 'لم يُنشر بعد',
    bacStatusPublished: 'منشور',
    bacCountdownKicker: 'العد التنازلي',
    bacCountdownDays: 'ي',
    bacCountdownHours: 'س',
    bacCountdownMinutes: 'د',
    bacJourJTitle: 'يوم النتائج',
    bacWaitingResult: 'في انتظار النتيجة',
    bacOutletsTitle: 'قنوات النتائج',
    bacOutletOutlook: 'Outlook (البريد)',
    bacOutletSms: 'رسالة SMS',
    bacOutletMenResults: 'bac.men.gov.ma (النقاط)',
    bacSiteStatusLabel: 'موقع bac.men.gov.ma',
    bacSiteOnline: 'متصل',
    bacSiteOffline: 'غير متصل',
    bacLinkOutlook: 'التحقق من Outlook',
    bacLinkMen: 'bac.men.gov.ma',
    bacLinkOutlookA11y: 'فتح Outlook للتحقق من النتائج',
    bacLinkMenA11y: 'فتح الموقع الرسمي bac.men.gov.ma',
    bacTapForGuide: 'التعليمات',
    bacOutletGuideA11y: 'عرض تعليمات التحقق',
    bacVerifyModalTitleOutlook: 'التحقق عبر Outlook',
    bacVerifyModalTitleMen: 'الاطلاع على bac.men.gov.ma',
    bacVerifyModalTitleSms: 'النتيجة عبر SMS',
    bacVerifyStepsTitle: 'الخطوات',
    bacMassarSectionTitle: 'رمز مسار',
    bacMassarSectionHint:
      'أكّد أو صحّح رمز مسار. يُستخدم للدخول إلى الموقع الرسمي ولتكوين بريد @taalim.ma.',
    bacMassarPlaceholder: 'مثال A123456789',
    bacMassarConfirm: 'تأكيد',
    bacMassarEdit: 'تعديل',
    bacMassarSaved: 'تم الحفظ',
    bacOutlookEmailLabel: 'معرّف Outlook',
    bacOutlookPasswordLabel: 'كلمة المرور',
    bacOutlookPasswordHint: 'نفس كلمة مرور مسار',
    bacOutlookStep1: 'افتح Outlook أو تطبيق البريد على هاتفك.',
    bacOutlookStep2: 'سجّل الدخول بـ {email} (رمز مسار + @taalim.ma).',
    bacOutlookStep3: 'أدخل كلمة مرور مسار (نفس بوابة مسار).',
    bacOutlookStep4: 'راجع البريد الوارد: رسالة رسمية تعلن نتيجتك.',
    bacOutlookStep5: 'إن لم يظهر شيء، انتظر دقائق ثم حدّث البريد.',
    bacMenStep1: 'افتح bac.men.gov.ma من الزر أدناه.',
    bacMenStep2: 'أدخل رمز مسار في الاستمارة.',
    bacMenStep3: 'فعّل « لستُ روبوتاً » (كابتشا).',
    bacMenStep4: 'أرسل الاستمارة لعرض النقطة والميزة.',
    bacMenStep5: 'عند النجاح: النقطة والميزة. عند الرسوب دون استدراك: رسالة مناسبة.',
    bacMenStep6: 'إن كنت مستحقاً للاستدراك، يوضح الموقع ذلك.',
    bacSmsStep1: 'لا إجراء في التطبيق: الرسالة من النظام الرسمي.',
    bacSmsStep2: 'تصل الرسالة إلى الهاتف المسجّل في حساب مسار.',
    bacSmsStep3: 'الرسالة تعلن نتيجتك يوم النشر مباشرة.',
    bacOpenOutlook: 'فتح Outlook',
    bacOpenMenSite: 'فتح bac.men.gov.ma',
    bacModalClose: 'إغلاق',
    bacThresholdsEyebrow: 'الالتحاق بالتعليم العالي',
    bacThresholdsTitle: 'حساب العتبات',
    bacThresholdsSubtitle: 'أدخل نقاطك من كشف النقاط لتقدير معدل القبول في المدارس.',
    bacThresholdsTip: 'الصيغ أدناه لمقارنة ملفك مع العتبات على بطاقات المؤسسات.',
    bacThresholdsSectionNotes: 'نقاط كشف النقاط',
    bacThresholdsSectionHint: 'من كشف النقاط الرسمي (على 20).',
    bacThresholdsRegional: 'الجهوي',
    bacThresholdsNational: 'الوطني',
    bacThresholdsContinuous: 'المراقبة المستمرة',
    bacThresholdsOverall: 'المعدل العام',
    bacThresholdsPlaceholder: '0,00',
    bacThresholdsSave: 'حفظ وحساب',
    bacThresholdsSaved: 'تم حفظ النقاط',
    bacThresholdsResultsTitle: 'معدلاتك التقديرية',
    bacThresholdsFormula7525: '75 % وطني + 25 % جهوي',
    bacThresholdsFormula5050: '50 % وطني + 50 % جهوي',
    bacThresholdsFormulaMajorBadge: 'الصيغة الأكثر شيوعاً',
    bacThresholdsOverallLabel: 'المعدل العام (كشف النقاط)',
    bacThresholdsDisclaimer:
      'قد تطبق كل مؤسسة صيغتها. عملياً، نحو 90 % من المدارس العليا تستخدم 75 % وطني و 25 % جهوي — التفاصيل على بطاقات المدارس.',
    bacThresholdsOutOf20: '/20',
    bacThresholdsCtaTitle: 'حساب عتبات المدارس',
    bacThresholdsCtaSub: 'أدخل نقاطك · صيغ 75/25 و 50/50',
    bacThresholdsLockedSub: 'متاح في 2ème باك',
    orientationTapHint: 'المس لعرض الخطوات',
    orientationProgressLabel: 'تقدّم التوجيه',
    orientationTasksA11y: 'مسار التوجيه — 6 خطوات',
    orientationModalSubtitle: 'خطتك في 6 مراحل',
    orientationFranchisedEmpty: 'لا توجد خطوة مكتملة بعد.',
    orientationContinueCta: 'متابعة',
    orientationSeeAllSteps: 'عرض التفاصيل',
    orientationStepCountLabel: '6 خطوات',
    orientationStepAccountSetup: 'إعداد الحساب',
    orientationStepAccountSetupShort: 'الحساب',
    orientationStepBadgeDone: 'مكتمل',
    orientationStepBadgeCurrent: 'جاري',
    orientationStepBadgeTodo: 'للقيام',
    orientationStepOrientationDiagnostic: 'تشخيص التوجيه',
    orientationStepOrientationDiagnosticShort: 'تشخيص',
    orientationStepRecommendation: 'توصية ومتابعة المدارس',
    orientationStepRecommendationShort: 'توصيات ومتابعة',
    orientationStepRecommendationHint:
      'تابع 3 مؤسسات موصى بها لإتمام هذه الخطوة.',
    diagnosticRecoFollowBanner:
      'لإتمام المسار: تابع 3 مؤسسات موصى بها على الأقل.',
    diagnosticRecoFollowBannerDone: 'تمت الخطوة — تتابع مؤسساتك الموصى بها.',
    practical_diagnostic_recommandations_follow_hint:
      'تابع 3 مؤسسات على الأقل من قائمة التوصيات.',
    orientationStepFeedback: 'ملاحظات',
    orientationStepFeedbackShort: 'ملاحظات',
    appFeedbackTitle: 'رأيك في التطبيق',
    appFeedbackEyebrow: 'تحسين مستمر',
    appFeedbackIntro:
      'ملاحظاتك توجّه أولوياتنا. خصّص 2–3 دقائق لتقييم كل محور.',
    appFeedbackProgress: '{{done}} / {{total}} معايير مقيّمة',
    appFeedbackScaleHint: 'اختر لكل سؤال: ممتاز، جيد أو متوسط.',
    appFeedbackOptionTresBien: 'ممتاز',
    appFeedbackOptionBien: 'جيد',
    appFeedbackOptionMoyen: 'متوسط',
    appFeedbackCatDesign: 'التصميم والواجهة',
    appFeedbackCatDesignDesc: 'المظهر، التنقل ووضوح الشاشات.',
    appFeedbackCatSimplicity: 'سهولة الاستخدام',
    appFeedbackCatSimplicityDesc: 'البدء، إيجاد المعلومة وملء الاستمارات.',
    appFeedbackCatTranslations: 'اللغات والترجمة',
    appFeedbackCatTranslationsDesc: 'جودة الفرنسية والعربية واتساق الصفحات.',
    appFeedbackCatRecommendations: 'التوجيه والتوصيات',
    appFeedbackCatRecommendationsDesc: 'التشخيص، النقاط وملاءمة المؤسسات المقترحة.',
    appFeedbackCatSchools: 'المؤسسات والتسجيلات',
    appFeedbackCatSchoolsDesc: 'البحث، الإعلانات ومتابعة الترشيح.',
    appFeedbackCatContent: 'الرئيسية والمسار',
    appFeedbackCatContentDesc: 'الصفحة الرئيسية، خطة النجاح والإشعارات.',
    appFeedbackCatTechnical: 'الأداء والموثوقية',
    appFeedbackCatTechnicalDesc: 'السرعة، الاستقرار والأعطال.',
    appFeedbackCatShop: 'المتجر والخدمات',
    appFeedbackCatShopDesc: 'اكتشاف العروض وتجربة الشراء.',
    appFeedbackCatComments: 'تعليقاتكم',
    appFeedbackCatCommentsDesc: 'فصّلوا ما يمكن تحسينه.',
    appFeedbackQDesignOverall: 'المظهر العام للتطبيق',
    appFeedbackQDesignOverallDesc: 'الألوان، الهوية البصرية، الانطباع العام.',
    appFeedbackQDesignNav: 'التنقل بين الأقسام',
    appFeedbackQDesignNavDesc: 'التبويبات، القوائم، الرجوع، وضوح المسارات.',
    appFeedbackQDesignRead: 'وضوح المحتوى',
    appFeedbackQDesignReadDesc: 'حجم النص، التباين، التسلسل البصري.',
    appFeedbackQEaseFirst: 'البدء والتعارف',
    appFeedbackQEaseFirstDesc: 'الحساب، الملف، الزيارة الأولى دون مساعدة.',
    appFeedbackQEaseFind: 'إيجاد المعلومة',
    appFeedbackQEaseFindDesc: 'مدارس، إعلانات، تشخيص، متجر، حساب…',
    appFeedbackQEaseForms: 'الاستمارات والفلاتر',
    appFeedbackQEaseFormsDesc: 'التشخيص، فلاتر المدارس، تحديث الملف.',
    appFeedbackQTransFr: 'جودة الفرنسية',
    appFeedbackQTransFrDesc: 'الصياغة، الأخطاء، أسلوب مناسب للتلميذ.',
    appFeedbackQTransAr: 'جودة العربية',
    appFeedbackQTransArDesc: 'الصياغة، المعنى، عرض RTL.',
    appFeedbackQTransConsist: 'اتساق FR / AR',
    appFeedbackQTransConsistDesc: 'نفس مستوى الجودة في كل الشاشات.',
    appFeedbackQRecoRel: 'ملاءمة التوصيات',
    appFeedbackQRecoRelDesc: 'تناسب المؤسسات مع ملفك واختياراتك.',
    appFeedbackQRecoClear: 'وضوح الشروحات',
    appFeedbackQRecoClearDesc: 'النقاط، المستويات، تقرير التشخيص.',
    appFeedbackQRecoDiag: 'مسار التشخيص',
    appFeedbackQRecoDiagDesc: 'الخطوات، المدة، فهم الأسئلة.',
    appFeedbackQSchoolSearch: 'قوائم وبطاقات المدارس',
    appFeedbackQSchoolSearchDesc: 'الفلاتر، البطاقات، المعلومات المفيدة.',
    appFeedbackQSchoolAnn: 'إعلانات التسجيل',
    appFeedbackQSchoolAnnDesc: 'الوضوح، التواريخ، الروابط، التفاصيل.',
    appFeedbackQSchoolFollow: 'المتابعة والحالات',
    appFeedbackQSchoolFollowDesc: 'الترشيحات المتتبعة وتحديث الحالة.',
    appFeedbackQContentHome: 'الرئيسية ومسار التوجيه',
    appFeedbackQContentHomeDesc: 'البطاقات، خطة النجاح، الخطوات المنجزة.',
    appFeedbackQContentNotif: 'الإشعارات',
    appFeedbackQContentNotifDesc: 'الملاءمة، التكرار، وضوح الرسائل.',
    appFeedbackQTechSpeed: 'السرعة والتحميل',
    appFeedbackQTechSpeedDesc: 'القوائم، الصور، تغيير الشاشة.',
    appFeedbackQTechStable: 'الاستقرار العام',
    appFeedbackQTechStableDesc: 'تعطل، تجمّد، إغلاق مفاجئ.',
    appFeedbackQTechBugs: 'الأخطاء التي واجهتها',
    appFeedbackQTechBugsDesc: 'تكرار وخطورة المشاكل.',
    appFeedbackQShop: 'المتجر والطلبات',
    appFeedbackQShopDesc: 'المنتجات، الخدمات، السلة ومتابعة الطلب.',
    appFeedbackTextImprove: 'كيف نحسّن التطبيق؟',
    appFeedbackTextImprovePh:
      'ما أعجبك، ما ينقص، ما عطّلك… (اختياري)',
    appFeedbackTextBugs: 'أخطاء أو بطء محدد',
    appFeedbackTextBugsPh: 'الشاشة، الإجراء، رسالة الخطأ إن وجدت…',
    appFeedbackTextFeatures: 'ميزات مرغوبة',
    appFeedbackTextFeaturesPh: 'أفكار للإصدارات القادمة (اختياري)',
    appFeedbackSubmit: 'إرسال رأيي',
    appFeedbackThanks: 'شكراً على مساهمتك',
    appFeedbackThanksSub: 'رأيك يساعد مجتمع إي-توجيهي بأكمله.',
    appFeedbackThanksEyebrow: 'تم الإرسال',
    appFeedbackThanksCardTitle: 'تم تسجيل رأيك بنجاح',
    appFeedbackThanksCardSub: 'سنأخذه بعين الاعتبار لتحسين التطبيق. يمكنك إغلاق هذه النافذة.',
    appFeedbackError: 'تعذّر الإرسال. أعد المحاولة لاحقاً.',
    appFeedbackLoginRequired: 'سجّل الدخول لإرسال رأيك.',
    appFeedbackRequiredRatings: 'يُرجى الإجابة على جميع الأسئلة (ممتاز، جيد أو متوسط).',
    appFeedbackRequiredComment: 'يُرجى وصف كيفية تحسين التطبيق (10 أحرف على الأقل).',
    appFeedbackOpenCta: 'إبداء رأيي في التطبيق',
    appUpdateEyebrow: 'تحديث',
    appUpdateTitleRequired: 'تحديث إلزامي',
    appUpdateTitleRecommended: 'إصدار جديد متوفر',
    appUpdateCta: 'التحديث من المتجر',
    appUpdateLater: 'لاحقاً',
    appUpdateVersionHint: 'إصدارك: {current} — آخر إصدار: {latest}',
    pushPermissionModalTitle: 'فعّل الإشعارات',
    pushPermissionModalBody:
      'استقبل تنبيهات فتح التسجيلات وإعلانات المسابقات ورسائل إي توجيهي المهمة.',
    pushPermissionModalHint:
      'الإشعارات معطّلة على هذا الجهاز. افتح الإعدادات للسماح بها (الإعدادات → الإشعارات → E-Tawjihi على iPhone، أو الإعدادات → التطبيقات → E-Tawjihi على Android).',
    pushPermissionModalOpenSettings: 'فتح الإعدادات',
    pushPermissionModalLater: 'لاحقاً',
    orientationStepApplyToSchools: 'إدارة التسجيلات',
    orientationStepApplyToSchoolsShort: 'التسجيلات',
    applySchoolsTourEyebrow: 'دليل',
    applySchoolsTourTitle: 'إدارة التسجيلات',
    applySchoolsTourNext: 'متابعة',
    applySchoolsTourBack: 'رجوع',
    applySchoolsTourTapNotif: 'عرض التنبيه',
    applySchoolsTourTapFollow: 'متابعة هذا الإعلان',
    applySchoolsTourTapStatus: 'تحديث حالتي',
    applySchoolsTourFocusTap: 'اضغط هنا',
    applySchoolsTourFocusLearn: 'اكتشف',
    applySchoolsTourTrackerStep: 'الخطوة {current} / {total}',
    applySchoolsTourTrackerActionTitle: 'الإجراء المطلوب',
    applySchoolsTourTrackerPending: 'لم يُنجَز بعد',
    applySchoolsTourTrackerDone: 'مكتمل',
    applySchoolsTourActionTapNotification: 'اضغط على تنبيه المسابقة أدناه',
    applySchoolsTourActionTapContinue: 'اضغط « متابعة » في الأسفل',
    applySchoolsTourActionTapFollow: 'اضغط قلب « متابعة » على البطاقة',
    applySchoolsTourActionTapStatus: 'اضغط « تحديث » على البطاقة',
    applySchoolsTourActionTapCandidaciesTab: 'اضغط تبويب الترشيحات',
    applySchoolsTourActionTapRegistrationLink: 'اضغط رابط التسجيل',
    applySchoolsTourTabsLegend:
      'الشارة الخضراء: {{active}} ترشيحات نشطة · الحمراء: {{attention}} إجراء(ات) مطلوب(ة).',
    applySchoolsTourTabsAnnouncementsPlaceholder:
      'تبويب الإعلانات: كل منشورات المدارس (مسابقات، تسجيلات…).',
    applySchoolsTourTabsTapCandidaciesHint:
      'اضغط تبويب الترشيحات لعرض متابعاتك والإجراءات المطلوبة.',
    applySchoolsTourGoInscriptions: 'الذهاب إلى التسجيلات',
    applySchoolsTourTeaseTitle: '{school} — تنبيه مسابقة',
    applySchoolsTourTeaseSub: 'اضغط لاستقبال تنبيه على هاتفك',
    applySchoolsTourTeaseHint: 'كما على هاتفك: يُعلِمك التنبيه عند نشر مدرسة لإعلان جديد.',
    applySchoolsTourPushHint: 'يفتح التنبيه الإعلان في التطبيق. هنا مثال لـ {school}.',
    applySchoolsTourCardTypeHint: 'الشريط يوضح نوع الإعلان (هنا: فتح التسجيلات).',
    applySchoolsTourCardFollowHint: 'القلب لمتابعة المدرسة واستقبال الإعلانات القادمة.',
    applySchoolsTourCardStatusHint: '« تحديث » لتحديد مرحلتك (مهتم، مرشّح، مسجّل…).',
    applySchoolsTourFollowHint: 'اضغط القلب: تتابع {school} وتفعّل التنبيهات.',
    applySchoolsTourStatusHint: 'اختر حالة ترشيحك — كما في تبويب التسجيلات.',
    applySchoolsTourCandidacyHint: 'في الترشيحات: البطاقة تتحول للون الوردي عند إعلان جديد يتطلب انتباهك.',
    applySchoolsTourBravoTitle: 'أحسنت!',
    applySchoolsTourBravoSub: 'تعرف متابعة إعلان، تحديث حالتك وإيجاد مدارسك.',
    applySchoolsTourStep_notification_tease_title: '1. تنبيهات المسابقات',
    applySchoolsTourStep_notification_tease_body: 'عند نشر مدرسة لإعلان (مسابقة، فتح تسجيلات…) يمكنك تلقي تنبيهاً.',
    applySchoolsTourStep_push_preview_title: '2. مثال تنبيه',
    applySchoolsTourStep_push_preview_body: 'هذا شكل التنبيه لفتح التسجيلات لدى {school}.',
    applySchoolsTourStep_announcement_card_title: '3. إعلان {school}',
    applySchoolsTourStep_announcement_card_body: 'نفس العرض في تبويب الإعلانات: التواريخ، الرابط، الأهلية والإجراءات.',
    applySchoolsTourRegistrationLinkHint:
      'في الاستخدام الفعلي، يفتح هذا الزر صفحة التسجيل الرسمية للمدرسة (موقع أو استمارة). هنا لا نفتحه: هذا عرض توضيحي فقط.',
    applySchoolsTourStep_registration_link_title: '4. رابط التسجيل',
    applySchoolsTourStep_registration_link_body:
      'زر السهم يفتح صفحة التسجيل لدى المؤسسة. استخدمه عندما تكون مستعداً للتسجيل على موقع المدرسة.',
    applySchoolsTourStep_follow_action_title: '5. متابعة المدرسة',
    applySchoolsTourStep_follow_action_body: 'بالمتابعة تجمع تتبع ترشيحك لهذه المدرسة.',
    applySchoolsTourStep_status_action_title: '6. حالة الترشيح',
    applySchoolsTourStep_status_action_body:
      'اضغط « تحديث » واختر « مسجَّل » أو « غير مهتم » لهذه المدرسة.',
    applySchoolsTourStep_inscriptions_tabs_title: '7. تبويبا الإعلانات / الترشيحات',
    applySchoolsTourStep_inscriptions_tabs_body:
      'تبويبان: اكتشاف الإعلانات ومتابعة ترشيحاتك. الشارات توضّح عدد المتابعات النشطة وعدد الإجراءات المطلوبة.',
    applySchoolsTourStep_candidacies_tab_title: '8. فتح الترشيحات',
    applySchoolsTourStep_candidacies_tab_body:
      'اضغط الترشيحات لعرض مدارسك المتابَعة. مرشّح « إجراء مطلوب » (الشارة الحمراء) يعرض البطاقات التي تحتاج تحديثاً.',
    applySchoolsTourStep_candidacy_card_title: '9. تحديث ترشيح',
    applySchoolsTourStep_candidacy_card_body:
      'بطاقة « إجراء مطلوب »: اضغط « تحديث » وحدّد « مقبول في المباراة » أو « غير مقبول في المباراة ».',
    applySchoolsTourStep_bravo_title: '10. انطلق!',
    applySchoolsTourStep_bravo_body: 'استكشف الإعلانات الحقيقية وابدأ ترشيحاتك.',
    inscCandidaciesEmptyTourCta: 'عرض الدليل',
    orientationStepAppDiscovery: 'اكتشاف التطبيق',
    orientationStepAppDiscoveryShort: 'اكتشاف',
    orientationStepInviteFriend: 'دعوة صديق',
    orientationStepInviteFriendShort: 'إحالة',
    modalClose: 'إغلاق',
    closeOverlayA11y: 'إغلاق',
    dailyPlay: 'العب',
    dailyPlayed: 'تم اللعب',
    homeDailyStreakOne: 'سلسلة: يوم واحد',
    homeDailyStreakMany: 'سلسلة: {{n}} أيام',
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
    loginPhonePlaceholder: '06XXXXXXXX',
    loginPasswordLabel: 'كلمة المرور',
    loginPasswordPlaceholder: 'كلمة المرور',
    loginForgotPassword: 'نسيت كلمة المرور؟',
    loginCta: 'تسجيل الدخول',
    loginBack: 'رجوع',
    loginInvalidPhone: '10 أرقام تبدأ بـ 06 أو 07',
    loginInvalidPassword: 'كلمة مرور غير صحيحة',
    loginBadCredentials: 'بيانات الدخول غير صحيحة.',
    loginBrandSubtitle: 'لوحتك بعد البكالوريا: التوجيه، التسجيلات، والمرافقة.',
    loginNoAccount: 'ليس لديك حساب بعد؟',
    loginCreateAccount: 'إنشاء حساب',
    registerTitle: 'إنشاء حساب',
    registerSubtitle: 'أنشئ حسابك في E‑Tawjihi في ثوانٍ.',
    registerPhoneLabel: 'رقم الهاتف',
    registerPhonePlaceholder: '06XXXXXXXX',
    registerPasswordLabel: 'كلمة المرور',
    registerPasswordPlaceholder: 'كلمة المرور',
    registerPasswordConfirmLabel: 'تأكيد كلمة المرور',
    registerPasswordConfirmPlaceholder: 'تأكيد كلمة المرور',
    registerCta: 'إنشاء الحساب',
    registerHaveAccount: 'لديك حساب بالفعل؟',
    registerLoginLink: 'تسجيل الدخول',
    registerInvalidConfirm: 'تأكيد غير صحيح',
    registerPasswordsMismatch: 'كلمتا المرور غير متطابقتين.',
    registerPasswordRulesTitle: 'يجب أن تحتوي كلمة المرور على:',
    registerPasswordRuleMinLength: '8 أحرف على الأقل',
    registerPasswordRuleUpper: 'حرف كبير (A-Z)',
    registerPasswordRuleLower: 'حرف صغير (a-z)',
    registerPasswordRuleNumber: 'رقم (0-9)',
    registerPasswordRuleSpecial: 'رمز خاص (!@#$…)',
    registerPasswordWeak: 'كلمة المرور ضعيفة',
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
    forgotSubtitleWhatsapp:
      'أدخل رقم الهاتف المسجّل في حسابك (نفس الرقم على واتساب).',
    forgotSuccessWhatsappTitle: 'تحقق من واتساب',
    forgotSuccessWhatsappBody:
      'إذا وُجد حساب لهذا الرقم، سيصلك رمز قريباً. أدخله لاختيار كلمة مرور جديدة.',
    forgotCtaWhatsapp: 'إرسال الطلب عبر واتساب',
    forgotCtaCheckPhone: 'التحقق من رقمي',
    forgotAccountNotFound:
      'لا يوجد حساب نشط في إي توجيهي لهذا الرقم. تحقق من 06 أو 07 المسجّل في حسابك.',
    forgotAccountFoundTitle: 'تم العثور على الحساب',
    forgotAccountFoundIntro:
      'أرسل الرسالة أدناه من نفس رقم واتساب حسابك إلى الرقم الرسمي لإي توجيهي.',
    forgotWhatsappMessageLabel: 'الرسالة المراد إرسالها',
    forgotWhatsappContactLabel: 'رقم واتساب إي توجيهي للتواصل',
    forgotWhatsappMessage:
      'Mot de passe oublié E-Tawjihi\nMon numéro de compte : {{phone}}\nMerci de m’aider à récupérer mon accès.',
    forgotCopyWhatsappMessage: 'نسخ الرسالة',
    forgotCopied: 'تم نسخ الرسالة',
    forgotOpenWhatsappCta: 'فتح واتساب',
    deviceTransferTitle: 'نقل الحساب',
    deviceTransferSubtitle: 'الأجهزة المتصلة',
    deviceTransferIntro:
      'هذا الحساب نشط على جهاز آخر. اختر الجهاز الذي تريد قطع اتصاله لتفعيل هذا الهاتف.',
    deviceTransferIntroMulti:
      'تم بلوغ حد {{max}} أجهزة متصلة في آن واحد. اقطع اتصال جهازاً أدناه للمتابعة على هذا الجهاز.',
    deviceTransferPickSubtitle: 'اختيار جهاز',
    deviceTransferPickIntro: 'اختر الجهاز الذي تريد قطع اتصاله لتحرير مكان على هذا الحساب.',
    deviceTransferPickLabel: 'الأجهزة المتصلة',
    deviceTransferSecurityHint:
      'إذا كان أحد هذه الأجهزة ليس لك، تواصل مع الدعم لتأمين حسابك.',
    deviceTransferCta: 'قطع الاتصال والمتابعة',
    deviceTransferSupportLabel: 'جهاز غير معروف؟',
    deviceTransferSupportHint:
      'تواصل مع دعم إي توجيهي على واتساب (0655690632). ستتضمن الرسالة رقم حسابك.',
    deviceTransferOpenSupportWhatsapp: 'تأمين حسابي (واتساب)',
    deviceTransferErrInvalid: 'تعذّر إكمال النقل. أعد المحاولة أو تواصل مع الدعم.',
    forgotWhatsappStepsTitle: 'الخطوات',
    forgotWhatsappStepSend: '1. انسخ الرسالة أو اضغط «فتح واتساب» (النص جاهز مسبقاً).',
    forgotWhatsappStepSameNumber: '2. أرسلها من هاتف الرقم {{phone}} — رقم حسابك.',
    forgotWhatsappStepFollow:
      '3. اتبع تعليمات إي توجيهي في المحادثة لاستلام كلمة المرور الجديدة.',
    forgotSuccessManychatTitle: 'تم إرسال الطلب',
    forgotSuccessManychatIntro:
      'إذا وُجد حساب لهذا الرقم، ستتلقى رسالة واتساب من إي توجيهي عبر رقمنا الرسمي.',
    forgotSuccessManychatSamePhone:
      'مهم: الرسالة تصل على نفس الرقم الذي أدخلته (06 أو 07 الخاص بحسابك).',
    forgotSuccessManychatStep1:
      '1. افتح واتساب على هذا الهاتف وانتظر رسالة «نسيت كلمة المرور» من إي توجيهي.',
    forgotSuccessManychatStep2: '2. دوّن رمز الاسترداد المكوّن من 6 أرقام في الرسالة.',
    forgotSuccessManychatStep3: '3. اضغط على الرابط في الرسالة وأدخل الرمز في المحادثة.',
    forgotSuccessManychatStep4:
      '4. ستصلك كلمة مرور جديدة عبر واتساب. استخدمها لتسجيل الدخول.',
    forgotSuccessManychatAltApp: 'تفضّل اختيار كلمة المرور بنفسك؟',
    forgotSuccessCtaEnterCodeInApp: 'إدخال الرمز في التطبيق',
    verifyOtpTitle: 'رمز التحقق',
    verifyOtpSubtitle: 'أدخل الرمز المكوّن من 6 أرقام المرسل عبر واتساب إلى {phone}.',
    verifyOtpCta: 'التحقق من الرمز',
    verifyOtpResend: 'إعادة إرسال الرمز',
    verifyOtpErrInvalid: 'رمز غير صالح أو منتهٍ.',
    verifyOtpErrMissingPhone: 'رقم الهاتف مفقود. أعد المحاولة.',
    verifyOtpCodeLabel: 'رمز من 6 أرقام',
    verifyOtpHint:
      'خيار: أدخل هنا الرمز المستلم على واتساب لاختيار كلمة المرور. أو اتبع الرابط في الرسالة لاستلام كلمة مرور مُنشأة تلقائياً.',
    forgotInfoWhatsapp:
      'يجب أن يكون الرقم مسجّلاً في إي توجيهي. تُرسل الرسالة من رقم إي توجيهي الرسمي على واتساب.',
    forgotWhatsappNotSent:
      'تعذّر إرسال رسالة واتساب. تأكد أن هذا الرقم مسجّل في إي توجيهي، أو أعد المحاولة لاحقاً.',
    resetFlowStep1: 'الخطوة 1 / 3',
    resetFlowStep2: 'الخطوة 2 / 3',
    resetFlowStep3: 'الخطوة 3 / 3',
    resetPasswordTitle: 'كلمة مرور جديدة',
    resetPasswordSubtitle: 'اختر كلمة مرور قوية (8 أحرف على الأقل، حرف كبير، صغير، رقم، رمز).',
    resetPasswordNew: 'كلمة المرور الجديدة',
    resetPasswordConfirm: 'تأكيد كلمة المرور',
    resetPasswordCta: 'حفظ',
    resetPasswordDoneTitle: 'تم تحديث كلمة المرور',
    resetPasswordDoneBody: 'جارٍ التوجيه لتسجيل الدخول…',
    resetPasswordErrToken: 'انتهت الجلسة. أعد المحاولة (رمز واتساب جديد).',
    resetPasswordErrMatch: 'كلمتا المرور غير متطابقتين.',
    loginShowPassword: 'إظهار',
    loginHidePassword: 'إخفاء',
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
    setupFiliere1Bac: 'شعبة 1ère باك',
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
    estDetailMediaPhotos: 'صور',
    estDetailMediaVideo: 'فيديو',
    estDetailMediaVideoOpen: 'مشاهدة الفيديو',
    estDetailMediaBrochure: 'الكتيب',
    estDetailMediaBrochureOpen: 'فتح الكتيب',
    estDetailDegrees: 'الشهادات الممنوحة',
    estDetailSectors: 'قطاعات المهن',
    estDetailScholarships: 'المنح',
    estDetailEngagements: 'الالتزامات',
    estDetailCampus: 'الحرم الجامعي',
    estDetailCampusNoMapsUrl: 'لا يوجد رابط خرائط Google لهذا الحرم.',
    estDetailContact: 'التواصل',
    estDetailAnnouncements: 'إعلانات المؤسسة',
    estDetailAnnouncementsEmpty: 'لا توجد إعلانات منشورة لهذه المؤسسة حاليًا.',
    estLabelSectors: 'القطاعات',
    estLabelTuition: 'الدراسة',
    estLabelSchoolType: 'النوع',
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
    accountSectionActiveServices: 'خدماتي النشطة',
    accountActiveServicesLoading: 'جارٍ تحميل الخدمات…',
    accountActiveServicesError: 'تعذّر تحميل الخدمات.',
    accountActiveServicesEmpty: 'لا توجد خدمة نشطة حالياً.',
    accountActiveServicesEndDate: 'نهاية الوصول',
    accountActiveServicesNoEndDate: 'وصول بدون تاريخ نهاية',
    accountActiveServicesDaysRemaining: '{{count}} يوماً متبقياً',
    accountActiveServicesOneDayLeft: 'يوم واحد متبقٍ',
    accountActiveServicesEndsToday: 'ينتهي اليوم',
    accountActiveServicesContract: 'العقد',
    accountActiveServicesPrice: 'المبلغ',
    accountActiveServicesPromo: 'عرض',
    accountActiveServicesPaymentComplete: 'الدفع مكتمل',
    accountActiveServicesPaymentIncomplete: 'الدفع غير مكتمل',
    accountActiveServicesRemaining: 'المتبقي للدفع',
    accountActiveServicesPaid: 'المدفوع',
    accountActiveServicesTotal: 'الإجمالي',
    accountActiveServicesTransactions: 'الدفعات المسجّلة',
    accountActiveServicesNoTransactions: 'لا توجد دفعة مسجّلة لهذه الخدمة.',
    accountActiveServicesTxDate: 'التاريخ',
    accountActiveServicesTxMethod: 'الوسيلة',
    accountActiveServicesTxStatus: 'الحالة',
    accountActiveServicesDownloadReceipt: 'تحميل الإيصال',
    accountActiveServicesReceiptSoonTitle: 'إيصال الدفع',
    accountActiveServicesReceiptSoonBody:
      'لا يوجد دفع مسجّل لإنشاء إيصال. تواصل مع مستشارك إذا احتجت إلى إثبات.',
    accountActiveServicesReceiptError: 'حدث خطأ أثناء إنشاء الإيصال. يُرجى المحاولة لاحقاً.',
    accountActiveServicesReceiptShareUnavailable: 'تعذّر فتح قائمة المشاركة على هذا الجهاز.',
    referralTeaserTitle: 'برنامج الإحالة والمكافآت',
    referralTeaserSubtitle: 'ادعُ أصدقاءك وافتح مكافآت وهدايا عند كل مستوى.',
    referralTeaserCta: 'عرض برنامج الإحالة والمكافآت',
    referralPageTitle: 'برنامج الإحالة والمكافآت',
    referralPageSubtitle: 'ادعُ أصدقاءك: كل شراء TAWJIH PLUS يقربك من مكافآتك.',
    referralReferredDiscountHint:
      'يحصل أصدقاؤك المدعوون على خصم {{percent}} على الخدمات عند استخدام رمزك (وليس على المنتجات).',
    referralReferredDiscountBadge: 'خصم {{percent}} على الخدمات',
    referralReferredDiscountShopLine: 'على الخدمات',
    referralLockedTitle: 'برنامج الإحالة والمكافآت مقفل',
    referralLockedBody: 'يلزم خدمة {{service}} نشطة لمشاركة رمزك وفتح المكافآت.',
    referralLockedCta: 'عرض الخدمات',
    referralTiersTitle: 'مستويات المكافآت',
    referralTiersSubtitle: 'مدعويك الذين اشتروا {{service}}',
    referralQualifiedCount: '{{count}} مدعو مؤهل',
    referralTierBadge: 'المستوى {{n}}',
    referralTierUnlocked: 'مفعّل',
    referralTierRemaining: 'متبقي {{count}}',
    referralTierThreshold: 'الهدف: {{count}} مدعوين',
    referralTeaserQualifiedLabel: 'مؤهل (TAWJIH PLUS)',
    referralTeaserAllUnlocked: 'كل المستويات مفعّلة',
    referralTierPickReward: 'اختر مكافأتك',
    referralTierYourReward: 'مكافأتك',
    referralTierPickProduct: 'اختر منتجاً قبل إنشاء الرمز.',
    referralTierChoiceHint: '{{count}} مكافآت للاختيار عند تفعيل المستوى',
    referralTierGeneratePromo: 'إنشاء رمز ترويجي 100٪',
    referralTierRewardFree: 'مجاني',
    referralTierPromoTitle: 'رمزك الترويجي',
    referralTierPromoUsed: 'تم استخدام الرمز',
    referralTierPromoAvailable: 'الرمز متاح — استخدام واحد',
    referralTierPromoHint: 'خصم 100٪ على المنتج المختار، استخدام واحد في المتجر.',
    referralTierPromoError: 'تعذّر إنشاء الرمز. أعد المحاولة.',
    referralTierGoShop: 'الذهاب إلى المتجر',
    referralSingleRewardHint: 'مكافأة مستقلة لكل مستوى يتم فتحه.',
    referralRewardTakenBadge: 'تم اختيار المكافأة',
    referralRewardTakenOnOtherTier: 'المكافأة مأخوذة من المستوى {{tier}}',
    referralStep3BodyNew: 'عند شراء مدعوك TAWJIH PLUS يُحتسب في مستوياتك.',
    referralStep4BodyNew: '5 مدعوين → كتاب · 10 → الباقة الكاملة (قابل للتعديل).',
    referralBalanceLabel: 'نقاطي',
    referralPointsUnit: 'نقطة',
    referralPendingPoints: '{{count}} نقطة قيد التحقق',
    referralYourCode: 'رمزي',
    referralYourLink: 'رابطي',
    referralCopyCode: 'نسخ الرمز',
    referralCopyLink: 'نسخ الرابط',
    referralCopied: 'تم النسخ',
    referralShareWhatsApp: 'مشاركة عبر واتساب',
    referralHowItWorks: 'كيف يعمل',
    referralStep1Title: 'شارك',
    referralStep1Body: 'أرسل رمزك أو رابطك لصديق أو لأحد أفراد عائلتك.',
    referralStep2Title: 'يسجّل',
    referralStep2Body: 'يُنشئ صديقك المدعو حسابه برمزك ويكمل ملفه.',
    referralStep3Title: 'يتقدّم',
    referralStep3Body: 'نقاط إضافية عند الطلب أو شراء خدمة توجيه.',
    referralStep4Title: 'تربح',
    referralStep4Body: 'استخدم نقاطك في متجر E-Tawjihi أو عند شركائنا.',
    referralInvitesTitle: 'مدعويني',
    referralInviteCompleted: 'إحالة مكتملة',
    referralInviteNotCompleted: 'لم يكتمل بعد',
    referralPointsEarned: '+{{count}} نقطة',
    referralPointsPendingLabel: '{{count}} نقطة قيد الانتظار',
    referralHistoryTitle: 'سجل النقاط',
    referralLedgerProfile: 'ملف مدعو مكتمل',
    referralLedgerOrder: 'طلب مدعو',
    referralLedgerBonus: 'مكافأة إحالة',
    referralLedgerSpend: 'استخدام المتجر',
    referralPartnersTitle: 'مكافآت الشركاء',
    referralPartnersHint: 'استبدل نقاطك بعروض عند شركائنا.',
    referralRedeemSoon: 'قريباً',
    referralShareMessage:
      'مرحباً! أدعوك إلى E-Tawjihi للتوجيه. استخدم رمزي {{code}} (خصم {{percent}} في المتجر) أو هذا الرابط: {{link}}',
    referralInvitesEmpty: 'لا يوجد مدعوون بعد. شارك رمزك لدعوة أصدقائك.',
    referralViewAllInvites: 'عرض كل مدعويني',
    referralPointsSoonNote:
      'الإحالة نشطة: رمزك ومتابعة مدعويك متاحة. سيُفعّل رصيد نقاط المكافآت في تحديث قادم.',
    loyaltyTeaserTitle: 'برنامج الإحالة والمكافآت',
    loyaltyTeaserSubtitle: 'ادعُ أصدقاءك وافتح مكافآت وهدايا عند كل مستوى.',
    loyaltyTeaserCta: 'عرض برنامج الإحالة والمكافآت',
    loyaltyTeaserNextReward: 'المستوى التالي',
    loyaltyPageTitle: 'الولاء',
    loyaltyBalanceLabel: 'نقاطي',
    loyaltyPointsUnit: 'نقطة',
    loyaltyPendingPoints: '{{count}} نقطة قيد الانتظار بعد طلباتك',
    loyaltyHowItWorks: 'كيف يعمل',
    loyaltyEarnRate: '{{rate}} نقطة / درهم — لكل درهم في المتجر (بعد تأكيد الطلب).',
    loyaltyRateBadge: '{{rate}} نقطة / درهم',
    loyaltyStep1Title: 'اشترِ',
    loyaltyStep1Body: 'اطلب من متجر E-Tawjihi (كتب، حزم، إلخ).',
    loyaltyStep2Title: 'اجمع',
    loyaltyStep2Body: 'تُضاف نقاطك بعد تأكيد الدفع.',
    loyaltyStep3Title: 'افتح',
    loyaltyStep3Body: 'بلغ المستويات لاستبدال منتج أو خدمة حقيقية.',
    loyaltyStep4Title: 'ادعُ',
    loyaltyStep4Body: 'شارك رمزك: تُتابع تقدّم مدعويك في مساحة الإحالة.',
    loyaltyRewardsTitle: 'مستويات المكافآت',
    loyaltyRewardsHint: 'منتجات وخدمات من كتالوجكم، مرتبة حسب النقاط المطلوبة.',
    loyaltyTierLabel: 'م{{n}}',
    loyaltyRedeemCta: 'استبدال',
    loyaltyRedeemLocked: 'مقفل',
    loyaltyRedeemInactive: 'التفعيل موقوف',
    loyaltyRedeemSoonTitle: 'قريباً',
    loyaltyRedeemSoonBody: 'سيُفعّل استبدال النقاط قريباً. إلى ذلك الحين، اكتشف المنتج أو الخدمة.',
    loyaltyRedeemConfirmTitle: 'استبدال هذه المكافأة؟',
    loyaltyRedeemConfirmBody:
      '« {{title}} » ستُفعَّل مقابل {{count}} {{unit}}. لا يمكن استخدام هذه المكافأة إلا مرة واحدة.',
    loyaltyRedeemSuccessTitle: 'تم الاستبدال',
    loyaltyRedeemSuccessBody: '« {{title}} » مفعّلة. خُصم {{count}} {{unit}} من رصيدك.',
    loyaltyRedeemAlreadyUsed: 'لقد استبدلت هذه المكافأة مسبقاً.',
    loyaltyRedeemInsufficient: 'رصيد النقاط غير كافٍ.',
    loyaltyRedeemError: 'تعذّر الاستبدال. حاول لاحقاً.',
    loyaltyRedeemCancel: 'إلغاء',
    loyaltyAlreadyRedeemedLabel: 'مستبدلة',
    loyaltyPointsToUnlock: 'باقي {{count}} نقطة',
    loyaltyNextRewardBar: 'التالي: {{title}} — باقي {{count}} نقطة',
    loyaltyGroupProducts: 'منتجات المتجر',
    loyaltyGroupServices: 'خدمات التوجيه',
    loyaltyCatalogLoading: 'جاري تحميل الكتالوج…',
    loyaltyCatalogError: 'تعذّر تحميل المكافآت.',
    loyaltyCatalogRetry: 'إعادة المحاولة',
    loyaltyCatalogEmpty: 'لا توجد مكافآت متاحة حالياً.',
    loyaltyHistoryTitle: 'سجل النقاط',
    loyaltyLedgerEarn: 'نقاط مكتسبة (شراء)',
    loyaltyLedgerSpend: 'استبدال مكافأة',
    loyaltyLedgerWelcome: 'مكافأة ترحيب',
    loyaltyPointsGoal: 'الهدف: {{count}} {{unit}}',
    loyaltyViewAllRewards: 'عرض الكتالوج كاملاً',
    loyaltyViewAllCount: '{{count}} مكافأة',
    loyaltyCatalogPageTitle: 'كتالوج المكافآت',
    loyaltyCatalogPageSubtitle: 'افتح كل مستوى بجمع النقاط. المكافآت المقفلة تُفعّل عند بلوغ الهدف.',
    loyaltyTimelineBalanceFoot: 'لديك {{balance}} {{unit}}',
    loyaltyEarnRulesTitle: 'كيف تربح النقاط',
    loyaltyEarnRulesSelf: 'أفعالك',
    loyaltyEarnRulesReferrer: 'عند تقدّم مدعويك (خُمس نقاط الفعل)',
    loyaltyPerMadSuffix: '/ درهم',
    accountSectionAcademic: 'المعلومات الأكاديمية',
    accountMassarCode: 'رمز مسار',
    accountStudentCode: 'رمز التلميذ',
    accountMassarCodeHint: 'معرّف مسار (البكالوريا المغربية).',
    accountStudentCodeHint: 'رمز التلميذ (بكالوريا البعثة / الفرنسية).',
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
    commonLoadError: 'مشكلة في الخادم. أعد المحاولة.',
    commonRetry: 'إعادة المحاولة',
    apiErrNetwork: 'تعذّر الاتصال. تحقق من الشبكة وأعد المحاولة.',
    apiErrTimeout: 'الخادم يستغرق وقتاً طويلاً. أعد المحاولة بعد قليل.',
    apiErrUnauthorized: 'انتهت الجلسة. سجّل الدخول مجدداً.',
    apiErrForbidden: 'ليس لديك صلاحية لهذا الإجراء.',
    apiErrNotFound: 'المحتوى غير موجود.',
    apiErrValidation: 'بعض المعلومات غير صالحة. تحقق وأعد المحاولة.',
    apiErrConflict: 'هذا الإجراء لم يعد ممكناً (تم بالفعل أو تعارض).',
    apiErrServer: 'الخادم يواجه مشكلة. أعد المحاولة لاحقاً.',
    apiErrRateLimit: 'محاولات كثيرة. انتظر قليلاً.',
    apiErrGeneric: 'حدث خطأ. أعد المحاولة.',
    apiErrAuth: 'بيانات الدخول غير صحيحة أو الحساب غير متاح.',
    apiErrDiagnostic: 'تعذّر معالجة التشخيص. أعد المحاولة.',
    apiErrDailyChallenge: 'تعذّر تحميل تحدي اليوم. أعد المحاولة.',
    qnaErrorGeneric: 'تعذّر إرسال رسالتك. أعد المحاولة.',
    accountSectionOrders: 'طلباتي',
    accountOrdersEmpty: 'لا توجد طلبات حتى الآن.',
    accountOrdersEmptyProducts: 'لا توجد منتجات. راجع تبويب الخدمات.',
    accountOrdersEmptyServices: 'لا توجد خدمات. راجع تبويب المنتجات.',
    accountOrdersLoading: 'جارٍ تحميل الطلبات…',
    accountOrdersError: 'تعذّر تحميل الطلبات.',
    accountTabProfile: 'معلوماتي',
    accountRefreshing: 'جاري التحديث…',
    accountTabOrders: 'طلباتي',
    accountOrdersOpenBadgeA11y: '{{count}} طلبات قيد المعالجة',
    accountOrdersOpenCount: '{{count}} قيد المعالجة',
    accountOrdersSegmentAll: 'الكل',
    accountOrdersSegmentProducts: 'منتجات',
    accountOrdersSegmentServices: 'خدمات',
    accountOrderViewDetail: 'عرض التفاصيل',
    accountOrderDetailTitle: 'تفاصيل الطلب',
    accountOrderDetailNotFound: 'الطلب غير موجود.',
    accountOrderPhysicalSection: 'منتجات وتوصيل',
    accountOrderServicesSection: 'خدمات التوجيه',
    accountOrderPaymentSection: 'دفع الخدمات',
    accountOrderRecapSection: 'ملخص',
    accountOrderCompletedNote: 'الطلب مكتمل — الملخص أدناه.',
    accountOrderPromoAddTitle: 'رمز ترويجي',
    accountOrderPromoPlaceholder: 'أدخل الرمز',
    accountOrderPromoApply: 'تطبيق',
    accountOrderPromoApplying: 'جاري التطبيق…',
    accountOrderPromoHint: 'يمكنك إضافة رمز ما دام الطلب قيد الانتظار أو المعالجة.',
    accountOrderPromoLockedHint:
      'الرمز الترويجي مقفل : الطلب لم يعد قيد الانتظار أو المعالجة.',
    accountOrderPromoDiscount: 'خصم الرمز الترويجي',
    accountOrderPromoApplied: 'تم تطبيق الرمز الترويجي.',
    estNotFound: 'غير موجود',
    shopEyebrow: 'E-Tawjihi',
    shopTitle: 'المتجر',
    shopSubtitle: 'اطلب عبر الإنترنت · الدفع عند التسليم',
    shopSearchPlaceholder: 'ابحث عن منتج أو باقة…',
    shopClearSearchA11y: 'مسح البحث',
    shopCartA11y: 'السلة',
    shopCartPayMethodsTitle: 'وسائل الدفع المتاحة',
    shopCartPayMethodCashDelivery: 'نقدًا عند التسليم (درهم)',
    shopCartPayMethodOffice: 'الدفع في المكتب',
    shopCartPayMethodBankTransfer: 'تحويل بنكي',
    shopCartPayMethodCashplus: 'كاش بلاس',
    shopCartPayDisclaimer:
      'البطاقة البنكية غير متاحة عبر الإنترنت — اختيار وسيلة الدفع يتم عند الطلب وبعد التأكيد من E-Tawjihi.',
    shopCartEyebrowBoutique: 'المتجر',
    shopCartTitle: 'السلة',
    shopCartItemsOne: 'عنصر واحد',
    shopCartItemsMany: '{n} عناصر',
    shopCartEmptyTitle: 'سلتك فارغة',
    shopCartEmptyDesc: 'تصفّح المنتجات وباقات التوجيه، ثم عد هنا لإتمام الطلب.',
    shopCartEmptyCta: 'اكتشف المتجر',
    shopCartPerUnit: 'للوحدة',
    shopCartQtyLabel: 'الكمية',
    shopCartRemove: 'حذف',
    shopCartSummaryTitle: 'الملخص',
    shopCartSubtotal: 'المجموع الفرعي',
    shopCartShippingLbl: 'التوصيل',
    shopCartShippingFreeAll: 'مجاني على كامل السلة',
    shopCartShippingNext: 'في الخطوة التالية',
    shopCartTotalEstimated: 'الإجمالي التقديري',
    shopCartFooterTotal: 'الإجمالي',
    shopCartGoCheckout: 'إتمام الطلب',
    shopCartReplaceServiceTitle: 'خدمات غير قابلة للجمع',
    shopCartReplaceServiceMessage:
      'إذا أضفت {newService} إلى السلة، سيتم إزالة {removed} من السلة لأنك لا يمكنك الجمع بين هاتين الخدمتين.',
    shopCartReplaceServiceMessageMany:
      'إذا أضفت {newService} إلى السلة، سيتم إزالة {removed} من السلة لأنك لا يمكنك الجمع بين هذه الخدمات.',
    shopCartReplaceServiceAccept: 'أوافق',
    shopCartReplaceServiceCancel: 'إلغاء',
    shopCheckoutEyebrowBoutique: 'المتجر',
    shopCheckoutTitle: 'الطلب',
    shopCheckoutItemsSummary: '{n} عنصر(ات)',
    shopCheckoutErrSubmit: 'تعذّر إتمام الطلب. أعد المحاولة.',
    shopCheckoutErrGeneric: 'حدث خطأ.',
    shopCheckoutDeliveryTitle: 'التوصيل',
    shopCheckoutDeliveryDesc: 'التوصيل للمنزل — الدفع نقدًا عند الاستلام (درهم).',
    shopCheckoutDeliveryInfo: 'أدخل مدينة التوصيل والعنوان لحساب رسوم الشحن.',
    shopCheckoutDeliveryInfoFree: ' (توصيل مجاني على هذه السلة).',
    shopCheckoutContactTitle: 'بيانات التواصل',
    shopCheckoutContactDesc: 'للتواصل معك بخصوص الطلب.',
    shopCheckoutLblEmail: 'البريد الإلكتروني',
    shopCheckoutLblFullName: 'الاسم الكامل',
    shopCheckoutLblPhone: 'الهاتف',
    shopCheckoutPhEmail: 'you@example.com',
    shopCheckoutPhName: 'الاسم والنسب',
    shopCheckoutPhPhone: '06…',
    shopCheckoutLblStudentCity: 'مدينة الإقامة',
    shopCheckoutPickCity: 'اختر مدينة…',
    shopCheckoutPaymentTitle: 'طريقة الدفع',
    shopCheckoutPaymentDescMixed:
      'اختر كيفية دفع الخدمات: تحويل، كاش بلاس، مكتب، أو كل الطلب (خدمات + منتجات) نقدًا عند التسليم.',
    shopCheckoutPaymentDescServices:
      'بعد التأكيد تظهر التعليمات التفصيلية في شاشة الشكر حسب اختيارك.',
    shopCheckoutPayBank: 'تحويل بنكي',
    shopCheckoutPayCashplus: 'كاش بلاس',
    shopCheckoutPayOffice: 'الدفع في المكتب',
    shopCheckoutPayOnDelivery: 'الدفع عند التسليم',
    shopCheckoutAddrTitle: 'عنوان التوصيل',
    shopCheckoutAddrDesc: 'لإرسال المنتجات المادية.',
    shopCheckoutLblCityShip: 'مدينة التوصيل',
    shopCheckoutLblAddress: 'العنوان الكامل',
    shopCheckoutPhAddress: 'الشارع، الحي، تفاصيل إضافية…',
    shopCheckoutNotesTitle: 'ملاحظات',
    shopCheckoutNotesDesc: 'اختياري — تفاصيل لفريق إي‑توجيهي.',
    shopCheckoutPhNotes: 'ملاحظات مفيدة…',
    shopCheckoutRecapTitle: 'الملخص',
    shopCheckoutUpgradeCatalog: 'السعر الكامل :',
    shopCheckoutUpgradeCredit: 'الخدمة المشتراة ({service}) : −{amount}',
    shopCheckoutLblSubtotal: 'المجموع الفرعي',
    shopCheckoutPromoTitle: 'رمز ترويجي',
    shopCheckoutPromoHint:
      'رمز واحد لكل طلب. إذا كان الرمز مرتبطًا بمنتجات محددة، تُطبَّق الخصم عليها فقط.',
    shopCheckoutPromoPh: 'ETW-XXXX',
    shopCheckoutPromoApply: 'تطبيق',
    shopCheckoutPromoRemove: 'إزالة',
    shopCheckoutLblDiscount: 'خصم ({code})',
    shopCheckoutLblDiscountPercent: 'خصم {pct} % ({code})',
    shopCheckoutLblArticlesNet: 'مجموع المنتجات',
    shopCheckoutPromoAppliedPercent: '−{pct} % على {base} (منتجات مشمولة).',
    shopCheckoutPromoAppliedFixed: 'خصم ثابت {amount} على المنتجات المشمولة.',
    shopCheckoutPromoScopedHint: 'الخصم يخص {base} فقط (منتجات مرتبطة بالرمز).',
    shopCheckoutPromoErrEnter: 'أدخل رمزًا ترويجيًا',
    shopCheckoutPromoErrValidate: 'تعذّر التحقق من الرمز',
    shopCheckoutLblShipping: 'التوصيل',
    shopCheckoutShipNoPhysical: 'بدون شحن (خدمات)',
    shopCheckoutShipFree: 'مجاني',
    shopCheckoutShipPickCity: 'اختر مدينة',
    shopCheckoutLblTotal: 'الإجمالي',
    shopCheckoutConfirmBtn: 'تأكيد الطلب',
    shopCheckoutDisclaimerPod:
      'الدفع نقدًا (درهم) عند التسليم (منتجات وخدمات) — قد يتواصل الفريق للتأكيد عبر الهاتف أو البريد.',
    shopCheckoutDisclaimerInstr: 'تعليمات الدفع (التحويل، كاش بلاس أو المكتب) تظهر بعد التأكيد.',
    shopCheckoutDisclaimerSecure: 'البيانات تُرسل بشكل آمن — لا يوجد دفع بالبطاقة في التطبيق.',
    shopCheckoutSheetCityShip: 'مدينة التوصيل',
    shopCheckoutSheetCityResidence: 'مدينة الإقامة',
    shopCheckoutStudentHintFree:
      'مرجع التسعير للمنطقة: {price} · {delais}. التوصيل: مجاني على كامل السلة.',
    shopCheckoutStudentHint: 'مؤشر التوصيل لهذه المنطقة: {price} · {delais}',
    shopCheckoutStudentHintFreeShort: 'توصيل مجاني على كامل السلة (عنصر مؤهل على الأقل).',
    shopCheckoutVilleMetaFree:
      'سعر الكتالوج للمنطقة: {price} · المدة التقديرية: {delais} · الرسوم المحتسبة: مجانية (سلة مؤهلة).',
    shopCheckoutVilleMetaFixed:
      'سعر الكتالوج للمنطقة: {price} · المدة التقديرية: {delais} · الرسوم على السلة: {fee} درهم (وضع ثابت للمتجر).',
    shopCheckoutVilleMetaCatalog: 'رسوم التوصيل المحتسبة: {fee} · المدة التقديرية: {delais}',
    shopCheckoutShipFreeBanner: 'توصيل مجاني على كامل السلة (عنصر مؤهل على الأقل).',
    shopCheckoutErrEmail: 'البريد الإلكتروني غير صالح.',
    shopCheckoutErrFullName: 'يرجى إدخال الاسم الكامل.',
    shopCheckoutErrPhone: 'يرجى إدخال رقم الهاتف.',
    shopCheckoutErrStudyLevel: 'يرجى إدخال المستوى الدراسي.',
    shopCheckoutErrBacType: 'يرجى اختيار نوع البكالوريا.',
    shopCheckoutErrMissionSpecs: 'لبكالوريا مهمة، أدخل تخصصين على الأقل.',
    shopCheckoutErrFiliere: 'يرجى إدخال المسار / التخصص.',
    shopCheckoutErrStudentVille: 'اختر مدينتك من القائمة (مرجع التوصيل).',
    shopCheckoutErrPayment: 'يرجى اختيار طريقة الدفع.',
    shopCheckoutErrShipCity: 'يرجى اختيار مدينة التوصيل.',
    shopCheckoutErrAddress: 'يرجى إدخال عنوان التوصيل.',
    shopThankEyebrowBoutique: 'المتجر',
    shopThankCashplusCodeLbl: 'رمز كاش بلاس',
    shopThankPaymentHeading: 'الدفع — {label}',
    shopThankModalityBank: 'تحويل بنكي',
    shopThankModalityCashplus: 'كاش بلاس',
    shopThankModalityOffice: 'الدفع في المكتب',
    shopThankModalityPayOnDelivery: 'الدفع عند التسليم',
    shopThankLevelLine: 'المستوى : {v}',
    shopThankBacLine: 'البكالوريا : {v}',
    shopThankFiliereLine: 'المسار / التخصص : {v}',
    shopThankMissionLine: 'تخصص المهمة : {v}',
    shopThankStudentCityLine: 'المدينة : {v}',
    shopThankDelayIndicative: 'المدة التقديرية : {delay}',
    shopThankCodCashTip: 'الدفع نقدًا (درهم) عند الاستلام.',
    shopThankPickupPayOnSite: 'الدفع في المكتب عند الاستلام.',
    shopThankSummarySubtotalItems: 'المجموع الفرعي للمنتجات',
    shopThankSummaryShipLbl: 'التوصيل',
    shopThankSummaryShipFeesLbl: 'رسوم التوصيل',
    shopThankPickupBase: 'موعد المرور : {date}',
    shopThankPickupTimePart: ' في {time}',
    shopFilterAll: 'الكل',
    shopFilterProducts: 'منتجات',
    shopFilterPacks: 'باقات',
    shopFilterServices: 'الخدمات',
    shopServicesError: 'تعذّر تحميل الخدمات.',
    shopServicesEmpty: 'لا توجد خدمات للعرض حاليًا.',
    shopServicesSectionTitle: 'خدماتنا',
    shopServicesSeeAll: 'عرض كل الخدمات',
    shopServicesOpenWeb: 'التفاصيل على الموقع',
    shopServicesPopular: 'الأكثر طلبًا',
    shopServicesFiliereAll: 'كل الشعب',
    shopServicesEligibleYou: 'أنت مؤهل',
    shopServicesFiliereMission: 'بكالوريا مهمة',
    shopServicesFiliereReste: 'باقي الشعب',
    shopSearchServicesPlaceholder: 'ابحث عن خدمة…',
    shopServiceDetail: 'التفاصيل',
    shopServicePromoChip: 'عرض',
    shopEntitlementAlreadyOwned: 'مفعّل مسبقًا على حسابك',
    shopEntitlementIncluded: 'مشمول في عرضك الحالي',
    shopEntitlementIncludedVia: 'مشمول مع {name}',
    shopEntitlementBlocked: 'غير متاح للشراء',
    shopEntitlementRequiresPrerequisite: 'شرط مسبق مطلوب',
    shopEntitlementUpgradeAvailable: 'ترقية باقتك',
    shopEntitlementNotPurchasable: 'الشراء غير متاح',
    shopEntitlementChecking: 'جارٍ التحقق من أهليتك…',
    shopEntitlementIncludedNoPurchase: 'مشمول في عرضك — دون شراء منفصل',
    shopEntitlementIncludedPriceHint: 'مشمول في عرضك — لا حاجة لشراء منفصل',
    shopErrorLoad: 'تعذّر تحميل المتجر.',
    shopLoading: 'جارٍ التحميل…',
    shopEmptyTitle: 'لا يوجد منتج',
    shopRefreshing: 'جاري التحديث…',
    shopEmptyDesc: 'غيّر الفلاتر أو عد لاحقًا.',
    shopEstablishmentsConcernedNotice:
      'يمكنكم لاحقًا تخصيص اختيارات المدارس من القائمة المعروضة. بالنسبة للمدارس التي تشترط دفع رسوم التسجيل المسبق، يجب إتمام الدفع لإتمام التسجيل. وبالنسبة للمدارس التي تضع معايير أهلية، يُكمَل التسجيل فقط في حال استيفاء شروط الأهلية.',
    shopBadgeProduct: 'منتج',
    shopBadgePack: 'باقة',
    shopBadgeService: 'خدمة',
    shopBadgeFree: 'توصيل مجاني',
    shopBadgeBestseller: 'الأكثر مبيعًا',
    shopBadgeUnavailable: 'غير متوفر',
    shopOutOfStock: 'نفدت الكمية',
    shopAddA11y: 'أضف إلى السلة',
    shopAddedA11y: 'موجود في السلة',
    shopRemoveFromCartA11y: 'إزالة من السلة',
    shopBuyNow: 'اطلب الآن',
    shopBuyNowA11y: 'اطلب الآن',
    shopViewProductA11y: 'عرض المنتج',
    shopViewServiceA11y: 'عرض الخدمة',
    shopThankHeroTitle: 'شكرًا على طلبك',
    shopThankHeroDesc: 'تم تسجيل طلبك. سنتواصل معك قريبًا على بيانات الاتصال التي أدخلتها.',
    shopThankRefLabel: 'المرجع',
    shopThankTotalLabel: 'الإجمالي شامل الضريبة',
    shopThankNextStepsTitle: 'الخطوات التالية',
    shopThankOrderNotFound: 'الطلب غير موجود أو انتهت الجلسة.',
    shopThankBankSectionTitle: 'الدفع بالتحويل البنكي',
    shopThankBankNameLbl: 'البنك',
    shopThankBankRibLbl: 'رقم الحساب (RIB)',
    shopThankBankHolderLbl: 'صاحب الحساب',
    shopThankBankInstructionsTitle: 'كيفية الدفع',
    shopThankBankUploadTitle: 'إرسال إيصال التحويل',
    shopThankBankUploadHint:
      'بعد التحويل، أرفق هنا صورة أو ملف PDF للإيصال. سيُحفظ مع طلبك ويظهر في حسابي.',
    shopThankBankUploadPick: 'اختيار ملف (PDF أو صورة)',
    shopThankBankUploadBusy: 'جارٍ الإرسال…',
    shopThankBankUploadOk: 'تم حفظ الإيصال.',
    shopThankBankUploadErr: 'تعذّر الإرسال. أعد المحاولة أو استخدم واتساب.',
    shopThankBankViewReceipt: 'عرض الإيصال',
    shopThankBankWhatsappHint: 'يمكنك أيضًا إرسال الإيصال عبر واتساب على الرقم {phone}.',
    shopThankBankWhatsappOpen: 'فتح واتساب',
    shopThankCopy: 'نسخ',
    shopThankCopied: 'تم النسخ إلى الحافظة.',
    shopThankCopyAllBank: 'نسخ كل الإحداثيات البنكية',
    shopThankCopyInstructions: 'نسخ التعليمات',
    shopThankBankCoordinTitle: 'إحداثيات التحويل البنكي',
    shopThankWhatsappPrefill: 'مرحبًا، أرفق إيصال التحويل الخاص بطلبي رقم {orderNumber}. شكرًا.',
    shopThankCashplusAgencyHint:
      'قدّم الرمز أدناه في وكالة كاش بلاس (يفضّل الأقرب إليك) لدفع مبلغ طلبك.',
    shopThankCashplusActivationHint:
      'بعد الدفع في الوكالة، يُفعّل وصولك تلقائيًا بمجرد تسجيل الدفع.',
    shopThankCashplusDelayHint:
      'إذا تأخّر التفعيل: افتح حسابي ← طلباتي، ثم ارفع إيصال كاش بلاس. أو راسلنا على واتساب أدناه مع رقم طلبك.',
    shopThankCashplusGotoAccountCta: 'فتح حسابي — طلباتي',
    shopThankWhatsappPrefillCashplus:
      'مرحبًا، تم الدفع عبر كاش بلاس للطلب رقم {orderNumber}. يرجى تأكيد الاستلام أو توضيح الخطوة التالية. شكرًا.',
    shopThankPaymentHelpWhatsappTitle: 'تحتاج مساعدة؟',
    shopThankWhatsappHintHelp:
      'راسلنا على واتساب على الرقم {phone} مع ذكر رقم الطلب عند الحاجة.',
    shopThankNextStep1Bank: 'احتفظ برقم طلبك لمتابعة الطلب.',
    shopThankNextStep2Bank:
      'نفّذ التحويل ثم أرفق الإيصال أعلاه أو أرسله عبر واتساب؛ سيقوم فريقنا بتأكيد الدفع.',
    shopThankNextStep1Followup: 'احتفظ برقم طلبك لمتابعة الطلب.',
    shopThankNextStep2Followup: 'اتبع تعليمات الدفع أدناه؛ قد يتواصل الفريق معك عند الحاجة.',
    shopThankNextStep1Cod: 'نتحقق من طلبك ونجهّز الخطوة التالية (التوصيل أو الاستلام).',
    shopThankNextStep2Cod: 'يتواصل فريق إي‑توجيهي معك عبر الهاتف أو البريد للتأكيد.',
    shopThankNextStep3Cod: 'الدفع نقدًا عند التسليم — لا يوجد دفع بالبطاقة في التطبيق.',
    shopThankBackShop: 'العودة إلى المتجر',
    accountOrderReceiptLink: 'إيصال التحويل',
    shopThankContactTitle: 'بيانات التواصل',
    shopThankItemsTitle: 'المحتويات والمبالغ',
    shopThankDeliveryTitle: 'التوصيل',
    shopThankPickupTitle: 'الاستلام من المكتب',
    shopThankOfficeMapsBtn: 'عرض الموقع على Google Maps',
    shopThankOfficeAddressLbl: 'عنوان المكتب',
    shopThankOfficeHoursLbl: 'أوقات العمل',
    shopThankOfficePhoneLbl: 'الهاتف',
    shopThankOfficeCallHint: 'اتصل لتأكيد تاريخ ووقت زيارتك.',
    shopThankInstructionsTitle: 'التعليمات',
    shopEstCategoryPublic: 'عمومي',
    shopEstCategoryMilitary: 'عسكري',
    shopEstCategorySemiPublic: 'شبه عمومي',
    shopEstCategoryPrivate: 'خاص',
    shopEstCategoryOther: 'أخرى',
    tabHome: 'الرئيسية',
    tabEcoles: 'المدارس',
    tabInscriptions: 'التسجيلات',
    tabBoutique: 'المتجر',
    tabCompte: 'حسابي',
    hubWhatsAppA11y: 'التواصل عبر واتساب للحصول على معلومات',
    hubWhatsAppPrefill: 'السلام، أحتاج معلومات حول إ-توجيهي.',
    hubGlobalWallUnreadBadgeA11y: '{{count}} رسالة جديدة في مجموعة الباك',
    globalWallTitle: 'مجموعة باك 2026',
    globalWallIntro:
      'رسائل فريق E‑TAWJIHI والنقاشات. يمكنك الرد تحت كل منشور (مثل مجموعة محادثة).',
    globalWallEmpty: 'لا توجد منشورات حالياً.',
    globalWallPullToRefresh: 'اسحب للتحديث',
    globalWallReplies: 'الردود',
    globalWallReplyPlaceholder: 'رسالتك…',
    globalWallLoginToReply: 'سجّل الدخول للرد.',
    globalWallError: 'تعذّر تحميل المجموعة. أعد المحاولة.',
    globalWallBubbleA11y: 'فتح مجموعة باك 2026',
    globalWallComposerPlaceholder: 'اكتب رسالة للمجموعة…',
    globalWallPublishMainFeed: 'منشور رئيسي',
    globalWallPublishAsReply: 'رد على آخر رسالة',
    globalWallReplyHere: 'رد هنا',
    globalWallReplyingToBanner: 'رد على · {{snippet}}',
    globalWallCancelReplyTarget: 'منشور رئيسي',
    globalWallAttachPage: 'صفحة للمشاركة',
    globalWallPickPageTitle: 'اختر صفحة',
    globalWallPickSchoolsSection: 'المدارس',
    globalWallPickAnnouncementsSection: 'إعلانات المباريات',
    globalWallSearchSchoolsPlaceholder: 'ابحث عن مدرسة…',
    globalWallPickClose: 'إغلاق',
    globalWallCustomPathHint: 'مسار الموقع (مثل الويب)، مثال /filieres أو /boutique',
    globalWallCustomPathLabel: 'المسار',
    globalWallCustomPathPlaceholder: '/my-page',
    globalWallCustomTitleLabel: 'العنوان المعروض',
    globalWallCustomTitlePlaceholder: 'مثال: اطلع على الشعب',
    globalWallApplyCustomLink: 'إضافة',
    globalWallCustomLinkMissing: 'أدخل المسار (مثال /filieres) والعنوان المعروض.',
    globalWallClearAttachedPage: 'إزالة الصفحة',
    globalWallSenderViews: '{{count}} مشاهدة',
    globalWallScrollToBottom: 'آخر الرسائل',
    globalWallNewMessagesCount: '{{count}} جديد',
    globalWallReactionPick: 'اختر تفاعلاً',
    globalWallAttachMainPagesSection: 'صفحات الموقع',
    globalWallAttachBack: 'رجوع',
    globalWallAttachSchoolsListing: 'دليل المدارس',
    globalWallAttachAnnouncementsListing: 'جميع إعلانات المباريات',
    globalWallAttachSeeDetails: 'عرض التفاصيل',
    globalWallAttachListingPageLink: 'إرفاق رابط الصفحة (القائمة الكاملة)',
    globalWallAttachSearchPickDetail: 'أو ابحث واختر ملفًا محددًا:',
    globalWallSearchAnnouncementsPlaceholder: 'بحث في إعلان (عنوان، مدرسة…)',
    globalWallAttachBoutiqueListing: 'عرض متجر المنتجات',
    globalWallAttachEventsListing: 'عرض أجندة الفعاليات',
    globalWallPickBoutiqueSection: 'اختر منتجًا',
    globalWallPickEventsSection: 'اختر فعالية',
    globalWallSearchBoutiquePlaceholder: 'ابحث عن منتج أو حزمة…',
    globalWallSearchEventsPlaceholder: 'تصفية حسب العنوان…',
    globalWallPresetHome: 'الرئيسية',
    globalWallPresetSchools: 'المدارس العليا',
    globalWallPresetFilieres: 'الشُعب',
    globalWallPresetContestAnnouncements: 'إعلانات المباريات',
    globalWallPresetInscriptions: 'تسجيلاتي',
    globalWallPresetBoutique: 'المتجر',
    globalWallPresetEvents: 'الفعاليات والندوات',
    globalWallPresetBlog: 'المدونة',
    globalWallPresetSecteurs: 'القطاعات والمهن',
    globalWallPresetServices: 'خدماتنا',
    globalWallPresetCommunity: 'مجموعة باك 2026',
    chatbotDestExternal: 'رابط',
    chatbotDestWebPage: 'صفحة ويب',
    chatbotBubbleA11y: 'فتح E‑MOWAJIH، مساعد التوجيه',
    chatbotTitle: 'E‑MOWAJIH',
    chatbotWelcome:
      'مرحبًا بك في **هذا الإصدار** من تطبيق E‑TAWJIHI.\n\nأنا **E‑MOWAJIH**: التوجيه، **المدارس**، **إعلانات المباريات**، **المتجر**، وخدمتا **TAWJIH PLUS** و **TASSJIL** — كل ذلك من الدردشة.\n\nعند الحاجة تظهر **بطاقات** تحت إجابتي: المس البطاقة لفتح مؤسسة، إعلان، أو منتج.\n\nفي الأسفل **اختصارات** لتوفير الوقت؛ أو اكتب سؤالك مباشرة.',
    chatbotPlaceholder: 'رسالتك…',
    chatbotSendA11y: 'إرسال',
    chatbotCloseA11y: 'إغلاق الدردشة',
    chatbotNewChat: 'محادثة جديدة',
    chatbotError: 'تعذّر إرسال الرسالة. أعد المحاولة.',
    chatbotRecoHeading: 'متابعة',
    chatbotBoutiqueCardsHeading: 'منتجات وحزم',
    chatbotOpenWebsite: 'عرض على الموقع',
    chatbotTooltip: 'سؤال؟ تحدّث مع E‑MOWAJIH',
    chatbotSuggEcoles: 'المدارس',
    chatbotSuggContestAnnouncements: 'إعلانات المباريات',
    chatbotSuggBoutique: 'المتجر',
    chatbotShortcutMsgEcoles: 'أريد معلومات عن المدارس والمؤسسات التعليمية في المغرب.',
    chatbotShortcutMsgContestAnnouncements:
      'أين أجد إعلانات المباريات وآخر أجل للتسجيل في المؤسسات؟',
    chatbotShortcutMsgBoutique:
      'ما المنتجات أو الباقات التي تنصحونني بها في المتجر، وكيف أطلب؟',
    chatbotThinkingHeader: 'E‑MOWAJIH يجهّز إجابتك',
    chatbotLoadingSubtitle: 'قد يستغرق ذلك بضع ثوانٍ — شكرًا على انتظارك.',
    chatbotPrepHint1: 'تحليل سؤالك والكلمات المفتاحية…',
    chatbotPrepHint2: 'الاطلاع على سياق E‑TAWJIHI (المدارس، الشُّعب، الخدمات، المتجر)…',
    chatbotPrepHint3: 'التحقق من المعلومات المحدّثة على المنصة…',
    chatbotPrepHint4: 'صياغة إجابتك المخصّصة…',
    chatbotThinkingAnalyze: 'تحليل سؤالك',
    chatbotThinkingContext: 'إعداد السياق',
    chatbotThinkingSuggestions: 'إعداد الاقتراحات',
    shareSheetTitle: 'مشاركة',
    shareSheetPreviewHint:
      'معاينة غنية (Open Graph) مثل واتساب عندما تدعمها الصفحة — رابط عام على e-tawjihi.ma.',
    shareLinkPreviewLoading: 'جاري تحميل المعاينة…',
    shareCopyLink: 'نسخ الرابط',
    shareNativeShare: 'مشاركة…',
    shareCopiedFeedback: 'تم نسخ الرابط.',
    shareOpenSheetA11y: 'مشاركة هذه الصفحة',
    shareKindHome: 'الرئيسية',
    shareKindSchools: 'المدارس العليا',
    shareKindSchool: 'بطاقة مؤسسة',
    shareKindAnnouncement: 'إعلان مسابقة',
    shareKindAnnouncements: 'إعلانات المسابقات',
    shareKindEvent: 'فعالية / ندوة',
    shareKindEvents: 'أجندة الفعاليات',
    shareKindCommunity: 'مجموعة باك 2026',
    shareKindBoutique: 'المتجر',
    shareKindBoutiqueProduct: 'بطاقة منتج',
    sidebarTitle: 'القائمة',
    sidebarSubtitle: 'المسار والأدوات والمجتمع',
    sidebarOpen: 'فتح القائمة',
    sidebarClose: 'إغلاق',
    sidebarCart: 'السلة',
    sidebarEvents: 'الفعاليات',
    sidebarSectionDiscover: 'اكتشف',
    sidebarSectionTools: 'أدوات وإرشاد',
    sidebarSectionShop: 'المتجر',
    sidebarSectionAccount: 'مساحتي',
    eventsAgendaTitle: 'الفعاليات والندوات',
    eventsDetailPractical: 'معلومات',
    eventsDetailDescription: 'عن الفعالية',
    eventsDetailStatus: 'الوضع',
    eventsDetailVenue: 'المكان والسعة',
    eventsDetailLocationLabel: 'المكان',
    eventsDetailRegistrationInfo: 'معلومات التسجيل',
    eventsTabUpcoming: 'القادمة',
    eventsTabLive: 'جارية',
    eventsTabPast: 'السابقة',
    eventsEmpty: 'لا توجد فعاليات في هذه القائمة.',
    eventsEmptyLive: 'لا توجد فعالية مباشرة حالياً.',
    eventsRegister: 'التسجيل',
    eventsRegFormTitle: 'بيانات التسجيل',
    eventsRegFirstName: 'الاسم الأول',
    eventsRegLastName: 'الاسم العائلي',
    eventsRegEmail: 'البريد الإلكتروني',
    eventsRegPhone: 'الهاتف',
    eventsRegPhoneHint: 'مرتبط بحسابك (تسجيل الدخول).',
    eventsRegSubmit: 'تأكيد التسجيل',
    eventsRegCancel: 'إلغاء',
    eventsRegMissingPhone: 'يجب أن يكون لحسابك رقم هاتف للتسجيل.',
    eventsRegError: 'تعذّر التسجيل.',
    eventsRegisterExternalLink: 'رابط التسجيل',
    eventsConnectionPending:
      'سيظهر رابط الاتصال بعد تفعيل يدوي. استخدم رابط التسجيل الخارجي إن وُجد.',
    eventsExternalRegClosed: 'التسجيل الخارجي غير متاح.',
    eventsExternalDefaultInfo:
      'التسجيل يتم عبر صفحة خارجية (الزر أدناه)، وليس عبر نموذج التوجيهي.',
    eventsUnregister: 'إلغاء التسجيل',
    eventsConfirmPresence: 'تأكيد الحضور',
    eventsFull: 'مكتمل',
    eventsLoadError: 'تعذّر تحميل الفعاليات.',
    eventsRefreshing: 'جاري التحديث…',
    eventsOnlineLink: 'رابط الاتصال',
    eventsMapsLink: 'خرائط Google',
    eventsOpenDetail: 'التفاصيل',
    eventsKindWebinar: 'ندوة عبر الويب',
    eventsKindLive: 'بث مباشر',
    eventsKindEvent: 'فعالية',
    eventsPastBadge: 'انتهت',
    eventsRegisteredLabel: 'مسجّل',
    eventsPlacesLabel: 'المقاعد',
    eventsFillLabel: 'الإشغال',
    eventsLiveNow: 'مباشر',
    eventsDateStart: 'البداية',
    eventsDateEnd: 'النهاية',
    eventsDuration: 'المدة',
    eventsRegOpen: 'التسجيل مفتوح',
    eventsRegClosed: 'التسجيل مغلق',
    eventsRegClosedHint: 'لم يعد بإمكان التسجيل لهذه الفعالية.',
    eventsLiveBannerTitle: 'فعالية مباشرة',
    eventsLiveBannerSubtitle: 'الجلسة جارية الآن.',
    eventsFollowUpTitle: 'متابعة تسجيلك',
    eventsContactNew: 'جديد',
    eventsContactUnreachable: 'لا يمكن التواصل',
    eventsContactWhatsapp: 'واتساب مُرسَل',
    eventsContactConfirmed: 'مؤكّد',
    eventsContactCancelled: 'ملغى',
    eventsContactAbandoned: 'متروك',
    eventsAttendanceAttended: 'حاضر',
    eventsAttendanceAbsent: 'غائب',
    eventsContactStatusPrefix: 'حالة التواصل',
    eventsAttendancePrefix: 'الحضور',

    // ── التسجيلات / تتبع الترشيحات ──
    inscEyebrow: 'التسجيلات والترشيحات',
    inscTitle: 'تسجيلاتي',
    inscSubtitle: 'تابع ترشيحاتك وابقَ على اطلاع بفترات التسجيل.',
    inscTabNotifications: 'الإشعارات',
    inscTabCandidacies: 'الترشيحات',
    inscTabAnnouncements: 'الإعلانات',
    inscCandidaciesActiveShort: 'نشطة',
    inscCandidaciesActiveBadgeA11y: '{{count}} ترشيحات نشطة',
    inscCandidaciesTabBadgeA11y: '{{active}} ترشيحات نشطة، {{attention}} إجراءات مطلوبة',
    inscCandidaciesActionsRequiredShort: 'إجراءات مطلوبة',
    inscCandidaciesAttentionFilterAll: 'الكل',
    inscCandidaciesAttentionFilterRequired: 'إجراء مطلوب',
    inscCandidaciesActionRequiredBanner:
      'إجراء مطلوب: راجع آخر إعلان وحدّث حالتك إذا طلبت المؤسسة ذلك (مثال: الانتقال إلى « مقبول في المباراة »).',
    inscCandidaciesLatestAnnouncementActionTag: 'يتطلب الإجراء',
    inscCandidaciesActionRequiredEmpty: 'لا يوجد ترشيح يتطلّب انتباهك حاليًا.',
    inscFilterSchoolLabel: 'المؤسسة',
    inscFilterSchoolAll: 'جميع المؤسسات',
    inscFilterSchoolPickTitle: 'تصفية حسب المؤسسة',
    inscFilterSchoolSearchPlaceholder: 'اسم، اسم عربي أو اختصار…',
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
    inscTawjihPlusUpgradeCta: 'الانتقال إلى TAWJIH PLUS',
    inscTawjihPlusLockTitle: 'محتوى مخصّص لعملاء TAWJIH PLUS',
    inscTawjihPlusLockHint:
      'إعلانات مفصّلة، روابط التسجيل، فلاتر متقدمة ومتابعة كاملة للحالة.',
    diagnosticAnswersSavedHint:
      'تم حفظ إجابات التشخيص. انتقل إلى TAWJIH PLUS لتوليد توصياتك المخصّصة.',
    diagnosticRecoGateEyebrow: 'تشخيص المدارس',
    diagnosticRecoGateHeaderTitle: 'توصيات المدارس بالذكاء الاصطناعي',
    diagnosticRecoGateHeaderSub:
      'ترتيب مخصّص وملخص للملف الشخصي وفق إجاباتك في التشخيص.',
    diagnosticRecoGateCardBadge: 'TAWJIH PLUS',
    diagnosticRecoGateCardTitle: 'محتوى مخصّص لعملاء TAWJIH PLUS',
    diagnosticRecoGateCardDesc:
      'تعرض هذه الصفحة المؤسسات الموصى بها بالذكاء الاصطناعي، مع تعليقات تفصيلية وملخص لملفك الشخصي.',
    diagnosticRecoGateFeature1: 'ترتيب المدارس (موصى به، ممكن، خيار أخير…)',
    diagnosticRecoGateFeature2: 'ملخص بالذكاء الاصطناعي وتعليق عام مخصّص لملفك',
    diagnosticRecoGateFeature3: 'متابعة المؤسسات الموصى بها ضمن مسارك',
    diagnosticRecoGateSavedBox:
      'تم حفظ إجابات التشخيص. بمجرد الاشتراك في TAWJIH PLUS، ستُولَّد هذه الصفحة تلقائياً.',
    inscNotifEmptyTitle: 'لا توجد إشعارات',
    inscNotifEmptyDesc: 'ستظهر هنا تنبيهات التسجيل والنتائج والتوجيه.',
    inscNotifMarkAllRead: 'وسم الكل كمقروء',
    inscNotifFilterAll: 'الكل',
    inscNotifFilterUnread: 'غير المقروءة',
    inscCandidaciesEmptyTitle: 'لا توجد ترشيحات متابَعة',
    inscCandidaciesEmptyDesc: 'تابع إعلانًا بجانب لتبدأ تتبع ترشيحك.',
    inscCandidaciesEmptyCta: 'استكشاف الإعلانات',
    inscCandidaciesFilterAll: 'الكل',
    inscCandidaciesFilterStatusLabel: 'الحالة',
    inscCandidaciesFilterStatusPickTitle: 'تصفية حسب الحالة',
    inscCandidaciesFilterStatusSearchPlaceholder: 'ابحث عن حالة…',
    inscCandidaciesFilterStatusNoResults: 'لا توجد حالة مطابقة',
    inscCandidaciesFilteredEmptyTitle: 'لا ترشيح بهذه الحالة',
    inscCandidaciesFilteredEmptyDesc: 'غيّر التصفية أو أعد التعيين لعرض الكل.',
    inscAnnouncementsEmptyTitle: 'لا توجد إعلانات',
    inscAnnouncementsEmptyDesc: 'لم يُنشر أي إعلان تسجيل في الوقت الحالي.',
    inscAnnouncementsFilteredEmptyTitle: 'لا يوجد إعلان يطابق هذه المرشحات',
    inscAnnouncementsFilteredEmptyDesc:
      'غيّر المدرسة أو المرشحات المتقدمة، أو أعد التعيين لعرض كل الإعلانات.',
    inscAnnouncementsFollow: 'متابعة',
    inscAnnouncementsFollowing: 'مُتابَع',
    inscAnnouncementsOpenLink: 'رابط التسجيل',
    inscAnnouncementsAlreadyTracked: 'مُتابَع بالفعل',
    inscAnnouncementsMarkApplied: 'لقد تقدّمت',
    inscAnnouncementUnseen: 'لم تُعرض',
    inscAnnouncementUnread: 'غير مقروءة',
    inscStatusUnknown: 'حالة غير معروفة',
    inscStatusNone: 'بدون حالة',
    inscStatusActionClear: 'إزالة الحالة',
    inscStatusActionTitle: 'تحديث الحالة',
    inscStatusActionSubtitle: 'اختر المرحلة الجديدة لترشّحك.',
    inscStatusActionUpdate: 'تحديث',
    inscStatusActionUpdating: 'جارٍ التحديث…',
    inscStatusBlockTitle: 'حالة الترشّح',
    inscStatusUnavailable: 'غير متاحة حاليًا',
    inscStatusSectionInProgress: 'قيد المتابعة',
    inscStatusSectionFinalized: 'النتيجة النهائية',
    inscOpenLinkBtn: 'فتح الرابط',
    inscOpenLinkA11y: 'فتح رابط التسجيل الرسمي',
    inscOpenLinkBtnResult: 'عرض النتيجة',
    inscOpenLinkBtnScholarship: 'التقديم للمنحة',
    inscOpenLinkBtnOffer: 'الاستفادة من العرض',
    inscOpenLinkBtnInfo: 'معرفة المزيد',
    inscOpenLinkBtnRegister: 'رابط التسجيل',
    inscAnnTypeOpening: 'فتح التسجيل',
    inscAnnTypeImportant: 'رسالة مهمة',
    inscAnnTypeOffer: 'عرض',
    inscAnnTypeResult: 'نتيجة التسجيل',
    inscAnnTypeScholarshipMa: 'منحة المغرب',
    inscAnnTypeScholarshipForeign: 'منحة أجنبية',
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
    inscDetailTutorialTitle: 'شرح التسجيل (فيديو)',
    inscDetailTutorialPlaybackError: 'تعذّر تشغيل الفيديو داخل التطبيق.',
    inscDetailTutorialRetry: 'إعادة المحاولة',
    inscDetailSiblingHistoryTitle: 'إعلانات أخرى للمؤسسة',
    inscDetailSiblingsNewer: 'إعلانات أحدث',
    inscDetailSiblingsOlder: 'إعلانات أقدم',
    inscDetailSiblingHistoryHint: 'مقارنةً بهذا الإعلان: نفس المؤسسة، تواريخ أحدث أو أقدم.',
    inscDetailSiblingUpcoming: 'قريباً',
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
    qnaSectionTitle: 'أسئلة وأجوبة',
    qnaIntro:
      'اطرح سؤالاً عاماً (يظهر للمجتمع) أو خاصاً (لفريق إي-توجيهي فقط). الإجابات الرسمية موضحة بشارة.',
    qnaRefresh: 'تحديث',
    qnaEmpty: 'لا توجد أسئلة بعد. كن أول من يطرح سؤالاً.',
    qnaBodyTooShort: 'النص يجب أن يضم 3 أحرف على الأقل.',
    qnaPrivateBadge: 'خاص · فريق إي-توجيهي',
    qnaPrivateHint: 'فريق إي-توجيهي فقط يمكنه الإجابة على الأسئلة الخاصة.',
    qnaMeToo: 'أنا أيضاً',
    qnaOfficialBadge: 'إي-توجيهي',
    qnaAnswerPlaceholder: 'إجابتك أو تجربتك…',
    qnaSendAnswer: 'نشر الإجابة',
    qnaTapToReply: 'ردّ',
    qnaReplyDockTitle: 'إجابة',
    qnaAskTitle: 'طرح سؤال',
    qnaLoginToParticipate: 'سجّل الدخول لطرح سؤال أو للإجابة.',
    qnaVisibilityPublic: 'عام',
    qnaVisibilityPrivate: 'خاص (الفريق)',
    qnaHintPublic: 'مرئي للطلاب الآخرين ويمكنهم الإجابة. يمكن للفريق تثبيت إجابة رسمية.',
    qnaHintPrivate: 'مرئي لك وللفريق فقط (حالة شخصية أو حساسة).',
    qnaPlaceholder: 'مثال: سؤالك عن المؤسسة، التسجيل، معلومة أو غير ذلك…',
    qnaSubmit: 'إرسال السؤال',
    qnaCommunityAnswerBadge: 'طالب',
    qnaVerdictCorrect: 'صحيح',
    qnaVerdictIncorrect: 'غير صحيح',
    qnaVerdictIncomplete: 'ناقص',
    qnaVerdictTeamLabel: 'تقييم الفريق',
    qnaLoadingComments: 'جاري تحميل الأسئلة والأجوبة…',
    qnaShowRepliesOne: 'عرض الإجابة',
    qnaShowRepliesMany: 'عرض {{count}} إجابات',
    qnaShowRemainingRepliesOne: 'عرض الإجابة المتبقية',
    qnaShowRemainingRepliesMany: 'عرض {{count}} إجابات أخرى',
  },
};
