import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // GitHub Pages serves the site from /espresso-explorer/. Set to '/' if you move it to a
  // custom domain or a host that serves from the root.
  base: '/espresso-explorer/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    // three.js alone clears the default 500 kB advisory; the split below is
    // deliberate, so raise the bar rather than warning on every build.
    chunkSizeWarningLimit: 1400,
    rollupOptions: {
      output: {
        // three.js and drei are ~1.2 MB together and are needed by every view
        // that draws a machine. Keeping them in one vendor chunk means one
        // request, cached across routes, and never on the landing page's
        // critical path — both 3D routes and the hero canvas load lazily.
        manualChunks(id) {
          if (id.includes('node_modules/three') || id.includes('@react-three')) {
            return 'three-stack'
          }
          return undefined
        },
      },
    },
  },
})
