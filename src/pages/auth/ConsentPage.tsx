import { useState } from 'react'
import check from '../../assets/icon/check.png'
import checkDone from '../../assets/icon/check_done.png'
import '../../styles/auth/ConsentPage.css'

const requiredItems = ['만 14세 이상이에요', '서비스 이용약관', '개인정보 수집 이용']

function ConsentPage({ onContinue }: { onContinue: () => void }) {
  const [accepted, setAccepted] = useState(() => requiredItems.map(() => false))
  const allAccepted = accepted.every(Boolean)

  return (
    <main className="consent" aria-labelledby="consent-title">
      <div className="consent__content">
        <h1 id="consent-title"><span>솜을 시작하기 전에<br />확인해주세요</span></h1>

        <div className="consent__choices">
          <label className="consent__choice consent__choice--all">
            <input
              type="checkbox"
              checked={allAccepted}
              onChange={(event) => setAccepted(requiredItems.map(() => event.target.checked))}
            />
            <img src={allAccepted ? checkDone : check} alt="" width="18" height="18" />
            전체 동의하기
          </label>
          {requiredItems.map((item, index) => (
            <label className="consent__choice" key={item}>
              <input
                type="checkbox"
                checked={accepted[index]}
                onChange={(event) => {
                  const checked = event.target.checked
                  setAccepted((current) => current.map((value, position) => position === index ? checked : value))
                }}
              />
              <img src={accepted[index] ? checkDone : check} alt="" width="18" height="18" />
              <strong>[필수]</strong> {item}
            </label>
          ))}
        </div>

        <section className="consent__notice" aria-labelledby="consent-notice-title">
          <h2 id="consent-notice-title">선택 항목은 따로 물어볼게요</h2>
          <p>수면시간, 걸음 수, 휴대폰 사용 시간, 캘린더는 연결할 때 항목마다 따로 동의를 받아요. 연결하지 않아도 솜을 쓸 수 있어요.</p>
        </section>
      </div>

      <button className="onboarding-continue" type="button" disabled={!allAccepted} onClick={onContinue}>
        동의하고 시작하기
      </button>
    </main>
  )
}

export default ConsentPage
