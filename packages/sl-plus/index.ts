import { SLIcon } from "@sl-plus/components"

import type { App } from "vue"

const components = [
  SLIcon
]

const install = (app:App) => {
  // 有的是组件，有的是指令 xxx.install = () => app.directive()
  components.forEach(c => {
    app.use(c)
  })
}

export default {
  install
}

export * from "@sl-plus/components"