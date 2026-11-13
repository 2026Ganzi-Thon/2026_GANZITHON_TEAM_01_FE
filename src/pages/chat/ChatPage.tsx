import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import ChatCalendar from './ChatCalendar'
import calendar from '../../assets/icon/calendar.png'
import sheep from '../../assets/image/original_sheep.png'
import '../../styles/chat/ChatPage.css'

function Message({ children, fromUser = false }: { children: ReactNode; fromUser?: boolean }) {
  return (
    <li className={fromUser ? 'chat-row chat-row--user' : 'chat-row'}>
      {fromUser ? (
        <svg className="chat-avatar" viewBox="0 0 32 32" role="img" aria-label="나">
          <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="16" cy="12" r="5" fill="currentColor" />
          <path d="M6.5 26a9.5 9.5 0 0 1 19 0 14 14 0 0 1-19 0Z" fill="currentColor" />
        </svg>
      ) : (
        <img className="chat-avatar" src={sheep} alt="소미" />
      )}
      <div className="chat-bubble">{children}</div>
    </li>
  )
}

export default function ChatPage({ onOpenRoutine }: { onOpenRoutine: () => void }) {
  const [draft, setDraft] = useState('')
  const [messages, setMessages] = useState<string[]>([])
  const [routineDismissed, setRoutineDismissed] = useState(false)
  const conversation = useRef<HTMLDivElement>(null)
  const calendarDialog = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const panel = conversation.current
    if (messages.length && panel) panel.scrollTop = panel.scrollHeight
  }, [messages])

  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const message = draft.trim()
    if (!message) return
    setMessages((previous) => [...previous, message])
    setDraft('')
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
            onClick={() => calendarDialog.current?.showModal()}
          >
            <img src={calendar} alt="" />
          </button>
          <div className="chat-history__divider">지난 대화 보기</div>
        </header>
        <ol className="chat-messages" aria-label="대화 내용" aria-live="polite">
          <Message>요즘 어때요? 이번주는 잠이 평소보다 1시간 짧았어요.</Message>
          <Message fromUser>
            <strong>이번 주 달라진 점</strong>
            <span>수면 평소 -1시간, 일정 사이 빈 시간 적음</span>
          </Message>
          <Message>마감 주간이었군요. 오늘은 5분만 털을 깎아볼까요?</Message>
          {!routineDismissed && (
            <li className="chat-row">
              <img className="chat-avatar" src={sheep} alt="소미" />
              <section className="chat-routine" aria-label="추천 루틴">
                <span className="chat-routine__label">추천 루틴</span>
                <h2>호흡 따라하기 - 2분</h2>
                <button type="button" className="chat-routine__start" onClick={onOpenRoutine}>지금 해볼게요</button>
                <button type="button" className="chat-routine__dismiss" onClick={() => setRoutineDismissed(true)}>
                  오늘은 그냥 둘래요
                </button>
              </section>
            </li>
          )}
          <Message fromUser>~~</Message>
          {messages.map((message, index) => <Message key={index} fromUser>{message}</Message>)}
        </ol>
      </div>
      <form className="chat-composer" onSubmit={sendMessage}>
        <input
          aria-label="소미에게 보낼 메시지"
          placeholder="소미에게 하고 싶은 말을 적어보세요..."
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <button type="submit" aria-label="메시지 보내기" disabled={!draft.trim()}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="m21 3-6.3 18-4.4-7.3L3 9.3 21 3ZM10.3 13.7l6.2-6.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </form>
      <ChatCalendar dialogRef={calendarDialog} />
    </main>
  )
}
