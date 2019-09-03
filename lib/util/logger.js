const winston = require('winston')

module.exports = new winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.Console()
  ]
})
