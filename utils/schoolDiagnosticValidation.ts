import {
  parseNoteSur20,
  TARGET_LEVEL_MASTER_INGENIEUR_ID,
  type SchoolQuickDiagnosticForm,
} from '@/constants/schoolQuickDiagnostic';

export function validateSchoolDiagnosticStep(s: number, form: SchoolQuickDiagnosticForm): string | null {
  if (s === 0) {
    if (!form.profileRole) return 'Précisez si vous êtes élève ou tuteur.';
    if (!form.firstName.trim()) return 'Indiquez votre prénom.';
    if (!form.lastName.trim()) return 'Indiquez votre nom.';
    if (form.phone.replace(/\s/g, '').length < 9) return 'Numéro de téléphone invalide.';
    if (!form.cityId) return 'Choisissez votre ville dans la liste.';
    if (!form.gender) return 'Indiquez le genre.';
  }
  if (s === 1) {
    if (!form.studyLevel) return 'Indiquez votre niveau d’études.';
    if (form.bacType !== 'normal' && form.bacType !== 'mission') {
      return 'Indiquez le type de baccalauréat (Marocain ou Mission).';
    }
    if (form.bacType === 'normal') {
      if (!form.lyceePublicPrive) return 'Indiquez si votre lycée est public ou privé.';
      if (!form.bacStream?.trim()) return 'Indiquez la filière du bac.';
      if (!form.massarCode?.trim()) return 'Indiquez votre code Massar.';
      if (form.massarCode.replace(/\s/g, '').length < 5) {
        return 'Le code Massar semble incomplet (au moins 5 caractères).';
      }
    }
    if (form.bacType === 'mission') {
      if (!form.missionSpecialite1?.trim()) return 'Indiquez la 1re spécialité (bac mission).';
      if (!form.missionSpecialite2?.trim()) return 'Indiquez la 2e spécialité (bac mission).';
      if (!form.studentCode?.trim()) return 'Indiquez votre code étudiant.';
      if (form.studentCode.replace(/\s/g, '').length < 3) {
        return 'Le code étudiant semble incomplet (au moins 3 caractères).';
      }
      if (form.missionSpecialite1 === form.missionSpecialite2) {
        return 'Les deux premières spécialités doivent être différentes.';
      }
    }
  }
  if (s === 2) {
    const validateOptionalNotes = (
      fields: { key: keyof SchoolQuickDiagnosticForm; label: string }[],
    ): string | null => {
      for (const f of fields) {
        const v = String(form[f.key] ?? '').trim();
        if (v && parseNoteSur20(v) === null) {
          return `La note (${f.label}) doit être entre 0 et 20.`;
        }
      }
      return null;
    };

    const validateGradeAvailabilityBlock = (opts: {
      received: '' | 'yes' | 'no';
      receivedRequired?: boolean;
      receivedPrompt: string;
      definitiveKey: keyof SchoolQuickDiagnosticForm;
      definitivePrompt: string;
      previsionnelMinKey: keyof SchoolQuickDiagnosticForm;
      previsionnelMaxKey: keyof SchoolQuickDiagnosticForm;
    }): string | null => {
      const {
        received,
        receivedRequired,
        receivedPrompt,
        definitiveKey,
        definitivePrompt,
        previsionnelMinKey,
        previsionnelMaxKey,
      } = opts;
      if (!received) {
        return receivedRequired ? receivedPrompt : null;
      }
      if (received === 'yes') {
        const note = String(form[definitiveKey] ?? '').trim();
        if (!note) return definitivePrompt;
        if (parseNoteSur20(note) === null) {
          return 'La note doit être un nombre entre 0 et 20.';
        }
        return null;
      }
      const minStr = String(form[previsionnelMinKey] ?? '').trim();
      const maxStr = String(form[previsionnelMaxKey] ?? '').trim();
      const a = parseNoteSur20(minStr);
      const b = parseNoteSur20(maxStr);
      if (minStr && a === null) {
        return 'Le prévisionnel minimum doit être un nombre entre 0 et 20.';
      }
      if (maxStr && b === null) {
        return 'Le prévisionnel maximum doit être un nombre entre 0 et 20.';
      }
      if (a !== null && b !== null && a > b) {
        return 'Le prévisionnel minimum ne peut pas dépasser le maximum.';
      }
      return null;
    };

    if (form.bacType === 'normal') {
      const err =
        validateOptionalNotes([{ key: 'noteGeneraleTroncCommunSur20', label: 'tronc commun' }]) ??
        validateGradeAvailabilityBlock({
          received: form.regionalGradeReceived,
          receivedPrompt: 'Indiquez si vous avez reçu votre note régionale.',
          definitiveKey: 'noteGeneralePremiereBacSur20',
          definitivePrompt: 'Indiquez votre note régionale.',
          previsionnelMinKey: 'previsionnelRegionalMinSur20',
          previsionnelMaxKey: 'previsionnelRegionalMaxSur20',
        }) ??
        validateGradeAvailabilityBlock({
          received: form.semestre1BacGradeReceived,
          receivedPrompt: 'Indiquez si vous avez reçu votre note du 1er semestre.',
          definitiveKey: 'noteGeneraleSemestre1SecondBacSur20',
          definitivePrompt: 'Indiquez votre note du 1er semestre.',
          previsionnelMinKey: 'previsionnelSemestre1BacMinSur20',
          previsionnelMaxKey: 'previsionnelSemestre1BacMaxSur20',
        }) ??
        validateGradeAvailabilityBlock({
          received: form.bacGradeReceived,
          receivedRequired: true,
          receivedPrompt: 'Indiquez si vous avez passé et reçu votre note du baccalauréat national.',
          definitiveKey: 'noteBacFinaleSur20',
          definitivePrompt: 'Indiquez votre note du baccalauréat national.',
          previsionnelMinKey: 'previsionnelBacNationalMinSur20',
          previsionnelMaxKey: 'previsionnelBacNationalMaxSur20',
        });
      if (err) return err;
    }
    if (form.bacType === 'mission') {
      const err =
        validateOptionalNotes([{ key: 'noteMissionSecondeSur20', label: 'Seconde' }]) ??
        validateGradeAvailabilityBlock({
          received: form.premiereMissionGradeReceived,
          receivedPrompt: 'Indiquez si vous avez reçu votre note de Première.',
          definitiveKey: 'noteMissionPremiereSur20',
          definitivePrompt: 'Indiquez votre note de Première.',
          previsionnelMinKey: 'previsionnelPremiereMissionMinSur20',
          previsionnelMaxKey: 'previsionnelPremiereMissionMaxSur20',
        }) ??
        validateGradeAvailabilityBlock({
          received: form.semestre1MissionGradeReceived,
          receivedPrompt: 'Indiquez si vous avez reçu votre note du 1er semestre de Terminale.',
          definitiveKey: 'noteMissionSemestre1TerminaleSur20',
          definitivePrompt: 'Indiquez votre note du 1er semestre de Terminale.',
          previsionnelMinKey: 'previsionnelSemestre1MissionMinSur20',
          previsionnelMaxKey: 'previsionnelSemestre1MissionMaxSur20',
        }) ??
        validateGradeAvailabilityBlock({
          received: form.bacGradeReceived,
          receivedRequired: true,
          receivedPrompt: 'Indiquez si vous avez passé et reçu votre note du baccalauréat.',
          definitiveKey: 'noteBacFinaleSur20',
          definitivePrompt: 'Indiquez votre note du baccalauréat.',
          previsionnelMinKey: 'previsionnelBacMissionMinSur20',
          previsionnelMaxKey: 'previsionnelBacMissionMaxSur20',
        });
      if (err) return err;
    }
  }
  if (s === 3) {
    if (!form.prefPublic && !form.prefPrivate && !form.prefSemiPublic && !form.prefMilitary) {
      return 'Cochez au moins un type d’écoles supérieures visé.';
    }
    if (form.prefMilitary) {
      if (form.gender === 'femme' && !form.militaryVeilWearing) {
        return 'Indiquez si vous portez le voile (formations militaires).';
      }
      if (!form.militaryHeightRequirementMet) {
        return 'Indiquez si votre taille correspond au minimum exigé.';
      }
    }
  }
  if (s === 4) {
    if (!form.studyCityScope) {
      return 'Indiquez si vous étudiez dans tout le Maroc ou des villes ciblées.';
    }
    if (form.studyCityScope === 'specific' && !(form.preferredStudyCityIds ?? []).length) {
      return 'Ajoutez au moins une ville d’études.';
    }
    if (!form.privateIfDreamSchoolRejects) {
      return 'Indiquez si une école privée est envisageable si refus ailleurs.';
    }
    if (form.privateIfDreamSchoolRejects === 'yes' && !form.privateMonthlyBudgetBracket) {
      return 'Indiquez une fourchette de budget pour le privé.';
    }
  }
  if (s === 5) {
    if (!form.considersContests) {
      return 'Indiquez si vous envisagez de préparer les concours.';
    }
    if (form.considersContests === 'yes' && !form.contestPrep) {
      return 'Indiquez comment vous comptez vous préparer.';
    }
  }
  if (s === 6) {
    if (!form.targetStudyLevelIds?.length) {
      return 'Indiquez au moins un niveau d’études visé.';
    }
    if (
      (form.targetStudyLevelIds ?? []).includes(TARGET_LEVEL_MASTER_INGENIEUR_ID) &&
      !form.ingenieurMasterPathPreference
    ) {
      return 'Indiquez comment vous envisagez d’accéder au diplôme ingénieur ou master (5 ans).';
    }
    if (!(form.acceptedHigherEdLanguages ?? []).length) {
      return 'Indiquez au moins une langue d’enseignement acceptée.';
    }
    if (!form.splitPublicYearsThenPrivate) {
      return 'Indiquez si un parcours en école publique puis privée vous convient.';
    }
    if (!form.consentProcessing) {
      return 'Acceptez l’enregistrement de vos réponses pour envoyer le diagnostic.';
    }
  }
  return null;
}
