export default {
  entry: "src/index.js",
  plugins: function() {
    return [
      ['eason-build-test', {a: 1, b: 2}],
      function() {
        console.log('this is anonymous plugin')
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
  ],
};
