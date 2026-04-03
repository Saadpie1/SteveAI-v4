import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  
  return {
    // Keep your base for GitHub Pages if applicable
    base: '/SteveAI-v4/', 
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      // --- ADD THIS PROXY SECTION ---
      proxy: {
        '/api': {
          target: 'http://localhost:3000', // Your Express Server Port
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
