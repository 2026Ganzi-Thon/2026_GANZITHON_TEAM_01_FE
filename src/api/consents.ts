import { writeApi } from './client'

export function saveRequiredConsents() {
  return writeApi('/me/consents', '필수 동의 저장', {
    consents: ['AGE_14_PLUS', 'TERMS_OF_SERVICE', 'PRIVACY_COLLECTION'].map((key) => ({ key, granted: true })),
  }, { method: 'PATCH' })
}
