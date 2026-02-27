<template>
    <div>
        <h1 class="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Single Image Analysis</h1>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Upload Section -->
            <div class="lg:col-span-1">
                <div
                    class="p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                    <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">Upload Image</h2>
                    <form @submit.prevent="analyzeImage">
                        <div class="mb-4">
                            <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                for="image_file">Select Image</label>
                            <input
                                class="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                                id="image_file" type="file" ref="fileInput" accept="image/*" required
                                @change="handleFileUpload">
                        </div>
                        <!-- <div class="flex items-center mb-4">
                            <input id="use_clip" type="checkbox" v-model="analyzeForm.use_clip"
                                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                            <label for="use_clip" class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Use
                                CLIP Model</label>
                        </div> -->
                        <button type="submit" :disabled="analyzing"
                            class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:opacity-50">
                            <span v-if="analyzing">Analyzing...</span>
                            <span v-else>Analyze Image</span>
                        </button>
                    </form>
                </div>

                <!-- Result Summary -->
                <div v-if="results"
                    class="mt-6 p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                    <h3 class="text-lg font-bold mb-3 dark:text-white">Analysis Results</h3>
                    <ul class="space-y-2 text-sm text-gray-700 dark:text-gray-400">
                        <li class="flex justify-between"><span>Total Bottles:</span> <span class="font-bold">{{
                            results.total_bottles }}</span></li>
                        <li class="flex justify-between"><span>Matched:</span> <span class="text-green-600 font-bold">{{
                            results.matched_bottles }}</span></li>
                        <li class="flex justify-between"><span>Unmatched:</span> <span class="text-red-600 font-bold">{{
                            results.unmatched_bottles }}</span></li>
                    </ul>
                </div>
            </div>

            <!-- Visualization Section -->
            <div class="lg:col-span-2">
                <div
                    class="p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 min-h-[400px] flex flex-col items-center justify-center">
                    <div v-if="results && results.visualization_path" class="w-full">
                        <h3 class="text-lg font-bold mb-4 dark:text-white text-center">Visualization</h3>
                        <img :src="results.visualization_path" alt="Visualization"
                            class="max-w-full rounded-lg shadow-lg">
                    </div>
                    <div v-else-if="imagePreview" class="w-full flex flex-col items-center">
                        <p class="mb-4 text-gray-500">Image Preview (Ready for Analysis)</p>
                        <img :src="imagePreview" class="max-w-full h-auto rounded-lg opacity-50">
                    </div>
                    <div v-else class="text-gray-500 flex flex-col items-center">
                        <svg class="w-20 h-20 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z">
                            </path>
                        </svg>
                        <p>Upload an image to see analysis</p>
                    </div>
                </div>

                <!-- Selection Controls -->
                <div v-if="results && results.clusters && results.clusters.length"
                    class="mt-6 p-4 bg-blue-50 dark:bg-gray-700 rounded-lg border border-blue-200 dark:border-gray-600">
                    <div class="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <p class="text-sm font-bold text-gray-900 dark:text-white">
                                Selected: <span class="text-blue-600 dark:text-blue-400">{{ selectedBottles.length
                                    }}</span> bottles
                            </p>
                        </div>
                        <div class="flex gap-2">
                            <button @click="clearSelection"
                                class="px-3 py-1 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded-lg">
                                Clear Selection
                            </button>
                            <button @click="showCreateLabelForm = true" :disabled="selectedBottles.length === 0"
                                class="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
                                Create Label from Selected
                            </button>
                            <button @click="showAddToLabelForm = true" :disabled="selectedBottles.length === 0"
                                class="px-3 py-1 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
                                Add to Existing Label
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Create Label Form Modal -->
                <div v-if="showCreateLabelForm"
                    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                        <h3 class="text-xl font-bold mb-4 dark:text-white">Create Label from {{ selectedBottles.length
                            }} Bottle(s)</h3>
                        <form @submit.prevent="createLabelFromSelection" class="space-y-4">
                            <div>
                                <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Name</label>
                                <input type="text" v-model="newLabelForm.name" required
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            </div>
                            <div>
                                <label
                                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Brand</label>
                                <input type="text" v-model="newLabelForm.brand" required
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            </div>
                            <div>
                                <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Volume
                                    (mL)</label>
                                <input type="number" v-model.number="newLabelForm.volume_ml" required
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            </div>
                            <div>
                                <label
                                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Material</label>
                                <select v-model="newLabelForm.material"
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                    <option value="PET">PET</option>
                                    <option value="HDPE">HDPE</option>
                                    <option value="Glass">Glass</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Empty Weight
                                    (grams)</label>
                                <input type="number" step="0.1" v-model.number="newLabelForm.empty_weight_grams"
                                    required
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            </div>
                            <div class="flex gap-2 justify-end">
                                <button type="button" @click="showCreateLabelForm = false"
                                    class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg">
                                    Cancel
                                </button>
                                <button type="submit" :disabled="creatingLabel"
                                    class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50">
                                    {{ creatingLabel ? 'Creating...' : 'Create Label' }}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Add to Label Form Modal -->
                <div v-if="showAddToLabelForm"
                    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                        <h3 class="text-xl font-bold mb-4 dark:text-white">Add {{ selectedBottles.length }} Bottle(s) to
                            Label</h3>
                        <form @submit.prevent="addBottlesToExistingLabel" class="space-y-4">
                            <div>
                                <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Select
                                    Label</label>
                                <select v-model="selectedLabelId" required
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                    <option value="" disabled>Choose a label...</option>
                                    <option v-for="label in availableLabels" :key="label.id" :value="label.id">
                                        {{ label.name }} ({{ label.brand }})
                                    </option>
                                </select>
                            </div>
                            <div class="flex gap-2 justify-end">
                                <button type="button" @click="showAddToLabelForm = false"
                                    class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg">
                                    Cancel
                                </button>
                                <button type="submit" :disabled="addingToLabel || !selectedLabelId"
                                    class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50">
                                    {{ addingToLabel ? 'Adding...' : 'Add to Label' }}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Matched/Pending Bottles -->
                <div v-if="results && results.bottles && results.bottles.filter(b => b.status !== 'no_match').length > 0"
                    class="mt-6">
                    <h3 class="text-xl font-bold mb-4 dark:text-white">Matched Bottles</h3>

                    <div
                        class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 bg-green-50 dark:bg-gray-900 rounded-lg border-l-4 border-green-500">
                        <div v-for="bottle in results.bottles.filter(b => b.status !== 'no_match')" :key="bottle.id"
                            class="relative p-3 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 cursor-pointer transition-all"
                            :class="{ 'ring-4 ring-blue-500 dark:ring-blue-400': isBottleSelected(bottle.id) }"
                            @click="toggleBottleSelection(bottle.id)">
                            <!-- Selection checkbox -->
                            <input type="checkbox" :checked="isBottleSelected(bottle.id)"
                                @click.stop="toggleBottleSelection(bottle.id)"
                                class="absolute top-2 right-2 w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500">
                            <div class="relative group">
                                <img :src="bottle.image_path" class="w-full h-32 object-cover rounded mb-2"
                                    :alt="'Bottle ' + bottle.id">
                                <button
                                    @click.stop="openPreview(bottle.image_path, bottle.label_name || 'No Match', bottle.id)"
                                    class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z">
                                        </path>
                                    </svg>
                                </button>
                            </div>
                            <p class="text-sm font-bold dark:text-white">
                                {{ bottle.label_name || 'No Match' }}
                            </p>
                            <p class="text-xs text-gray-500">
                                Index: {{ bottle.id }}
                            </p>
                            <p class="text-xs text-gray-500">
                                Conf: {{ (bottle.confidence * 100).toFixed(0) }}%
                            </p>
                            <p class="text-xs text-gray-500">
                                Match: {{ (bottle.match_confidence * 100).toFixed(0) }}%
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Unmatched Bottles by Cluster -->
                <div v-if="results && results.clusters && results.clusters.length" class="mt-6">
                    <h3 class="text-xl font-bold mb-4 dark:text-white">Unmatched Bottles by Cluster</h3>

                    <div v-for="cluster in results.clusters" :key="cluster.cluster_id" class="mb-6">
                        <!-- Cluster Header -->
                        <div class="flex items-center mb-3">
                            <div class="flex-grow">
                                <h4 class="text-lg font-semibold dark:text-white">
                                    Cluster {{ cluster.cluster_id }}
                                    <span class="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                                        ({{ cluster.bottle_count }} {{ cluster.bottle_count === 1 ? 'bottle' : 'bottles'
                                        }})
                                    </span>
                                </h4>
                            </div>
                            <div class="flex gap-2">
                                <button @click="selectCluster(cluster.cluster_id, true)"
                                    class="text-sm px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded">
                                    Select All
                                </button>
                                <button @click="selectCluster(cluster.cluster_id, false)"
                                    class="text-sm px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded">
                                    Deselect All
                                </button>
                            </div>
                        </div>

                        <!-- Bottles in this cluster -->
                        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border-l-4"
                            :class="getClusterBorderClass(cluster.cluster_id)">
                            <div v-for="(bottleId, index) in cluster.bottle_ids" :key="bottleId"
                                class="relative p-3 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 cursor-pointer transition-all"
                                :class="{ 'ring-4 ring-blue-500 dark:ring-blue-400': isBottleSelected(getBottleIndex(bottleId)) }"
                                @click="toggleBottleSelection(getBottleIndex(bottleId))">
                                <!-- Selection checkbox -->
                                <input type="checkbox" :checked="isBottleSelected(getBottleIndex(bottleId))"
                                    @click.stop="toggleBottleSelection(getBottleIndex(bottleId))"
                                    class="absolute top-2 right-2 w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500">
                                <div class="relative group">
                                    <img :src="getBottleById(bottleId).image_path"
                                        class="w-full h-32 object-cover rounded mb-2" :alt="'Bottle ' + bottleId">
                                    <button
                                        @click.stop="openPreview(getBottleById(bottleId).image_path, getBottleById(bottleId).label_name || 'No Match', bottleId)"
                                        class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor"
                                            viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z">
                                            </path>
                                        </svg>
                                    </button>
                                </div>
                                <p class="text-sm font-bold dark:text-white">
                                    {{ getBottleById(bottleId).label_name || 'No Match' }}
                                </p>
                                <p class="text-xs text-gray-500">
                                    Index: {{ getBottleIndex(bottleId) }}
                                </p>
                                <p class="text-xs text-gray-500">
                                    Conf: {{ (getBottleById(bottleId).confidence * 100).toFixed(0) }}%
                                </p>
                                <p class="text-xs text-gray-500">
                                    Match: {{ (getBottleById(bottleId).match_confidence * 100).toFixed(0) }}%
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Image Preview Modal -->
        <div v-if="previewImage.show" class="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
            @click="closePreview">
            <div class="relative max-w-7xl max-h-screen p-4" @click.stop>
                <!-- Close button -->
                <button @click="closePreview"
                    class="absolute top-2 right-2 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-2">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12">
                        </path>
                    </svg>
                </button>

                <!-- Image -->
                <img :src="previewImage.url" :alt="previewImage.title"
                    class="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl">

                <!-- Image info -->
                <div class="mt-4 text-center text-white">
                    <p class="text-lg font-bold">{{ previewImage.title }}</p>
                    <p class="text-sm text-gray-300">Bottle ID: {{ previewImage.bottleId }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import imagesApi from '../api/images';
import labelsApi from '../api/labels';

const fileInput = ref(null);
const imagePreview = ref(null);
const analyzing = ref(false);
const results = ref(null);

const analyzeForm = ref({
    image: null,
    use_clip: false
});

// Bottle selection state
const selectedBottles = ref([]);
const showCreateLabelForm = ref(false);
const showAddToLabelForm = ref(false);
const creatingLabel = ref(false);
const addingToLabel = ref(false);
const availableLabels = ref([]);
const selectedLabelId = ref('');

const newLabelForm = ref({
    name: '',
    brand: '',
    volume_ml: null,
    material: 'PET',
    empty_weight_grams: null
});

// Image preview state
const previewImage = ref({
    show: false,
    url: '',
    title: '',
    bottleId: null
});

const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
        analyzeForm.value.image = file;
        results.value = null; // Clear previous results
        selectedBottles.value = []; // Clear selection

        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.value = e.target.result;
        };
        reader.readAsDataURL(file);
    }
};

const analyzeImage = async () => {
    if (!analyzeForm.value.image) return;

    analyzing.value = true;
    const formData = new FormData();
    formData.append('image', analyzeForm.value.image);
    formData.append('use_clip', analyzeForm.value.use_clip);

    try {
        const response = await imagesApi.analyzeImage(formData);
        results.value = response.data;
        selectedBottles.value = []; // Clear selection on new analysis
    } catch (error) {
        console.error('Analysis failed', error);
        alert('Failed to analyze image');
    } finally {
        analyzing.value = false;
    }
};

// Bottle selection functions
const toggleBottleSelection = (index) => {
    const idx = selectedBottles.value.indexOf(index);
    if (idx > -1) {
        selectedBottles.value.splice(idx, 1);
    } else {
        selectedBottles.value.push(index);
    }
};

const isBottleSelected = (index) => {
    return selectedBottles.value.includes(index);
};

const clearSelection = () => {
    selectedBottles.value = [];
};

const selectCluster = (clusterId, select) => {
    const cluster = results.value.clusters.find(c => c.cluster_id === clusterId);
    if (!cluster) return;

    cluster.bottle_ids.forEach(bottleId => {
        const index = getBottleIndex(bottleId);
        const idx = selectedBottles.value.indexOf(index);

        if (select && idx === -1) {
            selectedBottles.value.push(index);
        } else if (!select && idx > -1) {
            selectedBottles.value.splice(idx, 1);
        }
    });
};

// Label management functions
const createLabelFromSelection = async () => {
    if (selectedBottles.value.length === 0) return;

    creatingLabel.value = true;
    try {
        const payload = {
            image_id: results.value.image_id,
            bottle_indices: selectedBottles.value,
            label: {
                name: newLabelForm.value.name,
                brand: newLabelForm.value.brand,
                volume_ml: newLabelForm.value.volume_ml,
                material: newLabelForm.value.material,
                empty_weight_grams: newLabelForm.value.empty_weight_grams
            }
        };

        const response = await imagesApi.createLabelFromBottles(payload);
        alert(`✓ Created label '${response.data.label_name}' from ${response.data.sample_count} bottles`);

        // Reset form
        newLabelForm.value = {
            name: '',
            brand: '',
            volume_ml: null,
            material: 'PET',
            empty_weight_grams: null
        };
        showCreateLabelForm.value = false;
        selectedBottles.value = [];

        // Refresh labels
        await fetchLabels();
    } catch (error) {
        console.error('Failed to create label', error);
        alert('Failed to create label: ' + (error.response?.data?.detail || error.message));
    } finally {
        creatingLabel.value = false;
    }
};

const addBottlesToExistingLabel = async () => {
    if (selectedBottles.value.length === 0 || !selectedLabelId.value) return;

    addingToLabel.value = true;
    try {
        await imagesApi.addBottlesToLabel(
            results.value.image_id,
            selectedLabelId.value,
            selectedBottles.value
        );

        alert(`✓ Added ${selectedBottles.value.length} bottle(s) to label`);
        showAddToLabelForm.value = false;
        selectedBottles.value = [];
        selectedLabelId.value = '';
    } catch (error) {
        console.error('Failed to add bottles to label', error);
        alert('Failed to add bottles to label: ' + (error.response?.data?.detail || error.message));
    } finally {
        addingToLabel.value = false;
    }
};

const fetchLabels = async () => {
    try {
        const response = await labelsApi.getLabels();
        availableLabels.value = response.data;
    } catch (error) {
        console.error('Failed to fetch labels', error);
    }
};

// Helper function to get bottle by ID
const getBottleById = (bottleId) => {
    return results.value.bottles.find(b => b.id === bottleId) || {};
};

// Helper function to get bottle index from ID
const getBottleIndex = (bottleId) => {
    return results.value.bottles.findIndex(b => b.id === bottleId);
};

// Helper function to get cluster border color class
const getClusterBorderClass = (clusterId) => {
    const colors = [
        'border-blue-500',
        'border-green-500',
        'border-purple-500',
        'border-orange-500',
        'border-pink-500',
        'border-indigo-500',
        'border-red-500',
        'border-yellow-500',
    ];
    return colors[clusterId % colors.length];
};

// Image preview functions
const openPreview = (imageUrl, title, bottleId) => {
    previewImage.value = {
        show: true,
        url: imageUrl,
        title: title,
        bottleId: bottleId
    };
};

const closePreview = () => {
    previewImage.value = {
        show: false,
        url: '',
        title: '',
        bottleId: null
    };
};

// Fetch labels on mount for the "add to label" dropdown
onMounted(() => {
    fetchLabels();
});

</script>
