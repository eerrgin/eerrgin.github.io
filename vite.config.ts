import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './', // ÖNEMLİ: Asset yollarını göreceli hale getirir
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
