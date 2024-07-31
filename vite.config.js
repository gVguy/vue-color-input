import vue from '@vitejs/plugin-vue'
import { libInjectCss } from 'vite-plugin-lib-inject-css'
/** @type {import('vite').UserConfig} */
export default {
  build: {
    lib: {
      entry: './src/entry',
      fileName: 'color-input',
      name: 'ColorInput'
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: { vue: 'Vue' },
      },
    },
  },
  plugins: [vue(), libInjectCss()]
}
