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
          start_url: "./",
          display: "standalone",
          background_color: "#fff9ec",
          theme_color: "#4CAF50",
          icons: [
            { src: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
            { src: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
          ],
        },
      }),
    ],
  };
});
