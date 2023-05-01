const path = require("path")
module.exports = function(api, options) {
    const { getWebpackConfig } = api
    const config = getWebpackConfig()
    const dir = process.cwd()
    // 获取构建模式
    const mode = process.env.EASON_BUILD_MODE || 'development'
    config.mode(mode)
    console.log(mode)
    // 设置entry
    config.entry('index')
        .add(path.resolve(dir, './src/index.js'))
    // entry: {
    //     index: path.resolve(__dirname, '../src/index.js'),
    //     login: path.resolve(__dirname, '../src/login.js')
    // },
    // 设置output
    config.output
        .filename('js/[name].js')
        .path(path.resolve(dir, './dist'))
    // output: {
    //     filename: 'js/[name].js',
    //     path: path.resolve(__dirname, '../dist')
    // },
}