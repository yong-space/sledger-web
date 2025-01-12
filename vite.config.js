import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import react from '@vitejs/plugin-react';

export default defineConfig({
    build: {
        target: 'esnext',
        rollupOptions: {
            output: {
                manualChunks: {
                    mui: [
                        '@mui/material',
                        '@mui/styled-engine-sc',
                        '@mui/icons-material',
                    ],
                    muix: [
                        '@mui/lab',
                        '@mui/x-data-grid',
                        '@mui/x-date-pickers',
                    ],
                    react: [
                        "react",
                        "react-dom",
                        "react-router-dom",
                        "react-is",
                        "react-dropzone",
                    ],
                    utils: [
                        "dayjs",
                        "jotai",
                        "randomcolor",
                        "cbor-js",
                        "workbox-build",
                        "workbox-window",
                    ],
                }
            },
        },
    },
    plugins: [
        react(),
        VitePWA({
            workbox: {
                navigateFallbackDenylist: [/^\/api.*/]
            },
            registerType: 'autoUpdate',
            manifest: {
                name: 'Sledger',
                short_name: 'Sledger',
                start_url: '/dash',
                description: 'The savings ledger app',
                background_color: '#375a7f',
                theme_color: '#375a7f',
                icons: [
                    {
                        src: '192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: '512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    },
                    {
                        src: '512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable'
                    }
                ]
            }
        })
    ],
    resolve: {
        alias: {
            '@mui/styled-engine': '@mui/styled-engine-sc',
        },
    },
});
