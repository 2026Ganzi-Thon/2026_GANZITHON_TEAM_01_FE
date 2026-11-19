import { useEffect, useState, type RefObject } from 'react'
import { DayPicker } from 'react-day-picker'
import { ko } from 'react-day-picker/locale'
import { getChatDates } from '../../api/chat'
import 'react-day-picker/style.css'

const weekdays = new Intl.DateTimeFormat('en-US', { weekday: 'short' })

function calendarDate(value: string) {
  return new Date(`${value}T12:00:00`)
}

function dateKey(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export default function ChatCalendar({ dialogRef, isOpen, selectedDate, today, onClose, onSelect }: {
  dialogRef: RefObject<HTMLDialogElement | null>
  isOpen: boolean
  selectedDate: string
  today: string
  onClose: () => void
  onSelect: (date: string) => void
}) {
  const [month, setMonth] = useState(() => calendarDate(selectedDate))
  const [result, setResult] = useState<{ month: string; dates: string[]; failed?: boolean }>()
  const monthKey = dateKey(month).slice(0, 7)
  const monthResult = result?.month === monthKey ? result : undefined

  useEffect(() => {
    if (!isOpen) return
    const controller = new AbortController()
    void getChatDates(monthKey, controller.signal).then((dates) => {
      if (!controller.signal.aborted) setResult({ month: monthKey, dates })
    }, () => {
      if (!controller.signal.aborted) setResult({ month: monthKey, dates: [], failed: true })
    })
    return () => controller.abort()
  }, [isOpen, monthKey])

  return (
    <dialog
      className="chat-calendar-dialog"
      ref={dialogRef}
      aria-label="대화 캘린더"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close()
      }}
    >
      <DayPicker
        mode="single"
        locale={ko}
        weekStartsOn={0}
        selected={calendarDate(selectedDate)}
        month={month}
        onMonthChange={setMonth}
        today={calendarDate(today)}
        endMonth={calendarDate(today)}
        disabled={{ after: calendarDate(today) }}
        modifiers={{ hasChat: (monthResult?.dates ?? []).map(calendarDate) }}
        modifiersClassNames={{ hasChat: 'chat-calendar__has-chat' }}
        onSelect={(date) => {
          if (!date) return
          onSelect(dateKey(date))
          dialogRef.current?.close()
        }}
        navLayout="after"
        formatters={{ formatWeekdayName: (date) => weekdays.format(date) }}
      />
      {monthResult?.failed && <p role="status">대화가 있는 날짜를 표시할 수 없어요. 날짜를 눌러 대화를 조회할 수 있어요.</p>}
    </dialog>
  )
}
