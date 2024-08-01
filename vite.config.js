import vue from '@vitejs/plugin-vue'
import { libInjectCss } from 'vite-plugin-lib-inject-css'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

/** @type {import('vite').UserConfig} */
export default {
  logLevel: 'info',
  build: {
    lib: {
      entry: resolve(__dirname, 'src/entry.ts'),
      fileName: 'color-input',
      name: 'ColorInput',
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: { vue: 'Vue' },
      },
    },
  },
  plugins: [
    vue(),
    dts({
      rollupTypes: true,
      tsconfigPath: resolve(__dirname, 'tsconfig.app.json'),
    }), 
    libInjectCss()
  ]
}

