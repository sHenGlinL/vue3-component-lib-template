import path from "path"
import { libTemplateRoot, outDir } from "./utils/paths"
import { nodeResolve } from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import vue from "rollup-plugin-vue"
import typescript from "rollup-plugin-typescript2"
import { parallel } from "gulp"
import { rollup, OutputOptions } from "rollup";

const buildFull = async () => {
  // rollup打包的输入配置
  const config = {
    input: path.resolve(libTemplateRoot, 'index.ts'), // 打包入口
    plugins: [nodeResolve(), typescript(), vue(), commonjs()], // 打包需要的插件
    external: (id) => /^vue/.test(id), // 表示打包的时候不打包vue包的源码
  }

  // 整个组件库两种使用方式， import导入 和 在浏览器中使用script标签
  // esm umd

  const buildConfig = [
    {
      format: 'umd',
      file: path.resolve(outDir, 'index.js'),
      name: 'SLPlus', // 全局名字
      exports: 'named', // 导出的名字 用命名的方式导出
      globals: {
        vue: "Vue" // 表示使用的vue是全局的vue
      }
    },
    {
      format: 'esm',
      file: path.resolve(outDir, 'index.esm.js'),
    }
  ]

  const bundle = await rollup(config)
  return Promise.all(buildConfig.map(config => bundle.write(config as OutputOptions)))
}

// gulp适合流程控制和代码转译，没有打包的功能
export const buildFullComponent = parallel(
  buildFull
)