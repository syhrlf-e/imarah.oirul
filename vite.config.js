import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
    server: {
        host: "127.0.0.1",
    },
    plugins: [
        laravel({
            input: "resources/js/app.tsx",
            refresh: true,
        }),
        react(),
        VitePWA({
            outDir: "public",
            buildBase: "/",
            scope: "/",
            injectRegister: "auto",
            manifest: false,
            workbox: {
                navigateFallback: null,
                globPatterns: ["build/assets/**/*.{js,css,woff2,png,svg}"],
                runtimeCaching: [
                    {
                        urlPattern: ({ url }) => {
                            const p = url.pathname;
                            return (
                                p.startsWith("/kas") ||
                                p.startsWith("/zakat") ||
                                p.startsWith("/laporan") ||
                                p.startsWith("/tromol")
                            );
                        },
                        handler: "NetworkOnly",
                    },
                ],
            },
        }),
    ],
    test: {
        globals: true,
        environment: "jsdom",
        setupFiles: "./resources/js/setupTests.ts",
    },
});
