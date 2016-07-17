import config from './utils/config'
config.loadSync()

import app from './app'
import logger from './utils/logger'
import eventStream from './utils/event-stream'

function getServerHost() {
  return process.env.HOST || '127.0.0.1'
}

function getServerPort() {
  let port = 4000
  if (process.env.PORT_RANGE_START && process.env.APP_INSTANCE) {
    port = parseInt(process.env.PORT_RANGE_START, 10) + parseInt(process.env.APP_INSTANCE, 10)
  }
  return port
}

let server = app.listen(getServerPort(), getServerHost(), function() {
  let port = server.address().port
  logger.info(`Server listening on port ${port}`)
  eventStream.run()
})
