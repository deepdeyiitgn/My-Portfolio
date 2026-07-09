import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// 👇 YEH LINE ADD KARO 👇
import vitePrerender from 'vite-plugin-prerender';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(), 
      tailwindcss(),

      // 👇 YAHAN SE ADD KARNA SHURU KARO 👇
      vitePrerender({
        staticDir: path.join(__dirname, 'dist'),
        routes: [
          '/', '/about', '/me', '/contact', '/faq', '/feature', 
          '/portfolio', '/links', '/proof', '/journal', '/now', 
          '/legal', '/terms', '/privacy', '/dmca', '/copyright', 
          '/live', '/search', '/status', '/user', '/feedback',
          '/projects', '/projects/transparent-clock', '/projects/quicklink', '/projects/studybot', '/projects/personal-portfolio', '/projects/qlynk-node-server',
          '/user/owner', '/user/108378384135281109285', '/user/103350525420119609015', '/user/108546736464141807623',
          '/journal/view/6a3b728fea40f18e35fe537e', '/journal/view/6a364487e7d3429ef5437377', '/journal/view/6a1afdbaef3f827e6e5726d7', '/journal/view/6a0ef24159d82f5693e1ad60', '/journal/view/6a06c878d94656fbf2914c27', '/journal/view/6a001e7cfab7dafa47fe8daa', '/journal/view/69f5d1462a36a7dff2cbeca8', '/journal/view/69f7747757e35596332311d1', '/journal/view/69f1e775d3a5c766762ccae4', '/journal/view/69ef331a5298467d02a43969', '/journal/view/69eb999218b9adae7a75dbee', '/journal/view/69e8d2a2acfbc8a63a18bec6'
        ],
        puppeteer: {
          headless: "new",
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
      }),
      // 👆 YAHAN TAK ADD KARO 👆
      
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
                !url.href.includes('qlynk.me') && 
                !url.href.includes('deydeep-static-files.hf.space') &&
                !url.href.includes('gstatic.com') &&
                !url.href.includes('googleusercontent.com'),
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
              urlPattern: /^https:\/\/(.*\.qlynk\.me|.*\.gstatic\.com|.*\.googleusercontent\.com|deydeep-static-files\.hf\.space)\/.*/i,
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
