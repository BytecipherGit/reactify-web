import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3001,
    open: true,
    // Proxy API requests to avoid CORS issues in development
    proxy: {
      '/api': {
        target: 'https://app.reeltoksocial.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path, // Keep /api prefix
        // Configure proxy to handle all methods including OPTIONS
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.error('Proxy error:', err)
          })
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Proxying request:', req.method, req.url)
          })
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received response:', proxyRes.statusCode, req.url)
          })
        },
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
