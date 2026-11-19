import { useEffect, useState } from 'react'
import { getHelpResources, helpResourceHref, type HelpResource } from '../../api/helpResources'
import { ApiError } from '../../api/client'
import '../../styles/my/HelpPage.css'

export default function HelpPage({ onBack }: { onBack: () => void }) {
  const [resources, setResources] = useState<HelpResource[]>()
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    void getHelpResources(controller.signal).then((items) => {
      if (!controller.signal.aborted) setResources(items)
    }, (error: unknown) => {
      if (!controller.signal.aborted) setError(error instanceof ApiError ? error.message : '도움 받을 곳을 불러오지 못했어요.')
    })
    return () => controller.abort()
  }, [retry])

  return (
    <main className="help-page">
      <header className="help-page__header">
        <button type="button" onClick={onBack} aria-label="나 화면으로 돌아가기">
          <svg width="9" height="15" viewBox="0 0 15 24" fill="none" aria-hidden="true">
            <path d="M13 2 3 12l10 10" stroke="currentColor" strokeWidth="3.5" />
          </svg>
        </button>
        <h1>도움 받을 곳</h1>
      </header>
      <div className="help-page__intro">
        <p>혼자 해결하지 못해도 괜찮아요</p>
        <p>지금 필요한 도움을 찾아보세요!</p>
      </div>
      <div className="help-page__cards">
        {!resources && <p role="status">{error || '도움 받을 곳을 불러오는 중이에요.'}</p>}
        {error && <button type="button" onClick={() => { setError(''); setRetry((value) => value + 1) }}>다시 불러오기</button>}
        {resources?.map((resource) => {
          const { situation, name, description, actionType, actionValue } = resource
          const href = helpResourceHref(resource)
          const isPhone = actionType === 'TEL'
          const label = isPhone ? actionValue : '기관 알아보기'
          const urgent = isPhone && actionValue.trim() === '109'

          return (
            <section className="help-page__card" data-urgent={urgent || undefined} key={`${name}:${actionValue}`}>
              <h2>{situation}</h2>
              <div className="help-page__row">
                <div>
                  <h3>{name}</h3>
                  <p>{description}</p>
                </div>
                {href && <a className="help-page__action" data-phone={isPhone} href={href} target={isPhone ? undefined : '_blank'} rel="noopener noreferrer" aria-label={`${name} ${label}`}>
                  <span className="help-page__action-label">{label}</span>
                  {isPhone ? (
                    <span className="help-page__phone-icon" aria-hidden="true" />
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true">
                      <path d="m6 4 4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  )}
                </a>}
              </div>
            </section>
          )
        })}
      </div>
    </main>
  )
}
