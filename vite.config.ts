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
  // 对于 GitHub Pages，使用 '/' 作为 base
  // 如果部署到子路径，改为 '/repo-name/'
  base: '/',
})
