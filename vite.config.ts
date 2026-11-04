import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Se publica en labs.mondistudio.com.ar/pritiado
export default defineConfig({
  base: '/pritiado/',
  plugins: [react()],
  build: { chunkSizeWarningLimit: 1500 },
})
