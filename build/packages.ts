// 专门打包util，指令，hook等
import { series, parallel, src, dest } from "gulp";
import { buildConfig } from "./utils/config";
import path from "path";
import { outDir, projectRoot } from "./utils/paths";
import ts from  "gulp-typescript"
import { withTaskName } from "./utils";

export const buildPackages = (dirname:string, name:string) => {

  // 模块规范： commonjs, es
  // umd是在浏览器中使用的

  // ts -> js, 所以不需要用到rollup，用gulp即可
  const tasks = Object.entries(buildConfig).map(([module, config]) => {
    const tsConfig = path.resolve(projectRoot, 'tsconfig.json') // 引入ts配置文件
    const inputs = ['**/*.ts', '!gulpfile.ts', '!node_modules'] // 入口文件，所有ts，除去gulpfile.ts和node_modules
    const output = path.resolve(dirname, config.output.name) // 出口路径

    return series(
      withTaskName(`build:${dirname}`, () => {
        return src(inputs).pipe(ts.createProject(tsConfig, {
          declaration: true, // 需要生成垫片文件
          strict: false, // 严格模式关闭
          module: config.module // 模块规范
        })()).pipe(dest(output))
      }),
      withTaskName(`copy:${dirname}`, () => {
        // 放到 es/utils 和 lib/utils 下
        return src(`${output}/**`).pipe(dest(path.resolve(outDir, config.output.name, name)))
      })
    )
  })

  return parallel(...tasks) // 并行操作
}