const fs = require('fs')
const path = require('path')
const logger = require('./logger')
const Addr = require('netaddr').Addr

class Config {
  constructor () {
    this.network = {
      internal: [],
      team: []
    }
  }

  loadSync () {
    let configFilename = path.join(process.cwd(), 'config.json')
    try {
      let rawData = fs.readFileSync(configFilename)
      let data = JSON.parse(rawData)

      for (let addr of data.network.internal) {
        this.network.internal.push(Addr(addr))
      }

      for (let addr of data.network.team) {
        this.network.team.push(Addr(addr))
      }
    } catch (e) {
      logger.error(e)
      process.exit(1)
    }
  }
}

module.exports = new Config()
