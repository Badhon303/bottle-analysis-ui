<template>
  <div>
    <h1 class="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Batch Processing</h1>

    <!-- Upload Batch Form -->
    <div class="mb-8 p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
      <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">Upload New Batch</h2>
      <form @submit.prevent="createBatch" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white" for="video_file">Upload Video</label>
          <input class="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" id="video_file" type="file" ref="fileInput" accept="video/*" required @change="handleFileUpload">
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-300" id="file_input_help">MP4, AVI, MOV, etc.</p>
        </div>
        <div>
          <label for="supplier" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Supplier Name</label>
          <input type="text" id="supplier" v-model="batchForm.supplier" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
        </div>
        <div class="md:col-span-2">
            <button type="submit" :disabled="uploading" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:opacity-50">
              <span v-if="uploading">Uploading...</span>
              <span v-else>Start Processing</span>
            </button>
        </div>
      </form>
    </div>

    <!-- Batches List -->
    <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                    <th scope="col" class="px-6 py-3">ID</th>
                    <th scope="col" class="px-6 py-3">Batch Name</th>
                    <th scope="col" class="px-6 py-3">Supplier</th>
                    <th scope="col" class="px-6 py-3">Status</th>
                    <th scope="col" class="px-6 py-3">Progress</th>
                    <th scope="col" class="px-6 py-3">Created At</th>
                    <th scope="col" class="px-6 py-3">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="batch in batches" :key="batch.id" class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <td class="px-6 py-4">{{ batch.id }}</td>
                    <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        <router-link :to="{ name: 'BatchDetails', params: { id: batch.id } }" class="hover:underline text-blue-600 dark:text-blue-500">
                            {{ batch.name }}
                        </router-link>
                    </td>
                    <td class="px-6 py-4">{{ batch.supplier || '-' }}</td>
                    <td class="px-6 py-4">
                        <span :class="{
                            'bg-yellow-100 text-yellow-800': batch.status === 'processing',
                            'bg-green-100 text-green-800': batch.status === 'analyzed',
                            'bg-blue-100 text-blue-800': batch.status === 'uploaded',
                            'bg-red-100 text-red-800': batch.status === 'error'
                        }" class="text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300 border border-gray-500">
                            {{ batch.status }}
                        </span>
                    </td>
                    <td class="px-6 py-4">
                        <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                            <div class="bg-blue-600 h-2.5 rounded-full" :style="{ width: batch.processing_progress + '%' }"></div>
                        </div>
                        <span class="text-xs text-gray-500">{{ batch.processing_progress }}%</span>
                    </td>
                    <td class="px-6 py-4">{{ new Date(batch.created_at).toLocaleString() }}</td>
                    <td class="px-6 py-4">
                         <router-link :to="{ name: 'BatchDetails', params: { id: batch.id } }" class="font-medium text-blue-600 dark:text-blue-500 hover:underline">View</router-link>
                    </td>
                </tr>
                <tr v-if="batches.length === 0">
                    <td colspan="7" class="px-6 py-4 text-center">No batches found.</td>
                </tr>
            </tbody>
        </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import batchesApi from '../api/batches';

const batches = ref([]);
const fileInput = ref(null);
const batchForm = ref({
    supplier: '',
    video: null
});
const uploading = ref(false);

const handleFileUpload = (event) => {
    batchForm.value.video = event.target.files[0];
};

const fetchBatches = async () => {
    try {
        const response = await batchesApi.getBatches();
        batches.value = response.data;
    } catch (error) {
        console.error('Failed to fetch batches', error);
    }
};

const createBatch = async () => {
    if (!batchForm.value.video) return;
    
    uploading.value = true;
    const formData = new FormData();
    formData.append('video', batchForm.value.video);
    if (batchForm.value.supplier) {
        formData.append('supplier', batchForm.value.supplier);
    }

    try {
        await batchesApi.createBatch(formData);
        // Reset
        batchForm.value.supplier = '';
        batchForm.value.video = null;
        if(fileInput.value) fileInput.value.value = '';
        await fetchBatches();
    } catch (error) {
        console.error('Failed to upload batch', error);
        alert('Upload failed');
    } finally {
        uploading.value = false;
    }
};

onMounted(() => {
    fetchBatches();
    // Poll for updates every 5 seconds
    setInterval(fetchBatches, 5000);
});
</script>
