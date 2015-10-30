'use strict'

var winston = require('winston')

module.exports = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({ prettyPrint: true, timestamp: true, level: 'debug', colorize: true })
    // new (winston.transports.File)({ name: 'info', filename: process.cwd() + '/logs/info.log', level: 'info' }),
    // new (winston.transports.File)({ name: 'debug', filename: process.cwd() + '/logs/debug.log', level: 'debug' }),
    // new (winston.transports.File)({ name: 'error', filename: process.cwd() + '/logs/error.log', level: 'error' })
  ]
})
