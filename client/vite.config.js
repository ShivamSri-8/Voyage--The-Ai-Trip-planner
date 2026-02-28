import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Bind to 0.0.0.0 so the dev server is accessible from phones on the same network
    host: '0.0.0.0',
    port: 5173,
  },
})
