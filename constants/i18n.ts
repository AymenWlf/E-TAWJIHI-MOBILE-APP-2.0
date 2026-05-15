export type AppLocale = 'fr' | 'ar';

export type HomeCopyKey =
  | 'notifications'
  | 'notifDrawerTitle'
  | 'notifDrawerClose'
  | 'notifDrawerSubtitle'
  | 'notifDrawerEmpty'
  | 'notifDrawerOpenLink'
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
  | 'schoolsHeroEyebrow'
  | 'schoolsHeroTitle'
  | 'schoolsFilters'
  | 'schoolsFiltersA11y'
  | 'schoolsFollowedOnlyA11y'
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
  | 'orientationTapHint'
  | 'orientationProgressLabel'
  | 'orientationTasksA11y'
  | 'orientationModalSubtitle'
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
  | 'accountSectionOrders'
  | 'accountOrdersEmpty'
  | 'accountOrdersEmptyProducts'
  | 'accountOrdersEmptyServices'
  | 'accountOrdersLoading'
  | 'accountOrdersError'
  | 'accountTabProfile'
  | 'accountTabOrders'
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
  | 'shopCheckoutLblSubtotal'
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
  | 'shopErrorLoad'
  | 'shopLoading'
  | 'shopEmptyTitle'
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
  | 'sidebarOpen'
  | 'sidebarClose'
  | 'sidebarCart'
  | 'sidebarEvents'
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
  | 'inscStatusUnknown'
  | 'inscStatusNone'
  | 'inscStatusActionTitle'
  | 'inscStatusActionClear'
  | 'inscStatusActionSubtitle'
  | 'inscStatusActionUpdate'
  | 'inscStatusActionUpdating'
  | 'inscStatusBlockTitle'
  | 'inscStatusUnavailable'
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
    schoolsHeroEyebrow: 'Écoles supérieures',
    schoolsHeroTitle: 'ÉCOLES SUP',
    schoolsFilters: 'Filtres',
    schoolsFiltersA11y: 'Filtres détaillés',
    schoolsFollowedOnlyA11y: 'Uniquement les écoles que je suis',
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
    orientationTapHint: 'Toucher pour afficher les tâches restantes',
    orientationProgressLabel: "Progression d'orientation",
    orientationTasksA11y: "Voir les tâches restantes du parcours d'orientation",
    orientationModalSubtitle: 'Tâches restantes du parcours',
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
    accountSectionOrders: 'Mes commandes',
    accountOrdersEmpty: 'Aucune commande pour l\'instant.',
    accountOrdersEmptyProducts: 'Aucun produit commandé. Consultez l\'onglet Services.',
    accountOrdersEmptyServices: 'Aucun service commandé. Consultez l\'onglet Produits.',
    accountOrdersLoading: 'Chargement des commandes…',
    accountOrdersError: 'Impossible de charger les commandes.',
    accountTabProfile: 'Mes informations',
    accountTabOrders: 'Mes commandes',
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
    estNotFound: 'Introuvable',
    shopEyebrow: 'E-Tawjihi',
    shopTitle: 'Boutique',
    shopSubtitle: 'Commandez en ligne · Paiement à la livraison',
    shopSearchPlaceholder: 'Rechercher un produit, pack…',
    shopClearSearchA11y: 'Effacer la recherche',
    shopCartA11y: 'Panier',
    shopCartPayMethodsTitle: 'Moyens de paiement possibles',
    shopCartPayMethodCashDelivery: 'Espèces à la livraison (MAD)',
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
    shopCheckoutEyebrowBoutique: 'Boutique',
    shopCheckoutTitle: 'Commande',
    shopCheckoutItemsSummary: '{n} article(s)',
    shopCheckoutErrSubmit: 'Impossible de finaliser la commande. Réessayez.',
    shopCheckoutErrGeneric: 'Une erreur est survenue.',
    shopCheckoutDeliveryTitle: 'Livraison',
    shopCheckoutDeliveryDesc: 'Livraison à domicile — paiement en espèces à la réception (MAD).',
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
    shopCheckoutLblSubtotal: 'Sous-total',
    shopCheckoutLblShipping: 'Livraison',
    shopCheckoutShipNoPhysical: 'Sans envoi (services)',
    shopCheckoutShipFree: 'Offert',
    shopCheckoutShipPickCity: 'Choisir une ville',
    shopCheckoutLblTotal: 'Total',
    shopCheckoutConfirmBtn: 'Confirmer la commande',
    shopCheckoutDisclaimerPod:
      'Règlement prévu en espèces (MAD) à la livraison (produits physiques et services) — l’équipe peut vous confirmer par téléphone ou email.',
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
      'Tarif catalogue zone : {price} · délai indicatif : {delais} · frais facturés au panier : {fee} MAD (mode fixe boutique).',
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
    shopThankCodCashTip: 'Paiement en espèces (MAD) à la réception.',
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
    shopErrorLoad: 'Impossible de charger la boutique.',
    shopLoading: 'Chargement…',
    shopEmptyTitle: 'Aucun produit',
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
    sidebarTitle: 'Navigation',
    sidebarOpen: 'Ouvrir le menu',
    sidebarClose: 'Fermer',
    sidebarCart: 'Panier',
    sidebarEvents: 'Événements',
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
    inscStatusUnknown: 'Statut inconnu',
    inscStatusNone: 'Aucun statut',
    inscStatusActionClear: 'Retirer le statut',
    inscStatusActionTitle: 'Mettre à jour le statut',
    inscStatusActionSubtitle: 'Choisissez la nouvelle étape de votre candidature.',
    inscStatusActionUpdate: 'Mettre à jour',
    inscStatusActionUpdating: 'Mise à jour…',
    inscStatusBlockTitle: 'Statut de candidature',
    inscStatusUnavailable: 'Non disponible pour le moment',
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
    dailyChallengeLeaderboardTopToday: 'أفضل الأوقات',
    dailyChallengeLeaderboardLoadMore: 'تحميل المزيد',
    dailyChallengeYouLabel: 'أنت',
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
    schoolsHeroEyebrow: 'المدارس العليا',
    schoolsHeroTitle: 'مدارس عليا',
    schoolsFilters: 'التصفية',
    schoolsFiltersA11y: 'فلاتر مفصلة',
    schoolsFollowedOnlyA11y: 'المدارس التي أتابعها فقط',
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
    orientationTapHint: 'المس لعرض المهام المتبقية',
    orientationProgressLabel: 'تقدّم التوجيه',
    orientationTasksA11y: 'عرض المهام المتبقية في المسار',
    orientationModalSubtitle: 'المهام المتبقية في المسار',
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
    accountSectionOrders: 'طلباتي',
    accountOrdersEmpty: 'لا توجد طلبات حتى الآن.',
    accountOrdersEmptyProducts: 'لا توجد منتجات. راجع تبويب الخدمات.',
    accountOrdersEmptyServices: 'لا توجد خدمات. راجع تبويب المنتجات.',
    accountOrdersLoading: 'جارٍ تحميل الطلبات…',
    accountOrdersError: 'تعذّر تحميل الطلبات.',
    accountTabProfile: 'معلوماتي',
    accountTabOrders: 'طلباتي',
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
    shopCheckoutLblSubtotal: 'المجموع الفرعي',
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
    shopErrorLoad: 'تعذّر تحميل المتجر.',
    shopLoading: 'جارٍ التحميل…',
    shopEmptyTitle: 'لا يوجد منتج',
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
    sidebarTitle: 'التنقل',
    sidebarOpen: 'فتح القائمة',
    sidebarClose: 'إغلاق',
    sidebarCart: 'السلة',
    sidebarEvents: 'الفعاليات',
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
    inscStatusUnknown: 'حالة غير معروفة',
    inscStatusNone: 'بدون حالة',
    inscStatusActionClear: 'إزالة الحالة',
    inscStatusActionTitle: 'تحديث الحالة',
    inscStatusActionSubtitle: 'اختر المرحلة الجديدة لترشّحك.',
    inscStatusActionUpdate: 'تحديث',
    inscStatusActionUpdating: 'جارٍ التحديث…',
    inscStatusBlockTitle: 'حالة الترشّح',
    inscStatusUnavailable: 'غير متاحة حاليًا',
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
