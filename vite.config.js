import { defineConfig, loadEnv } from "vite"
import vue from "@vitejs/plugin-vue"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  const apiBaseUrl = "https://analysis-api.codemonks.dev"

  return {
    plugins: [vue()],

    preview: {
      allowedHosts: ["analysis-ui.codemonks.dev"],
    },

    server: {
      allowedHosts: ["analysis-ui.codemonks.dev"],

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
