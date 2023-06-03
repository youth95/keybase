import { KeyBase } from './keybase'
import { toMemSnapshot as serialize } from './utils'
import { test, expect } from 'vitest'

expect.addSnapshotSerializer({
  test: val => val instanceof Uint8Array,
  serialize
})

test('should to blob', async () => {
  const keybase = new KeyBase()
  keybase.set(
    new Blob([new Uint8Array(16).fill(18)], { type: 'application/data' }),
    '39c72e7d-0001-4e0d-a03d-db7089b705f7'
  )

  const take = async (keyBase: KeyBase) =>
    new Uint8Array(await keyBase.toBlob().arrayBuffer())

  expect(await take(keybase)).toMatchInlineSnapshot(`
      00 01 00 00 00 00 00 01 00 00 00 30 00 00 00 00
      39 c7 2e 7d 00 01 4e 0d a0 3d db 70 89 b7 05 f7
      00 00 00 60 00 00 00 10 00 00 00 00 00 00 00 00
      61 70 70 6c 69 63 61 74 69 6f 6e 2f 64 61 74 61
      00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
      00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
      12 12 12 12 12 12 12 12 12 12 12 12 12 12 12 12
    `)

  keybase.set(
    new Blob([new Uint8Array(16).fill(22)], { type: 'image/png' }),
    '39c72e7d-0000-4e0d-a03d-db7089b705f7'
  )

  expect(await take(keybase)).toMatchInlineSnapshot(`
      00 01 00 00 00 00 00 02 00 00 00 30 00 00 00 00
      39 c7 2e 7d 00 01 4e 0d a0 3d db 70 89 b7 05 f7
      00 00 00 80 00 00 00 10 00 00 00 00 00 00 00 00
      39 c7 2e 7d 00 00 4e 0d a0 3d db 70 89 b7 05 f7
      00 00 00 90 00 00 00 10 00 01 00 00 00 00 00 00
      61 70 70 6c 69 63 61 74 69 6f 6e 2f 64 61 74 61
      00 69 6d 61 67 65 2f 70 6e 67 00 00 00 00 00 00
      00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
      12 12 12 12 12 12 12 12 12 12 12 12 12 12 12 12
      16 16 16 16 16 16 16 16 16 16 16 16 16 16 16 16
    `)

  const kb = new KeyBase()
  await kb.load(keybase.toBlob())
  expect(await take(kb)).toMatchInlineSnapshot(`
    00 01 00 00 00 00 00 02 00 00 00 30 00 00 00 00
    39 c7 2e 7d 00 01 4e 0d a0 3d db 70 89 b7 05 f7
    00 00 00 80 00 00 00 10 00 00 00 00 00 00 00 00
    39 c7 2e 7d 00 00 4e 0d a0 3d db 70 89 b7 05 f7
    00 00 00 90 00 00 00 10 00 01 00 00 00 00 00 00
    61 70 70 6c 69 63 61 74 69 6f 6e 2f 64 61 74 61
    00 69 6d 61 67 65 2f 70 6e 67 00 00 00 00 00 00
    00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
    12 12 12 12 12 12 12 12 12 12 12 12 12 12 12 12
    16 16 16 16 16 16 16 16 16 16 16 16 16 16 16 16
  `)

  console.log(kb.assets)

  
  expect(serialize(await take(kb))).equal(serialize(await take(keybase)))

})
