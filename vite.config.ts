import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // GitHub Pages serves the site from /espresso-explorer/. Set to '/' if you move it to a
  // custom domain or a host that serves from the root.
  base: '/espresso-explorer/',
  plugins: [
    react(),
    tailwindcss(),
    /**
     * Installable from a phone's share menu: own icon, no browser chrome, and
     * it keeps working on a plane. `autoUpdate` means a push to main is all it
     * takes to update every installed copy — there is no store review in the
     * middle, which is most of the reason to ship it this way.
     *
     * Icons come from `scripts/generate-icons.js` via `prebuild`, so they are
     * drawn from the same mark as the favicon rather than committed as
     * bitmaps. `base` supplies scope and start_url; do not hardcode them, or
     * moving the site to a custom domain silently breaks installation.
     */
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'Espresso Explorer',
        // What actually fits under a home-screen icon.
        short_name: 'Espresso',
        description:
          'Take home espresso machines apart in 3D and find the one that belongs on your counter.',
        theme_color: '#17120F',
        background_color: '#14100E',
        display: 'standalone',
        orientation: 'portrait',
        categories: ['shopping', 'lifestyle'],
        icons: [
          { src: 'icons/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/pwa-512.png', sizes: '512x512', type: 'image/png' },
          {
            // Android crops this to the launcher's shape; the mark is inset to
            // survive it. Without a maskable entry the OS crops the standard
            // icon instead and clips the cup.
            src: 'icons/pwa-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        // three-stack is ~1.2 MB on its own. Precaching it is the whole point:
        // it is what lets a machine page open its 3D viewer offline.
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        // Client-side routes have no file behind them; without this, opening
        // the installed app on /finder offline gives the browser's error page.
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            // The three families are loaded from Google's CDN, so they are not
            // in the precache. Left alone, an offline launch silently falls
            // back to system fonts and the whole type system disappears.
            urlPattern: /^https:\/\/fonts\.googleapis\.com\//,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-stylesheets' },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-files',
              expiration: { maxEntries: 24, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
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
