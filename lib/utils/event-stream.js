import { EventEmitter } from 'events'
import subscriber from './subscriber'

class EventStream extends EventEmitter {
  constructor (maxListeners) {
    super()
    this.setMaxListeners(maxListeners)
  }

  format (id, name, retry, data) {
    let encodedData = JSON.stringify(data)
    return `id: ${id}\nevent: ${name}\nretry: ${retry}\ndata: ${encodedData}\n\n`
  }

  run () {
    const namespace = process.env.THEMIS_FINALS_STREAM_REDIS_CHANNEL_NAMESPACE
    subscriber.subscribe(`${namespace}:internal`)
    subscriber.subscribe(`${namespace}:teams`)
    subscriber.subscribe(`${namespace}:other`)

    subscriber.on('message', (channel, rawData) => {
      let message = JSON.parse(rawData)
      this.emit(channel, this.format(message.id, message.name, 5000, message.data))
    })
  }
}

export default new EventStream(1024)
