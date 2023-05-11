const path = require('path')
const HtmlWebpackPlugin = require("html-webpack-plugin")
module.exports = function (api, params) {
    const dir = process.cwd()
    const plugin = api.getWebpackConfig()
        .plugin('HtmlWebpackPlugin2')
        .use(HtmlWebpackPlugin,[{
            filename: 'index2.html',
            template: path.resolve(dir, './public/index2.html'),
            chunks: ['index']
        }])
}