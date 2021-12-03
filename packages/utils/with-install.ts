// Plugin: 使组件含有install方法，app.use时，需要该类型
import type { App, Plugin } from "vue"

// 类型必须导出，否则生成不了.d.ts文件
export type SFCWithInstall<T> = T & Plugin

export const withInstall = <T>(component:T) => {
  (component as SFCWithInstall<T>).install = function(app:App) {
    app.component((component as any).name, component)
  }
  return component as SFCWithInstall<T>
}