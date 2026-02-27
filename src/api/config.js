import apiClient from './client';

export default {
    // Get configuration
    getConfig() {
        return apiClient.get('/config');
    },

    // Update configuration
    updateConfig(data) {
        return apiClient.put('/config', data);
    }
};
