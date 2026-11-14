import { useState, type RefObject } from 'react'
import { DayPicker } from 'react-day-picker'
import { ko } from 'react-day-picker/locale'
import 'react-day-picker/style.css'

const weekdays = new Intl.DateTimeFormat('en-US', { weekday: 'short' })

export default function ChatCalendar({ dialogRef }: { dialogRef: RefObject<HTMLDialogElement | null> }) {
  const [selected, setSelected] = useState<Date | undefined>(() => new Date())

  return (
    <dialog
      className="chat-calendar-dialog"
      ref={dialogRef}
      aria-label="대화 캘린더"
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close()
      }}
    >
      <DayPicker
        mode="single"
        locale={ko}
        weekStartsOn={0}
        selected={selected}
        onSelect={setSelected}
        navLayout="after"
        formatters={{ formatWeekdayName: (date) => weekdays.format(date) }}
      />
    </dialog>
  )
}
