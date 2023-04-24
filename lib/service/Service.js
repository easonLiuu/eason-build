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
        console.log('解析配置文件')
    }
}

module.exports = Service