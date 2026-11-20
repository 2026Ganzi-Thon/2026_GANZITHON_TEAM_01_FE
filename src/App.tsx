import { useCallback, useEffect, useState } from 'react'
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
import { requestGoogleCalendarAuthorization } from './api/googleCalendar'
import type { RoutineTarget } from './api/routines'
import { todayInSeoul } from './serviceDate'
import type { CalendarCallbackResult } from './googleCalendarCallback'

type Navigation = { screen: Screen; initialRoutine?: RoutineTarget; initialCheckInDate?: string }

const pendingSignupKey = 'pending-signup-login'

function readPendingSignupLogin() {
  try {
    return sessionStorage.getItem(pendingSignupKey) ?? undefined
  } catch {
    return undefined
  }
}

const calendarCallbackMessages = {
  cancelled: '연결이 취소됐어요. 필요하면 다시 연결해 주세요.',
  error: '구글 캘린더를 연결하지 못했어요. 다시 시도해 주세요.',
}

function App({ calendarCallback }: { calendarCallback?: Promise<CalendarCallbackResult> }) {
  const [onboarding, setOnboarding] = useState<'welcome' | 'login' | 'introduction' | 'consent' | 'signup' | 'nickname' | 'situation' | 'summary' | 'calendar' | 'complete'>('welcome')
  const [nickname, setNickname] = useState('')
  const [pendingConsentLoginId, setPendingConsentLoginId] = useState(readPendingSignupLogin)
  const [activeLoginId, setActiveLoginId] = useState('')
  const [profileStep, setProfileStep] = useState(0)
  const [profileAnswers, setProfileAnswers] = useState<string[][]>(() => profileSteps.map(() => []))
  const [{ screen, initialRoutine, initialCheckInDate }, setNavigation] = useState<Navigation>({ screen: 'home' })
  const [showHelp, setShowHelp] = useState(() => window.location.hash === '#help')
  const [retryCalendarAfterLogin, setRetryCalendarAfterLogin] = useState(false)
  const [calendarConnecting, setCalendarConnecting] = useState(false)
  const [calendarError, setCalendarError] = useState('')
  const [calendarResult, setCalendarResult] = useState<Exclude<CalendarCallbackResult, { status: 'success' }>>()
  const [callbackDismissed, setCallbackDismissed] = useState(false)
  const [callbackContinuing, setCallbackContinuing] = useState(false)

  const closeHelp = useCallback(() => {
    if (window.location.hash === '#help') {
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
    }
    setShowHelp(false)
  }, [])

  const showHome = useCallback((loginId: string, initialCheckInDate?: string) => {
    setActiveLoginId(loginId)
    closeHelp()
    setNavigation({ screen: 'home', initialCheckInDate })
    setOnboarding('complete')
  }, [closeHelp])

  const dismissCalendarCallback = useCallback(() => {
    window.history.replaceState(window.history.state, '', '/')
    setCallbackDismissed(true)
  }, [])

  useEffect(() => {
    function updateHelpPage() {
      setShowHelp(window.location.hash === '#help')
    }

    window.addEventListener('hashchange', updateHelpPage)
    return () => window.removeEventListener('hashchange', updateHelpPage)
  }, [])

  useEffect(() => {
    function resumeCalendarActions(event: PageTransitionEvent) {
      if (event.persisted) setCalendarConnecting(false)
    }
    window.addEventListener('pageshow', resumeCalendarActions)
    return () => window.removeEventListener('pageshow', resumeCalendarActions)
  }, [])

  useEffect(() => {
    if (!calendarCallback) return
    let mounted = true
    void calendarCallback.then((result) => {
      if (!mounted) return
      if (result.status === 'success') {
        dismissCalendarCallback()
        showHome(result.loginId)
      } else {
        setCalendarResult(result)
      }
    })
    return () => { mounted = false }
  }, [calendarCallback, dismissCalendarCallback, showHome])

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

  function rememberPendingSignup(loginId?: string) {
    setPendingConsentLoginId(loginId)
    try {
      if (loginId) sessionStorage.setItem(pendingSignupKey, loginId)
      else sessionStorage.removeItem(pendingSignupKey)
    } catch {
      // The signup flow can still continue in this page.
    }
  }

  async function openHome(loginId: string) {
    const date = todayInSeoul()
    const checkIn = await getCheckIn(date, AbortSignal.timeout(8_000)).catch(() => undefined)
    showHome(loginId, checkIn === null ? date : undefined)
  }

  async function connectCalendar() {
    if (calendarConnecting) return
    setCalendarConnecting(true)
    setCalendarError('')
    try {
      const authorizationUrl = await requestGoogleCalendarAuthorization()
      window.location.assign(authorizationUrl)
    } catch (error) {
      setCalendarError(error instanceof Error && !(error instanceof TypeError)
        ? error.message
        : '구글 캘린더를 연결할 수 없어요. 잠시 후 다시 시도해 주세요.')
      setCalendarConnecting(false)
    }
  }

  async function finishLogin(loginId: string) {
    const firstSignupLogin = pendingConsentLoginId === loginId
    if (firstSignupLogin) {
      await saveRequiredConsents()
      rememberPendingSignup()
    }
    if (firstSignupLogin || retryCalendarAfterLogin) {
      setActiveLoginId(loginId)
      setOnboarding('calendar')
      if (retryCalendarAfterLogin) {
        setRetryCalendarAfterLogin(false)
        await connectCalendar()
      }
      return
    }
    await openHome(loginId)
  }

  async function leaveCalendarCallback() {
    if (callbackContinuing) return
    setCallbackContinuing(true)
    if (calendarResult?.loginId) await openHome(calendarResult.loginId)
    else setOnboarding('login')
    dismissCalendarCallback()
  }

  function closeCalendarPage() {
    setCalendarError('')
    void openHome(activeLoginId)
  }

  function retryCalendarCallback() {
    dismissCalendarCallback()
    const loginId = calendarResult?.loginId
    if (!loginId) {
      setRetryCalendarAfterLogin(true)
      setOnboarding('login')
      return
    }
    setActiveLoginId(loginId)
    setOnboarding('calendar')
    void connectCalendar()
  }

  if (calendarCallback && !callbackDismissed) {
    const status = calendarResult
      ? calendarResult.message ?? calendarCallbackMessages[calendarResult.status]
      : '구글 캘린더를 연결하고 있어요.'
    return (
      <div className="app-frame">
        <CalendarConnectPage
          status={status}
          onBack={() => void leaveCalendarCallback()}
          onSkip={() => void leaveCalendarCallback()}
          onConnect={retryCalendarCallback}
          busy={!calendarResult || callbackContinuing}
        />
      </div>
    )
  }

  if (onboarding !== 'complete') {
    return (
      <div className="app-frame">
        {onboarding === 'welcome' ? (
          <WelcomePage onContinue={() => setOnboarding('introduction')} onLogin={() => setOnboarding('login')} />
        ) : onboarding === 'login' ? (
          <LoginPage
            onLogin={finishLogin}
            onSignup={() => {
              setRetryCalendarAfterLogin(false)
              setOnboarding('consent')
            }}
          />
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
              rememberPendingSignup(loginId)
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
            onContinue={() => setOnboarding('login')}
          />
        ) : onboarding === 'calendar' ? (
          <CalendarConnectPage
            onBack={closeCalendarPage}
            onSkip={closeCalendarPage}
            onConnect={() => void connectCalendar()}
            busy={calendarConnecting}
            status={calendarConnecting ? '구글 캘린더 연결을 준비하고 있어요.' : calendarError}
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
