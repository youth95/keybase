import { KeyBase } from '../src'

export const kb = new KeyBase()

export const runtime = {
  schema: {
    positions: {} as Record<string, number[]>
  }
}
export const mainId = '00000000-0000-0000-0000-000000000000'
export const dropzoneDOM = document.getElementById('dropzone')
