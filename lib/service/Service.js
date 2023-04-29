const fs = require("fs");
const path = require("path");
const WebpackChain = require("webpack-chain");
const log = require("../utils/log");
const { getConfigFile, loadModule } = require("../utils");
const constant = require("./const");

const HOOK_KEYS = [constant.HOOK_START, constant.HOOK_PLUGIN];
class Service {
  constructor(opts) {
    this.args = opts;
    this.config = {};
    this.hooks = {};
    this.plugins = [];
    this.dir = process.cwd();
    this.webpackConfig = null;
    this.internalValue = {};
  }
  async start() {
    console.log("启动服务");
    await this.resolveConfig();
    await this.registerHooks();
    await this.emitHooks(constant.HOOK_START);
    await this.registerPlugin()
    await this.runPlugin()
    console.log(this.webpackConfig.toConfig())
  }
  async resolveConfig() {
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
      console.log("配置文件不存在，终止执行");
      process.exit(1);
    }
    this.webpackConfig = new WebpackChain()
  }

  async registerHooks() {
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
  async registerPlugin() {
    let { plugins } = this.config
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
  async runPlugin() {
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
