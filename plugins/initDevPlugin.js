const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin")
const { CleanWebpackPlugin } = require("clean-webpack-plugin")
module.exports = function (api, options) {
  const { getWebpackConfig } = api;
  const config = getWebpackConfig();
  const dir = process.cwd();
  // 获取构建模式
  const mode = "development";
  config.mode(mode);
  console.log(mode);
  // 设置entry
  config.entry("index").add(path.resolve(dir, "./src/index.js"));
  // entry: {
  //     index: path.resolve(__dirname, '../src/index.js'),
  //     login: path.resolve(__dirname, '../src/login.js')
  // },
  // 设置output
  config.output.filename("js/[name].js").path(path.resolve(dir, "./dist"));
  // output: {
  //     filename: 'js/[name].js',
  //     path: path.resolve(__dirname, '../dist')
  // },
  config.module
    .rule("css")
        .test(/\.css$/)
        .exclude
            .add(/node_modules/)
            .end()
        .use("mini-css")
            .loader(MiniCssExtractPlugin.loader)
            .end()
        .use("css-loader")
            .loader("css-loader");
  config.module
    .rule("asset")
        .test(/\.(png|svg|jpg|jpeg|gif)$/i)
        .type("asset")
        .parser({
            dataUrlCondition: {
                maxSize: 8 * 1024,
            },
        })
        // .generator({
        //     filename: 'images/[name].[hash:6][ext]'
        // })
  config.module.rule('asset').set('generator', {
    filename: 'images/[name].[hash:6][ext]'
  })
  
  config.plugin('MiniCssExtractPlugin')
        .use(MiniCssExtractPlugin, [{
            filename: 'css/[name].css',
            chunkFilename: 'css/[name].chunk.css'
        }]) 
  config.plugin('HtmlWebpackPlugin')
        .use(HtmlWebpackPlugin, [{
            filename: 'index.html',
            template: path.resolve(dir, './public/index.html'),
            chunks: ['index']
        }])
//   config.plugin('HtmlWebpackPlugin')
//         .use(HtmlWebpackPlugin, [{
//             filename: 'login.html',
//             template: path.resolve(dir, './src/login.html'),
//             chunks: ['login']
//         }, {
//             filename: 'index.html',
//             template: path.resolve(dir, './src/index.html'),
//             chunks: ['index']
//         }])
//   config.plugin('ProvidePlugin')
//         .use(webpack.ProvidePlugin, [{
//             $: 'jquery',
//             jQuery: 'jquery'
//         }])
//   config.plugin('CopyWebpackPlugin')
//         .use(CopyWebpackPlugin, [{
//             patterns: [{
//                 from: path.resolve(dir, './src/img'),
//                 to: path.resolve(dir, './dist/img')
//             }]
//         }])
  config.plugin('CleanWebpackPlugin')
        .use(CleanWebpackPlugin, [])
  config.optimization
        .usedExports(true)
  config.watch(true)
};
