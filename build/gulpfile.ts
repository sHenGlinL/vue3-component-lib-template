// series: 串行  parallel: 并行
import { series, parallel } from "gulp"
import { run, withTaskName } from "./utils"
import { genTypes } from "./gen-types"
import { outDir, SLPlusRoot } from "./utils/paths"

// 拷贝package.json
const copySourceCode = async () => {
  await run(`cp ${SLPlusRoot}/package.json ${outDir}/package.json`)
}

/** 
 * 打包流程如下：
 * 1. 打包样式
 * 2. 打包工具方法
 * 3. 打包所有组件
 * 4. 打包每个组件
 * 5. 生成组件库
 * 6. 发布组件
 * 
 * 其中1，2，3，4步骤可以并行操作
*/
export default series(
  withTaskName('clean', () => run('rm -rf ./dist')), // 删除dist
  parallel(
    withTaskName('buildPackages', () => run('pnpm run --filter ./packages --parallel build')), // 打包packages目录下的所有包（组件包，样式包，工具包），并行执行build命令
    withTaskName('buildFullComponent', () => run('pnpm run build buildFullComponent')), // 执行build命令时会调用rollup, 我们给rollup传递参数buildFullComponent 那么就会执行导出任务叫 buildFullComponent
    withTaskName('buildComponent', () => run('pnpm run build buildComponent')), // 打包每一个组件
  ),
  parallel(
    genTypes,
    copySourceCode
  )
)

// 任务执行器，gulp任务名，根据参数会执行对应任务
export * from "./full-component"
export * from "./components"