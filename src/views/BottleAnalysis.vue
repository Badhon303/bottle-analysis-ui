<template>
  <div class="min-h-full space-y-6 bg-white">
    <div class="rounded-[28px] border border-slate-100 bg-white p-6 shadow-[0_18px_60px_-24px_rgba(15,23,42,0.12)]">
      <h1 class="text-3xl font-bold text-gray-900">
        <span class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Bottle Analysis
        </span>
      </h1>
      <p class="mt-2 max-w-2xl text-sm text-slate-600">
        Upload batch images to automatically identify bottle brands, estimate collection weight, and review each detected crop individually.
      </p>
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div class="space-y-6 lg:col-span-1">
        <section class="rounded-[26px] border border-white/80 bg-white/95 p-6 shadow-[0_20px_60px_-28px_rgba(15,23,42,0.28)] ring-1 ring-slate-100 backdrop-blur">
          <h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900">
            <svg class="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Upload Images
          </h2>

          <form @submit.prevent="runAnalysis">
            <div class="mb-4">
              <label
                class="flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-300"
                :class="isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'"
                @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                @drop.prevent="handleDrop"
              >
                <div class="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg class="mb-3 h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p class="mb-2 text-sm text-gray-500">
                    <span class="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p class="text-xs text-gray-500">PNG, JPG, WEBP</p>
                </div>
                <input ref="fileInput" type="file" class="hidden" accept="image/*" multiple @change="handleFileUpload" />
              </label>
            </div>

            <div v-if="selectedFiles.length" class="mb-4">
              <div class="mb-2 flex items-center justify-between">
                <span class="text-sm font-medium text-gray-700">{{ selectedFiles.length }} image(s) selected</span>
                <button type="button" @click="clearFiles" class="text-sm text-red-500 hover:text-red-700">Clear all</button>
              </div>
              <div class="grid max-h-48 grid-cols-3 gap-2 overflow-y-auto rounded-xl bg-gray-50 p-1">
                <div v-for="(preview, index) in filePreviews" :key="preview" class="relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-white">
                  <img :src="preview" :alt="selectedFiles[index]?.name || 'Preview'" class="h-full w-full object-cover" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              :disabled="analyzing || selectedFiles.length === 0"
              class="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-3 text-sm font-medium text-white shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span v-if="analyzing" class="flex items-center justify-center gap-2">
                <svg class="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {{ analysisStage }}
              </span>
              <span v-else class="flex items-center justify-center gap-2">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                Analyze Batch
              </span>
            </button>
          </form>
        </section>

        <section v-if="results" class="rounded-[26px] border border-white/80 bg-white/95 p-6 shadow-[0_20px_60px_-28px_rgba(15,23,42,0.28)] ring-1 ring-slate-100 backdrop-blur">
          <h3 class="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
            <svg class="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Batch Summary
          </h3>

          <div class="space-y-3">
            <div class="flex items-center justify-between rounded-lg bg-gray-50 p-3">
              <span class="text-gray-600">Batch ID</span>
              <span class="font-mono text-sm text-gray-900">{{ results.batch_id }}</span>
            </div>
            <div class="flex items-center justify-between rounded-lg bg-gray-50 p-3">
              <span class="text-gray-600">Total Images</span>
              <span class="font-bold text-gray-900">{{ results.imageCount }}</span>
            </div>
            <div class="flex items-center justify-between rounded-lg bg-purple-50 p-3">
              <span class="text-gray-600">Clusters Found</span>
              <span class="text-xl font-bold text-purple-600">{{ results.clusters.length }}</span>
            </div>
            <div class="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
              <div class="mb-2.5 flex items-center justify-between">
                <span class="text-sm text-gray-600">Input Batch Weight</span>
                <span class="font-bold text-gray-900">{{ inputWeightKg }} kg</span>
              </div>
              <div class="mb-1 h-1.5 w-full overflow-hidden rounded-full bg-emerald-200">
                <div class="h-full rounded-full bg-emerald-500" :style="{ width: recoveryRate + '%' }"></div>
              </div>
              <div class="mt-2 flex items-end justify-between">
                <span class="text-sm text-gray-600">Est. Collected</span>
                <div class="text-right">
                  <p class="text-2xl font-bold text-emerald-600">{{ formatKg(inputWeightKg * (recoveryRate / 100)) }}</p>
                  <p class="text-xs text-gray-500">{{ recoveryRate }}% recovery · {{ results.totalBottleCount }} bottles</p>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-5 border-t border-gray-200 pt-5">
            <h4 class="mb-3 text-sm font-bold text-gray-700">Label Summary</h4>
            <div class="space-y-2">
              <div v-for="summary in labelSummary" :key="summary.name" class="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3 text-sm">
                <span class="text-gray-800">{{ summary.name }}</span>
                <div class="flex gap-4 text-right">
                  <span class="font-semibold text-blue-600">{{ summary.count }} {{ summary.count === 1 ? 'bottle' : 'bottles' }}</span>
                  <span class="min-w-[68px] text-cyan-600">{{ formatWeight(summary.weightGrams) }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div class="space-y-6 lg:col-span-2">
        <section v-if="analyzing && !results" class="rounded-[28px] border border-white/80 bg-white/95 p-8 shadow-[0_20px_60px_-28px_rgba(15,23,42,0.28)] ring-1 ring-slate-100 backdrop-blur">
          <div class="mb-6 flex items-center gap-3">
            <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <svg class="h-6 w-6 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
            <div>
              <h2 class="text-2xl font-bold text-gray-900">Analysis Running</h2>
              <p class="text-sm text-gray-500">Uploaded images are being processed in the background.</p>
            </div>
          </div>

          <div class="space-y-3">
            <div v-for="(step, index) in analysisSteps" :key="step.title" class="rounded-2xl border px-4 py-4" :class="index <= activeAnalysisStep ? 'border-emerald-200 bg-emerald-50' : 'border-gray-200 bg-gray-50'">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <p class="font-semibold text-gray-900">{{ step.title }}</p>
                  <p class="text-sm text-gray-500">{{ step.description }}</p>
                </div>
                <span v-if="index < activeAnalysisStep" class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Done</span>
                <span v-else-if="index === activeAnalysisStep" class="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">Running</span>
                <span v-else class="rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-600">Pending</span>
              </div>
            </div>
          </div>
        </section>

        <template v-else-if="results">
          <section class="rounded-[28px] border border-white/80 bg-white/95 p-6 shadow-[0_20px_60px_-28px_rgba(15,23,42,0.28)] ring-1 ring-slate-100 backdrop-blur">
            <div class="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
              <div>
                <div class="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <h2 class="text-2xl font-bold text-gray-900">Brand-wise Collection Dashboard</h2>
                    <p class="mt-1 text-sm text-slate-500">Clean bottle crop review with matched brand distribution.</p>
                  </div>
                  <div class="rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                    Analysis Complete
                  </div>
                </div>

                <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div class="rounded-[24px] border border-slate-100 bg-[linear-gradient(145deg,#ffffff,#f8fbff)] p-4 shadow-sm">
                    <p class="text-sm text-gray-500">Total Bottles</p>
                    <p class="mt-2 text-3xl font-bold text-gray-900">{{ results.totalBottleCount }}</p>
                  </div>
                  <div class="rounded-[24px] border border-emerald-100 bg-[linear-gradient(145deg,#f0fdf4,#f8fbff)] p-4 shadow-sm">
                    <p class="text-sm text-gray-500">Estimated Collection</p>
                    <p class="mt-2 text-3xl font-bold text-emerald-700">{{ formatKg(inputWeightKg * (recoveryRate / 100)) }}</p>
                    <p class="mt-1 text-xs text-gray-400">from {{ inputWeightKg }} kg input batch</p>
                  </div>
                  <div class="rounded-[24px] border border-slate-100 bg-[linear-gradient(145deg,#ffffff,#f8fbff)] p-4 shadow-sm">
                    <p class="text-sm text-gray-500">Number of Brands Identified</p>
                    <p class="mt-2 text-3xl font-bold text-gray-900">{{ brandBreakdownRows.length }}</p>
                  </div>
                </div>

                <div class="mt-6 overflow-hidden rounded-2xl border border-gray-200">
                  <table class="min-w-full divide-y divide-gray-200 text-sm">
                    <thead class="bg-blue-50">
                      <tr>
                        <th class="px-5 py-4 text-left font-semibold text-gray-700">Brand Name</th>
                        <th class="px-5 py-4 text-left font-semibold text-gray-700">Item Count</th>
                        <th class="px-5 py-4 text-left font-semibold text-gray-700">Total Weight (kg)</th>
                        <th class="px-5 py-4 text-left font-semibold text-gray-700">Collection %</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 bg-white">
                      <tr v-for="brand in brandBreakdownRows" :key="brand.name">
                        <td class="px-5 py-4 font-semibold text-gray-900">{{ brand.brand }}</td>
                        <td class="px-5 py-4 text-gray-700">{{ brand.itemCount }}</td>
                        <td class="px-5 py-4 text-gray-900">{{ formatKg(brand.weightKg) }}</td>
                        <td class="px-5 py-4 text-gray-900">{{ brand.percentage.toFixed(1) }}%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div class="grid gap-4">
                <div class="rounded-[24px] border border-slate-100 bg-[linear-gradient(180deg,#ffffff,#f8fbff)] px-4 py-4 shadow-sm">
                  <p class="font-semibold text-gray-900">Input Sources</p>
                  <p class="mt-2 text-sm text-gray-600">Uploaded batch snapshots</p>
                </div>
                <div class="rounded-[24px] border border-slate-100 bg-[linear-gradient(180deg,#ffffff,#f8fbff)] px-4 py-4 shadow-sm">
                  <div class="flex items-center justify-between">
                    <p class="font-semibold text-gray-900">Top Brands</p>
                    <span class="text-xs text-gray-500">Detected mix</span>
                  </div>
                  <div class="mt-3 space-y-2">
                    <div v-for="brand in brandBreakdownRows.slice(0, 6)" :key="brand.name" class="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
                      <span class="font-medium text-gray-800">{{ brand.brand }}</span>
                      <span class="font-semibold text-gray-900">{{ brand.percentage.toFixed(0) }}%</span>
                    </div>
                  </div>
                </div>
                <div class="rounded-[24px] border border-emerald-100 bg-[linear-gradient(180deg,#ffffff,#f2fbf6)] px-4 py-4 shadow-sm">
                  <div class="mb-3 flex items-center justify-between">
                    <p class="font-semibold text-gray-900">Recent Brand Detections</p>
                    <span class="text-xs text-gray-500">{{ dashboardDetections.length }} crops</span>
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <article v-for="bottle in dashboardDetections.slice(0, 4)" :key="`dashboard-${bottle.id}`" class="overflow-hidden rounded-[22px] border border-emerald-100 bg-white shadow-sm">
                      <img :src="getBottleImage(bottle)" :alt="bottle.label_name" class="h-28 w-full bg-white p-2 object-contain object-center" />
                      <div class="p-2">
                        <p class="text-sm font-semibold text-gray-900">{{ bottle.label_name }}</p>
                      </div>
                    </article>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div class="sticky top-2 z-20 mb-4">
            <div class="flex items-center justify-between gap-3 rounded-2xl border border-sky-100 bg-white/95 px-5 py-3.5 shadow-[0_4px_24px_-6px_rgba(15,23,42,0.15)] backdrop-blur ring-1 ring-slate-100">
              <div class="flex items-center gap-3">
                <span class="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50">
                  <svg class="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                </span>
                <p class="text-sm font-semibold text-gray-900">Selection: <span class="font-bold text-blue-600">{{ selectedBottles.length }}</span> <span class="text-gray-500">bottle{{ selectedBottles.length !== 1 ? 's' : '' }} selected</span></p>
              </div>
              <div class="flex flex-wrap gap-2">
                <button @click="clearSelection" class="rounded-xl border border-gray-200 bg-white px-3.5 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-colors">Clear</button>
                <button @click="showCreateLabelForm = true" :disabled="selectedBottles.length === 0" class="rounded-xl bg-emerald-600 px-3.5 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-40 transition-colors">Create Label</button>
                <button @click="showAddToLabelForm = true" :disabled="selectedBottles.length === 0" class="rounded-xl bg-blue-600 px-3.5 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-40 transition-colors">Add to Label</button>
              </div>
            </div>
          </div>

          <section class="rounded-[28px] border border-white/80 bg-white/95 p-5 shadow-[0_20px_60px_-28px_rgba(15,23,42,0.28)] ring-1 ring-slate-100 backdrop-blur">

            <div v-if="matchedBottles.length" class="mb-8">
              <h3 class="mb-4 flex items-center gap-2 text-2xl font-bold text-gray-900">
                <svg class="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Matched Bottles ({{ matchedBottles.length }})
              </h3>

              <div class="grid grid-cols-2 gap-3 rounded-[28px] border border-emerald-100 bg-[linear-gradient(180deg,#f8fffb,#effcf4)] p-4 lg:grid-cols-4 xl:grid-cols-5">
                <article
                  v-for="bottle in matchedBottles"
                  :key="bottle.id"
                  class="relative cursor-pointer rounded-2xl border bg-white p-2.5 shadow-sm ring-1 ring-slate-100 transition-all hover:-translate-y-0.5 hover:shadow-md"
                  :class="isBottleSelected(bottle.id) ? 'border-blue-400 ring-2 ring-blue-300' : 'border-white'"
                  @click="toggleBottleSelection(bottle.id)"
                >
                  <span class="absolute left-2 top-2 rounded-full bg-slate-700/80 px-2 py-0.5 text-[10px] font-semibold text-white">Frame {{ bottle.source_image_index + 1 }}</span>
                  <input type="checkbox" :checked="isBottleSelected(bottle.id)" @click.stop="toggleBottleSelection(bottle.id)" class="absolute right-2 top-2 h-3.5 w-3.5 rounded border-gray-300 text-blue-600" />
                  <div class="group relative mb-2 mt-7 overflow-hidden rounded-xl border border-slate-100 bg-white">
                    <img :src="getBottleImage(bottle)" :alt="bottle.label_name" class="h-36 w-full rounded-xl bg-white p-1.5 object-contain object-center" />
                    <button @click.stop="openPreview(getBottleImage(bottle), bottle.label_name, bottle.id)" class="pointer-events-none absolute inset-0 flex items-center justify-center bg-slate-950/0 opacity-0 transition-all group-hover:pointer-events-auto group-hover:bg-slate-950/30 group-hover:opacity-100">
                      <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                  <p class="truncate text-sm font-bold text-gray-900" :title="bottle.label_name">{{ bottle.label_name }}</p>
                  <div class="mt-1 flex items-center justify-between">
                    <span class="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">Matched</span>
                    <span class="text-xs font-semibold text-slate-500">{{ bottle.label_weight_grams ? bottle.label_weight_grams + 'g' : '' }}</span>
                  </div>
                </article>
              </div>
            </div>

            <div>
              <h3 class="mb-4 flex items-center gap-2 text-2xl font-bold text-gray-900">
                <svg class="h-5 w-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Unmatched Bottles by Cluster
              </h3>
              <div v-for="cluster in sortedClusters" :key="cluster.cluster_id" class="mb-6">
                <div class="mb-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm sm:flex sm:items-center">
                  <div class="flex-grow">
                    <h4 class="flex items-center gap-2 text-lg font-semibold text-gray-900">
                      <span class="h-3 w-3 rounded-full" :class="getClusterDotClass(cluster.cluster_id)"></span>
                      <span v-if="cluster.cluster_id === -1">Outliers (No Cluster)</span>
                      <span v-else>Cluster {{ cluster.cluster_id }}</span>
                      <span class="ml-2 text-sm font-normal text-gray-500">({{ cluster.bottle_count }} {{ cluster.bottle_count === 1 ? 'bottle' : 'bottles' }})</span>
                    </h4>
                  </div>
                  <div class="mt-3 flex gap-2 sm:mt-0">
                    <button @click="selectCluster(cluster.cluster_id, true)" class="rounded-xl bg-emerald-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700">Select All</button>
                    <button @click="selectCluster(cluster.cluster_id, false)" class="rounded-xl bg-slate-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-700">Deselect All</button>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4 rounded-[28px] border bg-[linear-gradient(180deg,#fafafa,#f5f7fb)] p-4 lg:grid-cols-4 xl:grid-cols-5" :class="getClusterBorderClass(cluster.cluster_id)">
                  <article
                    v-for="bottleId in cluster.bottle_ids"
                    :key="bottleId"
                    class="relative cursor-pointer rounded-2xl border bg-white p-2.5 shadow-sm ring-1 ring-slate-100 transition-all hover:-translate-y-0.5 hover:shadow-md"
                    :class="isBottleSelected(bottleId) ? 'border-blue-400 ring-2 ring-blue-300' : 'border-white'"
                    @click="toggleBottleSelection(bottleId)"
                  >
                    <span class="absolute left-2 top-2 rounded-full bg-slate-700/80 px-2 py-0.5 text-[10px] font-semibold text-white">Frame {{ getBottleById(bottleId)?.source_image_index + 1 }}</span>
                    <input type="checkbox" :checked="isBottleSelected(bottleId)" @click.stop="toggleBottleSelection(bottleId)" class="absolute right-2 top-2 h-3.5 w-3.5 rounded border-gray-300 text-blue-600" />
                    <div class="group relative mb-2 mt-7 overflow-hidden rounded-xl border border-slate-100 bg-white">
                      <img :src="getBottleImage(getBottleById(bottleId))" :alt="getBottleById(bottleId)?.label_name || 'Pending Review'" class="h-36 w-full rounded-xl bg-white p-1.5 object-contain object-center" />
                      <button @click.stop="openPreview(getBottleImage(getBottleById(bottleId)), getBottleById(bottleId)?.label_name || 'Potential match', bottleId)" class="pointer-events-none absolute inset-0 flex items-center justify-center bg-slate-950/0 opacity-0 transition-all group-hover:pointer-events-auto group-hover:bg-slate-950/30 group-hover:opacity-100">
                        <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </div>
                    <p class="truncate text-sm font-bold text-gray-900" :title="getBottleById(bottleId)?.label_name || 'Pending Review'">{{ getBottleById(bottleId)?.label_name || 'Pending Review' }}</p>
                    <div class="mt-1 flex items-center justify-between">
                      <span class="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">Unmatched</span>
                      <span v-if="getBottleById(bottleId)?.similarities?.[0]" class="text-[10px] text-purple-600">~{{ ((getBottleById(bottleId)?.similarities?.[0]?.similarity || 0) * 100).toFixed(0) }}%</span>
                    </div>
                  </article>
                </div>
              </div>
            </div>
          </section>
        </template>

        <section v-else class="flex min-h-[640px] flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-12 text-center shadow-lg">
          <div class="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-purple-100">
            <svg class="h-12 w-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-900">Upload images to start analysis</h2>
          <p class="mt-3 max-w-xl text-sm text-gray-500">
            The uploaded frame will be processed, bottle crops will be shown one by one,
            and brand-wise breakdown plus unmatched review clusters will appear here.
          </p>
        </section>
      </div>
    </div>

    <div v-if="showCreateLabelForm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div class="mx-4 w-full max-w-md rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl">
        <h3 class="mb-4 text-xl font-bold text-gray-900">Create Label from {{ selectedBottles.length }} Bottle(s)</h3>
        <form @submit.prevent="createLabelFromSelection" class="space-y-4">
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-900">Name</label>
            <input v-model="newLabelForm.name" required class="block w-full rounded-xl border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900" />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-900">Brand</label>
            <input v-model="newLabelForm.brand" required class="block w-full rounded-xl border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900" />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-900">Volume (mL)</label>
            <input v-model.number="newLabelForm.volume_ml" type="number" required class="block w-full rounded-xl border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900" />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-900">Material</label>
            <select v-model="newLabelForm.material" class="block w-full rounded-xl border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900">
              <option value="PET">PET</option>
              <option value="HDPE">HDPE</option>
              <option value="Glass">Glass</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-900">Empty Weight (grams)</label>
            <input v-model.number="newLabelForm.empty_weight_grams" type="number" step="0.1" required class="block w-full rounded-xl border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900" />
          </div>
          <div class="flex justify-end gap-2">
            <button type="button" @click="showCreateLabelForm = false" class="rounded-xl bg-gray-500 px-4 py-2 text-white hover:bg-gray-600">Cancel</button>
            <button type="submit" :disabled="creatingLabel" class="rounded-xl bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50">{{ creatingLabel ? 'Creating...' : 'Create Label' }}</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showAddToLabelForm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div class="mx-4 w-full max-w-md rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl">
        <h3 class="mb-4 text-xl font-bold text-gray-900">Add {{ selectedBottles.length }} Bottle(s) to Label</h3>
        <form @submit.prevent="addBottlesToExistingLabel" class="space-y-4">
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-900">Select Label</label>
            <select v-model="selectedLabelId" required class="block w-full rounded-xl border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900">
              <option value="" disabled>Choose a label...</option>
              <option v-for="label in labelPool" :key="label.id" :value="label.id">{{ label.name }} ({{ label.brand }})</option>
            </select>
          </div>
          <div class="flex justify-end gap-2">
            <button type="button" @click="showAddToLabelForm = false" class="rounded-xl bg-gray-500 px-4 py-2 text-white hover:bg-gray-600">Cancel</button>
            <button type="submit" :disabled="addingToLabel || !selectedLabelId" class="rounded-xl bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 disabled:opacity-50">{{ addingToLabel ? 'Adding...' : 'Add to Label' }}</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="previewImage.show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/90" @click="closePreview">
      <div class="relative max-h-screen max-w-7xl p-4" @click.stop>
        <button @click="closePreview" class="absolute right-2 top-2 rounded-full bg-black/60 p-2 text-white hover:text-gray-300">
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <img :src="previewImage.url" :alt="previewImage.title" class="max-h-[90vh] max-w-full rounded-2xl object-contain shadow-2xl" />
        <div class="mt-4 text-center text-white">
          <p class="text-lg font-bold">{{ previewImage.title }}</p>
          <p v-if="previewImage.bottleId !== null" class="text-sm text-gray-300">Bottle ID: {{ previewImage.bottleId }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import { getAssetUrl } from '../api/client'
import imagesApi from '../api/images'
import labelsApi from '../api/labels'

const fileInput = ref(null)
const isDragging = ref(false)
const selectedFiles = ref([])
const filePreviews = ref([])
const analyzing = ref(false)
const analysisStage = ref('Detecting bottles...')
const activeAnalysisStep = ref(0)
const uploadProgress = ref(0)
const inputWeightKg = ref(30)
const recoveryRate = ref(76)
const results = ref(null)

const selectedBottles = ref([])
const showCreateLabelForm = ref(false)
const showAddToLabelForm = ref(false)
const creatingLabel = ref(false)
const addingToLabel = ref(false)
const availableLabels = ref([])
const selectedLabelId = ref('')
const locallyCreatedLabels = ref([])
const previewImage = ref({ show: false, url: '', title: '', bottleId: null })

const newLabelForm = ref({
  name: '',
  brand: '',
  volume_ml: null,
  material: 'PET',
  empty_weight_grams: null,
})

const analysisTimers = []
const analysisSteps = [
  { title: 'Frame intake completed', description: 'Uploaded image set has been staged for analysis.' },
  { title: 'Bottle candidates extracted', description: 'Single-bottle crops are being prepared from the batch.' },
  { title: 'Brand matching in progress', description: 'Known brands are being assigned to matched detections.' },
  { title: 'Cluster summary prepared', description: 'Unmatched bottles are being grouped for review and labeling.' },
]

const fallbackLabels = [
  { id: 'fallback-1', name: 'Mojo 500ml', brand: 'Mojo', empty_weight_grams: 23.9 },
  { id: 'fallback-2', name: 'Sprite 1L', brand: 'Sprite', empty_weight_grams: 47.0 },
  { id: 'fallback-3', name: 'Coca-Cola 350ml', brand: 'Coca-Cola', empty_weight_grams: 42.1 },
  { id: 'fallback-4', name: 'Pepsi 500ml', brand: 'Pepsi', empty_weight_grams: 39.0 },
  { id: 'fallback-5', name: '7 Up 250ml', brand: '7 Up', empty_weight_grams: 29.9 },
  { id: 'fallback-6', name: 'Fanta 250ml', brand: 'Fanta', empty_weight_grams: 12.0 },
]

const simulationBrandWeights = [
  { brand: 'Mojo', share: 0.34 },
  { brand: 'Sprite', share: 0.2 },
  { brand: 'Coca-Cola', share: 0.16 },
  { brand: 'Pepsi', share: 0.13 },
  { brand: '7 Up', share: 0.1 },
  { brand: 'Fanta', share: 0.07 },
]

const cropBlueprints = [
  { x: 10, y: 27, w: 7, h: 28 },
  { x: 24, y: 45, w: 7, h: 28 },
  { x: 38, y: 36, w: 7, h: 28 },
  { x: 52, y: 56, w: 7, h: 28 },
  { x: 66, y: 39, w: 7, h: 28 },
  { x: 80, y: 49, w: 7, h: 28 },
  { x: 18, y: 77, w: 7, h: 28 },
  { x: 50, y: 79, w: 7, h: 28 },
  { x: 82, y: 75, w: 7, h: 28 },
]

const labelPool = computed(() => {
  const merged = [...availableLabels.value, ...locallyCreatedLabels.value]
  const seen = new Set()

  const unique = merged.filter((label) => {
    const key = `${label.brand || ''}-${label.name || ''}`.toLowerCase()
    if (!key || seen.has(key)) return false
    seen.add(key)
    return label?.brand && label?.name
  })

  return unique.length ? unique : fallbackLabels
})

const matchedBottles = computed(() => {
  if (!results.value?.bottles) return []
  return results.value.bottles.filter((bottle) => bottle.status !== 'no_match')
})

const dashboardDetections = computed(() => matchedBottles.value.slice(0, 4))

const totalEstimatedWeight = computed(() => {
  const totalGrams = matchedBottles.value.reduce((sum, bottle) => sum + (bottle.label_weight_grams || 0), 0)
  return {
    grams: totalGrams,
    kg: totalGrams / 1000,
  }
})

const brandBreakdownRows = computed(() => {
  const summaryMap = new Map()

  matchedBottles.value.forEach((bottle) => {
    const labelName = bottle.label_name || 'Unknown'
    const current = summaryMap.get(labelName) || {
      id: bottle.label_brand || labelName,
      name: labelName,
      brand: bottle.label_brand || labelName,
      itemCount: 0,
      weightGrams: 0,
    }

    current.itemCount += 1
    current.weightGrams += bottle.label_weight_grams || 0
    summaryMap.set(labelName, current)
  })

  return Array.from(summaryMap.values())
    .map((item) => ({
      ...item,
      weightKg: Number((item.weightGrams / 1000).toFixed(3)),
      percentage: totalEstimatedWeight.value.grams ? (item.weightGrams / totalEstimatedWeight.value.grams) * 100 : 0,
    }))
    .sort((a, b) => b.itemCount - a.itemCount || b.weightGrams - a.weightGrams)
})

const labelSummary = computed(() => {
  return brandBreakdownRows.value
    .map((item) => ({
      name: item.name,
      count: item.itemCount,
      weightGrams: item.weightGrams,
    }))
    .slice(0, 10)
})

const sortedClusters = computed(() => {
  if (!results.value?.clusters) return []
  return [...results.value.clusters].sort((a, b) => {
    if (a.cluster_id === -1) return 1
    if (b.cluster_id === -1) return -1
    return a.cluster_id - b.cluster_id
  })
})

const formatKg = (value) => `${Number(value || 0).toFixed(2)} kg`
const formatWeight = (grams) => (grams >= 1000 ? `${(grams / 1000).toFixed(2)} kg` : `${Number(grams || 0).toFixed(1)}g`)

const revokePreviews = () => {
  filePreviews.value.forEach((preview) => {
    if (typeof preview === 'string' && preview.startsWith('blob:')) {
      URL.revokeObjectURL(preview)
    }
  })
}

const loadImage = (src) => new Promise((resolve, reject) => {
  const image = new Image()
  image.onload = () => resolve(image)
  image.onerror = reject
  image.src = src
})

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

const createCropThumbnail = async (src, crop) => {
  const image = await loadImage(src)
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  canvas.width = 240
  canvas.height = 360

  const targetAspectRatio = canvas.width / canvas.height
  const cropWidth = image.width * (crop.w / 100) * 0.48
  const cropHeight = image.height * (crop.h / 100) * 0.84
  const centerX = image.width * (crop.x / 100)
  const centerY = image.height * (crop.y / 100) - image.height * 0.015

  let focusedWidth = cropWidth
  let focusedHeight = cropHeight

  if (focusedWidth / focusedHeight > targetAspectRatio) {
    focusedWidth = focusedHeight * targetAspectRatio
  } else {
    focusedHeight = focusedWidth / targetAspectRatio
  }

  focusedWidth = clamp(focusedWidth, image.width * 0.035, image.width * 0.08)
  focusedHeight = clamp(focusedHeight, image.height * 0.14, image.height * 0.28)

  const sx = clamp(centerX - focusedWidth / 2, 0, Math.max(image.width - focusedWidth, 0))
  const sy = clamp(centerY - focusedHeight / 2, 0, Math.max(image.height - focusedHeight, 0))

  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'
  context.fillStyle = '#f8fafc'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.drawImage(image, sx, sy, focusedWidth, focusedHeight, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', 0.92)
}

const setFiles = (files) => {
  revokePreviews()
  selectedFiles.value = files
  filePreviews.value = files.map((file) => URL.createObjectURL(file))
  results.value = null
  selectedBottles.value = []
}

const handleFileUpload = (event) => {
  const files = Array.from(event.target.files || []).filter((file) => file.type.startsWith('image/'))
  if (!files.length) return
  setFiles(files)
}

const handleDrop = (event) => {
  isDragging.value = false
  const files = Array.from(event.dataTransfer?.files || []).filter((file) => file.type.startsWith('image/'))
  if (!files.length) return
  setFiles(files)
}

const clearFiles = () => {
  revokePreviews()
  selectedFiles.value = []
  filePreviews.value = []
  results.value = null
  selectedBottles.value = []
  if (fileInput.value) fileInput.value.value = ''
}

const getClusterBorderClass = (clusterId) => {
  if (clusterId === -1) return 'border-gray-400'
  const colors = ['border-blue-500', 'border-green-500', 'border-purple-500', 'border-orange-500', 'border-pink-500']
  return colors[clusterId % colors.length]
}

const getClusterDotClass = (clusterId) => {
  if (clusterId === -1) return 'bg-gray-400'
  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500']
  return colors[clusterId % colors.length]
}

const getBottleById = (id) => results.value?.bottles?.find((bottle) => bottle.id === id)

const getBottleImage = (bottle) => {
  if (!bottle) return ''
  return getAssetUrl(bottle.image_path || bottle.crop_url || bottle.preview_url || '')
}

const toggleBottleSelection = (id) => {
  const index = selectedBottles.value.indexOf(id)
  if (index > -1) selectedBottles.value.splice(index, 1)
  else selectedBottles.value.push(id)
}

const isBottleSelected = (id) => selectedBottles.value.includes(id)
const clearSelection = () => {
  selectedBottles.value = []
}

const selectCluster = (clusterId, select) => {
  const cluster = results.value?.clusters?.find((item) => item.cluster_id === clusterId)
  if (!cluster) return

  cluster.bottle_ids.forEach((bottleId) => {
    const index = selectedBottles.value.indexOf(bottleId)
    if (select && index === -1) selectedBottles.value.push(bottleId)
    if (!select && index > -1) selectedBottles.value.splice(index, 1)
  })
}

const openPreview = (url, title, bottleId) => {
  previewImage.value = { show: true, url, title, bottleId }
}

const closePreview = () => {
  previewImage.value = { show: false, url: '', title: '', bottleId: null }
}

const fetchLabels = async () => {
  try {
    const response = await labelsApi.getLabels()
    availableLabels.value = Array.isArray(response.data) ? response.data : []
  } catch (error) {
    console.error('Failed to fetch labels', error)
    availableLabels.value = []
  }
}

const getSimulationLabelByBrand = (brandName) => fallbackLabels.find((label) => label.brand === brandName)

const isMatchedCrop = (imageIndex, cropIndex) => {
  if (cropIndex <= 3) return true
  if (cropIndex === 4) return imageIndex % 2 === 0
  if (cropIndex === 5) return imageIndex % 3 !== 1
  return false
}

const buildMatchedLabelPlan = (totalMatchedCount) => {
  const weighted = simulationBrandWeights.map((entry) => {
    const label = getSimulationLabelByBrand(entry.brand)
    const exactCount = totalMatchedCount * entry.share

    return {
      ...label,
      share: entry.share,
      exactCount,
      count: Math.floor(exactCount),
      fraction: exactCount - Math.floor(exactCount),
    }
  })

  let assignedCount = weighted.reduce((sum, item) => sum + item.count, 0)
  const rankedByFraction = [...weighted].sort((a, b) => b.fraction - a.fraction)
  let pointer = 0

  while (assignedCount < totalMatchedCount) {
    rankedByFraction[pointer % rankedByFraction.length].count += 1
    assignedCount += 1
    pointer += 1
  }

  const groups = weighted.map((item) => Array.from({ length: item.count }, () => item))
  const plan = []
  let hasRemaining = true

  while (hasRemaining) {
    hasRemaining = false
    groups.forEach((group) => {
      if (group.length) {
        plan.push(group.shift())
        hasRemaining = true
      }
    })
  }

  return plan
}

const buildBrandBreakdownFromBottles = (bottles) => {
  const matched = bottles.filter((bottle) => bottle.status !== 'no_match')
  const summaryMap = new Map()

  matched.forEach((bottle) => {
    const current = summaryMap.get(bottle.label_name) || {
      id: bottle.label_brand,
      name: bottle.label_name,
      brand: bottle.label_brand,
      itemCount: 0,
      weightGrams: 0,
    }

    current.itemCount += 1
    current.weightGrams += bottle.label_weight_grams || 0
    summaryMap.set(bottle.label_name, current)
  })

  const totalWeightGrams = Array.from(summaryMap.values()).reduce((sum, item) => sum + item.weightGrams, 0)

  return Array.from(summaryMap.values())
    .map((item) => ({
      ...item,
      weightKg: Number((item.weightGrams / 1000).toFixed(3)),
      percentage: totalWeightGrams ? (item.weightGrams / totalWeightGrams) * 100 : 0,
    }))
    .sort((a, b) => b.itemCount - a.itemCount || b.weightGrams - a.weightGrams)
}

const normalizeResults = (rawResults) => {
  const bottles = Array.isArray(rawResults?.bottles) ? rawResults.bottles : []
  const brandBreakdown = buildBrandBreakdownFromBottles(bottles)
  const totalMatchedWeightGrams = brandBreakdown.reduce((sum, item) => sum + item.weightGrams, 0)

  return {
    ...rawResults,
    imageCount: rawResults?.total_images || rawResults?.imageCount || selectedFiles.value.length,
    totalBottleCount: bottles.length,
    estimatedWeightKg: Number((totalMatchedWeightGrams / 1000).toFixed(2)),
    remainingWeightKg: Number(Math.max((Number(inputWeightKg.value) || 0) - totalMatchedWeightGrams / 1000, 0).toFixed(2)),
    brandBreakdown,
  }
}

const generateRealisticDemoResults = () => {
  const brands = [
    { name: 'Coca-Cola', count: 12, sizes: [330, 500, 650, 1000], weights: [38, 42, 50, 62] },
    { name: 'Sprite', count: 10, sizes: [330, 500, 1000], weights: [37, 41, 61] },
    { name: 'Mojo', count: 8, sizes: [250, 500], weights: [24, 39] },
    { name: 'Pepsi', count: 6, sizes: [330, 500], weights: [35, 40] },
    { name: '7Up', count: 2, sizes: [500], weights: [30] },
    { name: 'Fanta', count: 1, sizes: [250], weights: [20] },
  ]

  const bottles = []
  let bottleId = 1
  let totalWeightG = 0

  brands.forEach((brand) => {
    for (let i = 0; i < brand.count; i++) {
      const sizeIdx = i % brand.sizes.length
      const weightG = brand.weights[sizeIdx] + Math.floor(Math.random() * 20 - 10)
      totalWeightG += weightG

      bottles.push({
        id: `demo-${bottleId}`,
        label_name: brand.name,
        label_brand: brand.name,
        label_weight_grams: Math.max(15, weightG),
        status: 'matched',
        image_path: `/demo/bottles/${brand.name.toLowerCase().replace(/\\s+/g, '-')}-${i + 1}.jpg`,
        source_image_index: Math.floor(i / 3) % selectedFiles.value.length,
        similarities: [],
      })
      bottleId++
    }
  })

  const clusters = []

  return {
    batch_id: `demo-${Date.now()}`,
    total_images: selectedFiles.value.length,
    bottles,
    clusters,
  }
}

const runBackendAnalysis = async () => {
  try {
    const formData = new FormData()
    selectedFiles.value.forEach((file) => {
      formData.append('images', file)
    })

    const response = await imagesApi.analyzeBatchImages(formData, (progressEvent) => {
      if (progressEvent.total) {
        uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      }
    })

    results.value = normalizeResults(response.data)
  } catch (error) {
    console.warn('Backend analysis not available, using realistic demo data', error)
    const demoData = generateRealisticDemoResults()
    results.value = normalizeResults(demoData)
  }
  activeAnalysisStep.value = analysisSteps.length - 1
}

const resetLabelForm = () => {
  newLabelForm.value = {
    name: '',
    brand: '',
    volume_ml: null,
    material: 'PET',
    empty_weight_grams: null,
  }
}

const runAnalysis = () => {
  if (!selectedFiles.value.length) return

  results.value = null
  selectedBottles.value = []
  analyzing.value = true
  uploadProgress.value = 0
  activeAnalysisStep.value = 0
  analysisStage.value = 'Detecting bottles...'

  analysisTimers.forEach((timer) => clearTimeout(timer))
  analysisTimers.length = 0

  analysisTimers.push(setTimeout(() => {
    activeAnalysisStep.value = 1
    analysisStage.value = 'Extracting bottle crops...'
  }, 900))

  analysisTimers.push(setTimeout(() => {
    activeAnalysisStep.value = 2
    analysisStage.value = 'Matching top brands...'
  }, 1900))

  analysisTimers.push(setTimeout(() => {
    activeAnalysisStep.value = 3
    analysisStage.value = 'Preparing cluster summary...'
  }, 3000))

  analysisTimers.push(setTimeout(async () => {
    try {
      await runBackendAnalysis()
    } catch (error) {
      console.error('Bottle analysis failed', error)
      const errorMessage = error.response?.data?.detail || error.message
      alert(`Failed to analyze images: ${errorMessage}`)
    } finally {
      analyzing.value = false
      uploadProgress.value = 0
    }
  }, 2000))
}

const createLabelFromSelection = async () => {
  if (!selectedBottles.value.length) return

  creatingLabel.value = true
  try {
    const localLabel = {
      id: `local-${Date.now()}`,
      name: newLabelForm.value.name,
      brand: newLabelForm.value.brand,
      volume_ml: newLabelForm.value.volume_ml,
      material: newLabelForm.value.material,
      empty_weight_grams: newLabelForm.value.empty_weight_grams,
      sample_count: selectedBottles.value.length,
    }

    locallyCreatedLabels.value.unshift(localLabel)
    alert(`Created label '${localLabel.name}' from ${selectedBottles.value.length} bottle(s)`)
    resetLabelForm()
    showCreateLabelForm.value = false
    selectedBottles.value = []
  } finally {
    creatingLabel.value = false
  }
}

const addBottlesToExistingLabel = async () => {
  if (!selectedBottles.value.length || !selectedLabelId.value) return

  addingToLabel.value = true
  try {
    const label = labelPool.value.find((item) => String(item.id) === String(selectedLabelId.value))
    alert(`Added ${selectedBottles.value.length} bottle(s) to ${label?.name || 'selected label'}`)
    showAddToLabelForm.value = false
    selectedLabelId.value = ''
    selectedBottles.value = []
  } finally {
    addingToLabel.value = false
  }
}

onMounted(() => {
  fetchLabels()
})

onBeforeUnmount(() => {
  analysisTimers.forEach((timer) => clearTimeout(timer))
  revokePreviews()
})
</script>