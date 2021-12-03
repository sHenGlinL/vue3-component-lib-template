import { SLIcon } from "@vue3-component-lib-template/components"

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

export * from "@vue3-component-lib-template/components"