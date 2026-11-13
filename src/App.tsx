import { useState } from 'react'
import BottomNavigation, { type Screen } from './components/BottomNavigation'
import ChatPage from './pages/chat/ChatPage'
import HomePage from './pages/home/HomePage'
import MyPage from './pages/my/MyPage'
import IntroductionPage from './pages/onboarding/IntroductionPage'
import WelcomePage from './pages/onboarding/WelcomePage'
import RoutinePage from './pages/routine/RoutinePage'

const screens = {
  chat: ChatPage,
  routine: RoutinePage,
  my: MyPage,
}

function App() {
  const [onboarding, setOnboarding] = useState<'welcome' | 'introduction' | 'complete'>('welcome')
  const [screen, setScreen] = useState<Screen>('home')
  const Page = screen === 'home' ? null : screens[screen]

  if (onboarding !== 'complete') {
    return (
      <div className="app-frame">
        {onboarding === 'welcome' ? (
          <WelcomePage onContinue={() => setOnboarding('introduction')} />
        ) : (
          <IntroductionPage
            onBack={() => setOnboarding('welcome')}
            onContinue={() => setOnboarding('complete')}
          />
        )}
      </div>
    )
  }

  return (
    <div className={screen === 'home' ? 'app-frame app-frame--home' : 'app-frame'}>
      <div className="app-layout">
        {Page ? <Page /> : <HomePage onOpenRoutine={() => setScreen('routine')} />}
        <BottomNavigation screen={screen} onSelect={setScreen} />
      </div>
    </div>
  )
}

export default App
