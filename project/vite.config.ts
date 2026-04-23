import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
base: '/'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
