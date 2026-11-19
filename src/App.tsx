import { useEffect, useState } from 'react'
import BottomNavigation, { type Screen } from './components/BottomNavigation'
import ChatPage from './pages/chat/ChatPage'
import HomePage from './pages/home/HomePage'
import MyPage from './pages/my/MyPage'
import HelpPage from './pages/my/HelpPage'
import ConsentPage from './pages/auth/ConsentPage'
import CalendarConnectPage from './pages/auth/CalendarConnectPage'
import IntroductionPage from './pages/onboarding/IntroductionPage'
import LoginPage from './pages/auth/LoginPage'
import NicknamePage from './pages/auth/NicknamePage'
import OnboardingCompletePage from './pages/auth/OnboardingCompletePage'
import SignupPage from './pages/auth/SignupPage'
import SituationPage from './pages/auth/SituationPage'
import WelcomePage from './pages/onboarding/WelcomePage'
import RoutinePage from './pages/routine/RoutinePage'
import { profileSteps } from './situationOptions'
import { getCheckIn } from './api/checkIns'
import { saveRequiredConsents } from './api/consents'
import type { RoutineTarget } from './api/routines'
import { todayInSeoul } from './serviceDate'

type Navigation = { screen: Screen; initialRoutine?: RoutineTarget; initialCheckInDate?: string }

function App() {
  const [onboarding, setOnboarding] = useState<'welcome' | 'login' | 'introduction' | 'consent' | 'signup' | 'nickname' | 'situation' | 'summary' | 'calendar' | 'complete'>('welcome')
  const [nickname, setNickname] = useState('')
  const [pendingConsentLoginId, setPendingConsentLoginId] = useState<string>()
  const [activeLoginId, setActiveLoginId] = useState('')
  const [profileStep, setProfileStep] = useState(0)
  const [profileAnswers, setProfileAnswers] = useState<string[][]>(() => profileSteps.map(() => []))
  const [{ screen, initialRoutine, initialCheckInDate }, setNavigation] = useState<Navigation>({ screen: 'home' })
  const [showHelp, setShowHelp] = useState(() => window.location.hash === '#help')

  useEffect(() => {
    function updateHelpPage() {
      setShowHelp(window.location.hash === '#help')
    }

    window.addEventListener('hashchange', updateHelpPage)
    return () => window.removeEventListener('hashchange', updateHelpPage)
  }, [])

  function closeHelp() {
    if (window.location.hash === '#help') {
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
    }
    setShowHelp(false)
  }

  function setScreen(nextScreen: Screen) {
    setNavigation((current) => current.screen === nextScreen && !showHelp ? current : { screen: nextScreen })
  }

  function openRecommendedRoutine(initialRoutine: RoutineTarget) {
    setNavigation((current) => current.screen === 'chat' ? { screen: 'routine', initialRoutine } : current)
  }

  function updateProfileAnswer(step: number, answer: string[]) {
    setProfileAnswers((current) => current.map((value, index) => index === step ? answer : value))
  }

  function advanceProfile() {
    if (profileStep === profileSteps.length - 1) setOnboarding('summary')
    else setProfileStep(profileStep + 1)
  }

  async function openHome(loginId: string) {
    if (pendingConsentLoginId === loginId) {
      await saveRequiredConsents()
      setPendingConsentLoginId(undefined)
    }
    const date = todayInSeoul()
    const checkIn = await getCheckIn(date, AbortSignal.timeout(8_000)).catch(() => undefined)
    setActiveLoginId(loginId)
    closeHelp()
    setNavigation({ screen: 'home', initialCheckInDate: checkIn === null ? date : undefined })
    setOnboarding('complete')
  }

  if (onboarding !== 'complete') {
    return (
      <div className="app-frame">
        {onboarding === 'welcome' ? (
          <WelcomePage onContinue={() => setOnboarding('introduction')} onLogin={() => setOnboarding('login')} />
        ) : onboarding === 'login' ? (
          <LoginPage onLogin={openHome} onSignup={() => setOnboarding('consent')} />
        ) : onboarding === 'introduction' ? (
          <IntroductionPage
            onBack={() => setOnboarding('welcome')}
            onContinue={() => setOnboarding('consent')}
          />
        ) : onboarding === 'consent' ? (
          <ConsentPage onContinue={() => setOnboarding('signup')} />
        ) : onboarding === 'signup' ? (
          <SignupPage
            onLogin={() => setOnboarding('login')}
            onComplete={(loginId) => {
              setPendingConsentLoginId(loginId)
              setOnboarding('nickname')
            }}
          />
        ) : onboarding === 'nickname' ? (
          <NicknamePage
            nickname={nickname}
            onChange={setNickname}
            onContinue={() => {
              setNickname(nickname.trim())
              setOnboarding('situation')
            }}
          />
        ) : onboarding === 'summary' ? (
          <OnboardingCompletePage
            nickname={nickname}
            onBack={() => setOnboarding('situation')}
            onContinue={() => setOnboarding('calendar')}
          />
        ) : onboarding === 'calendar' ? (
          <CalendarConnectPage onBack={() => setOnboarding('summary')} onSkip={() => setOnboarding('login')} />
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
    <div className={screen === 'home' && !showHelp ? 'app-frame app-frame--home' : 'app-frame'}>
      <div className="app-layout">
        {showHelp ? (
          <HelpPage onBack={() => {
            closeHelp()
            if (screen !== 'chat') setScreen('my')
          }} />
        ) : screen === 'my' ? (
          <MyPage />
        ) : screen === 'chat' ? (
          <ChatPage onOpenRoutine={openRecommendedRoutine} />
        ) : screen === 'routine' ? (
          <RoutinePage loginId={activeLoginId} initialRoutine={initialRoutine} onHome={() => setScreen('home')} />
        ) : (
          <HomePage
            loginId={activeLoginId}
            initialCheckInDate={initialCheckInDate}
            onOpenChat={() => setScreen('chat')}
            onOpenRoutine={() => setScreen('routine')}
          />
        )}
        <BottomNavigation screen={showHelp ? 'my' : screen} onSelect={(nextScreen) => {
          closeHelp()
          setScreen(nextScreen)
        }} />
      </div>
    </div>
  )
}

export default App
