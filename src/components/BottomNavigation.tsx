import chatIcon from '../assets/icon/chat.png'
import homeIcon from '../assets/icon/home.png'
import myIcon from '../assets/icon/my.png'
import routineIcon from '../assets/icon/routine.png'
import './BottomNavigation.css'

const tabs = [
  { screen: 'home', label: '홈', icon: homeIcon, size: 20 },
  { screen: 'chat', label: '대화', icon: chatIcon, size: 19 },
  { screen: 'routine', label: '루틴', icon: routineIcon, size: 17 },
  { screen: 'my', label: '마이', icon: myIcon, size: 19 },
] as const

export type Screen = (typeof tabs)[number]['screen']

type BottomNavigationProps = {
  screen: Screen
  onSelect: (screen: Screen) => void
}

export default function BottomNavigation({ screen, onSelect }: BottomNavigationProps) {
  return (
    <nav className="bottom-navigation" aria-label="주 메뉴">
      {tabs.map((tab) => (
        <button
          key={tab.screen}
          type="button"
          className="bottom-navigation__button"
          aria-current={screen === tab.screen ? 'page' : undefined}
          onClick={() => onSelect(tab.screen)}
        >
          <span className="bottom-navigation__icon-slot" aria-hidden="true">
            <span
              className="bottom-navigation__icon"
              style={{ width: tab.size, height: tab.size, maskImage: `url("${tab.icon}")` }}
            />
          </span>
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
