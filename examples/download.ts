import { kb } from './context'

export const download = () => {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(kb.toBlob())
  a.download = 'data.kb'
  a.click()
}
