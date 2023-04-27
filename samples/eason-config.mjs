export default {
  entry: "src/index.js",
  plugins: ["eason-build-test"],
  hooks: [
    ["start", (context) => {
        console.log('start', context)
    }],
    ["configResolved",  (context) => {
        console.log('configResolved', context)
    }],
  ],
};
