import apiClient from './client';

export default {
    // Create a new batch (upload video)
    createBatch(formData) {
        return apiClient.post('/batches', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    // Get all batches
    getBatches(params) {
        return apiClient.get('/batches', { params });
    },

    // Get a specific batch
    getBatch(id) {
        return apiClient.get(`/batches/${id}`);
    },

    // Get bottles in a batch
    getBatchBottles(id, params) {
        return apiClient.get(`/batches/${id}/bottles`, { params });
    },

    // Get clusters in a batch
    getBatchClusters(id) {
        return apiClient.get(`/batches/${id}/clusters`);
    },

    // Get cluster details
    getClusterDetails(batchId, clusterId) {
        return apiClient.get(`/batches/${batchId}/clusters/${clusterId}/details`);
    },

    // Set batch actual weight
    setBatchWeight(id, weight) {
        return apiClient.post(`/batches/${id}/weight`, { actual_weight_kg: weight });
    },

    // Get batch summary
    getBatchSummary(id) {
        return apiClient.get(`/batches/${id}/summary`);
    }
};
