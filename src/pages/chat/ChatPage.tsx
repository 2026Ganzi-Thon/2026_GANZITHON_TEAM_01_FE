import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { getChatMessages, respondToChatCard, sendChatMessage, type CardResponse, type ChatHelpResource, type ChatMessage } from '../../api/chat'
import { ApiError } from '../../api/client'
import { saveRequiredConsents } from '../../api/consents'
import { todayInSeoul } from '../../serviceDate'
import ConsentPage from '../auth/ConsentPage'
import ChatCalendar from './ChatCalendar'
import calendar from '../../assets/icon/calendar.png'
import profile from '../../assets/icon/profile.png'
import sheep from '../../assets/image/original_sheep.png'
import '../../styles/chat/ChatPage.css'

function Message({ children, fromUser = false }: { children: ReactNode; fromUser?: boolean }) {
  return (
    <li className={fromUser ? 'chat-row chat-row--user' : 'chat-row'}>
      {fromUser ? (
        <img className="chat-avatar" src={profile} alt="나" />
      ) : (
        <img className="chat-avatar" src={sheep} alt="소미" />
      )}
      <div className="chat-bubble">{children}</div>
    </li>
  )
}

export default function ChatPage({ onOpenRoutine }: { onOpenRoutine: () => void }) {
  const [draft, setDraft] = useState('')
  const [selectedDate, setSelectedDate] = useState(todayInSeoul)
  const [thread, setThread] = useState<{ date: string; messages: ChatMessage[] }>()
  const [loadError, setLoadError] = useState('')
  const [actionError, setActionError] = useState('')
  const [retry, setRetry] = useState(0)
  const [pendingMessage, setPendingMessage] = useState<string | null>(null)
  const [respondingTo, setRespondingTo] = useState<number | null>(null)
  const [needsConsent, setNeedsConsent] = useState(false)
  const [isSavingConsent, setIsSavingConsent] = useState(false)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [helpByMessage, setHelpByMessage] = useState<Record<number, ChatHelpResource[]>>({})
  const conversation = useRef<HTMLDivElement>(null)
  const calendarDialog = useRef<HTMLDialogElement>(null)
  const today = todayInSeoul()
  const isToday = selectedDate === today
  const messages = thread?.date === selectedDate ? thread.messages : undefined
  const isSending = pendingMessage !== null
  const busy = isSending || respondingTo !== null

  useEffect(() => {
    if (needsConsent) return
    const controller = new AbortController()
    void getChatMessages(selectedDate, controller.signal).then((items) => {
      if (!controller.signal.aborted) setThread({ date: selectedDate, messages: items })
    }, (error: unknown) => {
      if (controller.signal.aborted) return
      if (error instanceof ApiError && error.code === 'CONSENT_REQUIRED') {
        setNeedsConsent(true)
      } else {
        setLoadError(error instanceof ApiError ? error.message : '대화를 불러오지 못했어요.')
      }
    })
    return () => controller.abort()
  }, [needsConsent, retry, selectedDate])

  useEffect(() => {
    const panel = conversation.current
    if (isToday && panel && (messages?.length || isSending)) panel.scrollTop = panel.scrollHeight
  }, [isSending, isToday, messages])

  function showDate(date: string) {
    if (date === selectedDate) return
    setSelectedDate(date)
    setThread(undefined)
    setLoadError('')
    setActionError('')
    if (conversation.current) conversation.current.scrollTop = 0
  }

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = draft.trim()
    if (!text || busy || !messages || selectedDate !== todayInSeoul()) return
    setActionError('')
    setPendingMessage(text)
    setDraft('')
    try {
      const { userMessage, replies, helpResources } = await sendChatMessage(text)
      const replyDate = userMessage.threadDate
      const earlier = replyDate === selectedDate ? messages : []
      const received = [userMessage, ...replies]
      const unique = new Map([...earlier, ...received].map((message) => [message.id, message]))
      setThread({ date: replyDate, messages: [...unique.values()] })
      if (replyDate !== selectedDate) setSelectedDate(replyDate)
      const riskReply = replies.find((reply) => reply.riskFlag)
      if (riskReply && helpResources?.length) {
        setHelpByMessage((previous) => ({ ...previous, [riskReply.id]: helpResources }))
      }
    } catch (error) {
      setDraft(text)
      if (error instanceof ApiError && error.code === 'CONSENT_REQUIRED') setNeedsConsent(true)
      else setActionError(error instanceof ApiError ? error.message : '메시지 전송을 확인할 수 없어요. 대화 내역을 확인해 주세요.')
    } finally {
      setPendingMessage(null)
    }
  }

  async function answerCard(messageId: number, response: CardResponse) {
    if (busy) return
    setRespondingTo(messageId)
    setActionError('')
    try {
      await respondToChatCard(messageId, response)
      setThread((previous) => previous && {
        ...previous,
        messages: previous.messages.map((message) => message.id === messageId ? { ...message, cardResponse: response } : message),
      })
      if (response === 'ACCEPTED') onOpenRoutine()
    } catch (error) {
      if (error instanceof ApiError && error.code === 'CONSENT_REQUIRED') setNeedsConsent(true)
      else {
        setActionError(error instanceof ApiError ? error.message : '추천 응답을 저장하지 못했어요.')
        if (error instanceof ApiError && error.status === 409) setRetry((count) => count + 1)
      }
    } finally {
      setRespondingTo(null)
    }
  }

  async function saveConsent() {
    if (isSavingConsent) return
    setIsSavingConsent(true)
    setActionError('')
    try {
      await saveRequiredConsents()
      setThread(undefined)
      setNeedsConsent(false)
    } catch (error) {
      setActionError(error instanceof ApiError ? error.message : '필수 동의를 저장하지 못했어요.')
    } finally {
      setIsSavingConsent(false)
    }
  }

  if (needsConsent) {
    return <ConsentPage onContinue={saveConsent} isSubmitting={isSavingConsent} error={actionError} />
  }

  return (
    <main className="chat-page" aria-label="대화">
      <div className="chat-conversation" ref={conversation}>
        <header className="chat-history">
          <button
            className="chat-calendar"
            type="button"
            aria-label="캘린더 열기"
            aria-haspopup="dialog"
            disabled={busy}
            onClick={() => {
              calendarDialog.current?.showModal()
              setIsCalendarOpen(true)
            }}
          >
            <img src={calendar} alt="" />
          </button>
          <div className="chat-history__divider">{isToday ? '지난 대화 보기' : selectedDate}</div>
          {!isToday && <button className="chat-status__action" type="button" onClick={() => showDate(today)}>오늘 대화로</button>}
        </header>
        {loadError ? (
          <div className="chat-status">
            <p role="alert">{loadError}</p>
            <button className="chat-status__action" type="button" onClick={() => {
              setLoadError('')
              setRetry((count) => count + 1)
            }}>다시 불러오기</button>
          </div>
        ) : !messages ? <p className="chat-status" role="status">대화를 불러오고 있어요.</p>
          : messages.length === 0 && <p className="chat-status">{isToday ? '소미에게 첫 메시지를 보내보세요.' : '이 날짜에는 대화가 없어요.'}</p>}
        <ol className="chat-messages" aria-label="대화 내용" aria-live="polite">
          {messages?.map((message) => {
            if (message.messageType === 'ROUTINE_RECOMMENDATION') {
              return (
                <li className="chat-row" key={message.id}>
                  <img className="chat-avatar" src={sheep} alt="소미" />
                  <section className="chat-routine" aria-label="추천 루틴">
                    <span className="chat-routine__label">추천 루틴</span>
                    <h2>{message.payload?.title || message.content}</h2>
                    {message.payload?.durationSec && <span>{message.payload.durationSec}초</span>}
                    {message.payload?.reason && <span>{message.payload.reason}</span>}
                    {message.cardResponse === 'ACCEPTED' && <span>루틴을 선택했어요.</span>}
                    {message.cardResponse === 'DECLINED' && <span>루틴을 건너뛰었어요.</span>}
                    {isToday && !message.cardResponse && (
                      <>
                        <button type="button" className="chat-routine__start" disabled={busy} onClick={() => void answerCard(message.id, 'ACCEPTED')}>지금 해볼게요</button>
                        <button type="button" className="chat-routine__dismiss" disabled={busy} onClick={() => void answerCard(message.id, 'DECLINED')}>오늘은 그냥 둘래요</button>
                      </>
                    )}
                  </section>
                </li>
              )
            }

            return (
              <Message key={message.id} fromUser={message.role === 'USER'}>
                {message.messageType === 'WEEK_SUMMARY' && message.payload?.title && <strong>{message.payload.title}</strong>}
                <div>{message.payload?.body || message.content}</div>
                {message.riskFlag && (
                  <div className="chat-help">
                    {helpByMessage[message.id]?.map((resource, index) => (
                      <div key={index}><strong>{resource.name}</strong><div>{resource.description}</div></div>
                    ))}
                    <a href="#help">도움 받을 곳 보기</a>
                  </div>
                )}
              </Message>
            )
          })}
          {pendingMessage !== null && (
            <>
              <Message fromUser>{pendingMessage}</Message>
              <Message>
                <span className="chat-typing" role="status" aria-label="소미가 답장을 준비하고 있어요">
                  <span aria-hidden="true" />
                  <span aria-hidden="true" />
                  <span aria-hidden="true" />
                </span>
              </Message>
            </>
          )}
        </ol>
        {actionError && <div className="chat-status">
          <p role="alert">{actionError}</p>
          <button className="chat-status__action" type="button" disabled={busy} onClick={() => {
            setActionError('')
            setLoadError('')
            setThread(undefined)
            setRetry((count) => count + 1)
          }}>대화 새로고침</button>
        </div>}
      </div>
      {isToday && <form className="chat-composer" onSubmit={sendMessage}>
        <input
          aria-label="소미에게 보낼 메시지"
          placeholder="소미에게 하고 싶은 말을 적어보세요..."
          value={draft}
          readOnly={isSending}
          onChange={(event) => setDraft(event.target.value)}
        />
        <button type="submit" aria-label="메시지 보내기" disabled={!draft.trim() || !messages || busy}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="m21 3-6.3 18-4.4-7.3L3 9.3 21 3ZM10.3 13.7l6.2-6.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </form>}
      <ChatCalendar
        dialogRef={calendarDialog}
        isOpen={isCalendarOpen}
        selectedDate={selectedDate}
        today={today}
        onClose={() => setIsCalendarOpen(false)}
        onSelect={showDate}
      />
    </main>
  )
}
