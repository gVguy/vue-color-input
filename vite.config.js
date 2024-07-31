import vue from '@vitejs/plugin-vue'
/** @type {import('vite').UserConfig} */
export default {
  build: {
    lib: {
      entry: './src/entry',
      fileName: 'color-input',
      name: 'ColorInput'
    },
    rollupOptions: {
      external: ['vue']
    },
  },
  plugins: [vue()]
}
