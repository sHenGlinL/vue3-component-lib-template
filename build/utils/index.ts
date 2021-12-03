import { spawn } from "child_process" // 产卵，产生一个子进程
import { projectRoot } from "./paths"

// 给任务赋予名字
export const withTaskName = <T>(name:string, fn:T) => Object.assign(fn, { displayName: name })

// 在node中开启子进程，运行命令行脚本
export const run = (command:string) => {
  return new Promise(resolve => {
    const [cmd, ...args] = command.split(" ") // 空格分割，前面是命令，后面是参数。  比如：rm -rf
    const app = spawn(cmd, args, {
      cwd: projectRoot, // 执行目录
      stdio: 'inherit', // 将这个子进程的输出共享给父进程
      shell: true, // 默认情况下linux才支持rm -rf（电脑安装了git bash）。windows系统需要设置为true。
    })
    app.on('close', resolve)
  })
}