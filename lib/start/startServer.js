const chokidar = require("chokidar");
const path = require("path");
const cp = require("child_process");
const { getConfigFile } = require("../utils");
const log = require('../utils/log')
let child
function runServer(args = {}) {
  const { config = '', customWebpackPath = '', stopBuild = false } = args
  // 启动webpack服务
  // 启动子进程的方式
  const scriptPath = path.resolve(__dirname, './devService.js')
  child = cp.fork(scriptPath, [
    '--port 8080', 
    '--config ' + config,
    '--customWebpackPath ' + customWebpackPath,
    '--stop-build ' + stopBuild
  ])
  child.on('exit', code => {
    if (code) {
      process.exit(code)
    }
  })
}
function onChange() {
  log.verbose('onchange', 'config file')
  // 关闭子进程
  child.kill()
  // 重新启动子进程
  runServer()
}
function runWatcher() {
  //启动配置监听
  const configPath = getConfigFile()
  // const startPath = path.resolve(process.cwd(), 'lib/start')
  // const buildPath = path.resolve(process.cwd(), 'lib/build')
  const watcher = chokidar
    .watch(configPath)
    .on("change", onChange)
    .on("error", (error) => {
      console.error("file watcher error!", error);
      process.exit(1);
    });
  // 添加新的监听
  // watcher.add(buildPath)
}
module.exports = function (opts, cmd) {
  // console.log(opts)
  // console.log('start server')
  // 通过子进程启动webpack-dev-server服务
  // 1.子进程启动避免主进程受到影响
  // 2.子进程启动方便重启 解决webpack-dev-server配置修改后无法重启问题
  runServer(opts);

  // 监听配置修改
  runWatcher()
};
