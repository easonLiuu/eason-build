const fs = require("fs");
const path = require("path");
const log = require("../utils/log");
const { getConfigFile } = require("../utils");

class Service {
  constructor(opts) {
    this.args = opts;
    this.config = {};
    this.hooks = {};
    this.dir = process.cwd();
  }
  async start() {
    console.log("启动服务");
    await this.resolveConfig();
    this.registerHooks();
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
      configFilePath = getConfigFile();
    }
    if (configFilePath && fs.existsSync(configFilePath)) {
      const isMjs = configFilePath.endsWith("mjs");
      if (isMjs) {
        this.config = (await import(configFilePath)).default;
      } else {
        this.config = require(configFilePath);
      }
      log.verbose("config", this.config);
      log.info("config:", this.config);
    } else {
      console.log("配置文件不存在，终止执行");
      process.exit(1);
    }
    // console.log(configFilePath)
  }
  registerHooks() {
    // [['init', function(){}], [...]]
    // console.log(this.config)
    const { hooks } = this.config;
    console.log(hooks);
    if (hooks && hooks.length > 0) {
      hooks.forEach((hook) => {
        const [key, fn] = hook;
        if (key && fn ) {
            if (typeof key === "string" && typeof fn === "function") {
                const existHook = this.hooks[key]
                if (!existHook) {
                    this.hooks[key] = []
                }
                this.hooks[key].push(fn)
            }
        }
      });
    }
    // 处理完的hooks就是个对象
    log.verbose('hooks', this.hooks)
  }
  emitHooks() {}
}

module.exports = Service;
