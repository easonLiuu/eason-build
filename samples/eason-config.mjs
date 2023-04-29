export default {
  entry: "src/index.js",
  plugins: function() {
    return [
      ['eason-build-test', {a: 1, b: 2}],
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
        console.log(value.fn())
      }
    ]
  },
  hooks: [
    [
      "start",
      (context) => {
        console.log("start", context);
      },
    ],
    [
      "configResolved",
      (context) => {
        console.log("configResolved", context);
      },
    ],
    [
      'plugin', (context) => {
        console.log('plugin', context.webpackConfig)
      }
    ]
  ],
};
