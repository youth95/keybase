enum TypeSize {
  u8 = 1,
  u16 = 2,
  u32 = 4,
  u64 = 8
}

export class BlobReader {
  constructor (private blob: Blob) {}
  private _cur = 0

  get cur () {
    return this._cur
  }

  private getValue = (view: DataView, size: TypeSize) =>
    ({
      [TypeSize.u8]: () => view.getUint8(0),
      [TypeSize.u16]: () => view.getUint16(0),
      [TypeSize.u32]: () => view.getUint32(0),
      [TypeSize.u64]: () => view.getUint16(0)
    }[size]())

  private buildGetter = (n: TypeSize) => async () => {
    if (this._cur >= this.length) {
      throw new Error(`cur out of ${this.length} to be: ${this._cur}`)
    }
    const value = this.getValue(
      new DataView(
        await this.blob.slice(this._cur, this._cur + n).arrayBuffer()
      ),
      n
    )
    this._cur += n
    return value
  }
  private buildSkiper =
    (n: TypeSize) =>
    (count: number = 1) =>
      this.skip(n * count)

  getU8 = this.buildGetter(TypeSize.u8)
  getU16 = this.buildGetter(TypeSize.u16)
  getU32 = this.buildGetter(TypeSize.u32)
  getU64 = this.buildGetter(TypeSize.u64)

  getStringArray = async (len: number) => {
    let buffer = await this.blob.slice(this.cur, this.cur + len).arrayBuffer()
    const decoder = new TextDecoder()
    const result: string[] = []
    this._cur += len
    return decoder.decode(buffer).split('\0').filter(Boolean)
  }

  skip = (n: number) => {
    this._cur += n
    return this
  }
  skipU8 = this.buildSkiper(TypeSize.u8)
  skipU16 = this.buildSkiper(TypeSize.u16)
  skipU32 = this.buildSkiper(TypeSize.u32)
  skipU64 = this.buildSkiper(TypeSize.u64)

  get length () {
    return this.blob.size
  }
}
