import { kb } from './context'

export const saveToLocal = () => {
  const conn = indexedDB.open('kb-files')
  conn.addEventListener('upgradeneeded', ev => {
    const db = conn.result
    if (!db.objectStoreNames.contains('files')) {
      db.createObjectStore('files', { keyPath: 'id' })
    }
  })
  conn.addEventListener('success', ev => {
    const db = conn.result
    const transaction = db.transaction(['files'], 'readwrite')
    for (const id of Object.keys(kb.assets)) {
      transaction.objectStore('files').add({ id, value: kb.assets[id] })
    }
  })
}
