import { call, pipe } from 'ramda'
import { log, toDataTransfer, toFileType } from './utils'
import { kb, mainId, runtime } from './context'

interface Context extends DragEvent {
  blobs?: Promise<Blob[]>
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

const attachBlobs = (ev: Context): Context => {
  const blobs = call(pipe(toDataTransfer, toBlobs), ev)
  return {
    ...ev,
    blobs
  }
}

export const saveToKeybase = pipe(attachBlobs, async context => {
  const blobs = await context.blobs
  for (const blob of blobs ?? []) {
    if (blob.type === 'application/keybase') {
      kb.load(blob)
    } else {
      const id = kb.set(blob)
      runtime.schema.positions[id] = [context.clientX, context.clientY]
      kb.set(
        new Blob([JSON.stringify(runtime.schema)], {
          type: 'application/json'
        }),
        mainId
      )
    }
  }
  log(kb)
  return context
})
