import { createApp } from 'vue';
import Dev from './serve.vue';

const app = createApp(Dev);
app.mount('#app');

document.title = 'vue-color-input';