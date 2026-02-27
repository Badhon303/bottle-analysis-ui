<template>
    <div>
        <h1 class="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
            <span class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Batch Image Analysis
            </span>
        </h1>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Upload Section -->
            <div class="lg:col-span-1">
                <div
                    class="p-6 bg-white border border-gray-200 rounded-xl shadow-lg dark:bg-gray-800 dark:border-gray-700">
                    <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                        <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z">
                            </path>
                        </svg>
                        Upload Images
                    </h2>
                    <form @submit.prevent="analyzeImages">
                        <!-- Drop zone -->
                        <div class="mb-4">
                            <label
                                class="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300"
                                :class="isDragging
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-300 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600'"
                                @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false"
                                @drop.prevent="handleDrop">
                                <div class="flex flex-col items-center justify-center pt-5 pb-6">
                                    <svg class="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12">
                                        </path>
                                    </svg>
                                    <p class="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                        <span class="font-semibold">Click to upload</span> or drag and drop
                                    </p>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">
                                        PNG, JPG, WEBP (Max 50 images)
                                    </p>
                                </div>
                                <input type="file" class="hidden" ref="fileInput" accept="image/*" multiple
                                    @change="handleFileUpload">
                            </label>
                        </div>

                        <!-- Selected files preview -->
                        <div v-if="selectedFiles.length > 0" class="mb-4">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {{ selectedFiles.length }} image(s) selected
                                </span>
                                <button type="button" @click="clearFiles"
                                    class="text-sm text-red-500 hover:text-red-700">
                                    Clear all
                                </button>
                            </div>
                            <div class="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                                <div v-for="(file, index) in selectedFiles" :key="index"
                                    class="relative group aspect-square">
                                    <img :src="filePreviews[index]"
                                        class="w-full h-full object-cover rounded-lg border border-gray-200 dark:border-gray-600">
                                    <button type="button" @click="removeFile(index)"
                                        class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                                        ×
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Upload progress -->
                        <div v-if="uploadProgress > 0 && uploadProgress < 100" class="mb-4">
                            <div class="flex justify-between mb-1">
                                <span class="text-sm text-gray-600 dark:text-gray-400">Uploading...</span>
                                <span class="text-sm text-gray-600 dark:text-gray-400">{{ uploadProgress }}%</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                                <div class="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                                    :style="{ width: uploadProgress + '%' }"></div>
                            </div>
                        </div>

                        <button type="submit" :disabled="analyzing || selectedFiles.length === 0"
                            class="w-full text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-xl text-sm px-5 py-3 text-center dark:focus:ring-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl">
                            <span v-if="analyzing" class="flex items-center justify-center gap-2">
                                <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                        stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                    </path>
                                </svg>
                                Analyzing {{ selectedFiles.length }} images...
                            </span>
                            <span v-else class="flex items-center justify-center gap-2">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4">
                                    </path>
                                </svg>
                                Analyze Batch
                            </span>
                        </button>
                    </form>
                </div>

                <!-- Batch Summary Card -->
                <div v-if="results"
                    class="mt-6 p-6 bg-white border border-gray-200 rounded-xl shadow-lg dark:bg-gray-800 dark:border-gray-700">
                    <h3 class="text-lg font-bold mb-4 dark:text-white flex items-center gap-2">
                        <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z">
                            </path>
                        </svg>
                        Batch Summary
                    </h3>
                    <div class="space-y-3">
                        <div class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <span class="text-gray-600 dark:text-gray-400">Batch ID</span>
                            <span class="font-mono text-sm text-gray-900 dark:text-white truncate ml-2 max-w-[150px]"
                                :title="results.batch_id">
                                {{ results.batch_id }}
                            </span>
                        </div>
                        <div class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <span class="text-gray-600 dark:text-gray-400">Total Images</span>
                            <span class="font-bold text-gray-900 dark:text-white">{{ results.total_images }}</span>
                        </div>
                        <div class="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                            <span class="text-gray-600 dark:text-gray-400">Total Bottles</span>
                            <span class="font-bold text-blue-600 dark:text-blue-400 text-xl">{{ results.total_bottles
                                }}</span>
                        </div>
                        <div class="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                            <span class="text-gray-600 dark:text-gray-400">Matched</span>
                            <span class="font-bold text-green-600 dark:text-green-400 text-xl">{{
                                results.matched_bottles }}</span>
                        </div>
                        <div
                            class="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                            <span class="text-gray-600 dark:text-gray-400">Unmatched</span>
                            <span class="font-bold text-orange-600 dark:text-orange-400 text-xl">{{
                                results.unmatched_bottles }}</span>
                        </div>
                        <div v-if="results.clusters && results.clusters.length"
                            class="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                            <span class="text-gray-600 dark:text-gray-400">Clusters Found</span>
                            <span class="font-bold text-purple-600 dark:text-purple-400 text-xl">{{
                                results.clusters.length }}</span>
                        </div>
                        <!-- Weight Summary (calculated from bottle weights) -->
                        <div v-if="totalEstimatedWeight.grams > 0"
                            class="flex justify-between items-center p-3 bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-cyan-900/30 dark:to-teal-900/30 rounded-lg border border-cyan-200 dark:border-cyan-800">
                            <span class="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                <svg class="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3">
                                    </path>
                                </svg>
                                Est. Weight
                            </span>
                            <div class="text-right">
                                <span class="font-bold text-cyan-600 dark:text-cyan-400 text-xl">{{
                                    formatWeight(totalEstimatedWeight.grams) }}</span>
                                <p class="text-xs text-gray-500 dark:text-gray-400">
                                    ({{ totalEstimatedWeight.kg.toFixed(3) }} kg)
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Results Section -->
            <div class="lg:col-span-2">
                <!-- Results when available -->
                <div v-if="results">
                    <!-- Selection Controls (always visible when there are clusters) -->
                    <div v-if="results.clusters && results.clusters.length"
                        class="mb-6 p-4 bg-blue-50 dark:bg-gray-700 rounded-xl border border-blue-200 dark:border-gray-600">
                        <div class="flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <p class="text-sm font-bold text-gray-900 dark:text-white">
                                    Selected: <span class="text-blue-600 dark:text-blue-400">{{ selectedBottles.length
                                        }}</span> bottles
                                </p>
                            </div>
                            <div class="flex gap-2">
                                <button @click="clearSelection"
                                    class="px-3 py-1.5 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded-lg">
                                    Clear Selection
                                </button>
                                <button @click="showCreateLabelForm = true" :disabled="selectedBottles.length === 0"
                                    class="px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
                                    Create Label from Selected
                                </button>
                                <button @click="showAddToLabelForm = true" :disabled="selectedBottles.length === 0"
                                    class="px-3 py-1.5 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
                                    Add to Existing Label
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Per Image Results -->
                    <div
                        class="mb-6 p-6 bg-white border border-gray-200 rounded-xl shadow dark:bg-gray-800 dark:border-gray-700">
                        <h3 class="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
                            <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z">
                                </path>
                            </svg>
                            Per Image Results ({{ results.per_image_results?.length || 0 }} images)
                        </h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div v-for="imageResult in results.per_image_results" :key="imageResult.image_id"
                                class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                                <div class="flex items-center gap-3">
                                    <img v-if="imageResult.visualization_path" :src="imageResult.visualization_path"
                                        class="w-16 h-12 object-cover rounded shadow cursor-pointer hover:opacity-80 transition-opacity"
                                        @click="openPreview(imageResult.visualization_path, imageResult.original_filename, null)">
                                    <div class="flex-grow min-w-0">
                                        <p class="font-medium text-sm text-gray-900 dark:text-white truncate"
                                            :title="imageResult.original_filename">
                                            {{ imageResult.original_filename }}
                                        </p>
                                        <div class="flex gap-2 mt-1 text-xs">
                                            <span class="text-blue-600 dark:text-blue-400">{{ imageResult.total_bottles
                                                }} total</span>
                                            <span class="text-green-600 dark:text-green-400">{{
                                                imageResult.matched_bottles }} matched</span>
                                            <span class="text-orange-600 dark:text-orange-400">{{
                                                imageResult.unmatched_bottles }} unmatched</span>
                                        </div>
                                        <!-- Per-image weight -->
                                        <div v-if="imageResult.estimated_weight_grams"
                                            class="mt-1 flex items-center gap-1 text-xs text-cyan-600 dark:text-cyan-400">
                                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3">
                                                </path>
                                            </svg>
                                            <span>{{ formatWeight(imageResult.estimated_weight_grams) }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Matched/Pending Bottles Section -->
                    <div v-if="matchedBottles.length > 0" class="mb-6">
                        <h3 class="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
                            <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            Matched Bottles ({{ matchedBottles.length }})
                        </h3>

                        <div
                            class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 bg-green-50 dark:bg-gray-900 rounded-xl border-l-4 border-green-500">
                            <div v-for="bottle in matchedBottles" :key="bottle.id"
                                class="relative p-3 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 cursor-pointer transition-all hover:shadow-md"
                                :class="{ 'ring-4 ring-blue-500 dark:ring-blue-400': isBottleSelected(bottle.id) }"
                                @click="toggleBottleSelection(bottle.id)">
                                <!-- Source image badge -->
                                <span
                                    class="absolute top-1 left-1 px-1.5 py-0.5 text-xs bg-gray-800/70 text-white rounded z-10">
                                    Img {{ bottle.source_image_index + 1 }}
                                </span>
                                <!-- Selection checkbox -->
                                <input type="checkbox" :checked="isBottleSelected(bottle.id)"
                                    @click.stop="toggleBottleSelection(bottle.id)"
                                    class="absolute top-1 right-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 z-10">
                                <div class="relative group mt-4">
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
                                <p class="text-sm font-bold dark:text-white truncate">
                                    {{ bottle.label_name || 'No Match' }}
                                </p>
                                <p class="text-xs text-gray-500">
                                    ID: {{ bottle.id }}
                                </p>
                                <p class="text-xs text-gray-500">
                                    Conf: {{ (bottle.confidence * 100).toFixed(0) }}%
                                </p>
                                <p class="text-xs text-gray-500">
                                    Match: {{ (bottle.match_confidence * 100).toFixed(0) }}%
                                </p>
                                <!-- Bottle weight -->
                                <p v-if="bottle.label_weight_grams"
                                    class="text-xs text-cyan-600 dark:text-cyan-400 font-medium">
                                    {{ bottle.label_weight_grams }}g
                                </p>
                                <!-- Status badge -->
                                <span class="inline-block mt-1 px-2 py-0.5 text-xs rounded-full" :class="{
                                    'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300': bottle.status === 'auto_labeled',
                                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300': bottle.status === 'pending'
                                }">
                                    {{ bottle.status === 'auto_labeled' ? 'Auto' : 'Pending' }}
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Unmatched Bottles by Cluster Section -->
                    <div v-if="results.clusters && results.clusters.length">
                        <h3 class="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
                            <svg class="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z">
                                </path>
                            </svg>
                            Unmatched Bottles by Cluster
                        </h3>

                        <div v-for="cluster in sortedClusters" :key="cluster.cluster_id" class="mb-6">
                            <!-- Cluster Header -->
                            <div class="flex items-center mb-3">
                                <div class="flex-grow">
                                    <h4 class="text-lg font-semibold dark:text-white flex items-center gap-2">
                                        <span class="w-3 h-3 rounded-full"
                                            :class="getClusterDotClass(cluster.cluster_id)"></span>
                                        <span v-if="cluster.cluster_id === -1">Outliers (No Cluster)</span>
                                        <span v-else>Cluster {{ cluster.cluster_id }}</span>
                                        <span class="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                                            ({{ cluster.bottle_count }} {{ cluster.bottle_count === 1 ? 'bottle' :
                                                'bottles' }})
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
                            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border-l-4"
                                :class="getClusterBorderClass(cluster.cluster_id)">
                                <div v-for="bottleId in cluster.bottle_ids" :key="bottleId"
                                    class="relative p-3 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 cursor-pointer transition-all hover:shadow-md"
                                    :class="{ 'ring-4 ring-blue-500 dark:ring-blue-400': isBottleSelected(bottleId) }"
                                    @click="toggleBottleSelection(bottleId)">
                                    <!-- Source image badge -->
                                    <span v-if="getBottleById(bottleId)"
                                        class="absolute top-1 left-1 px-1.5 py-0.5 text-xs bg-gray-800/70 text-white rounded z-10">
                                        Img {{ getBottleById(bottleId).source_image_index + 1 }}
                                    </span>
                                    <!-- Selection checkbox -->
                                    <input type="checkbox" :checked="isBottleSelected(bottleId)"
                                        @click.stop="toggleBottleSelection(bottleId)"
                                        class="absolute top-1 right-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 z-10">
                                    <div class="relative group mt-4">
                                        <img :src="getBottleById(bottleId)?.image_path"
                                            class="w-full h-32 object-cover rounded mb-2" :alt="'Bottle ' + bottleId">
                                        <button
                                            @click.stop="openPreview(getBottleById(bottleId)?.image_path, getBottleById(bottleId)?.label_name || 'No Match', bottleId)"
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
                                    <p class="text-sm font-bold dark:text-white truncate">
                                        {{ getBottleById(bottleId)?.label_name || 'No Match' }}
                                    </p>
                                    <p class="text-xs text-gray-500">
                                        ID: {{ bottleId }}
                                    </p>
                                    <p class="text-xs text-gray-500">
                                        Conf: {{ ((getBottleById(bottleId)?.confidence || 0) * 100).toFixed(0) }}%
                                    </p>
                                    <p class="text-xs text-gray-500">
                                        Match: {{ ((getBottleById(bottleId)?.match_confidence || 0) * 100).toFixed(0)
                                        }}%
                                    </p>
                                    <!-- Bottle weight if available -->
                                    <p v-if="getBottleById(bottleId)?.label_weight_grams"
                                        class="text-xs text-cyan-600 dark:text-cyan-400 font-medium">
                                        {{ getBottleById(bottleId).label_weight_grams }}g
                                    </p>
                                    <!-- Top similarity hint -->
                                    <p v-if="getBottleById(bottleId)?.similarities?.length"
                                        class="text-xs text-purple-500 dark:text-purple-400 mt-1 truncate"
                                        :title="'Best match: ' + getBottleById(bottleId).similarities[0].label_name">
                                        → {{ getBottleById(bottleId).similarities[0].label_name }} ({{
                                            (getBottleById(bottleId).similarities[0].similarity * 100).toFixed(0) }}%)
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Empty state -->
                <div v-else
                    class="p-12 bg-white border border-gray-200 rounded-xl shadow-lg dark:bg-gray-800 dark:border-gray-700 flex flex-col items-center justify-center min-h-[400px]">
                    <div class="relative mb-6">
                        <div
                            class="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center">
                            <svg class="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z">
                                </path>
                            </svg>
                        </div>
                        <div
                            class="absolute -bottom-1 -right-1 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                            +
                        </div>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Upload Multiple Images</h3>
                    <p class="text-gray-500 dark:text-gray-400 text-center max-w-md">
                        Select up to 50 images to analyze together. Bottles will be detected, matched against known
                        labels, and similar unmatched bottles will be clustered across all images.
                    </p>
                </div>
            </div>
        </div>

        <!-- Create Label Modal -->
        <div v-if="showCreateLabelForm"
            class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl max-w-md w-full mx-4">
                <h3 class="text-xl font-bold mb-4 dark:text-white">Create Label from {{ selectedBottles.length }}
                    Bottle(s)</h3>
                <form @submit.prevent="createLabelFromSelection" class="space-y-4">
                    <div>
                        <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Name</label>
                        <input type="text" v-model="newLabelForm.name" required
                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    </div>
                    <div>
                        <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Brand</label>
                        <input type="text" v-model="newLabelForm.brand" required
                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    </div>
                    <div>
                        <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Volume (mL)</label>
                        <input type="number" v-model.number="newLabelForm.volume_ml" required
                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    </div>
                    <div>
                        <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Material</label>
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
                        <input type="number" step="0.1" v-model.number="newLabelForm.empty_weight_grams" required
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

        <!-- Add to Label Modal -->
        <div v-if="showAddToLabelForm"
            class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl max-w-md w-full mx-4">
                <h3 class="text-xl font-bold mb-4 dark:text-white">Add {{ selectedBottles.length }} Bottle(s) to Label
                </h3>
                <form @submit.prevent="addBottlesToExistingLabel" class="space-y-4">
                    <div>
                        <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Select Label</label>
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

        <!-- Image Preview Modal -->
        <div v-if="previewImage.show" class="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
            @click="closePreview">
            <div class="relative max-w-7xl max-h-screen p-4" @click.stop>
                <button @click="closePreview"
                    class="absolute top-2 right-2 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-2">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12">
                        </path>
                    </svg>
                </button>
                <img :src="previewImage.url" :alt="previewImage.title"
                    class="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl">
                <div class="mt-4 text-center text-white">
                    <p class="text-lg font-bold">{{ previewImage.title }}</p>
                    <p v-if="previewImage.bottleId !== null" class="text-sm text-gray-300">Bottle ID: {{
                        previewImage.bottleId }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import imagesApi from '../api/images';
import labelsApi from '../api/labels';

// File handling state
const fileInput = ref(null);
const selectedFiles = ref([]);
const filePreviews = ref([]);
const isDragging = ref(false);

// Analysis state
const analyzing = ref(false);
const uploadProgress = ref(0);
const results = ref(null);

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

// Computed properties
const matchedBottles = computed(() => {
    if (!results.value?.bottles) return [];
    return results.value.bottles.filter(b => b.status !== 'no_match');
});

const sortedClusters = computed(() => {
    if (!results.value?.clusters) return [];
    // Sort clusters: regular clusters first (by id), then outliers (-1) at the end
    return [...results.value.clusters].sort((a, b) => {
        if (a.cluster_id === -1) return 1;
        if (b.cluster_id === -1) return -1;
        return a.cluster_id - b.cluster_id;
    });
});

// Calculate total estimated weight by summing all bottle label_weight_grams
const totalEstimatedWeight = computed(() => {
    if (!results.value?.bottles) return { grams: 0, kg: 0 };
    const totalGrams = results.value.bottles.reduce((sum, bottle) => {
        return sum + (bottle.label_weight_grams || 0);
    }, 0);
    return {
        grams: totalGrams,
        kg: totalGrams / 1000
    };
});

// File handling functions
const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    addFiles(files);
};

