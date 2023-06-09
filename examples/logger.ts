import { KeyBase } from '../src'

const kb = new KeyBase()

;(self as any).kb = kb

let isDirty = false
let saved = true

const id = '00000000-0000-0000-0000-000000000001'

export const log = (...args: any) => {
  const newBlob = new Blob(
    [new Blob([kb.assets[id]?.data, args]).slice(-1024 * 1024)],
    { type: 'appliaction/logs' }
  )
  kb.set(newBlob, id)
  isDirty = true
}

const saveToFile = () => {
  if (isDirty && saved) {
    saved = false
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
      const target = kb.assets['00000000-0000-0000-0000-000000000001']
      const h = transaction.objectStore('files').put({ id, value: target })
      h.addEventListener('success', () => {
        isDirty = false
        saved = true
      })
    })
    conn.addEventListener('error', console.error.bind(console))
  }
  requestAnimationFrame(saveToFile)
}

saveToFile()
