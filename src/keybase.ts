import { v4, parse, stringify } from 'uuid'
import { BlobReader } from './BlobReader'

const INDEX_TABLE_ROW_SIZE = 48

interface Asset {
  data: Blob,
  lastUpdateTime: number;
}



export class KeyBase {
  private _assets: Record<string, Asset> = {}
  private types: string[] = []

  readonly dirty: Set<string> = new Set()
  readonly deleted: Set<string> = new Set()

  async load(file: Blob) {
    if (!KeyBase.verify(file)) {
      throw new Error(`not found magic word`)
    }
    this.clear()
    const reader = new BlobReader(file)
    const version = await reader.skipU16().getU16()

    if (version === 1) {
      const indexTableRowCount = await reader.skipU16().getU32()
      const typesDataLength = await reader.getU32()
      const indexTableData = await file
        .slice(
          reader.skipU16().cur,
          reader.cur + INDEX_TABLE_ROW_SIZE * indexTableRowCount
        )
        .arrayBuffer()

      reader.skip(INDEX_TABLE_ROW_SIZE * indexTableRowCount)
      this.types = await reader.getStringArray(typesDataLength)

      for (let i = 0; i < indexTableRowCount; i++) {
        const idb = new Uint8Array(indexTableData, i * INDEX_TABLE_ROW_SIZE, 16)
        const id = stringify(idb)
        const reader = new DataView(
          indexTableData,
          i * INDEX_TABLE_ROW_SIZE + 16
        )
        const addr = reader.getUint32(0)
        const size = reader.getUint32(4)
        const lastUpdateTime = Number(reader.getBigUint64(8))
        const type = reader.getUint16(16)
        this.assets[id] = {
          data: file.slice(addr, addr + size, this.types[type]),
          lastUpdateTime,
        }
      }
    } else {
      throw new Error(`not impl for version ${version}`)
    }
  }

  clear() {
    this._assets = {}
    this.types = []
    this.dirty.clear()
    this.deleted.clear()
  }

  toBlob(): Blob {
    let ids = Array.from(Object.keys(this.assets))
    const indexTableHeaderSize = 2 + 2 + 4 + 6
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

    let assetOffset = 2 + indexTableHeaderSize + indexTableSize + typeIndex.size

    const indexTable = new Blob(
      ids.map(id => {
        const { data: { size, type }, lastUpdateTime } = this.assets[id]
        const view = new DataView(new ArrayBuffer(32))
        view.setUint32(0, assetOffset)
        view.setUint32(4, size)
        view.setBigInt64(8, BigInt(lastUpdateTime))
        view.setUint16(16, this.types.indexOf(type))
        const part = new Blob([
          parse(id),
          view,
        ])
        assetOffset += size
        return part
      })
    )
    const assets = ids.map(id => this.assets[id].data)
    return new Blob(
      ['KB', new Blob([indexTableHeader, indexTable, typeIndex])].concat(
        assets
      ),
      { type: 'application/keybase' }
    )
  }

  set(blob: Blob, id: string = v4(), lastUpdateTime = new Date().valueOf()): string {
    if (blob.type === '') {
      throw new Error('asset must has type')
    }
    if (!this.types.includes(blob.type)) {
      this.types.push(blob.type)
    }
    this.assets[id] = {
      data: blob,
      lastUpdateTime,
    }
    this.dirty.add(id)

    return id
  }

  remove(id: string) {
    delete this._assets[id]
    this.deleted.add(id)
  }

  get assets() {
    return this._assets
  }

  static async verify(file: Blob): Promise<boolean> {
    const reader = new BlobReader(file)
    const magic = await reader.getU16()
    return magic === 19266 // magic === 'KB'
  }
}
