import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node'
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  assetsInclude: ['**/*.json']
})
