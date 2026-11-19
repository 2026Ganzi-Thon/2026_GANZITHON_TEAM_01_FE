import type { SavedCheckIn } from '../../api/checkIns'

const moods = {
  '편안해요': 'CALM',
  '괜찮아요': 'OKAY',
  '그냥 그래요': 'SO_SO',
  '불안해요': 'ANXIOUS',
  '지쳤어요': 'TIRED',
  '기타': 'OTHER',
} as const

const stressors = {
  '취업·업무': 'WORK',
  '미래에 대한 걱정': 'FUTURE_WORRY',
  '다른 사람과의 비교': 'COMPARISON',
  '인간관계': 'RELATIONSHIP',
  '특별한 이유 없음': 'NO_REASON',
  '기타': 'OTHER',
} as const

const supportNeeds = {
  '따뜻한 위로': 'COMFORT',
  '마음 털어놓기': 'VENT',
  '잠깐 쉬어가기': 'SHORT_BREAK',
  '작은 행동 추천': 'SMALL_ACTION',
} as const

export const checkInSteps = [
  {
    question: '오늘 마음은 어떤가요?',
    description: '지금 느끼는 마음을 골라주세요!',
    options: Object.keys(moods),
  },
  {
    question: '무엇이 마음을 무겁게 했나요?',
    description: '오늘 가장 신경 쓰였던 일을 알려주세요.',
    options: Object.keys(stressors),
  },
  {
    question: '지금 어떤 도움이 필요해요?',
    description: '솜이 오늘의 마음을 함께 돌봐줄게요.',
    options: Object.keys(supportNeeds),
  },
  {
    question: '어젯밤 잠은 얼마나 잤나요?',
    description: '정확하지 않아도 괜찮아요',
    options: ['4시간 이하', '5~6시간', '7~8시간', '9시간 이상'],
  },
]

export function buildCheckInRequest([mood, stressor, supportNeed]: string[]) {
  return {
    mood: moods[mood as keyof typeof moods],
    stressors: stressor ? [stressors[stressor as keyof typeof stressors]] : undefined,
    supportNeed: supportNeeds[supportNeed as keyof typeof supportNeeds],
  }
}

function findAnswer(options: Record<string, string>, value: string | null | undefined) {
  return Object.keys(options).find((label) => options[label] === value) ?? ''
}

export function restoreCheckInAnswers(checkIn: SavedCheckIn | null) {
  if (!checkIn) return []
  return [
    findAnswer(moods, checkIn.mood),
    findAnswer(stressors, checkIn.stressors[0]),
    findAnswer(supportNeeds, checkIn.supportNeed),
  ]
}
