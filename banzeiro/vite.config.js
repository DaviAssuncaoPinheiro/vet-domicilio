import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('framer-motion') || id.includes('motion-dom') || id.includes('motion-utils')) return 'motion'
          if (id.includes('@phosphor-icons')) return 'icons'
          if (id.includes('@dnd-kit')) return 'dnd'
          if (id.includes('qrcode')) return 'qr'
          if (id.includes('react') || id.includes('scheduler') || id.includes('zustand')) return 'react'
        },
      },
    },
  },
})
