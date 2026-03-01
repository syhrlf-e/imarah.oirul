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
            input: [
                "resources/js/app.tsx",
                "resources/js/Pages/Dashboard.tsx", // explicit entry agar muncul di manifest sebagai top-level key
            ],
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
                    {
                        urlPattern: ({ url }) => {
                            return url.pathname.match(
                                /\.(?:png|jpg|jpeg|svg|gif|webp|woff2|woff|ttf)$/i,
                            );
                        },
                        handler: "CacheFirst",
                        options: {
                            cacheName: "assets-cache",
                            expiration: {
                                maxEntries: 100,
                                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
                            },
                        },
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
