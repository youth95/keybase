import { kb } from './context'

export const download = async () => {
  if ('showSaveFilePicker' in window) {
    const file = await (window as any).showSaveFilePicker({
      suggestedName: 'data.kb'
    })

    const writableStream = await file.createWritable()
    await writableStream.write(kb.toBlob())
    await writableStream.close()
  } else {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(kb.toBlob())
    a.download = 'data.kb'
    a.click()
  }
}
