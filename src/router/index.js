import { createRouter, createWebHistory } from 'vue-router';

import Batches from '../views/Batches.vue';
import BatchDetails from '../views/BatchDetails.vue';
import Labels from '../views/Labels.vue';

import Analyze from '../views/Analyze.vue';
import BatchAnalyze from '../views/BatchAnalyze.vue';

const routes = [
    {
        path: '/analyze',
        name: 'Analyze',
        component: Analyze,
    },
    {
        path: '/batch-analyze',
        name: 'BatchAnalyze',
        component: BatchAnalyze,
    },
    // {
    //     path: '/batches',
    //     name: 'Batches',
    //     component: Batches,
    // },
    // {
    //     path: '/batches/:id',
    //     name: 'BatchDetails',
    //     component: BatchDetails,
    //     props: true,
    // },
    {
        path: '/labels',
        name: 'Labels',
        component: Labels,
    },

];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
