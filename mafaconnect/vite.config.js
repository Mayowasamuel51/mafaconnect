import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => ({
  server: {
    host: "localhost", // 🟢 safer for Windows/local dev
    port: 8081, // 🟢 change to match your frontend port
    strictPort: true,
    cors: true,
    hmr: {
      protocol: "ws",
      host: "localhost",
      port: 8081, // 🟢 match the same port
    },
  },

  plugins: [
    react(),
    mode === "development" && componentTagger(),

    // 🟣 PWA only active in production — disabled for dev to avoid SW cache issues
    mode === "production" &&
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["favicon.ico", "robots.txt", "sounds/notification.mp3"],
        manifest: {
          name: "MAFA Connect",
          short_name: "MAFA",
          description: "Professional point of sale and retail management system",
          theme_color: "#6366f1",
          background_color: "#ffffff",
          display: "standalone",
          orientation: "portrait",
          start_url: "/",
          icons: [
            {
              src: "/icon-192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any maskable",
            },
            {
              src: "/icon-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any maskable",
            },
          ],
        },
        workbox: {
          cleanupOutdatedCaches: true,
          skipWaiting: true,
          clientsClaim: true,
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
              handler: "NetworkFirst",
              options: {
                cacheName: "supabase-cache",
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24, // 24 hours
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
      }),
  ].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom"],
  },
}));



// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react"; // 👈 standard React plugin (not SWC)
// import path from "path";
// import { componentTagger } from "lovable-tagger";
// import { VitePWA } from "vite-plugin-pwa";

// // https://vitejs.dev/config/
// export default defineConfig(({ mode }) => ({
//   server: {
//     host: "::",
//     port: 8080,
//   },
//   plugins: [
//     react(),
//     mode === "development" && componentTagger(),
//     VitePWA({
//       registerType: "autoUpdate",
//       includeAssets: ["favicon.ico", "robots.txt", "sounds/notification.mp3"],
//       manifest: {
//         name: "MAFA Connect",
//         short_name: "MAFA",
//         description: "Professional point of sale and retail management system",
//         theme_color: "#6366f1",
//         background_color: "#ffffff",
//         display: "standalone",
//         orientation: "portrait",
//         start_url: "/",
//         icons: [
//           {
//             src: "/icon-192.png",
//             sizes: "192x192",
//             type: "image/png",
//             purpose: "any maskable",
//           },
//           {
//             src: "/icon-512.png",
//             sizes: "512x512",
//             type: "image/png",
//             purpose: "any maskable",
//           },
//         ],
//       },
//       workbox: {
//         cleanupOutdatedCaches: true,
//         skipWaiting: true,
//         clientsClaim: true,
//         runtimeCaching: [
//           {
//             urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
//             handler: "NetworkFirst",
//             options: {
//               cacheName: "supabase-cache",
//               expiration: {
//                 maxEntries: 100,
//                 maxAgeSeconds: 60 * 60 * 24, // 24 hours
//               },
//               cacheableResponse: {
//                 statuses: [0, 200],
//               },
//             },
//           },
//         ],
//       },
//     }),
//   ].filter(Boolean),

//   resolve: {
//     alias: {
//       "@": path.resolve(__dirname, "./src"),
//     },
//     dedupe: ["react", "react-dom"],
//   },
// }));


// // import { defineConfig } from "vite";
// // import react from "@vitejs/plugin-react";
// // import path from "path";

// // // https://vitejs.dev/config/
// // export default defineConfig({
// //   plugins: [react()],
// //   resolve: {
// //     alias: {
// //       "@": path.resolve(__dirname, "./src"), // 👈 enables "@/..." imports
// //     },
// //   },
// // });

// // // import { defineConfig } from 'vite'
// // // import react from '@vitejs/plugin-react'

// // // // https://vite.dev/config/
// // // export default defineConfig({
// // //   plugins: [react()],
// // // })
