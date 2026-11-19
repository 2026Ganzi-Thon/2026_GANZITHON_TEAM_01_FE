import { readApi, writeApi } from './client'
import type { HelpResource } from './helpResources'

export type CardResponse = 'ACCEPTED' | 'DECLINED'

export type ChatMessage = {
  id: number
  threadDate: string
  role: 'USER' | 'SOMI'
  messageType: 'TEXT' | 'WEEK_SUMMARY' | 'ROUTINE_RECOMMENDATION'
  content: string
  payload: {
    routineId?: string
    title?: string | null
    body?: string | null
    reason?: string
    durationSec?: number
  } | null
  riskFlag: boolean
  cardResponse: CardResponse | null
}

type ChatTurn = {
  userMessage: ChatMessage
  replies: ChatMessage[]
  helpResources: HelpResource[] | null
}

export async function getChatMessages(date: string, signal: AbortSignal) {
  const params = new URLSearchParams({ date })
  const messages: ChatMessage[] = []
  while (true) {
    const { items, nextCursor } = await readApi<{ items: ChatMessage[]; nextCursor: string | null }>(
      `/chat/messages?${params}`, '대화 불러오기', signal,
    )
    messages.push(...items)
    if (!nextCursor) return messages
    if (nextCursor === params.get('cursor')) throw new Error('대화 목록을 끝까지 불러오지 못했어요.')
    params.set('cursor', nextCursor)
  }
}

export function getChatDates(month: string, signal: AbortSignal) {
  return readApi<string[]>(`/chat/dates?${new URLSearchParams({ month })}`, '대화 날짜 불러오기', signal)
}

export async function sendChatMessage(text: string): Promise<ChatTurn> {
  const response = await writeApi('/chat/messages', '메시지 전송', { text }, { expectedStatus: 201 })
  return response.json()
}

export function respondToChatCard(messageId: number, response: CardResponse) {
  return writeApi(`/chat/recommendations/${messageId}/response`, '추천 응답 저장', { response })
}
