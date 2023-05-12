const fs = require("fs");
const path = require("path");
const WebpackDevServer = require("webpack-dev-server")
const WebpackChain = require("webpack-chain");
const webpack = require("webpack")
const log = require("../utils/log");
const { getConfigFile, loadModule } = require("../utils");
const constant = require("./const");
const InitDevPlugin = require("../../plugins/initDevPlugin")
const InitBuildPlugin = require("../../plugins/initBuildPlugin")

const HOOK_KEYS = [constant.HOOK_START, constant.HOOK_PLUGIN];
class Service {
  constructor(cmd, opts) {
    // log.verbose('Service', opts)
    this.args = opts;
    this.cmd = cmd;
    this.config = {};
    this.hooks = {};
    this.plugins = [];
    this.dir = process.cwd();
    this.webpackConfig = null;
    this.internalValue = {};
    log.verbose('Service args', this.args)
  }
  start = async () => {
    console.log("启动服务");
    await this.resolveConfig();
    await this.registerHooks();
    await this.emitHooks(constant.HOOK_START);
    await this.registerPlugin()
    await this.runPlugin()
    if (!this.args.stopBuild) {
      // console.log(this.webpackConfig.toConfig())
      await this.initWebpack()
      // console.log('webpack', this.webpack)
      // 完成webpack配置（借助plugin)
      await this.startServer()
      // 完成webpack-dev-Server的启动
    }
  }
  startServer = async () => {
    let compiler
    let devServer
    let serverConfig
    try {
      const webpack = require(this.webpack)
      const webpackConfig = this.webpackConfig.toConfig()
      compiler = webpack(webpackConfig, (err, stats) => {
        if (err) {
          log.error('ERROR!', err)
        } else {
          const res = stats.toJson({ all: false, errors: true, warnings: true, timings: true })
          if (res.errors && res.errors.length > 0) {
            log.error('COMPILE ERROR!')
            res.errors.forEach(error => {
              log.error('ERROR MESSAGE', error.message)
            })
          } else if( res.warnings && res.warnings.length > 0 ) {
            log.warn('COMPILE WARNING!')
            res.warnings.forEach(warning => {
              log.warn('WARNING MESSAGE', warning.message)
            })
          } else {
            log.info('COMPILE SUCCESSFULLY!', 'Compile finish in ' + res.time / 1000 + 's' )
          }
        }
      })
      serverConfig = {
        port: this.args.port || 8080 ,
        host: this.args.host || '0.0.0.0',
        https: this.args.https || false
      }
      // 构建完成
      if (WebpackDevServer.getFreePort) {
        devServer = new WebpackDevServer(serverConfig, compiler)
      } else {
        devServer = new WebpackDevServer(compiler, serverConfig)
      }
      if (devServer.startCallback) {
        devServer.startCallback(() => {
          log.info('WEBPACK-DEV-SERVER LAUNCH SUCCESSFULLY!')
        })
      } else {
        devServer.listen(serverConfig.port, serverConfig.host, (err) => {
          if (err) {
            log.error('WEBPACK-DEV-SERVER ERROR!')
            log.error('ERROR MESSAGE', err.toString())
          } else {
            log.info('WEBPACK-DEV-SERVER LAUNCH SUCCESSFULLY!')
          }
        })
      }
    } catch (error) {
      log.error('error', error)
    }
    compiler.hooks.done.tap('compileHooks', () => {
      console.log('done!!')
    })
  }
  initWebpack = () => {
    // config中获取CustomWebpackPath属性
    // 传入了这个属性 则使用 手动指定webpack路径 使用该地址引用webpack
    // 否则 使用node_modules中的webpack
    const { customWebpackPath } = this.args
    if (customWebpackPath) {
        if (fs.existsSync(customWebpackPath)) {
            let p = customWebpackPath
            if (!path.isAbsolute(p)) {
                p = path.resolve(p)
            }
            this.webpack = require.resolve(p)
        }
    } else {
        this.webpack = require.resolve('webpack', {
            paths: [path.resolve(process.cwd(), 'node_modules')]
        })
    }
    log.verbose('webpack path: ', this.webpack)
    log.verbose('webpack config: ', this.webpackConfig.toConfig())

  }
  resolveConfig = async () => {
    // console.log('解析配置文件')
    const { config } = this.args;
    // console.log(config)
    let configFilePath = "";
    if (config) {
      if (path.isAbsolute(config)) {
        configFilePath = config;
      } else {
        configFilePath = path.resolve(config);
      }
    } else {
      configFilePath = getConfigFile({ cwd: this.dir });
    }
    if (configFilePath && fs.existsSync(configFilePath)) {
    //   const isMjs = configFilePath.endsWith("mjs");
    //   if (isMjs) {
    //     this.config = (await import(configFilePath)).default;
    //   } else {
    //     this.config = require(configFilePath);
    //   }
      this.config = await loadModule(configFilePath)
      log.verbose("config", this.config);
      log.info("config:", this.config);
    } else {
      log.error("配置文件不存在，终止执行");
      process.exit(1);
    }
    this.webpackConfig = new WebpackChain()
  }

