import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import {defineConfig} from 'vite';

const configDirectory = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(configDirectory, '.'),
      },
      dedupe: ['react', 'react-dom'],
    },
    server: {
      // HMR configuration for development stability.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    // Keep discovery bounded on Windows while converting the CommonJS cookie
    // dependency that React Router imports through its ESM build.
    optimizeDeps: {
      noDiscovery: true,
      include: [
        'react',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'react-dom',
        'react-dom/client',
        'react-router-dom',
        'react-router',
        'react-router > cookie',
        'lucide-react',
        'motion/react',
        'clsx',
        'tailwind-merge',
        'dompurify',
        '@tiptap/react',
        'use-sync-external-store',
        'use-sync-external-store/shim',
        'use-sync-external-store/shim/with-selector',
      ],
    },
    build: {
      chunkSizeWarningLimit: 500,
    },
  };
});
