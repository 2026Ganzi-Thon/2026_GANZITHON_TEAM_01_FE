import sheep from '../../assets/image/original_sheep.png'
import completedSheep from '../../assets/image/checkin_sheeep.png'
import { checkInSteps } from './checkInQuestions'
import '../../styles/home/CheckIn.css'

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
  isSubmitting: boolean
  error: string
}

export function CheckIn({ step, answer, walkingAnswer, onSelect, onSelectWalking, onPrevious, onNext, onSkip, isSubmitting, error }: CheckInProps) {
  const isLastStep = step === checkInSteps.length - 1
  const canContinue = isLastStep || Boolean(answer)
  const questions = [{ ...checkInSteps[step], answer, onSelect }]
  if (isLastStep) questions.push({ ...walkingQuestion, answer: walkingAnswer, onSelect: onSelectWalking })

  return (
    <div className={isLastStep ? 'check-in check-in--daily-activity' : 'check-in'} aria-busy={isSubmitting}>
      <h1 className="check-in__title">하루 체크인</h1>
      <div className="check-in__progress" role="img" aria-label={`전체 ${checkInSteps.length}단계 중 ${step + 1}단계`}>
        {checkInSteps.map(({ question }, index) => (
          <span key={question} data-current={step === index ? '' : undefined} />
        ))}
      </div>
      <div className="check-in__body">
        {!isLastStep && <img className="check-in__sheep" src={sheep} width="113" height="146" alt="" />}
        <div className="check-in__questions">
          {questions.map((item, index) => (
            <section key={index}>
              <h2 id={`check-in-question-${index}`} className="check-in__question" aria-live="polite">{item.question}</h2>
              <p className="check-in__description">{item.description}</p>
              <div className="check-in__options" role="group" aria-labelledby={`check-in-question-${index}`}>
                {item.options.map((option) => (
                  <button key={option} type="button" aria-pressed={item.answer === option} disabled={isSubmitting} onClick={() => item.onSelect(option)}>
                    {option}
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
      <div className="check-in__actions">
        {step > 0 && <button className="check-in__previous" type="button" disabled={isSubmitting} onClick={onPrevious}> 이전</button>}
        <button type="button" disabled={!canContinue || isSubmitting} onClick={onNext}>
          {isSubmitting ? '저장 중…' : isLastStep ? '완료' : '다음'}
        </button>
      </div>
      <button className="check-in__skip" type="button" disabled={isSubmitting} onClick={onSkip}>
        {isLastStep ? '건너뛰기' : '다음에 하기'}
      </button>
      {error && <p className="check-in__description" role="alert">{error}</p>}
    </div>
  )
}

type CheckInCompleteProps = {
  onPrevious: () => void
  onHome: () => void
  title?: string
  skipped?: boolean
}

export function CheckInComplete({ onPrevious, onHome, title = '하루 체크인 완료!', skipped = false }: CheckInCompleteProps) {
  return (
    <section className="check-in-complete" aria-labelledby="check-in-complete-title">
      <button className="check-in-complete__back" type="button" onClick={onPrevious}>‹ 이전</button>
      <div className="check-in-complete__content">
        <div className="check-in-complete__art">
          <img src={completedSheep} width="213" height="213" alt="" />
        </div>
        <h1 id="check-in-complete-title" role="status">{skipped ? '하루 체크인을 건너뛰었어요' : title}</h1>
        {!skipped && <p>오늘의 마음을 확인했어요!</p>}
      </div>
      <button className="check-in-complete__home" type="button" onClick={onHome}>메인 홈으로</button>
    </section>
  )
}
