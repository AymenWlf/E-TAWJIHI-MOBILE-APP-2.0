/** @deprecated Utiliser `@/services/simpleAppFeedback` ou `@/services/parcoursAppFeedback`. */
export {
  fetchSimpleAppFeedbackPrompt as fetchAppFeedbackPrompt,
  submitSimpleAppFeedback,
  type SimpleAppFeedbackPromptData as AppFeedbackPromptData,
} from '@/services/simpleAppFeedback';

export { submitParcoursAppFeedback as submitAppFeedback } from '@/services/parcoursAppFeedback';

export type { SubmitParcoursAppFeedbackPayload as SubmitAppFeedbackPayload } from '@/services/parcoursAppFeedback';
