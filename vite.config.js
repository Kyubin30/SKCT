import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// GitHub Pages serves this project at https://<user>.github.io/SKCT/, not at
// the domain root, so every asset URL needs the /SKCT/ prefix baked in.
export default defineConfig({
  base: '/SKCT/',
  plugins: [react()],
})
