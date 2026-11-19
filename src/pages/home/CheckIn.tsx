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
  {
    question: '어젯밤 잠은 얼마나 잤나요?',
    description: '정확하지 않아도 괜찮아요',
    options: ['4시간 이하', '5~6시간', '7~8시간', '9시간 이상'],
  },
]

const walkingQuestion = {
  question: '오늘 얼마나 걸었나요?',
  description: '걸음 수를 몰라도 건너뛸 수 있어요',
  options: ['2천걸음 이하', '2천~5천 걸음', '5천~8천 걸음', '8천 걸음 이상'],
}

type CheckInProps = {
  step: number
  answer: string | undefined
  walkingAnswer: string
  onSelect: (answer: string) => void
  onSelectWalking: (answer: string) => void
  onPrevious: () => void
  onNext: () => void
  onSkip: () => void
}

export function CheckIn({ step, answer, walkingAnswer, onSelect, onSelectWalking, onPrevious, onNext, onSkip }: CheckInProps) {
  const isLastStep = step === checkInSteps.length - 1
  const canContinue = Boolean(answer && (!isLastStep || walkingAnswer))
  const questions = [{ ...checkInSteps[step], answer, onSelect }]
  if (isLastStep) questions.push({ ...walkingQuestion, answer: walkingAnswer, onSelect: onSelectWalking })

  return (
    <div className={isLastStep ? 'check-in check-in--daily-activity' : 'check-in'}>
      <h1 className="check-in__title">하루 체크인</h1>
      <div className="check-in__progress" role="img" aria-label={`전체 ${checkInSteps.length}단계 중 ${step + 1}단계`}>
        {checkInSteps.map(({ question }, index) => (
          <span key={question} data-current={step === index ? '' : undefined} />
        ))}
      </div>
      {!isLastStep && <img className="check-in__sheep" src={sheep} width="113" height="146" alt="" />}
      <div className="check-in__questions">
        {questions.map((item, index) => (
          <section key={index}>
            <h2 id={`check-in-question-${index}`} className="check-in__question" aria-live="polite">{item.question}</h2>
            <p className="check-in__description">{item.description}</p>
            <div className="check-in__options" role="group" aria-labelledby={`check-in-question-${index}`}>
              {item.options.map((option) => (
                <button key={option} type="button" aria-pressed={item.answer === option} onClick={() => item.onSelect(option)}>
                  {option}
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
      <div className="check-in__actions">
        {step > 0 && <button className="check-in__previous" type="button" onClick={onPrevious}> 이전</button>}
        <button type="button" disabled={!canContinue} onClick={onNext}>다음</button>
      </div>
      <button className="check-in__skip" type="button" onClick={onSkip}>건너뛰기</button>
    </div>
  )
}

type CheckInCompleteProps = {
  onPrevious: () => void
  onHome: () => void
  title?: string
}

export function CheckInComplete({ onPrevious, onHome, title = '하루 체크인 완료!' }: CheckInCompleteProps) {
  return (
    <section className="check-in-complete" aria-labelledby="check-in-complete-title">
      <button className="check-in-complete__back" type="button" onClick={onPrevious}>‹ 이전</button>
      <div className="check-in-complete__content">
        <div className="check-in-complete__art">
          <img src={completedSheep} width="213" height="213" alt="" />
        </div>
        <h1 id="check-in-complete-title" role="status">{title}</h1>
        <p>오늘의 마음을 확인했어요!</p>
      </div>
      <button className="check-in-complete__home" type="button" onClick={onHome}>메인 홈으로</button>
    </section>
  )
}
