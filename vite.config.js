import { defineConfig, loadEnv } from "vite"
import vue from "@vitejs/plugin-vue"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  const apiBaseUrl = env.BOTTLE_VISION_BASE_URL || "http://localhost:8000"

  return {
    plugins: [vue()],
    // --- ADD THIS SECTION ---
    preview: {
      allowedHosts: ["analysis-ui.codemonks.dev"],
    },
    // If you encounter this during dev/start, add this too:
    server: {
      allowedHosts: ["analysis-ui.codemonks.dev"],
      // --- END OF NEW SECTION ---
      proxy: {
        "/api": {
          target: apiBaseUrl,
          changeOrigin: true,
          secure: false,
        },
        "/uploads": {
          target: apiBaseUrl,
          changeOrigin: true,
          secure: false,
        },
        "/outputs": {
          target: apiBaseUrl,
          changeOrigin: true,
          secure: false,
        },
        "/crops": {
          target: apiBaseUrl,
          changeOrigin: true,
          secure: false,
        },
        "/api/camera": {
          target: apiBaseUrl,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
