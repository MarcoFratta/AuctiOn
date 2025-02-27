import './assets/main.css'
import VueSocialSharing from 'vue-social-sharing'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate) // Register the plugin

app.use(VueSocialSharing)
app.component('font-awesome-icon', FontAwesomeIcon)
app.use(pinia)
app.use(router)

app.mount('#app')
