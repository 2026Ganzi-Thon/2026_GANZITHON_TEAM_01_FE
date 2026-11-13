import { useState } from 'react'
import BottomNavigation, { type Screen } from './components/BottomNavigation'
import ChatPage from './pages/chat/ChatPage'
import HomePage from './pages/home/HomePage'
import MyPage from './pages/my/MyPage'
import WelcomePage from './pages/onboarding/WelcomePage'
import RoutinePage from './pages/routine/RoutinePage'

const screens = {
  chat: ChatPage,
  routine: RoutinePage,
  my: MyPage,
}

function App() {
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false)
  const [screen, setScreen] = useState<Screen>('home')
  const Page = screen === 'home' ? null : screens[screen]

  if (!hasSeenWelcome) {
    return (
      <div className="app-frame">
        <WelcomePage onContinue={() => setHasSeenWelcome(true)} />
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
