import apiClient from './client';

export default {
    // Analyze a single image
    analyzeImage(formData) {
        return apiClient.post('/images/analyze', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    // Create a label from selected bottles
    createLabelFromBottles(data) {
        return apiClient.post('/images/create-label', data);
    },

    // Add bottles to an existing label
    addBottlesToLabel(imageId, labelId, bottleIndices) {
        const params = new URLSearchParams();
        params.append('image_id', imageId);
        params.append('label_id', labelId);
        // Backend expects the array directly as the body, not wrapped in an object
        return apiClient.post(`/images/add-to-label?${params.toString()}`, bottleIndices);
    },

    // List available crops for an image
    getBottleCrops(imageId) {
        return apiClient.get(`/images/${imageId}/bottles`);
    },

    // Analyze multiple images in batch
    analyzeBatchImages(formData, onUploadProgress) {
        return apiClient.post('/images/analyze-batch', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress,
        });
    }
};
