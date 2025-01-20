import { defineConfig, UserConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { seoPlugin } from './vite-seo-plugin';
import fs from 'fs/promises';
import path from 'path';

// Get all dictionary terms
async function getDictionaryTerms() {
  const termsDir = path.join(process.cwd(), 'public/seo/slownik-erp');
  const terms = await fs.readdir(termsDir);
  return terms.filter(term => term !== 'index.html' && term !== 'structured-data.json');
}

export default defineConfig(async (): Promise<UserConfig> => {
  // Get all dictionary terms
  const terms = await getDictionaryTerms();
  
  // Create input entries for all dictionary terms
  const termEntries = Object.fromEntries(
    terms.map(term => [
      `slownik-${term}`,
      resolve(__dirname, `slownik-erp/${term}/index.html`)
    ])
  );

  return {
    base: '/',
    plugins: [
      react(),
      seoPlugin()
    ],
    server: {
      port: 5173,
      host: true,
      open: true,
      fs: {
        strict: true,
        allow: ['..']
      }
    },
    preview: {
      port: 4173,
      host: true,
      strictPort: true
    },
    appType: 'spa',
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
      manifest: true,
      cssCodeSplit: false,
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          compare: resolve(__dirname, 'porownaj-systemy-erp/index.html'),
          systems: resolve(__dirname, 'systemy-erp/index.html'),
          partners: resolve(__dirname, 'partnerzy/index.html'),
          cost: resolve(__dirname, 'koszt-wdrozenia-erp/index.html'),
          dictionary: resolve(__dirname, 'slownik-erp/index.html'),
          calculator: resolve(__dirname, 'kalkulator/index.html'),
          anegis: resolve(__dirname, 'partnerzy/anegis/index.html'),
          asseco: resolve(__dirname, 'partnerzy/asseco-business-solutions/index.html'),
          axians: resolve(__dirname, 'partnerzy/axians/index.html'),
          bpsc: resolve(__dirname, 'partnerzy/bpsc/index.html'),
          deveho: resolve(__dirname, 'partnerzy/deveho-consulting/index.html'),
          digitland: resolve(__dirname, 'partnerzy/digitland/index.html'),
          enova: resolve(__dirname, 'partnerzy/enova/index.html'),
          ipcc: resolve(__dirname, 'partnerzy/ipcc/index.html'),
          itintegro: resolve(__dirname, 'partnerzy/it.integro/index.html'),
          proalpha: resolve(__dirname, 'partnerzy/proalpha/index.html'),
          rambase: resolve(__dirname, 'partnerzy/rambase/index.html'),
          rho: resolve(__dirname, 'partnerzy/rho-software/index.html'),
          sente: resolve(__dirname, 'partnerzy/sente/index.html'),
          simple: resolve(__dirname, 'partnerzy/simple/index.html'),
          streamsoft: resolve(__dirname, 'partnerzy/streamsoft/index.html'),
          symfonia: resolve(__dirname, 'partnerzy/symfonia/index.html'),
          sygrnity: resolve(__dirname, 'partnerzy/sygrnity-business-solutions/index.html'),
          vendo: resolve(__dirname, 'partnerzy/vendo.erp/index.html'),
          ...termEntries
        },
        output: {
          assetFileNames: (assetInfo) => {
            if (!assetInfo.name) return 'assets/[name]-[hash][extname]';
            const extType = assetInfo.name.split('.')[1];
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
              return `assets/images/[name]-[hash][extname]`;
            }
            if (/css/i.test(extType)) {
              return `assets/css/[name]-[hash][extname]`;
            }
            return `assets/[name]-[hash][extname]`;
          },
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          manualChunks: {
            vendor: ['react', 'react-dom'],
            main: ['/src/main.tsx']
          }
        }
      },
      modulePreload: {
        polyfill: false
      }
    },
    optimizeDeps: {
      include: ['react', 'react-dom']
    }
  };
});