import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        // Improve chunking for better caching and reduced unused JS
        rollupOptions: {
          output: {
            manualChunks: {
              'vendor-react': ['react', 'react-dom'],
              'vendor-supabase': ['@supabase/supabase-js'],
            }
          }
        },
        // Target modern browsers for smaller bundles
        target: 'es2020',
        // Minify with esbuild for faster builds
        minify: 'esbuild',
        // Enable CSS code splitting
        cssCodeSplit: true,
      }
    };
});
