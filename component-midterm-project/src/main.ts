// src/main.ts

// ✅ Only import ONE Tailwind entry file (index.css already includes Tailwind)
import './assets/index.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

// ✅ Pinia first, then router
app.use(createPinia())
app.use(router)

app.mount('#app')
