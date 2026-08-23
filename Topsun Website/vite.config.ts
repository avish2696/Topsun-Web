import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  base: '/',
  plugins: [
    figmaAssetResolver(),
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api/apitxt': {
        target: 'https://apitxt.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/apitxt/, ''),
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.svg', '**/*.csv', '**/*.glb'],
  build: {
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,  // Hide all console logs in production
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash][extname]',
      },
    },
    chunkSizeWarningLimit: 1500,
    cssCodeSplit: true,
    sourcemap: false,
    reportCompressedSize: false,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'motion/react',
      'lucide-react',
      'sonner',
      '@supabase/supabase-js',
    ],
    exclude: ['@vite/env'],
  },
})
