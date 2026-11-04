import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Vista previa autocontenida (un solo HTML) para revisar en el celular
export default defineConfig({
  base: './',
  plugins: [react(), viteSingleFile()],
  build: { outDir: 'dist-preview', chunkSizeWarningLimit: 4000 },
})
