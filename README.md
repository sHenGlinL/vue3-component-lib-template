# vue3 + typescript + pnpm + monorepo + gulp + rollup 搭建vue3组件库框架

## 1.初始化pnpm, 新建.npmrc文件
- 不加 shamefully-hoist = true 依赖引用可能会有问题
```
pnpm init -y
```
```
shamefully-hoist = true
```
## 2.安装依赖
```
pnpm install vue@next typescript -D
```
## 3.初始化tsconfig
```
npx tsc --init
```
## 4.构建monorepo环境
>### 4.1 新建 pnpm-workspace.yaml 配置文件
>### 4.2 新建play文件夹，作为测试环境的包
>>#### 4.2.1 进入play目录，初始化项目
```
pnpm init
```
- package name: @{项目名称}/play
>>#### 4.2.2 安装依赖
```
pnpm install vite @vitejs/plugin-vue -D
```
>>#### 4.2.3 构建目录结构
- 配置vite.config.ts
- 创建index.html、src/main.ts、src/app.vue入口文件
- 在根目录创建typings文件，创建vue-shim.d.ts垫片
- 在package.json创建运行项目命令
- play目录下的package.json:
```
"dev": "vite"
```
- 根目录下的package.json:
```
"dev": "pnpm -C play dev"
```

>### 4.3 新建packages文件夹，用于管理子模块包
>>#### 4.3.1 在packages目录下，新建components文件夹、theme-chalk文件夹、utils文件夹
- 上述三个文件夹都是模块包，每个目录下都需要初始化：
```
pnpm init -y
```
- package.json 的name分别为 @{项目名称}/components，@{项目名称}/theme-chalk，@{项目名称}/utils
>>#### 4.3.2 在根目录全局安装(软链接)以上三个包，使得包之间可以互相引用
```
pnpm install @{项目名称}/components @{项目名称}/theme-chalk @{项目名称}/utils -w
```

## 5.创建组件
>### 5.1 进入components目录，创建组件
- 例如icon组件：
```
|-- components
    |-- icon
        |-- src
            |-- icon.vue // 组件主文件
            |-- icon.ts  // props和公共方法
        |-- index.ts     // 组件入口文件
    |-- package.json 
```
>### 5.2 进入utils目录，创建注册组件的公共方法
>### 5.3 进入play目录，main.ts中引入组件，运行测试
>### 5.4 进入theme-chalk文件夹，创建样式
- tips：字体图标等素材可从[iconfont]网站找
目录如下：
```
|-- theme-chalk
    |-- src
        |-- fonts  // 字体图标文件夹（需要把下载的字体库.ttf .woff .woff2三个文件放这里）
        |-- mixins // 混合方法/规范/变量
            |-- config.scss
            |-- mixins.scss
        |-- icon.scss // 例子：icon组件的样式（下载的字体库的css粘贴到此文件夹，一键替换命名空间，修改引入路径）
        |-- index.scss // 样式入口
    |-- package.json
```
>### 5.5 全局安装sass
```
pnpm i sass -w -D
```
>### 5.6 进入play目录，main.ts中引入样式，运行测试


## 6. 准备打包工作
>### 6.1 安装gulp，控制打包流程
```
pnpm i gulp @types/gulp sucrase -w -D
```
>### 6.2 配置打包脚本和文件
>>#### 6.2.1 根目录创建build文件夹
```
|-- build
    |-- utils  // 存放工具方法
        |-- index.ts // 默认工具
        |-- paths.ts // 维护文件路径
    |-- gulpfile.ts  // 打包脚本入口文件
```
>>#### 6.2.2 根目录package.json添加打包脚本
```
"build": "gulp -f build/gulpfile.ts"
```

>### 6.3 编写根目录的gulpfile.ts文件
1. 创建任务「clean」：删除dist文件
2. 创建任务「buildPackages」：打包packages目录下的包
    1. 分别进入components、theme-chalk、utils目录
        1. 创建gulpfile.ts文件
        2. 在package.json添加打包脚本。
        ```
        "build": "gulp"
        ```
    2. 编写theme-chalk下的gulpfile.ts文件
        1. 安装所需依赖
        ```
        pnpm i gulp-sass @types/gulp-sass sass @types/sass gulp-autoprefixer @types/gulp-autoprefixer gulp-clean-css @types/gulp-clean-css -w -D
        ```
        2. 删除theme-chalk包下的dist文件
        3. sass编译成css，生成到theme-chalk包下的dist目录
        4. 拷贝字体文件到theme-chalk包下的dist目录
        5. 拷贝theme-chalk包下的dist文件到根目录dist文件
    3. 编写utils下的gulpfile.ts文件
        1. 在根目录build文件夹下新建packages.ts文件，用于打包util，指令，hook等。（相当于把方法提到外面，增加可复用性）
    4. 编写build/packages.ts文件
        1. 在根目录build/utils文件夹下新建config.ts文件，用于定义打包导出时的模块规范（cjs，es）
        2. 引入根目录的tsconfig.json（ts打包配置文件）
        3. 安装依赖，用于转译ts
        ```
        pnpm i gulp-typescript -w -D
        ```
        4. 打包完成后，拷贝打包文件到根目录dist文件
    5. 打包组件准备工作
        1. 在packages目录下新建 {项目名称} 的文件夹，作为组件库的整合入口
        2. 进入该文件夹进行初始化
        ```
        pnpm init -y
        ```
        3. 新建index.ts文件，作为组件库入口文件
3. 创建任务「buildFullComponent」：打包所有组件
    1. 在build文件夹下创建full-component.ts文件
    2. gulp适合流程控制和代码转译，没有打包的功能，因此需要安装rollup及相关插件
    ```
    pnpm i rollup @rollup/plugin-node-resolve @rollup/plugin-commonjs rollup-plugin-typescript2 rollup-plugin-vue -w -D
    ```
4. 创建任务「buildComponent」：打包每个组件
    1. 在build文件夹下创建components.ts文件
    2. 需要查找packages/components下，所有文件夹下的index.ts文件逐个打包，这里安装fast-glob库来实现（也可以使用node实现）。
    ```
    pnpm i fast-glob -w -D
    ```
    3. 打包时需要把组件index.ts文件下，引入的自身库的路径重写，不然会找不到。因为打包的时候排除了自身库的路径，防止二次打包。
    4. 生成每个组件的.d.ts声明文件，安装所需依赖ts-morph。再安装 @vue/compiler-sfc 用于解析单文件组件
    ```
    pnpm i ts-morph @vue/compiler-sfc -w -D
    ```
    5. 完成后会发现，dist/es,lib/components 下少了index.js入口文件。需要打包入口文件。
5. 新建build/gen-types文件，用来生成packages/{项目名称}/index.ts的.d.ts文件
6. 拷贝packages/{项目名称}/package.json到dist文件

## -------完成！---------

<!-- Markdown link & img dfn's -->
[iconfont]: https://www.iconfont.cn/