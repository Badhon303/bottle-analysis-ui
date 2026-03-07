import apiClient from './client';

// Base URL for camera endpoints (uses different port or same backend)
const CAMERA_BASE = '/camera';

export default {
    // Get camera status
    getStatus() {
        return apiClient.get(`${CAMERA_BASE}/status`);
    },

    // Connect to camera
    connect() {
        return apiClient.post(`${CAMERA_BASE}/connect`);
    },

    // Disconnect from camera
    disconnect() {
        return apiClient.post(`${CAMERA_BASE}/disconnect`);
    },

    // Start capturing snapshots
    startSnapshots(config = {}) {
        return apiClient.post(`${CAMERA_BASE}/snapshots/start`, config);
    },

    // Stop capturing snapshots
    stopSnapshots() {
        return apiClient.post(`${CAMERA_BASE}/snapshots/stop`);
    },

    // Get single snapshot (returns blob URL)
    async getSnapshot() {
        const response = await apiClient.get(`${CAMERA_BASE}/snapshot`, {
            responseType: 'blob'
        });
        return URL.createObjectURL(response.data);
    },

    // Get stream URL (for <img> src with MJPEG)
    getStreamUrl() {
        // In development, use the proxy
        // In production, use the full URL
        const baseUrl = import.meta.env.PROD
            ? import.meta.env.BOTTLE_VISION_BASE_URL
            : '';
        return `${baseUrl}/api${CAMERA_BASE}/stream`;
    }
};
