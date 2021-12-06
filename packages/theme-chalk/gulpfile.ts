import { series, src, dest } from "gulp" // src：输入，返回一个流。 dest：输出。
import gulpSass from "gulp-sass"
import dartSass from "sass"
import autoprefixer from "gulp-autoprefixer"
import cleanCss from "gulp-clean-css"
import path from "path"
import { run } from "../../build/utils"
import { outDir } from "../../build/utils/paths"

// 删除dist文件
async function clean() {
  run('rm -rf ./packages/theme-chalk/dist')
}

// 编译scss为css
function compile() {
  const sass = gulpSass(dartSass) // 返回一个编译方法
  return src(path.resolve(__dirname, './src/*.scss'))
          .pipe(sass.sync()) // 把src目录下的所有scss文件编译成css
          .pipe(autoprefixer()) // 加css前缀
          .pipe(cleanCss()) // 压缩css
          .pipe(dest('./dist')) // 输出
}

// 拷贝字体文件
function copyFont() {
  return src(path.resolve(__dirname, './src/fonts/**'))
          .pipe(cleanCss()) // 压缩
          .pipe(dest('./dist/fonts'))
}

// 拷贝打包文件到根目录的dist
function copyFullStyle() {
  return src(path.resolve(__dirname, './dist/**'))
          .pipe(dest(path.resolve(outDir, 'theme-chalk')))
}

export default series(
  clean,
  compile,
  copyFont,
  copyFullStyle
)