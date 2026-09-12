import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Absolute base so nested routes like /car/:slug load /assets/* correctly
  base: '/',
  server: {
    host: true,
    // Allow Cloudflare quick tunnels / other preview hosts
    allowedHosts: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
  },
})
