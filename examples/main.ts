import { pipe } from 'ramda'
import { KeyBase } from '../src'

const kb = new KeyBase()

;(window as any).kb = kb
;(window as any).download = () => {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(kb.toBlob())
  a.download = 'data.kb'
  a.click()
}
;(window as any).appendImage = (blob: Blob) => {
  const image = document.createElement('img')
  image.src = URL.createObjectURL(blob)
  dropzoneDOM?.append(image)
}
;(window as any).fetchKBFromNetwork = async () => {
  const xhr = new XMLHttpRequest()
  xhr.responseType = 'blob'
  xhr.open('GET', 'http://localhost:3000/data.kb', true)
  xhr.onload = async ev => {
    await kb.load(xhr.response)
    console.log(kb)
  }
  xhr.onprogress = ev => {
    console.log(ev)
  }
  xhr.send()
}

const toBlobs = (dataTransfer: DataTransfer | null) => {
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
          type: !file.type ? 'application/binary' : file.type
        })
      )
    }
  }
  console.log(blobs)
  return blobs
}

const appendBlobs = (blobs: Blob[]) => blobs.forEach(blob => kb.set(blob))

const main = pipe(toBlobs, appendBlobs)

window.addEventListener('paste', ev => {
  main(ev.clipboardData)
})

const dropzoneDOM = document.getElementById('dropzone')

dropzoneDOM?.addEventListener('drop', ev => {
  ev.preventDefault()
  main(ev.dataTransfer)
})

dropzoneDOM?.addEventListener('dragover', ev => ev.preventDefault())

const loadDOM = document.getElementById('load')

loadDOM?.addEventListener('change', ev => {
  const file = (ev.target as HTMLInputElement).files?.item(0)
  if (file) {
    kb.load(file)
  }
  console.log(kb)
})