const handleDrop = (event) => {
    isDragging.value = false;
    const files = Array.from(event.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    addFiles(files);
};

const addFiles = (files) => {
    const remainingSlots = 50 - selectedFiles.value.length;
    const filesToAdd = files.slice(0, remainingSlots);

    filesToAdd.forEach(file => {
        selectedFiles.value.push(file);
        const reader = new FileReader();
        reader.onload = (e) => {
            filePreviews.value.push(e.target.result);
        };
        reader.readAsDataURL(file);
    });
};

const removeFile = (index) => {
    selectedFiles.value.splice(index, 1);
    filePreviews.value.splice(index, 1);
};

const clearFiles = () => {
    selectedFiles.value = [];
    filePreviews.value = [];
    if (fileInput.value) fileInput.value.value = '';
};

// Analysis function
const analyzeImages = async () => {
    if (selectedFiles.value.length === 0) return;

    analyzing.value = true;
    uploadProgress.value = 0;
    results.value = null;
    selectedBottles.value = [];

    const formData = new FormData();
    selectedFiles.value.forEach(file => {
        formData.append('images', file);
    });

    try {
        const response = await imagesApi.analyzeBatchImages(formData, (progressEvent) => {
            if (progressEvent.total) {
                uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            }
        });
        results.value = response.data;
    } catch (error) {
        console.error('Batch analysis failed', error);
        const errorMessage = error.response?.data?.detail || error.message;
        alert('Failed to analyze images: ' + errorMessage);
    } finally {
        analyzing.value = false;
        uploadProgress.value = 0;
    }
};

// Bottle selection functions
const toggleBottleSelection = (id) => {
    const idx = selectedBottles.value.indexOf(id);
    if (idx > -1) {
        selectedBottles.value.splice(idx, 1);
    } else {
        selectedBottles.value.push(id);
    }
};

const isBottleSelected = (id) => {
    return selectedBottles.value.includes(id);
};

const clearSelection = () => {
    selectedBottles.value = [];
};

const selectCluster = (clusterId, select) => {
    const cluster = results.value.clusters.find(c => c.cluster_id === clusterId);
    if (!cluster) return;

    cluster.bottle_ids.forEach(bottleId => {
        const idx = selectedBottles.value.indexOf(bottleId);
        if (select && idx === -1) {
            selectedBottles.value.push(bottleId);
        } else if (!select && idx > -1) {
            selectedBottles.value.splice(idx, 1);
        }
    });
};

// Helper functions
const getBottleById = (bottleId) => {
    return results.value?.bottles?.find(b => b.id === bottleId);
};

const formatWeight = (grams) => {
    if (grams === null || grams === undefined) return '—';
    if (grams >= 1000) {
        return `${(grams / 1000).toFixed(2)} kg`;
    }
    return `${grams.toFixed(1)}g`;
};

const getClusterBorderClass = (clusterId) => {
    if (clusterId === -1) return 'border-gray-400';
    const colors = [
        'border-blue-500',
        'border-green-500',
        'border-purple-500',
        'border-orange-500',
        'border-pink-500',
        'border-indigo-500',
        'border-red-500',
        'border-yellow-500',
        'border-teal-500',
    ];
    return colors[clusterId % colors.length];
};

const getClusterDotClass = (clusterId) => {
    if (clusterId === -1) return 'bg-gray-400';
    const colors = [
        'bg-blue-500',
        'bg-green-500',
        'bg-purple-500',
        'bg-orange-500',
        'bg-pink-500',
        'bg-indigo-500',
        'bg-red-500',
        'bg-yellow-500',
        'bg-teal-500',
    ];
    return colors[clusterId % colors.length];
};

// Label management functions
const createLabelFromSelection = async () => {
    if (selectedBottles.value.length === 0) return;

    creatingLabel.value = true;
    try {
        // For batch, we need to use a different approach - select from any image
        // Using the first selected bottle's source image
        const firstBottle = getBottleById(selectedBottles.value[0]);
        if (!firstBottle) {
            throw new Error('Could not find selected bottle');
        }

        const payload = {
            image_id: firstBottle.source_image_id,
            bottle_indices: selectedBottles.value.map(id => {
                const bottle = getBottleById(id);
                return bottle?.local_id ?? id;
            }),
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
        // For batch, we need to handle bottles from multiple images
        // Using the first selected bottle's source image for now
        const firstBottle = getBottleById(selectedBottles.value[0]);
        if (!firstBottle) {
            throw new Error('Could not find selected bottle');
        }

        await imagesApi.addBottlesToLabel(
            firstBottle.source_image_id,
            selectedLabelId.value,
            selectedBottles.value.map(id => {
                const bottle = getBottleById(id);
                return bottle?.local_id ?? id;
            })
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

// Fetch labels on mount
onMounted(() => {
    fetchLabels();
});
</script>
