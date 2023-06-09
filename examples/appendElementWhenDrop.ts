import { call, pipe } from 'ramda'
import { createDOM, setDOMProps, toFileType } from './utils'
import { assetLoaders } from './assetLoaders'
import { dropzoneDOM } from './dom'

export const appendToDropzoneDOM = (el: Element) => dropzoneDOM?.append(el)

const setBlockGlobalProps = setDOMProps({
  className: 'absolute'
  // draggable: true
})

export const appendElement = async (file: Blob, x = 0, y = 0) => {
  const loaders = Object.values(assetLoaders)
  for (const loader of loaders) {
    if (await loader.use(file)) {
      const { el, props } = loader
      call(
        pipe(
          createDOM(el),
          setBlockGlobalProps,
          setDOMProps(props({ blob: file, x: x - 100, y: y - 50 })),
          appendToDropzoneDOM
        )
      )
      return
    }
  }
  console.log('unknow file type for appendElement', file)
}

export const appendElementWhenDrop = (ev: DragEvent) => {
  for (let i = 0; i < (ev.dataTransfer?.files.length ?? 0); i++) {
    const file = ev.dataTransfer?.files.item(i)
    if (file) {
      appendElement(file, ev.clientX, ev.clientY)
    }
  }
}
