import { pipe } from 'ramda'
import { KeyBase } from '../src'
import { defineInWindow } from './utils'

const dropzoneDOM = document.getElementById('dropzone')
const mainId = '00000000-0000-0000-0000-000000000000'
const kb = new KeyBase()

let schema = {
  positions: {} as Record<string, number[]>
}

const showElementFromKB = async () => {
  schema = JSON.parse(
    new TextDecoder().decode(await kb.assets[mainId].arrayBuffer())
  )
  Object.keys(schema.positions).forEach(id => {
    const [x, y] = schema.positions[id]
    appendElement(kb.assets[id], x, y)
  })
}

const saveToLocal = () => {
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
const loadFromLocal = () => {
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
      showElementFromKB()
    })
  })
}

const appendImage = (blob: Blob, x = 0, y = 0) => {
  const image = document.createElement('img')
  image.src = URL.createObjectURL(blob)
  image.className = 'absolute'
  image.width = 200
  image.height = 100
  image.style.transform = `translate(${x}px,${y}px)`
  dropzoneDOM?.append(image)
}

const appendVideo = (blob: Blob, x = 0, y = 0) => {
  const video = document.createElement('video')
  video.controls = true
  video.src = URL.createObjectURL(blob)
  video.className = 'absolute'
  video.width = 200
  video.height = 100
  video.style.transform = `translate(${x}px,${y}px)`
  dropzoneDOM?.append(video)
}

const appendModelViewer = (blob: Blob, x = 0, y = 0) => {
  const modelViewer: any = document.createElement('model-viewer')
  modelViewer.ar = true
  modelViewer.cameraControls = true
  modelViewer.autoplay = true
  modelViewer['shadow-intensity'] = '1'
  modelViewer['touch-action'] = 'pan-y'

  modelViewer.src = URL.createObjectURL(blob)
  modelViewer.className = 'absolute'
  modelViewer.style.width = '400px'
  modelViewer.style.height = '200px'
  modelViewer.style.transform = `translate(${x}px,${y}px)`
  dropzoneDOM?.append(modelViewer)
}

const appendElement = async (file: Blob, x = 0, y = 0) => {
  const fileType = await toFileType(file)
  if (fileType.includes('image')) {
    appendImage(file, x - 100, y - 50)
  } else if (fileType.includes('video')) {
    appendVideo(file, x - 100, y - 50)
  } else if (fileType.includes('model')) {
    appendModelViewer(file, x - 200, y - 100)
  } else {
    console.log('unknow file type for appendElement', fileType)
  }
}

const fetchKBFromNetwork = () => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.responseType = 'blob'
    xhr.open('GET', 'http://localhost:3000/data.kb', true)
    xhr.onload = async ev => {
      await kb.load(xhr.response)
      resolve(xhr.response)
      console.log(kb)
    }
    xhr.onprogress = ev => {
      console.log(ev)
    }
    xhr.onerror = reject
    xhr.send()
  })
}

const fetchKBFromNetworkFullStep = async () => {
  await fetchKBFromNetwork()
  saveToLocal()
  await showElementFromKB()
}

const matchMagic = async (file: Blob, magic: number[]) => {
  const target = new Uint8Array(magic)
  const source = new Uint8Array(
    await file.slice(0, target.byteLength).arrayBuffer()
  )
  return target.every((v, i) => v === source[i])
}

const toFileType = async (file: Blob) => {
  if (file.type !== '') {
    return file.type
  }
  if (await matchMagic(file, [0x67, 0x6c, 0x54, 0x46])) {
    return 'model/gltf-binary'
  }
  if (await KeyBase.verify(file)) {
    return 'application/keybase'
  }
  return 'application/binary'
}

const toBlobs = async (dataTransfer: DataTransfer | null) => {
  if (!dataTransfer) {
    return []
  }
  const [type] = dataTransfer.types
  let blobs: Blob[] = []
  if (type !== 'Files') {
    blobs = [
      new Blob([dataTransfer.getData(type)], {
        type: !type ? 'application/binary' : type
      })
    ]
  } else {
    for (let i = 0; i < dataTransfer.files.length; i++) {
      const file = dataTransfer.files.item(i)!
      blobs.push(
        new Blob([file], {
          type: !file.type ? await toFileType(file) : file.type
        })
      )
    }
  }
  return blobs
}

const showKB = () => console.log(kb)
const toDataTransfer = (ev: ClipboardEvent | DragEvent) =>
  (ev as ClipboardEvent).clipboardData ?? (ev as DragEvent).dataTransfer

const toKB = async (ev: DragEvent) => {
  const blobs = await pipe(toDataTransfer, toBlobs)(ev)
  for (const blob of blobs) {
    if (blob.type === 'application/keybase') {
      kb.load(blob)
    } else {
      const id = kb.set(blob)
      schema.positions[id] = [ev.clientX, ev.clientY]
      kb.set(
        new Blob([JSON.stringify(schema)], { type: 'application/json' }),
        mainId
      )
    }
  }
  showKB()
}

const appendElementWhenDrop = (ev: DragEvent) => {
  for (let i = 0; i < (ev.dataTransfer?.files.length ?? 0); i++) {
    const file = ev.dataTransfer?.files.item(i)
    if (file) {
      appendElement(file, ev.clientX, ev.clientY)
    }
  }
}

const preventDefault = <T extends Event>(ev: T) => {
  ev.preventDefault()
  return ev
}

const drapzoneDOMAddEventListener =
  dropzoneDOM!.addEventListener.bind(dropzoneDOM)

const hidePlacehodler = (ev: DragEvent) => {
  if (placeholder) {
    placeholder.style.display = 'none'
  }
}

drapzoneDOMAddEventListener('drop', pipe(preventDefault, toKB))
drapzoneDOMAddEventListener('drop', pipe(preventDefault, appendElementWhenDrop))
drapzoneDOMAddEventListener('drop', pipe(preventDefault, hidePlacehodler))

const placeholder = document.getElementById('dropzone-placeholder')
const showPlaceholder = (ev: DragEvent) => {
  if (placeholder) {
    placeholder.style.display = 'block'
    placeholder.style.transform = `translate(${ev.clientX - 100}px,${
      ev.clientY - 50
    }px)`
  }
}
drapzoneDOMAddEventListener('dragover', pipe(preventDefault, showPlaceholder))

defineInWindow({
  kb,
  showElementFromKB,
  saveToLocal,
  loadFromLocal,
  fetchKBFromNetwork,
  fetchKBFromNetworkFullStep,
  showBlob: (blob: Blob) => blob.arrayBuffer().then(console.log),
  download: () => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(kb.toBlob())
    a.download = 'data.kb'
    a.click()
  }
})
