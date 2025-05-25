import './assets/style/main.css'
import 'virtual:uno.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Button, Dialog, Cell, CellGroup, Field } from 'vant'
import 'vant/lib/index.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Button)
app.use(Dialog)
app.use(Cell)
app.use(CellGroup)
app.use(Field)

app.mount('#app')
