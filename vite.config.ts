import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  server: {
    allowedHosts: ['connectable-ricky-nonmoveably.ngrok-free.dev']
  },

  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Penalty Rush',
        short_name: 'Penalty Rush',
        description: '5 tirs. Un score. Défends ton pays.',
        theme_color: '#05080d',
        background_color: '#05080d',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        icons: [
          {
            src: 'icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,woff2}']
      }
    })
  ],

  build: {
    target: 'es2022'
  }
});