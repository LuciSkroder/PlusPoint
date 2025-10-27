import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ command }) => {
  const isDev = command === "serve";

  return {
    base: isDev ? "/" : "/PlusPoint/",
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        manifest: {
          name: "PlusPoint",
          short_name: "PlusPoint",
          description: "A Progressive Web App built with React and Vite",
          start_url: "/PlusPoint/",
          display: "standalone",
          background_color: "#ffffff",
          theme_color: "#0d6efd",
          icons: [
            {
              src: "icons/icon-192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "icons/icon-512.png",
              sizes: "512x512",
              type: "image/png",
            },
            {
              src: "icons/icon-512-maskable.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        },
        workbox: {
          runtimeCaching: [
            {
              urlPattern: ({ request }) => request.destination === "image",
              handler: "CacheFirst",
              options: {
                cacheName: "images-cache",
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                },
              },
            },
            {
              urlPattern: ({ request }) =>
                request.destination === "script" ||
                request.destination === "style",
              handler: "StaleWhileRevalidate",
              options: {
                cacheName: "assets-cache",
              },
            },
          ],
        },
      }),
    ],
  };
});
