import callIcon from '../../assets/icon/call.png'
import '../../styles/my/HelpPage.css'

const resources = [
  {
    title: '마음이 지치고 힘들 때',
    name: '정신 건강 복지 센터',
    description: '심리 상담과 지역 전문기관 연계',
    label: '기관 알아보기',
    href: 'https://mentalhealth.go.kr/portal/health/fac/PotalHealthFacListTab1.do?tab1no=tab1no4',
  },
  {
    title: '취업 준비가 막막할 때',
    name: '대학 일자리 플러스 센터',
    description: '진로 · 취업 상담 및 프로그램',
    label: '고용 24',
    href: 'https://www.work24.go.kr/cm/c/f/1100/selecSystInfo.do?systClId=SC00000194&systId=SI00000337',
  },
  {
    title: '직장 문제로 힘들 때',
    name: '고용 노동부 고객상담 센터',
    description: '근로조건 · 임금 · 노동 관련 상담',
    label: '1350',
    href: 'tel:1350',
  },
  {
    title: '지금 당장 도움이 필요할 때',
    name: '자살예방상담전화',
    description: '24시간 상담 가능',
    label: '109',
    href: 'tel:+82109?oai_link_source=model_response_hotline',
    urgent: true,
  },
]

export default function HelpPage({ onBack }: { onBack: () => void }) {
  return (
    <main className="help-page">
      <header className="help-page__header">
        <button type="button" onClick={onBack} aria-label="나 화면으로 돌아가기">
          <svg width="15" height="24" viewBox="0 0 15 24" fill="none" aria-hidden="true">
            <path d="M13 2 3 12l10 10" stroke="currentColor" strokeWidth="3.5" />
          </svg>
        </button>
        <h1>도움 받을 곳</h1>
      </header>
      <div className="help-page__intro">
        <p>혼자 해결하지 않아도 괜찮아요</p>
        <p>지금 필요한 도움을 찾아보세요!</p>
      </div>
      <div className="help-page__cards">
        {resources.map(({ title, name, description, label, href, urgent }) => {
          const isPhone = href.startsWith('tel:')

          return (
            <section className="help-page__card" data-urgent={urgent} key={title}>
              <h2>{title}</h2>
              <div className="help-page__row">
                <div>
                  <h3>{name}</h3>
                  <p>{description}</p>
                </div>
                <a className="help-page__action" href={href} aria-label={`${name} ${label}`}>
                  {label}
                  {isPhone ? (
                    <img src={callIcon} width="15" height="15" alt="" />
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true">
                      <path d="m6 4 4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  )}
                </a>
              </div>
            </section>
          )
        })}
      </div>
    </main>
  )
}
