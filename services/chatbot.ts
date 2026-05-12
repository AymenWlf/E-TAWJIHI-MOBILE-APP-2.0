import AsyncStorage from '@react-native-async-storage/async-storage';

import { buildApiUrl } from '@/constants/api';
import { httpGetJson, httpPostJson } from '@/services/http';

const ANONYMOUS_SESSION_KEY = 'etawjihi_chat_anonymous_id';

export interface ChatbotChatResponseData {
  reply: string;
  sessionId: number;
  contextUsed: boolean;
  userHasOrientationTest: boolean;
  grokUsed?: boolean;
}

export interface ChatbotSession {
  id: number;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  title?: string;
}

export interface ChatbotMessageRow {
  id: number;
  role: string;
  content: string;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

/** Identifiant de session anonyme (AsyncStorage), pour cohérence avec le web si l’auth évolue. */
export async function getAnonymousSessionId(): Promise<string> {
  let id = await AsyncStorage.getItem(ANONYMOUS_SESSION_KEY);
  if (!id) {
    id = `anon_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
    await AsyncStorage.setItem(ANONYMOUS_SESSION_KEY, id);
  }
  return id;
}

export async function getChatbotSessions(
  accessToken: string | null,
  anonymousSessionId?: string | null,
): Promise<ChatbotSession[]> {
  const params: Record<string, string> = {};
  if (anonymousSessionId) params.anonymousSessionId = anonymousSessionId;
  const url = buildApiUrl('/api/chatbot/sessions', params);
  const headers: Record<string, string> = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  const data = await httpGetJson<{ success: boolean; data?: { sessions?: ChatbotSession[] } }>(url, { headers });
  if (!data.success || !data.data?.sessions) return [];
  return data.data.sessions;
}

export async function getChatbotSessionMessages(
  sessionId: number,
  accessToken: string | null,
  anonymousSessionId?: string | null,
): Promise<ChatbotMessageRow[]> {
  const params: Record<string, string> = {};
  if (anonymousSessionId) params.anonymousSessionId = anonymousSessionId;
  const url = buildApiUrl(`/api/chatbot/sessions/${sessionId}/messages`, params);
  const headers: Record<string, string> = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  const data = await httpGetJson<{ success: boolean; data?: { messages?: ChatbotMessageRow[] } }>(url, {
    headers,
  });
  if (!data.success || !data.data?.messages) return [];
  return data.data.messages;
}

export interface SendChatbotMessageOptions {
  userId?: number | null;
  sessionId?: number | null;
  anonymousSessionId?: string | null;
  boutiqueProductSlug?: string | null;
}

export async function sendChatbotMessage(
  message: string,
  accessToken: string | null,
  options?: SendChatbotMessageOptions,
): Promise<ChatbotChatResponseData> {
  const opts = options ?? {};
  const body: Record<string, unknown> = { message, clientPlatform: 'mobile' };
  if (opts.userId != null) body.userId = opts.userId;
  if (opts.sessionId != null) body.sessionId = opts.sessionId;
  if (opts.anonymousSessionId != null) body.anonymousSessionId = opts.anonymousSessionId;
  if (opts.boutiqueProductSlug != null && opts.boutiqueProductSlug !== '') {
    body.boutiqueProductSlug = opts.boutiqueProductSlug;
  }
  const headers: Record<string, string> = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  const data = await httpPostJson<
    { success: boolean; message?: string; data?: ChatbotChatResponseData },
    Record<string, unknown>
  >(buildApiUrl('/api/chatbot/chat'), body, { headers });
  if (!data.success || !data.data) {
    throw new Error(typeof data.message === 'string' ? data.message : 'Erreur chatbot');
  }
  return data.data;
}
