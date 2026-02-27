import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiBaseUrl = env.BOTTLE_VISION_BASE_URL || 'http://localhost:8000'

  return {
    plugins: [vue()],
    server: {
      proxy: {
        '/api': {
          target: apiBaseUrl,
          changeOrigin: true,
          secure: false,
        },
        '/uploads': {
          target: apiBaseUrl,
          changeOrigin: true,
          secure: false,
        },
        '/outputs': {
          target: apiBaseUrl,
          changeOrigin: true,
          secure: false,
        },
        '/crops': {
          target: apiBaseUrl,
          changeOrigin: true,
          secure: false,
        },
        // Camera stream proxy - note: camera backend runs separately
        '/api/camera': {
          target: apiBaseUrl,
          changeOrigin: true,
          secure: false,
        }
      }
    }
  }
})
