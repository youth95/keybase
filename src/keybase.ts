import { v4, parse } from 'uuid'
import { toMemSnapshot } from './utils';




const INDEX_TABLE_ROW_SIZE = 16 + 4 + 4 + 2 + 6

export class KeyBase {
    private assets: Record<string, Blob> = {};
    private types: string[] = []

    async load(file: Blob) {
        this.assets = {}
        const dataView = new DataView(await file.slice(0, 4).arrayBuffer())
        const version = dataView.getUint16(0);
        if (version === 1) {
            throw new Error('not impl yet')
        } else {
            throw new Error(`not impl for version ${version}`)
        }
    }

    toBlob(): Blob {
        const ids = Array.from(Object.keys(this.assets))
        const indexTableHeaderSize = 2 + 2 + 4 + 8
        const indexTableSize = Number(INDEX_TABLE_ROW_SIZE) * (ids.length)
        let assetOffset = indexTableHeaderSize + indexTableSize

        const indexTableHeader = new DataView(new ArrayBuffer(indexTableHeaderSize))
        const indexTable = new DataView(new ArrayBuffer(indexTableSize))
        const typeIndex = new Blob(this.types.map(type => new Blob([type, new Uint8Array(1)])));
        // write header metas
        ids.forEach((id, i) => {
            const { size, type } = this.assets[id];
            new Uint8Array(indexTable.buffer, i * INDEX_TABLE_ROW_SIZE + indexTableHeaderSize).set(parse(id)) // id
            indexTable.setUint32(i * INDEX_TABLE_ROW_SIZE, assetOffset + typeIndex.size) // addr
            indexTable.setUint32(i * INDEX_TABLE_ROW_SIZE + 4, size)//  size
            indexTable.setUint16(i * INDEX_TABLE_ROW_SIZE + 4 + 4, this.types.indexOf(type) ?? 0)// mime type
            assetOffset += size
        })
        indexTableHeader.setUint16(0, 1);
        indexTableHeader.setUint32(2, ids.length);

        const assets = ids.map(id => this.assets[id]);
        return new Blob([
            new Blob([
                indexTableHeader,
                indexTable
            ]),
            typeIndex,
        ].concat(assets))
    }

    set(blob: Blob, id: string = v4()): string {
        if (blob.type === '') {
            throw new Error('asset must has type')
        }
        if (!this.types.includes(blob.type)) {
            this.types.push(blob.type);
        }
        this.assets[id] = blob
        return id
    }


}