/**这里主要放置的是组件的props， 及一些公共的方法**/

import type { ExtractPropTypes } from 'vue' // vue3内置类型。作用：给一个类型，返回一个vue的props类型

export const iconProps = {
  size: {
    type: Number
  },
  color: {
    type: String
  }
}

// 导出类型，给外界使用
export type IconProps = ExtractPropTypes<typeof iconProps>