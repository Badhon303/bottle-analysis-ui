import apiClient from './client';

export default {
    // Get bottle similarities
    getBottleSimilarities(id) {
        return apiClient.get(`/bottles/${id}/similarities`);
    },

    // Confirm labels for multiple bottles
    confirmBottles(bottleIds, labelId) {
        return apiClient.post('/bottles/confirm', {
            bottle_ids: bottleIds,
            label_id: labelId
        });
    },

    // Reassign a single bottle
    reassignBottle(id, labelId, source = 'correction') {
        return apiClient.post(`/bottles/${id}/reassign`, {
            label_id: labelId,
            source
        });
    },

    // Batch reassign bottles
    batchReassign(bottleIds, labelId, source = 'manual') {
        return apiClient.post('/bottles/batch-reassign', {
            bottle_ids: bottleIds,
            label_id: labelId,
            source
        });
    },

    // Create new label from bottles
    createLabelFromBottles(bottleIds, labelData) {
        return apiClient.post('/bottles/new-label', {
            bottle_ids: bottleIds,
            label: labelData
        });
    },

    // Assign label to single bottle
    assignLabel(id, labelId) {
        return apiClient.post(`/bottles/${id}/assign-label`, null, {
            params: { label_id: labelId }
        });
    }
};
