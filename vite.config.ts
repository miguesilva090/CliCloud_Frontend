
import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5177,
    
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),

      // fix loading all icon chunks in dev mode
      // https://github.com/tabler/tabler-icons/issues/1233
      '@tabler/icons-react': '@tabler/icons-react/dist/esm/icons/index.mjs',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React chunk
          'react-core': ['react', 'react-dom', 'react-router-dom'],

          // State management and data fetching
          'data-management': ['@tanstack/react-query', 'zustand', 'axios'],

          // Form handling
          'form-handling': ['react-hook-form', '@hookform/resolvers', 'zod'],

          // UI Components - Radix
          'radix-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-select',
            '@radix-ui/react-label',
            '@radix-ui/react-slot',
            '@radix-ui/react-switch',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-tabs',
          ],

          // UI Components - Custom
          'ui-components': [
            '@/components/ui/button',
            '@/components/ui/form',
            '@/components/ui/input',
            '@/components/ui/select',
            '@/components/ui/switch',
            '@/components/ui/label',
            '@/components/ui/dialog',
            '@/components/ui/checkbox',
          ],

          // Charts and visualization
          charts: ['recharts'],

          // Date handling
          'date-utils': ['date-fns'],

          // Icons
          icons: ['@tabler/icons-react', 'lucide-react'],

          // 3D libraries - split into separate chunk (heavy dependencies)
          'three-js': ['three', '@react-three/fiber', '@react-three/drei'],

          // Split into separate chunks
          'country-select': ['react-flags-select'],
          'country-data': ['@/data/countries'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
})
