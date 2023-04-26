export default {
  entry: "src/index.js",
  plugins: ["eason-build-test"],
  hooks: [
    ["created", (context) => {
        console.log('created', context)
    }],
    ["configResolved",  (context) => {
        console.log('configResolved', context)
    }],
  ],
};
