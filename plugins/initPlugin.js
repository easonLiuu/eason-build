module.exports = function(api, options) {
    const { getWebpackConfig } = api
    const config = getWebpackConfig()
    // 获取构建模式
    const mode = process.env.EASON_BUILD_MODE || 'development'
    config.mode(mode)
    console.log(mode)
}