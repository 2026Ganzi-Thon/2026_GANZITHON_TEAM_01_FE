import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { readGoogleCalendarCallback } from './googleCalendarCallback'

const calendarCallback = readGoogleCalendarCallback()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App calendarCallback={calendarCallback} />
  </StrictMode>,
)
