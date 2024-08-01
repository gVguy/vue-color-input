import vue from '@vitejs/plugin-vue'
/** @type {import('vite').UserConfig} */
export default {
  base: '/vue-color-input/',
  build: {
    outDir: './demo',
    emptyOutDir: true
  },
  plugins: [vue()]
}
