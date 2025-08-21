// src/main.ts
// import './assets/main.css'
import './assets/tailwind.css'
import './assets/index.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

// ✅ Pinia first, then Router (important if you ever use stores in route guards)
app.use(createPinia())
app.use(router)

app.mount('#app')
