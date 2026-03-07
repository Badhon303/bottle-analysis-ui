import axios from "axios"

// In development, use relative URL (Vite proxy forwards to backend)
// In production, use the full API base URL from environment variable
const baseURL = import.meta.env.PROD
  ? `${import.meta.env.VITE_BOTTLE_VISION_BASE_URL}/api`
  : "/api"

// Helper to get full URL for assets (images, etc.)
export const getAssetUrl = (path) => {
  if (!path) return ""
  if (
    path.startsWith("http") ||
    path.startsWith("blob:") ||
    path.startsWith("data:")
  ) {
    return path
  }

  const base = import.meta.env.PROD
    ? import.meta.env.VITE_BOTTLE_VISION_BASE_URL
    : ""

  // Ensure path starts with /
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return `${base}${normalizedPath}`
}

const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response || error.message)
    return Promise.reject(error)
  },
)

export default apiClient
