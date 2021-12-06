import { createApp } from "vue"
import App from "./app.vue"

import SLIcon from "@sl-plus/components/icon";
import "@sl-plus/theme-chalk/src/index.scss"

const app = createApp(App)
app.use(SLIcon)
app.mount('#app')