  registerHooks = async () => {
    // [['init', function(){}], [...]]
    // console.log(this.config)
    const { hooks } = this.config;
    console.log(hooks);
    if (hooks && hooks.length > 0) {
      for (const hook of hooks) {
        const [key, fn] = hook;
        if (
          key &&
          fn &&
          typeof key === "string" &&
          HOOK_KEYS.indexOf(key) >= 0
        ) {
          if (typeof fn === "function") {
            const existHook = this.hooks[key];
            if (!existHook) {
              this.hooks[key] = [];
            }
            this.hooks[key].push(fn);
          } else if (typeof fn === "string") {
            // console.log("处理fn");
            // let fnPath = path.isAbsolute(fn) ? fn : path.resolve(fn)
            // fnPath = require.resolve(fnPath)
            const newFn = await loadModule(fn);
            if (newFn) {
              const existHook = this.hooks[key];
              if (!existHook) {
                this.hooks[key] = [];
              }
              this.hooks[key].push(newFn);
            }
          }
        }
      }
    }
    // 处理完的hooks就是个对象
    log.verbose("hooks", this.hooks);
  }
  emitHooks = async (key) => {
    const hooks = this.hooks[key];
    if (hooks) {
      for (const fn of hooks) {
        try {
          await fn(this);
        } catch (error) {
          log.error(error);
        }
      }
    }
  }
  registerPlugin = async () => {
    let { plugins } = this.config
    const builtInPlugins = this.cmd === 'start' ? [InitDevPlugin] : [InitBuildPlugin]
    builtInPlugins.forEach(plugin => {
        this.plugins.push({
            mod: plugin
        })
    })
    if (plugins) {
        if (typeof plugins === 'function') {
            plugins = plugins()
        }
        if (Array.isArray(plugins)) {
            for (const plugin of plugins) {
                if (typeof plugin === 'string') {
                    const mod = await loadModule(plugin)
                    this.plugins.push({ mod })
                } else if (Array.isArray(plugin)) {
                    const [pluginPath, pluginParam] = plugin
                    const mod = await loadModule(pluginPath)
                    this.plugins.push({
                        mod,
                        param: pluginParam
                    })
                } else if (typeof plugin === 'function') {
                    this.plugins.push({
                        mod: plugin
                    })
                }
            } 
        } 
    }
  }
  runPlugin = async () => {
    for (const plugin of this.plugins) {
        const { mod, params } = plugin
        if (!mod) {
            continue
        }
        const API = {
            getWebpackConfig: this.getWebpackConfig,
            emitHooks: this.emitHooks,
            // 用于不同插件之间传值
            setValue: this.setValue,
            getValue: this.getValue,
            log,
        }
        const options = {
            ...params
        }
        await mod(API, options)
    }
  }
  getWebpackConfig = () => {
    return this.webpackConfig
    // 写plugin 直接从plugin拿到当前webpack的config，对其进行修改
  }
  setValue = (key, value) => {
    this.internalValue[key] = value
  }
  getValue = (key) => {
    return this.internalValue[key]
  }

}

module.exports = Service;
