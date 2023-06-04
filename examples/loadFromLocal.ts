import { kb } from './context'
import { showElementFromKeybaseInstance } from './showElementFromKeybaseInstance'

export const loadFromLocal = () => {
  kb.clear()
  const conn = indexedDB.open('kb-files')
  conn.addEventListener('success', ev => {
    const db = conn.result
    const transaction = db.transaction(['files'], 'readonly')
    const request = transaction.objectStore('files').getAll()
    request.addEventListener('success', () => {
      for (const { id, value } of request.result) {
        kb.set(value, id)
      }
      showElementFromKeybaseInstance()
    })
  })
}
