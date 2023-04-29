export default {
  entry: "src/index.js",
  plugins: function() {
    return [
      ['./plugins/eason-build-plugin', {a: 1, b: 2}],
      function(api, options) {
        const config = api.getWebpackConfig()
        config.module
          .rule('eslint')
            .test(/.js$/)
            .exclude
              .add('node_modules')
              .end()
            .use('eslint')
              .loader('eslint-loader')
        console.log('this is anonymous plugin')
        const value = api.getValue('name')
        console.log(value)
      }
    ]
  },
  hooks: [
    [
      "start",
      (context) => {
        // console.log("start", context);
      },
    ],
    [
      "configResolved",
      (context) => {
        // console.log("configResolved", context);
      },
    ],
    [
      'plugin', (context) => {
        // console.log('plugin', context.webpackConfig)
      }
    ]
  ],
};
