import sheep from '../../assets/image/original_sheep.png'
import completedSheep from '../../assets/image/checkin_sheeep.png'
import '../../styles/home/CheckIn.css'

export const checkInSteps = [
  {
    question: '오늘 마음은 어떤가요?',
    description: '지금 느끼는 마음을 골라주세요!',
    options: ['편안해요', '괜찮아요', '그냥 그래요', '불안해요', '지쳤어요', '기타'],
  },
  {
    question: '무엇이 마음을 무겁게 했나요?',
    description: '오늘 가장 신경 쓰였던 일을 알려주세요.',
    options: ['취업이나 업무', '미래에 대한 걱정', '다른 사람과의 비교', '인간관계', '특별한 이유는 없어요', '기타'],
  },
  {
    question: '지금 어떤 도움이 필요해요?',
    description: '솜이 오늘의 마음을 함께 돌봐줄게요.',
    options: ['따뜻한 위로', '마음 털어 놓기', '잠깐 쉬어가기', '작은 행동 추천'],
  },
]

type CheckInProps = {
  step: number
  answer: string | undefined
  onSelect: (answer: string) => void
  onPrevious: () => void
  onNext: () => void
  onSkip: () => void
}

export function CheckIn({ step, answer, onSelect, onPrevious, onNext, onSkip }: CheckInProps) {
  const { question, description, options } = checkInSteps[step]

  return (
    <div className="check-in">
      <h1 className="check-in__title">하루 체크인</h1>
      <div className="check-in__progress" role="img" aria-label={`전체 3단계 중 ${step + 1}단계`}>
        {checkInSteps.map(({ question }, index) => (
          <span key={question} data-current={step === index ? '' : undefined} />
        ))}
      </div>
      <img className="check-in__sheep" src={sheep} width="113" height="146" alt="" />
      <h2 id="check-in-question" className="check-in__question" aria-live="polite">{question}</h2>
      <p className="check-in__description">{description}</p>
      <div className="check-in__options" role="group" aria-labelledby="check-in-question">
        {options.map((option) => (
          <button key={option} type="button" aria-pressed={answer === option} onClick={() => onSelect(option)}>
            {option}
          </button>
        ))}
      </div>
      <div className="check-in__actions">
        {step > 0 && <button className="check-in__previous" type="button" onClick={onPrevious}>이전</button>}
        <button type="button" disabled={!answer} onClick={onNext}>다음</button>
      </div>
      <button className="check-in__skip" type="button" onClick={onSkip}>건너뛰기</button>
    </div>
  )
}

type CheckInCompleteProps = {
  onPrevious: () => void
  onHome: () => void
}

export function CheckInComplete({ onPrevious, onHome }: CheckInCompleteProps) {
  return (
    <section className="check-in-complete" aria-labelledby="check-in-complete-title">
      <button className="check-in-complete__back" type="button" onClick={onPrevious}>‹ 이전</button>
      <div className="check-in-complete__content">
        <div className="check-in-complete__art">
          <img src={completedSheep} width="213" height="213" alt="" />
        </div>
        <h1 id="check-in-complete-title" role="status">하루 체크인 완료!</h1>
        <p>오늘의 마음을 확인했어요!</p>
      </div>
      <button className="check-in-complete__home" type="button" onClick={onHome}>메인 홈으로</button>
    </section>
  )
}
