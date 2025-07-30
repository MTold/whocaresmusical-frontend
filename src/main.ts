import 'element-plus/dist/index.css'
import './assets/main.css'
import '@/styles/font.css';

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import setupAxios from './utils/axios-config'

// 设置axios拦截器
setupAxios()

const app = createApp(App) // 只传入根组件

app.use(createPinia())
app.use(router)
app.use(ElementPlus)
app.mount('#app')
