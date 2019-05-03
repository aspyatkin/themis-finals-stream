import config from './utils/config'
config.loadSync()

import app from './app'
import logger from './utils/logger'
import eventStream from './utils/event-stream'
import cluster from 'cluster'

function getNumProcesses () {
  return parseInt(process.env.NUM_PROCESSES || '2', 10)
}

function getServerPort () {
  return parseInt(process.env.PORT || '4000', 10)
}

function getServerHost () {
  return process.env.HOST || '127.0.0.1'
}

if (cluster.isMaster) {
  logger.info(`Master ${process.pid} is running`)

  for (let i=0; i<getNumProcesses(); i++) {
    cluster.fork()
  }

  cluster.on('online', function (worker) {
    logger.info(`Worker ${worker.process.pid} started`)
  })

  cluster.on('exit', function (worker, code, signal) {
    logger.info(`Worker ${worker.process.pid} died`)
    cluster.fork()
  })
} else {
  let server = app.listen(getServerPort(), getServerHost(), function () {
    logger.info(`Worker ${process.pid}, server listening on ${server.address().address}:${server.address().port}`)
    eventStream.run()
  })
}
