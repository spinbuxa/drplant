import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false, // Desabilitado para produção para economizar memória no build
    target: 'esnext',
  },
  define: {
    // Garante fallback seguro para evitar erros de undefined
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || '')
  }
});