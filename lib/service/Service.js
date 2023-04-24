const path = require('path')
const DEFAULT_CONFIG_NAME = 'eason-config'

class Service {

    constructor(opts) {
        this.args = opts
        this.config = {}
        this.hooks = {}
    }
    async start() {
        console.log('启动服务')
        this.resolveConfig()
    }
    resolveConfig() {
        // console.log('解析配置文件')
        const { config } = this.args
        // console.log(config)
        let configFilePath = ''
        if (config) {
            if (path.isAbsolute(config)) {
                configFilePath = config
            } else {
                configFilePath = path.resolve(config)
            }
        }
        console.log(configFilePath)
    }
}

module.exports = Service