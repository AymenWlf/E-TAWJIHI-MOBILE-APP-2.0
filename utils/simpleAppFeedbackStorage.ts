import AsyncStorage from '@react-native-async-storage/async-storage';

const DISMISS_PREFIX = '@etawjihi/simple_feedback_dismissed_v1/';
const SUBMITTED_PREFIX = '@etawjihi/simple_feedback_submitted_v1/';

export async function isSimpleFeedbackDismissed(userId: number): Promise<boolean> {
  const raw = await AsyncStorage.getItem(`${DISMISS_PREFIX}${userId}`);
  return raw === '1';
}

export async function markSimpleFeedbackDismissed(userId: number): Promise<void> {
  await AsyncStorage.setItem(`${DISMISS_PREFIX}${userId}`, '1');
}

export async function isSimpleFeedbackSubmitted(userId: number): Promise<boolean> {
  const raw = await AsyncStorage.getItem(`${SUBMITTED_PREFIX}${userId}`);
  return raw === '1';
}

export async function clearSimpleFeedbackLocalFlags(userId: number): Promise<void> {
  await AsyncStorage.multiRemove([
    `${DISMISS_PREFIX}${userId}`,
    `${SUBMITTED_PREFIX}${userId}`,
  ]);
}

export async function markSimpleFeedbackSubmitted(userId: number): Promise<void> {
  await AsyncStorage.setItem(`${SUBMITTED_PREFIX}${userId}`, '1');
}
