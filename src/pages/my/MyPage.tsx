import { useState } from 'react'
import { profileSteps } from '../../situationOptions'
import '../../styles/my/MyPage.css'

const weeklyBars = [
  { day: '월', height: 52 },
  { day: '화', height: 74 },
  { day: '수', height: 108 },
  { day: '목', height: 128 },
  { day: '금', height: 70 },
  { day: '토', height: 91 },
  { day: '일', height: 52 },
]

const menus = [
  { label: '알림 설정' },
  { label: '개인정보 및 데이터 삭제' },
]

type MyPageProps = {
  nickname: string
  answers: string[][]
  onAnswerChange: (step: number, answer: string[]) => void
}

export default function MyPage({ nickname, answers, onAnswerChange }: MyPageProps) {
  const [period, setPeriod] = useState<7 | 30>(7)

  return (
    <main className="my-page">
      <h1>나</h1>

      <section className="my-page__card my-page__records" aria-labelledby="my-records-title">
        <header className="my-page__records-header">
          <h2 id="my-records-title">나의 기록</h2>
          <div className="my-page__period" role="group" aria-label="기록 기간">
            {([7, 30] as const).map((days) => (
              <button key={days} type="button" aria-pressed={period === days} onClick={() => setPeriod(days)}>
                {days}일
              </button>
            ))}
          </div>
        </header>
        {period === 7 ? (
          <>
            <div className="my-page__chart" role="img" aria-label="월요일부터 일요일까지의 털 무게. 목요일이 가장 무거웠어요.">
              {weeklyBars.map(({ day, height }) => (
                <div className="my-page__day" key={day} aria-hidden="true">
                  <span className="my-page__bar" style={{ height }} data-peak={day === '목' || undefined} />
                  <span>{day}</span>
                </div>
              ))}
            </div>
            <p className="my-page__note">털이 가장 무거웠던 날은 목요일이에요. 그날 수면 시간이 평소보다 2시간 짧았어요.</p>
          </>
        ) : (
          <p className="my-page__note my-page__empty">30일 기록이 아직 없어요.</p>
        )}
      </section>

      <section className="my-page__card my-page__settings" aria-label="설정">
        <details>
          <summary className="my-page__menu">
            데이터 연결 관리
            <span className="my-page__chevron" aria-hidden="true" />
          </summary>
          <div>
              {nickname && <p>{nickname}</p>}
              {profileSteps.map(({ label, options, multiple }, index) => {
                const answer = answers[index]

                return multiple ? (
                  <fieldset key={label}>
                    <legend>{label}</legend>
                    {options.map((option) => (
                      <div key={option}>
                        <label>
                          <input
                            type="checkbox"
                            checked={answer.includes(option)}
                            onChange={(event) => onAnswerChange(index, event.target.checked ? [...answer, option] : answer.filter((value) => value !== option))}
                          />
                          {option}
                        </label>
                      </div>
                    ))}
                  </fieldset>
                ) : (
                  <p key={label}>
                    <label>
                      {label}{' '}
                      <select value={answer[0] ?? ''} onChange={(event) => onAnswerChange(index, event.target.value ? [event.target.value] : [])}>
                        <option value="">선택 안 함</option>
                        {options.map((option) => <option key={option}>{option}</option>)}
                      </select>
                    </label>
                  </p>
                )
              })}
          </div>
        </details>

        {menus.map(({ label }) => (
          <div className="my-page__menu" key={label}>
            {label}
            <span className="my-page__chevron" aria-hidden="true" />
          </div>
        ))}
        <a className="my-page__menu my-page__help-button" href="#help">
          <span>
            도움 받을 곳
            <span className="my-page__note">전문 상담 연결 안내</span>
          </span>
          <span className="my-page__chevron" aria-hidden="true" />
        </a>
      </section>
    </main>
  )
}
