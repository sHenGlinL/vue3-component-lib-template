import { parallel, series } from "gulp";
import { sync } from "fast-glob";
import { componentsRoot, outDir, projectRoot } from "./utils/paths";
import path from "path"
import { nodeResolve } from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import vue from "rollup-plugin-vue"
import typescript from "rollup-plugin-typescript2"
import { rollup, OutputOptions } from "rollup";
import { buildConfig } from "./utils/config";
import { pathRewriter, run } from "./utils";
import { Project, SourceFile } from "ts-morph"
import fs from 'fs/promises';
import * as compilerSfc from "@vue/compiler-sfc"

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
      external: (id) => /^vue/.test(id) || /^@sl-plus/.test(id), // 这里也可以写一个插件，把引入的依赖干掉。这里需要排除vue源码包，自己的库的包 
    }
    const bundle = await rollup(config)
    const options = Object.values(buildConfig).map(config => ({
      format: config.format,
      file: path.resolve(config.output.path, `components/${file}/index.js`),
      paths: pathRewriter(config.output.name) // @sl-plus -> sl-plus/es或者/lib
    }))
    await Promise.all(options.map(option => bundle.write(option as OutputOptions)))
  })

  return Promise.all(builds)
}

// 生成.d.ts文件到dist/types目录
const genTypes = async () => {
  const project = new Project({
    // 生成.d.ts 我们需要有一个tsconfig
    compilerOptions: {
      allowJs: true,
      declaration: true,
      emitDeclarationOnly: true,
      noEmitOnError: true,
      outDir: path.resolve(outDir, "types"),
      baseUrl: projectRoot,
      paths: {
        "@sl-plus/*": ["packages/*"],
      },
      skipLibCheck: true,
      strict: false,
    },
    tsConfigFilePath: path.resolve(projectRoot, "tsconfig.json"),
    skipAddingFilesFromTsConfig: true,
  });

  const filePaths = sync('**/*', {
    cwd: componentsRoot,
    onlyFiles: true,
    absolute: true
  })

  const sourceFiles:SourceFile[] = []

  await Promise.all(filePaths.map(async filePath => {
    if (filePath.endsWith('.vue')) {
      const content = await fs.readFile(filePath, 'utf-8')
      const sfc = compilerSfc.parse(content) // 得到ast
      const { script } = sfc.descriptor
      if(script) {
        const content = script.content // 拿到脚本
        const sourceFile = project.createSourceFile(filePath + '.ts', content) // .vue.ts 因为.ts结尾的文件才能变成.d.ts文件
        sourceFiles.push(sourceFile);
      }
    } else if (filePath.endsWith('.ts')) {
      const sourceFile = project.addSourceFileAtPath(filePath); // 把所有的ts文件都放在一起 发射成.d.ts文件
      sourceFiles.push(sourceFile);
    }
  }))

  await project.emit({ // 默认是放到内存中的，需要手动写入文件
    emitOnlyDtsFiles: true
  })

  // 写入文件
  const tasks = sourceFiles.map(async (sourceFile: any) => {
    const emitOutput = sourceFile.getEmitOutput();
    const tasks = emitOutput.getOutputFiles().map(async (outputFile: any) => {
      const filepath = outputFile.getFilePath();
      await fs.mkdir(path.dirname(filepath), {
        recursive: true,
      });
      // @sl-plus -> sl-plus/es -> .d.ts 肯定不用去lib下查找
      await fs.writeFile(filepath, pathRewriter("es")(outputFile.getText()));
    });
    await Promise.all(tasks);
  });

  await Promise.all(tasks)
}

// 拷贝到dist/es/components和dist/lib/components目录下
const copyTypes = () => {
  const src = path.resolve(outDir,'types/components/')
  const copy = module => {
    const output = path.resolve(outDir, module, 'components')
    return () => run(`cp -r ${src}/* ${output}`)
  }
  return parallel(copy('es'),copy('lib'))
}

// 编译index.ts入口文件，这一步使用gulp也可以，这里使用的是rollup
const buildComponentEntry = async () => {
  const config = {
    input: path.resolve(componentsRoot, "index.ts"),
    plugins: [typescript()],
    external: () => true,
  }
  const bundle = await rollup(config);
  return Promise.all(
    Object.values(buildConfig)
    .map(config => ({
      format: config.format,
      file: path.resolve(config.output.path, "components/index.js"),
    }))
    .map(config => bundle.write(config as OutputOptions))
  );
}

export const buildComponent = series(
  buildEachComponent,
  genTypes,
  copyTypes(),
  buildComponentEntry
)
