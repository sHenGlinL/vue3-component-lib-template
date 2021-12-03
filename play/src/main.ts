import { createApp } from "vue"
import App from "./app.vue"

import SLIcon from "@vue3-component-lib-template/components/icon";
import "@vue3-component-lib-template/theme-chalk/src/index.scss"

const app = createApp(App)
app.use(SLIcon)
app.mount('#app')