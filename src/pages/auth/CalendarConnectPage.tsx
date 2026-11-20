import '../../styles/auth/CalendarConnectPage.css'

const weekdays = ['월', '화', '수', '목', '금', '토', '일']
const barHeights = [40, 57, 43, 100, 54, 84, 40]

export default function CalendarConnectPage({ onBack, onSkip, onConnect, status, busy }: {
  onBack: () => void
  onSkip: () => void
  onConnect: () => void
  status?: string
  busy?: boolean
}) {
  return (
    <main className="welcome calendar-connect" aria-labelledby="calendar-connect-title">
      <button className="introduction__back" type="button" onClick={onBack} disabled={busy}>
        <span aria-hidden="true">‹</span> 이전
      </button>
      <div className="calendar-connect__content">
        <h1 id="calendar-connect-title">구글 캘린더를<br />연결할까요?</h1>
        <p>일정이 몰린 주에는 마음도 쉽게 지쳐요.<br />솜이 바쁜 흐름을 먼저 알아챌게요.</p>
        <section className="calendar-connect__preview" aria-label="주간 일정 요약 예시">
          <h2>이번 주 일정이 평소보다 많았어요</h2>
          <p>고생했어요. 이제 털을 덜어내볼까요?</p>
          <div className="calendar-connect__chart" aria-hidden="true">
            {weekdays.map((day, index) => (
              <div key={day}>
                <span className="calendar-connect__bar" style={{ height: `${barHeights[index]}%` }} />
                <span>{day}</span>
              </div>
            ))}
          </div>
        </section>
        <ul className="calendar-connect__details">
          <li><span aria-hidden="true">✓</span>일정이 있는 시간대만 확인해요</li>
          <li><span aria-hidden="true">✓</span>일정 제목과 내용은 보지 않아요</li>
          <li><span aria-hidden="true">✓</span>마이페이지에서 언제든 연결을 끊을 수 있어요</li>
        </ul>
      </div>
      <div className="calendar-connect__actions">
        <p role="status">{status || '연결하지 않아도 솜을 쓸 수 있어요'}</p>
        <button className="onboarding-continue" type="button" onClick={onConnect} disabled={busy}>
          <span className="calendar-connect__google" aria-hidden="true"><span>G</span></span>
          구글 캘린더 연결하기
        </button>
        <button className="calendar-connect__skip" type="button" onClick={onSkip} disabled={busy}>나중에 할게요</button>
      </div>
    </main>
  )
}
