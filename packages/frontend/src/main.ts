import './assets/main.css'
import * as VueSocialSharing from 'vue-social-sharing'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import App from './App.vue'
import router from './router'
import Vue3Toastify, { type ToastContainerOptions } from 'vue3-toastify'

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate) // Register the plugin
app.use(VueSocialSharing.default)
app.use(pinia)
app.use(router)
app.use(Vue3Toastify, {
  autoClose: 3000,
  // ...
} as ToastContainerOptions)

app.mount('#app')
