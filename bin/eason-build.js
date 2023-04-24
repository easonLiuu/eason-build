#!/usr/bin/env node
const commander = require('commander')
const { program } = require('commander')
const pkg = require('../package.json')
const checkNode = require('../lib/checkNode')
const startServer = require('../lib/start/startServer')
const buildServer = require('../lib/build/buildServer')

const MIN_NODE_VERSION = '8.9.0';

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
        program.parse(process.argv)
    } catch (error) {
        console.log(error.message)
    }
})()