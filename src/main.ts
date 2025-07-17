import 'element-plus/dist/index.css'
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App) // 只传入根组件

app.use(createPinia())
app.use(router)
app.mount('#app')
