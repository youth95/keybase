import { matchMagic } from './utils'

export type AssetLoaders = Record<
  string,
  {
    el: string
    use: (blob: Blob) => Promise<boolean>
    props: (params: { blob: Blob; x: number; y: number }) => any
  }
>

export const assetLoaders: AssetLoaders = {
  image: {
    el: 'img',
    use: blob => Promise.resolve(blob.type.includes('image')),
    props: ({ blob, x, y }) => ({
      src: URL.createObjectURL(blob),
      width: 200,
      height: 100,
      style: {
        transform: `translate(${x}px,${y}px)`
      }
    })
  },
  video: {
    el: 'video',
    use: blob => Promise.resolve(blob.type.includes('video')),
    props: ({ blob, x, y }) => ({
      controls: true,
      src: URL.createObjectURL(blob),
      width: 200,
      height: 100,
      style: {
        transform: `translate(${x}px,${y}px)`
      }
    })
  },
  model: {
    el: 'model-viewer',
    use: async blob => matchMagic(blob, [0x67, 0x6c, 0x54, 0x46]),
    props: ({ blob, x, y }) => ({
      ar: true,
      cameraControls: true,
      autoplay: true,
      shadowIntensity: '1',
      src: URL.createObjectURL(blob),
      style: {
        width: '400px',
        height: '200px',
        transform: `translate(${x}px,${y}px)`
      }
    })
  }
}
