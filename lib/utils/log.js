const npmlog = require('npmlog')
const LOG_LEVELS = ['verbose', 'info', 'error', 'warn']
const logLevel = LOG_LEVELS.indexOf(process.env.LOG_LEVEL) >= 0 ? process.env.LOG_LEVEL : 'info'
npmlog.level = logLevel
module.exports = npmlog