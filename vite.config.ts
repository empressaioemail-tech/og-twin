import { defineConfig } from 'vite'
import { copyFileSync } from 'fs'
import { resolve } from 'path'

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
  assetsInclude: ['**/*.json'],
  build: {
    // Skip HTML transformation entirely - mockup is self-contained
    rollupOptions: {
      input: []
    },
    copyPublicDir: true
  },
  plugins: [
    {
      name: 'copy-index-html',
      closeBundle() {
        // Copy index.html directly to dist without parsing
        copyFileSync(
          resolve(__dirname, 'index.html'),
          resolve(__dirname, 'dist/index.html')
        )
        console.log('✓ Copied index.html to dist (bypassing HTML parser)')
      }
    }
  ]
})
