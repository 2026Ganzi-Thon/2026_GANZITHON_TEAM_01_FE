import chatIcon from '../assets/icon/chat.png'
import chatSelectedIcon from '../assets/icon/chat_check.png'
import homeIcon from '../assets/icon/home.png'
import homeSelectedIcon from '../assets/icon/home_check.png'
import myIcon from '../assets/icon/my.png'
import mySelectedIcon from '../assets/icon/my_check.png'
import routineIcon from '../assets/icon/routine.png'
import routineSelectedIcon from '../assets/icon/routine_check.png'
import './BottomNavigation.css'

const tabs = [
  { screen: 'home', label: '홈', icon: homeIcon, selectedIcon: homeSelectedIcon, size: 20 },
  { screen: 'chat', label: '대화', icon: chatIcon, selectedIcon: chatSelectedIcon, size: 19 },
  { screen: 'routine', label: '루틴', icon: routineIcon, selectedIcon: routineSelectedIcon, size: 17 },
  { screen: 'my', label: '마이', icon: myIcon, selectedIcon: mySelectedIcon, size: 19 },
] as const

export type Screen = (typeof tabs)[number]['screen']

type BottomNavigationProps = {
  screen: Screen
  onSelect: (screen: Screen) => void
}

export default function BottomNavigation({ screen, onSelect }: BottomNavigationProps) {
  return (
    <nav className="bottom-navigation" aria-label="주 메뉴">
      <div className="bottom-navigation__tabs">
        {tabs.map((tab) => (
          <button
            key={tab.screen}
            type="button"
            className="bottom-navigation__button"
            aria-current={screen === tab.screen ? 'page' : undefined}
            onClick={() => onSelect(tab.screen)}
          >
            <span className="bottom-navigation__icon-slot" aria-hidden="true">
              {screen === tab.screen ? (
                <img src={tab.selectedIcon} alt="" width={tab.size} height={tab.size} />
              ) : (
                <span
                  className="bottom-navigation__icon"
                  style={{ width: tab.size, height: tab.size, maskImage: `url("${tab.icon}")` }}
                />
              )}
            </span>
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
