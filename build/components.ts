import { series } from "gulp";
import { sync } from "fast-glob";
import { componentsRoot } from "./utils/paths";
import path from "path"
import { nodeResolve } from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import vue from "rollup-plugin-vue"
import typescript from "rollup-plugin-typescript2"
import { rollup, OutputOptions } from "rollup";
import { buildConfig } from "./utils/config";

// 打包每个组件
const buildEachComponent = async () => {
  const files = sync('*', {
    cwd: componentsRoot,
    onlyDirectories: true
  })
  // 把components下的所有组件，打包放到 dist/es/components 和 dist/lib/components 下
  const builds = files.map(async (file: string) => {
    const input = path.resolve(componentsRoot, file, 'index.ts') // 每个组件的入口
    // rollup打包入口配置
    const config = {
      input,
      plugins: [nodeResolve(), typescript(), vue(), commonjs()], // 打包需要的插件
      external: (id) => /^vue/.test(id) || /^@vue3-component-lib-template/.test(id), // 这里也可以写一个插件，把引入的依赖干掉。这里需要排除vue源码包，自己的库的包 
    }
    const bundle = await rollup(config)
    const options = Object.values(buildConfig).map(config => ({
      format: config.format,
      file: path.resolve(config.output.path, `components/${file}/index.js`),
      // paths: pathRewriter() // @vue3-component-lib-template -> vue3-component-lib-template/es或者/lib
    }))
    await Promise.all(options.map(option => bundle.write(option as OutputOptions)))
  })

  return Promise.all(builds)
}
export const buildComponent = series(
  buildEachComponent
)