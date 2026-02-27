<template>
    <div v-if="batch">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
            <div>
                <h1 class="text-3xl font-bold text-gray-900 dark:text-white">{{ batch.name }}</h1>
                <p class="text-gray-500">{{ batch.supplier }} - <span class="uppercase">{{ batch.status }}</span></p>
            </div>
            <div class="flex gap-2">
                <button @click="refreshData"
                    class="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-800 text-sm font-medium">Refresh</button>
                <router-link to="/batches"
                    class="px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded-lg text-white text-sm font-medium">Back to
                    List</router-link>
            </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div class="p-4 bg-white rounded-lg shadow dark:bg-gray-800">
                <h3 class="text-sm text-gray-500">Total Bottles</h3>
                <p class="text-2xl font-bold dark:text-white">{{ summary?.total_bottles || 0 }}</p>
            </div>
            <div class="p-4 bg-white rounded-lg shadow dark:bg-gray-800">
                <h3 class="text-sm text-gray-500">Labeled</h3>
                <p class="text-2xl font-bold "
                    :class="{ 'text-green-500': summary?.total_bottles && summary?.total_bottles === batch.labeled_bottles }">
                    {{ batch.labeled_bottles || 0 }}</p>
            </div>
            <div class="p-4 bg-white rounded-lg shadow dark:bg-gray-800">
                <h3 class="text-sm text-gray-500">Pending Review</h3>
                <p class="text-2xl font-bold text-yellow-500">{{ batch.pending_bottles || 0 }}</p>
            </div>
            <div class="p-4 bg-white rounded-lg shadow dark:bg-gray-800">
                <h3 class="text-sm text-gray-500">Impurity</h3>
                <p class="text-2xl font-bold text-red-500">{{ batch.impurity_percentage?.toFixed(2) || 0 }}%</p>
            </div>
        </div>

        <!-- Tabs -->
        <div class="mb-4 border-b border-gray-200 dark:border-gray-700">
            <ul class="flex flex-wrap -mb-px text-sm font-medium text-center">
                <li class="me-2">
                    <button @click="activeTab = 'bottles'"
                        :class="{ 'border-blue-600 text-blue-600': activeTab === 'bottles' }"
                        class="inline-block p-4 border-b-2 rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300">All
                        Bottles</button>
                </li>
                <li class="me-2">
                    <button @click="activeTab = 'clusters'"
                        :class="{ 'border-blue-600 text-blue-600': activeTab === 'clusters' }"
                        class="inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300">Clusters
                        (Unknowns)</button>
                </li>
            </ul>
        </div>

        <!-- Content -->
        <div v-if="activeTab === 'bottles'">
            <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <div v-for="bottle in bottles" :key="bottle.id"
                    class="relative group bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
                    <img :src="bottle.image_path" alt="Bottle" class="w-full h-40 object-cover">
                    <div class="p-2">
                        <h5 class="mb-1 text-sm font-bold tracking-tight text-gray-900 dark:text-white truncate">{{
                            bottle.label_name || 'Unknown' }}</h5>
                        <p class="mb-1 text-xs text-gray-500">{{ (bottle.confidence * 100).toFixed(0) }}% Conf</p>
                        <span :class="{
                            'bg-green-100 text-green-800': bottle.status === 'confirmed',
                            'bg-blue-100 text-blue-800': bottle.status === 'auto_labeled',
                            'bg-yellow-100 text-yellow-800': bottle.status === 'pending',
                            'bg-red-100 text-red-800': bottle.status === 'no_match'
                        }" class="text-xs font-medium px-2 py-0.5 rounded">
                            {{ bottle.status }}
                        </span>
                    </div>
                    <!-- Hover Actions -->
                    <div
                        class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button @click="openReassignModal(bottle)"
                            class="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-xs px-3 py-2">Edit</button>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="activeTab === 'clusters'">
            <div v-if="clusters.length === 0" class="text-center py-10 text-gray-500">No clusters found.</div>
            <div v-for="cluster in clusters" :key="cluster.cluster_id"
                class="mb-8 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 p-4">
                <h3 class="text-lg font-bold mb-2">Cluster #{{ cluster.cluster_id }} ({{ cluster.count }} bottles)</h3>
                <div class="flex gap-2 overflow-x-auto mb-4 pb-2">
                    <div v-for="(img, idx) in cluster.sample_images" :key="idx" class="relative group">
                        <img :src="img" class="h-24 w-24 object-cover rounded">
                        <!-- Preview Button Overlay -->
                        <div
                            class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded">
                            <button @click="openPreview(img)"
                                class="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-xs px-3 py-1.5">
                                Preview
                            </button>
                        </div>
                    </div>
                </div>
                <button @click="assignClusterLabel(cluster.cluster_id)"
                    class="text-white bg-green-700 hover:bg-green-800 font-medium rounded-lg text-sm px-5 py-2.5">Assign
                    Label to Cluster</button>
            </div>
        </div>

        <!-- Preview Modal -->
        <div v-if="previewImage" @click="closePreview"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
            <div @click.stop class="relative max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden">
                <button @click="closePreview"
                    class="absolute top-4 right-4 text-white bg-red-600 hover:bg-red-700 rounded-full p-2 z-10">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12">
                        </path>
                    </svg>
                </button>
                <img :src="previewImage" alt="Bottle Preview" class="max-w-full max-h-[90vh] object-contain">
            </div>
        </div>

    </div>
    <div v-else class="text-center py-10">Loading batch details...</div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import batchesApi from '../api/batches';

const props = defineProps({
    id: String
});
const route = useRoute();
const batchId = props.id || route.params.id;

const batch = ref(null);
const summary = ref(null);
const bottles = ref([]);
const clusters = ref([]);
const activeTab = ref('bottles');
const previewImage = ref(null);

const fetchData = async () => {
    try {
        const [batchRes, summaryRes, bottlesRes, clustersRes] = await Promise.all([
            batchesApi.getBatch(batchId),
            batchesApi.getBatchSummary(batchId),
            batchesApi.getBatchBottles(batchId),
            batchesApi.getBatchClusters(batchId)
        ]);

        batch.value = batchRes.data;
        summary.value = summaryRes.data;
        bottles.value = bottlesRes.data;
        clusters.value = clustersRes.data;
    } catch (error) {
        console.error('Error fetching batch details', error);
    }
};

const refreshData = () => {
    fetchData();
};

const openReassignModal = (bottle) => {
    alert(`TODO: Open modal to reassign bottle ${bottle.id}`);
};

const assignClusterLabel = (clusterId) => {
    alert(`TODO: Assign label to cluster ${clusterId}`);
};

const openPreview = (imageUrl) => {
    previewImage.value = imageUrl;
};

const closePreview = () => {
    previewImage.value = null;
};

onMounted(() => {
    fetchData();
});
</script>
