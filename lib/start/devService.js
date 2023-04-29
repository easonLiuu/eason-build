const detectPort = require("detect-port");
const inquirer = require("inquirer");
const Service = require("../service/Service");
const log = require("../utils/log");

(async function () {
  const DEFAULT_PORT = 8000;

  const params = process.argv.slice(2);
  const paramObj = {};
  params.forEach((param) => {
    const paramArr = param.split(" ");
    paramObj[paramArr[0].replace("--", "")] = paramArr[1];
  });
  log.verbose('DevService', paramObj);
  const { config = '' } = paramObj

  let defaultPort = paramObj["port"] || DEFAULT_PORT;
  defaultPort = parseInt(defaultPort, 10);
  // console.log(defaultPort)
  try {
    const newPort = await detectPort(defaultPort);
    if (newPort !== defaultPort) {
      // console.log("端口号" + defaultPort + "可以使用");
      // const prompt = inquirer.createPromptModule();
      // 命令行交互
      const questions = {
        type: "confirm",
        name: "answer",
        message: `${defaultPort}已被占用，是否启用新端口号${newPort}?`,
      };
      const answer = (await inquirer.prompt(questions)).answer;
      if (!answer) {
        process.exit(1);
      }
    }
    const args = {
      port: newPort,
      config,
      customWebpackPath: paramObj.customWebpackPath || ''
    };
    process.env.NODE_ENV = "development";
    const service = new Service(args);
    await service.start();
  } catch (e) {
    console.error(e);
  }
})();
4