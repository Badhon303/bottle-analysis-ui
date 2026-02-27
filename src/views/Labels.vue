<template>
  <div>
    <h1 class="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Label Management</h1>

    <!-- Create Label Form -->
    <div class="mb-8 p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
      <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">Create New Label</h2>
      <form @submit.prevent="createLabel" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label for="name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Name</label>
          <input type="text" id="name" v-model="newLabel.name" required class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
        </div>
        <div>
          <label for="brand" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Brand</label>
          <input type="text" id="brand" v-model="newLabel.brand" required class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
        </div>
        <div>
          <label for="volume" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Volume (mL)</label>
          <input type="number" id="volume" v-model.number="newLabel.volume_ml" required class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
        </div>
        <div>
            <label for="material" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Material</label>
            <select id="material" v-model="newLabel.material" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                <option value="PET">PET</option>
                <option value="HDPE">HDPE</option>
                <option value="Glass">Glass</option>
                <option value="Other">Other</option>
            </select>
        </div>
        <div>
            <label for="weight" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Empty Weight (grams)</label>
            <input type="number" step="0.1" id="weight" v-model.number="newLabel.empty_weight_grams" required class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
        </div>
        <div class="md:col-span-2">
            <button type="submit" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Add Label</button>
        </div>
      </form>
    </div>

    <!-- Labels Table -->
    <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                    <th scope="col" class="px-6 py-3">ID</th>
                    <th scope="col" class="px-6 py-3">Name</th>
                    <th scope="col" class="px-6 py-3">Brand</th>
                    <th scope="col" class="px-6 py-3">Volume</th>
                    <th scope="col" class="px-6 py-3">Material</th>
                    <th scope="col" class="px-6 py-3">Weight (g)</th>
                    <th scope="col" class="px-6 py-3">Samples</th>
                    <th scope="col" class="px-6 py-3">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="label in labels" :key="label.id" class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        {{ label.id }}
                    </th>
                    <td class="px-6 py-4">{{ label.name }}</td>
                    <td class="px-6 py-4">{{ label.brand }}</td>
                    <td class="px-6 py-4">{{ label.volume_ml }} mL</td>
                    <td class="px-6 py-4">{{ label.material }}</td>
                    <td class="px-6 py-4">{{ label.empty_weight_grams }}</td>
                    <td class="px-6 py-4">{{ label.sample_count }}</td>
                    <td class="px-6 py-4">
                        <button @click="deleteLabel(label.id)" class="font-medium text-red-600 dark:text-red-500 hover:underline">Delete</button>
                    </td>
                </tr>
                <tr v-if="labels.length === 0">
                    <td colspan="8" class="px-6 py-4 text-center">No labels found.</td>
                </tr>
            </tbody>
        </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import labelsApi from '../api/labels';

const labels = ref([]);
const newLabel = ref({
    name: '',
    brand: '',
    volume_ml: null,
    material: 'PET',
    empty_weight_grams: null,
    description: ''
});

const fetchLabels = async () => {
    try {
        const response = await labelsApi.getLabels();
        labels.value = response.data;
    } catch (error) {
        console.error('Failed to fetch labels', error);
    }
};

const createLabel = async () => {
    try {
        await labelsApi.createLabel(newLabel.value);
        // Reset form
        newLabel.value = {
            name: '',
            brand: '',
            volume_ml: null,
            material: 'PET',
            empty_weight_grams: null,
            description: ''
        };
        // Refresh list
        await fetchLabels();
    } catch (error) {
        console.error('Failed to create label', error);
        alert('Failed to create label');
    }
};

const deleteLabel = async (id) => {
    if(!confirm('Are you sure?')) return;
    try {
        await labelsApi.deleteLabel(id);
        await fetchLabels();
    } catch (error) {
        console.error('Failed to delete label', error);
    }
};

onMounted(() => {
    fetchLabels();
});
</script>
