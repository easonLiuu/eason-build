const fg = require("fast-glob");
const path = require("path")
const fs = require("fs")
const log = require("./log")
const DEFAULT_CONFIG_FILE = ["eason-config.(mjs|js|json)"];


function getConfigFile({ cwd = process.cwd() } = {}) {
  const [configFile] = fg.sync(DEFAULT_CONFIG_FILE, {
    cwd,
    absolute: true,
  });
  log.verbose('configFile', configFile)
  return configFile
}

async function loadModule(modulePath) {
    // 判断modulePath为模块还是路径
    let fnPath
    if (modulePath.startsWith('/') || modulePath.startsWith('.')) {
        fnPath = path.isAbsolute(modulePath) ? modulePath : path.resolve(modulePath)
    } else {
        fnPath = modulePath
    }
    
    fnPath = require.resolve(fnPath, {
        paths: [
            path.resolve(process.cwd(), 'node_modules')
        ]
    })
    // console.log('fnPath', fnPath)
    if (fnPath && fs.existsSync(fnPath)) {
        let result
        const isMjs = fnPath.endsWith("mjs");
        if (isMjs) {
            result = (await import(fnPath)).default;
        } else {
            result = require(fnPath);
        }
        return result
    }
    return null
}

module.exports = {
    getConfigFile,
    loadModule
};
