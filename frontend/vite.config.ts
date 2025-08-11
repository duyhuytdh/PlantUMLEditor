import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0', // Allow external connections for Docker
    port: 5173,
    strictPort: true,
    // Proxy removed - frontend now calls Java server directly
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
  }
})
