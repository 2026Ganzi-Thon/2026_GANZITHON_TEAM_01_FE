import { useState } from 'react'
import BottomNavigation, { type Screen } from './components/BottomNavigation'
import ChatPage from './pages/chat/ChatPage'
import HomePage from './pages/home/HomePage'
import MyPage from './pages/my/MyPage'
import ConsentPage from './pages/auth/ConsentPage'
import IntroductionPage from './pages/onboarding/IntroductionPage'
import LoginPage from './pages/auth/LoginPage'
import NicknamePage from './pages/auth/NicknamePage'
import OnboardingCompletePage from './pages/auth/OnboardingCompletePage'
import SignupPage from './pages/auth/SignupPage'
import SituationPage from './pages/auth/SituationPage'
import WelcomePage from './pages/onboarding/WelcomePage'
import RoutinePage from './pages/routine/RoutinePage'
import { profileSteps } from './situationOptions'

const screens = {
  chat: ChatPage,
  routine: RoutinePage,
}

function App() {
  const [onboarding, setOnboarding] = useState<'welcome' | 'login' | 'introduction' | 'consent' | 'signup' | 'nickname' | 'situation' | 'summary' | 'complete'>('welcome')
  const [nickname, setNickname] = useState('')
  const [profileStep, setProfileStep] = useState(0)
  const [profileAnswers, setProfileAnswers] = useState<string[][]>(() => profileSteps.map(() => []))
  const [screen, setScreen] = useState<Screen>('home')
  const Page = screen === 'chat' || screen === 'routine' ? screens[screen] : null

  function updateProfileAnswer(step: number, answer: string[]) {
    setProfileAnswers((current) => current.map((value, index) => index === step ? answer : value))
  }

  function advanceProfile() {
    if (profileStep === profileSteps.length - 1) setOnboarding('summary')
    else setProfileStep(profileStep + 1)
  }

  if (onboarding !== 'complete') {
    return (
      <div className="app-frame">
        {onboarding === 'welcome' ? (
          <WelcomePage onContinue={() => setOnboarding('introduction')} onLogin={() => setOnboarding('login')} />
        ) : onboarding === 'login' ? (
          <LoginPage />
        ) : onboarding === 'introduction' ? (
          <IntroductionPage
            onBack={() => setOnboarding('welcome')}
            onContinue={() => setOnboarding('consent')}
          />
        ) : onboarding === 'consent' ? (
          <ConsentPage onContinue={() => setOnboarding('signup')} />
        ) : onboarding === 'signup' ? (
          <SignupPage onComplete={() => setOnboarding('nickname')} />
        ) : onboarding === 'nickname' ? (
          <NicknamePage
            nickname={nickname}
            onChange={setNickname}
            onBack={() => setOnboarding('signup')}
            onContinue={() => {
              setNickname(nickname.trim())
              setOnboarding('situation')
            }}
          />
        ) : onboarding === 'summary' ? (
          <OnboardingCompletePage
            onBack={() => setOnboarding('situation')}
            onHome={() => setOnboarding('complete')}
          />
        ) : (
          <SituationPage
            key={profileStep}
            step={profileStep}
            value={profileAnswers[profileStep]}
            onChange={(answer) => updateProfileAnswer(profileStep, answer)}
            onBack={() => {
              if (profileStep === 0) setOnboarding('nickname')
              else setProfileStep(profileStep - 1)
            }}
            onSkip={() => {
              updateProfileAnswer(profileStep, [])
              advanceProfile()
            }}
            onContinue={advanceProfile}
          />
        )}
      </div>
    )
  }

  return (
    <div className={screen === 'home' ? 'app-frame app-frame--home' : 'app-frame'}>
      <div className="app-layout">
        {screen === 'my' ? <MyPage nickname={nickname} answers={profileAnswers} onAnswerChange={updateProfileAnswer} /> : Page ? <Page /> : <HomePage onOpenRoutine={() => setScreen('routine')} />}
        <BottomNavigation screen={screen} onSelect={setScreen} />
      </div>
    </div>
  )
}

export default App
