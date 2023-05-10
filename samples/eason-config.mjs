export default {
  entry: "src/index.js",
  plugins: function() {
    return [
      ['./plugins/eason-build-plugin', {a: 1, b: 2}],
      function(api, options) {
        console.log('this is anonymous plugin', options)
      }
    ]
  },
  hooks: [
    // [
    //   "start",
    //   (context) => {
    //     // console.log("start", context);
    //   },
    // ],
    // [
    //   "configResolved",
    //   (context) => {
    //     // console.log("configResolved", context);
    //   },
    // ],
    // [
    //   'plugin', (context) => {
    //     // console.log('plugin', context.webpackConfig)
    //   }
    // ]
  ],
};
