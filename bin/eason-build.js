#!/usr/bin/env node
checkDebug()
const commander = require('commander')
const { program } = require('commander')
const pkg = require('../package.json')
const checkNode = require('../lib/checkNode')
const startServer = require('../lib/start/startServer')
const buildServer = require('../lib/build/buildServer')

const MIN_NODE_VERSION = '8.9.0';

function checkDebug() {
    if (process.argv.indexOf('--debug') >= 0 || process.argv.indexOf('-d') >= 0) {
        process.env.LOG_LEVEL = 'verbose'
    } else {
        process.env.LOG_LEVEL = 'info'
    }
}

(async () => {
    try {
        if (!checkNode(MIN_NODE_VERSION)) {
            throw new Error('Please upgrade your node version to v' + MIN_NODE_VERSION)
        }
        // 拿到版本号
        program.version(pkg.version)

        program
            .command('start')
            .option('-c, --config  <config>', '配置文件路径')
            .description('start server by eason-build ')
            .allowUnknownOption()
            .action(startServer)
        program
            .command('build')
            .option('-c, --config  <config>', '配置文件路径')
            .description('build project by eason-build')
            .allowUnknownOption()
            .action(buildServer)

        program
            .option('-d, --debug', '开启调试模式')

        program.parse(process.argv)
    } catch (error) {
        console.log(error.message)
    }
})()