export const toMemSnapshot = (data: ArrayBuffer) => {
    const seq = Array.from(new Uint8Array(data)).map(n => n.toString(16).padStart(2, '0')).reduce((all: string[][], one, i) => {
        const ch = Math.floor(i / 16);
        all[ch] = ([] as string[]).concat((all[ch] || ([] as string[])), one);
        return all
    }, []).map(row => row.join(' '))
    return seq.join('\n')
}