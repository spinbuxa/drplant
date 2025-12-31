import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  define: {
    // Garante que o process.env.API_KEY seja substituído durante o build
    // Adiciona uma string vazia como fallback para evitar que JSON.stringify receba undefined
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || '')
  }
});