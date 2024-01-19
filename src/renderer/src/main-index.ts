import { createApp } from 'vue';

import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';

import { I18n } from '@/lib/i18n';

import { createPinia } from 'pinia';
import { createPersistedState } from 'pinia-plugin-persistedstate';

import MainIndex from '@/renderer/src/MainIndex.vue';

const pinia = createPinia();
pinia.use(
  createPersistedState({
    auto: true,
    storage: localStorage
  })
);

const app = createApp(MainIndex);
app.use(I18n);
app.use(pinia);
app.use(ElementPlus);
app.mount('#app');
