import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],resolve: {
    alias: {
      '@arcgis/core': resolve(__dirname, 'node_modules/@arcgis/core')
    }
  },
  optimizeDeps: {
    include: ['@arcgis/core/assets/esri/themes/light/main.css']
  }
  
})
