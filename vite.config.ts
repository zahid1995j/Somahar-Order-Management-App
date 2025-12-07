import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // 1. Load Environment Variables
    const env = loadEnv(mode, '.', '');

    return {
        // 💥 CRITICAL FIX FOR NETLIFY ASSET LOADING 💥
        // Setting base to '/' works best when combined with the 
        // rewrite rule in netlify.toml for a Single Page Application (SPA).
        base: '/',
        
        server: {
            port: 3000,
            host: '0.0.0.0',
        },
        
        plugins: [react()],
        
        // Define is used to make environment variables accessible globally
        define: {
            // Note: Use 'import.meta.env.VITE_...' in your components instead of 'process.env'
            'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
            'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
        },
        
        resolve: {
            alias: {
                // Path alias for cleaner imports (e.g., import X from '@/components/Y')
                '@': path.resolve(__dirname, '.'),
            }
        }
    };
});
