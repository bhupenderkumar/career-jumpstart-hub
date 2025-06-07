import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api/jobs': {
        target: 'https://remoteok.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/jobs/, '/api'),
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; JobScraper/1.0)',
        }
      },
      '/api/web3career': {
        target: 'https://web3.career',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/web3career/, ''),
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; JobScraper/1.0)',
        }
      }
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt'],
      manifest: {
        name: 'Career Jumpstart Hub',
        short_name: 'Career Hub',
        description: 'AI-powered resume builder and career jumpstart platform',
        theme_color: '#000000',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
