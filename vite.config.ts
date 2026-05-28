import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Všetky requesty začínajúce na /v2 presmeruje Vite na Spring Boot
      '/v2': {
        target: 'http://localhost:9090/be4fe',
        changeOrigin: true,
        secure: false, // Ak by tvoj lokálny backend bežal na HTTPS s neplatným certifikátom
      },
    },
  },
})
