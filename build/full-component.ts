import path from "path"
import { SLPlusRoot, outDir } from "./utils/paths"
import { nodeResolve } from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import vue from "rollup-plugin-vue"
import typescript from "rollup-plugin-typescript2"
import { parallel } from "gulp"
import { rollup, OutputOptions } from "rollup";
import fs from "fs/promises"
import { buildConfig } from "./utils/config"
import { pathRewriter } from "./utils"

const buildFull = async () => {
  // rollup打包的输入配置
  const config = {
    input: path.resolve(SLPlusRoot, 'index.ts'), // 打包入口
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

// 把入口文件打包放到 dist/es 和 dist/lib 目录下
const buildEntry = async () => {
  const entryFiles = await fs.readdir(SLPlusRoot, { withFileTypes: true });
  // 找到index.ts文件
  const entryPoints = entryFiles
    .filter(f => f.isFile())
    .filter(f => !["package.json"].includes(f.name))
    .map(f => path.resolve(SLPlusRoot, f.name));
  
  const config = {
    input: entryPoints,
    plugins: [nodeResolve(), vue(), typescript()],
    external: (id: string) => /^vue/.test(id) || /^@sl-plus/.test(id),
  };
  const bundle = await rollup(config);
  return Promise.all(
    Object.values(buildConfig)
      .map(config => ({
        format: config.format,
        dir: config.output.path,
        paths: pathRewriter(config.output.name),
      }))
      .map(option => bundle.write(option as OutputOptions))
  );
}

// gulp适合流程控制和代码转译，没有打包的功能
export const buildFullComponent = parallel(
  buildFull,
  buildEntry
)