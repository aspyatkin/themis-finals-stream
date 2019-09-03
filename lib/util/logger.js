const winston = require('winston')

module.exports = new winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  transports: [
    new winston.transports.Console()
  ]
})
