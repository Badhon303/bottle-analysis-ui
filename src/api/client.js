import axios from "axios"

// In development, use relative URL (Vite proxy forwards to backend)
// In production, use the full API base URL from environment variable
const baseURL = import.meta.env.PROD
  ? `${import.meta.env.VITE_API_BASE_URL}/api`
  : "/api"

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
