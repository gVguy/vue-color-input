import { createApp } from 'vue';
import Dev from './serve.vue';
import DevSetup from './serve-setup.vue';

const app = createApp(Dev);
app.config.unwrapInjectedRef = true;
app.mount('#app');

document.title = 'vue-color-input';
