import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp}'],
          runtimeCaching: [
            {
              // 1. API Data Rule (Vercel Backend)
              urlPattern: /\/api\/.*/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'portfolio-api-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 30
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              // 2. Local Images (Exclude explicitly external CDNs here)
              urlPattern: ({ request, url }) => 
                request.destination === 'image' && 
                !url.href.includes('static.qlynk.me') && 
                !url.href.includes('deydeep-static-files.hf.space'),
              handler: 'CacheFirst',
              options: {
                cacheName: 'portfolio-local-image-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 30
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              // 3. SPECIAL RULE: Custom CDNs (qlynk & hf.space)
              urlPattern: /^https:\/\/(static\.qlynk\.me|deydeep-static-files\.hf\.space)\/.*/i,
              handler: 'CacheFirst', 
              options: {
                cacheName: 'external-cdn-cache',
                expiration: {
                  maxEntries: 200, 
                  maxAgeSeconds: 60 * 60 * 24 * 30 
                },
                cacheableResponse: {
                  statuses: [0, 200] 
                }
              }
            }
          ]
        },
        manifest: {
          name: 'Deep Dey | Software Architect',
          short_name: 'Deep Dey',
          theme_color: '#ffffff',
          background_color: '#ffffff',
          display: 'standalone',
          icons: [
            {
              src: '/android-chrome-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: '/android-chrome-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        }
      })
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
