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
      chunkSizeWarningLimit: 900,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return undefined;
            if (id.includes('@tiptap')) return 'editor-vendor';
            if (id.includes('@splinetool')) return 'spline-vendor';
            if (id.includes('@react-three/fiber')) return 'r3f-vendor';
            if (id.includes('@react-three/drei') || id.includes('three-stdlib')) return 'drei-vendor';
            if (id.includes('/three/') || id.includes('\\three\\')) return 'three-core';
            if (id.includes('gsap') || id.includes('lenis') || id.includes('motion')) return 'animation-vendor';
            if (id.includes('@tanstack')) return 'table-vendor';
            if (id.includes('react') || id.includes('scheduler')) return 'react-vendor';
            return 'vendor';
          },
        },
      },
    },
  };
});
