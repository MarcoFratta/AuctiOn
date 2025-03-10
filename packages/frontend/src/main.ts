import './assets/main.css'
import * as VueSocialSharing from 'vue-social-sharing'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate) // Register the plugin
app.use(VueSocialSharing.default)
app.use(pinia)
app.use(router)

app.mount('#app')
