import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    nodePolyfills({
      // Enable polyfills for specific globals and modules
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  server: {
    proxy: {
      // Proxy API calls to the Go backend during development
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('🚨 Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('🔄 Proxying request:', req.method, req.url, '→', proxyReq.path);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('✅ Proxy response:', req.method, req.url, '→', proxyRes.statusCode);
          });
        },
      },
      // Direct proxy for health checks and other endpoints that don't use /api prefix
      '/healthz': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/nema': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
