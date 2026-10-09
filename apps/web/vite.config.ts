import { defineConfig, type ProxyOptions } from 'vite'
import react from '@vitejs/plugin-react'

const publicPort = Number(process.env.EVERGREEN_PUBLIC_PORT || 4000)
const apiPort = Number(process.env.EVERGREEN_API_PORT || 4301)
if (process.env.VITEST !== 'true' && (![publicPort, apiPort].every(port => Number.isInteger(port) && port > 0 && port <= 65535) || apiPort === publicPort)) {
  throw new Error('EverGreen public and API ports must be distinct valid ports')
}
const apiTarget = `http://127.0.0.1:${apiPort}`
const backendProxy: ProxyOptions = {
  target: apiTarget,
  changeOrigin: true,
  configure(proxy) {
    proxy.on('proxyReq', (proxyReq, req) => {
      // Never pass through an untrusted caller-supplied forwarded address.
      proxyReq.setHeader('X-Forwarded-For', req.socket.remoteAddress || 'unknown')
    })
  },
  rewrite: (path) => path.replace(/^\/api\/backend/, ''),
}

const directApiProxy: ProxyOptions = {
  target: apiTarget,
  changeOrigin: true,
  configure(proxy) {
    proxy.on('proxyReq', (proxyReq, req) => {
      proxyReq.setHeader('X-Forwarded-For', req.socket.remoteAddress || 'unknown')
    })
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: publicPort,
    strictPort: true,
    proxy: {
      '/api/backend': backendProxy,
      '/health': directApiProxy,
      '/auth': directApiProxy,
      '/api/processors': directApiProxy,
      '/api/docs': directApiProxy,
      '/docs': directApiProxy,
    },
  },
  preview: {
    port: publicPort,
    strictPort: true,
    proxy: {
      '/api/backend': backendProxy,
      '/health': directApiProxy,
      '/auth': directApiProxy,
      '/api/processors': directApiProxy,
      '/api/docs': directApiProxy,
      '/docs': directApiProxy,
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
})
