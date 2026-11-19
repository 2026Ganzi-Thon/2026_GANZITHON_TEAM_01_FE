import { readApi } from './client'

export type HelpResource = {
  situation: string
  name: string
  description: string
  actionType: 'LINK' | 'TEL'
  actionValue: string
}

export function getHelpResources(signal: AbortSignal) {
  return readApi<HelpResource[]>('/help-resources', '도움 받을 곳 불러오기', signal)
}

export function helpResourceHref({ actionType, actionValue }: HelpResource) {
  if (actionType === 'LINK' && /^https?:\/\//i.test(actionValue)) return actionValue
  if (actionType === 'TEL' && /^\+?\d[\d -]*$/.test(actionValue)) return `tel:${actionValue.replace(/[ -]/g, '')}`
}
