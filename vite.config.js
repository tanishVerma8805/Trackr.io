import { defineConfig } from 'vite'
import react from '@vitejs/react-plugin'
import tailwindcss from '@tailwindcss/vite' // 1. Import it here

// https://vitejs.dev
export default defineConfig({
  plugins: [
    react(),
    
  ],
})
