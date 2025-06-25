import { defineConfig } from 'vite';
import { resolve } from 'path';
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  root: '.',
  base: 'https://xaveriusyehuda.github.io/story-app-pwa/',
  publicDir: resolve(__dirname, 'src', 'public'),
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto', // Service worker akan didaftarkan secara otomatis
      devOptions: {
        enabled: true // <-- Matikan dev-sw
      },
      injectManifest: {
        swSrc: path.resolve(__dirname, 'src/service-worker.js'), // Path ke service worker kustom Anda
        swDest: 'sw.js', // Output service worker akan berada di `dist/sw.js`
        globDirectory: resolve(__dirname, 'dist'), // Direktori output build Anda
        globPattern: [
          "**/*.{js,wasm,css,html}",
          "assets/index-*.{css, js}",
          "assets/*.{png, jpg}",
          "favicon.png",
          "index.html",
          "manifest.webmanifest",
        ],
        globIgnores: [
          "**/node_modules/**/*",
          "sw.js",
          "workbox-*.js"
        ]
      },
      manifest: {
        id: '/story-app-pwa/',
        name: 'Dicoding Story App',
        short_name: 'CodeStory',
        scope: 'https://xaveriusyehuda.github.io/story-app-pwa/',
        start_url: '.',
        theme_color: '#4CAF50',
        display: 'fullscreen',
        icons: [
          {
            src: 'images/logo-dicoding-story-app-48x48.png',
            sizes: '48x48',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'images/logo-dicoding-story-app-144x144.png',
            sizes: '144x144',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'images/logo-dicoding-story-app-196x196.png',
            sizes: '196x196',
            type: 'image/png',
            purpose: 'any'
          }
        ],
        screenshots: [
          {
            src: 'images/dekstop.png', 
            sizes: '958x576', 
            type: 'image/png',
            form_factor: 'wide'
          },
          {
            src: 'images/mobile.png', 
            sizes: '377x775', 
            type: 'image/png',
            form_factor: 'narrow'
          },
        ]
      }
    })
  ]
});