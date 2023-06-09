import { defineConfig } from 'vite'
import { comlink } from 'vite-plugin-comlink'
import * as path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      src: path.resolve(__dirname, './src')
    }
  },
  worker: {
    plugins: [comlink()]
  },
  plugins: [comlink()]
})
