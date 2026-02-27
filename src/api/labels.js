import apiClient from './client';

export default {
    // Get all labels
    getLabels() {
        return apiClient.get('/labels');
    },

    // Get a specific label
    getLabel(id) {
        return apiClient.get(`/labels/${id}`);
    },

    // Create a new label
    createLabel(data) {
        return apiClient.post('/labels', data);
    },

    // Update a label
    updateLabel(id, data) {
        return apiClient.put(`/labels/${id}`, data);
    },

    // Delete a label
    deleteLabel(id) {
        return apiClient.delete(`/labels/${id}`);
    }
};
