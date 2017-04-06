import redis from 'redis'
import logger from './logger'

class Subscriber {
  constructor () {
    let host = process.env.REDIS_HOST || '127.0.0.1'
    let port = 6379
    if (process.env.REDIS_PORT) {
      port = parseInt(process.env.REDIS_PORT, 10)
    }
    let db = 0
    if (process.env.THEMIS_FINALS_STREAM_REDIS_DB) {
      db = parseInt(process.env.THEMIS_FINALS_STREAM_REDIS_DB, 10)
    }

    this.client = redis.createClient(port, host, { db: db })

    this.client.on('ready', () => {
      logger.info('Connection to Redis has been established ...')
    })

    this.client.on('error', (err) => {
      logger.error(`Redis connection error: ${err}`)
    })
  }

  subscribe (channel) {
    this.client.subscribe(channel)
  }

  on (eventName, callback) {
    this.client.on(eventName, callback)
  }
}

export default new Subscriber()
