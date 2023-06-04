import { pipe } from 'ramda'
import { KeyBase } from '../src'

/**
 * merge obj to `window`
 * @param obj
 * @returns
 */
export const defineInWindow = <T>(obj: T) => Object.assign(window, obj)

export const showBlob = (blob: Blob) => blob.arrayBuffer().then(console.log)

export const log = (...args: any[]) => console.log(...args)

export const preventDefault = <T extends Event>(ev: T) => {
  ev.preventDefault()
  return ev
}

export const withPreventDefault = <T extends Event, R>(fn: (ev: T) => R) =>
  pipe(preventDefault, fn)

export const toDataTransfer = (ev: ClipboardEvent | DragEvent) =>
  (ev as ClipboardEvent).clipboardData ?? (ev as DragEvent).dataTransfer

export const matchMagic = async (file: Blob, magic: number[]) => {
  const target = new Uint8Array(magic)
  const source = new Uint8Array(
    await file.slice(0, target.byteLength).arrayBuffer()
  )
  return target.every((v, i) => v === source[i])
}

export const toFileType = async (file: Blob) => {
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

export const createElement = document.createElement.bind(document)
export const createDOM = (target: string) => () => createElement(target)

export const setDOMProps =
  (props: Record<string, any>) => (el: HTMLElement) => {
    Object.entries(props).forEach(([key, value]) => {
      if (key === 'style') {
        Object.entries(value as Record<string, string>).forEach(
          ([key, value]) => el.style.setProperty(key, value)
        )
      } else {
        ;(el as any)[key] = value
      }
    })
    return el
  }

export const addEventListenerWithPreventDefault =
  <K extends keyof HTMLElementEventMap>(target: HTMLElement | null, event: K) =>
  (listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any) => {
    target?.addEventListener(event, withPreventDefault(listener))
  }
