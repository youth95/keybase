import { v4, parse, stringify } from 'uuid'
import { BlobReader } from './BlobReader'

const INDEX_TABLE_ROW_SIZE = 16 + 4 + 4 + 2 + 6

export class KeyBase {
  private _assets: Record<string, Blob> = {}
  private types: string[] = []

  async load (file: Blob) {
    this._assets = {}
    const reader = new BlobReader(file)
    const version = await reader.getU16()
    if (version === 1) {
      const indexTableRowCount = await reader.skipU16().getU32()
      const typesDataLength = await reader.getU32()
      const indexTableData = await file
        .slice(
          reader.skipU32().cur,
          reader.cur + INDEX_TABLE_ROW_SIZE * indexTableRowCount
        )
        .arrayBuffer()

      reader.skip(INDEX_TABLE_ROW_SIZE * indexTableRowCount)
      this.types = await reader.getStringArray(typesDataLength)

      for (let i = 0; i < indexTableRowCount; i++) {
        const id = stringify(
          new Uint8Array(indexTableData, i * INDEX_TABLE_ROW_SIZE, 16)
        )
        const reader = new DataView(
          indexTableData,
          i * INDEX_TABLE_ROW_SIZE + 16
        )
        const addr = reader.getUint32(0)
        const size = reader.getUint32(4)
        const type = reader.getUint16(8)
        this.assets[id] = file.slice(addr, addr + size, this.types[type])
      }
    } else {
      throw new Error(`not impl for version ${version}`)
    }
  }

  toBlob (): Blob {
    const ids = Array.from(Object.keys(this.assets))
    const indexTableHeaderSize = 2 + 2 + 4 + 8
    const indexTableSize = Number(INDEX_TABLE_ROW_SIZE) * ids.length

    const indexTableHeader = new DataView(new ArrayBuffer(indexTableHeaderSize))
    indexTableHeader.setUint16(0, 1)
    indexTableHeader.setUint32(4, ids.length)

    let typeIndex = new Blob(
      this.types.map(type => new Blob([type, new Uint8Array(1)]))
    )

    typeIndex = new Blob([
      typeIndex,
      new Uint8Array(32 - (typeIndex.size % 16))
    ])

    indexTableHeader.setUint32(8, typeIndex.size)

    let assetOffset = indexTableHeaderSize + indexTableSize + typeIndex.size

    const indexTable = new Blob(
      ids.map(id => {
        const { size, type } = this.assets[id]
        const addrAndSize = new DataView(new ArrayBuffer(8))
        addrAndSize.setUint32(0, assetOffset)
        addrAndSize.setUint32(4, size)
        const typePart = new DataView(new ArrayBuffer(2))
        typePart.setUint16(0, this.types.indexOf(type))
        const part = new Blob([
          parse(id),
          addrAndSize,
          typePart,
          new Uint8Array(6)
        ])
        assetOffset += size
        return part
      })
    )
    const assets = ids.map(id => this.assets[id])
    return new Blob(
      [new Blob([indexTableHeader, indexTable, typeIndex])].concat(assets),
      { type: 'application/keybase' }
    )
  }

  set (blob: Blob, id: string = v4()): string {
    if (blob.type === '') {
      throw new Error('asset must has type')
    }
    if (!this.types.includes(blob.type)) {
      this.types.push(blob.type)
    }
    this.assets[id] = blob
    return id
  }

  get assets () {
    return this._assets
  }
}
