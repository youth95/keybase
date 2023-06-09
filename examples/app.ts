import { pipe } from 'ramda'
import { saveToKeybaseFromBlobs } from './saveToKeybase'
import { kb } from './context'
;(self as any).kb = kb

export const saveToKeybase = pipe(saveToKeybaseFromBlobs, () => kb)
