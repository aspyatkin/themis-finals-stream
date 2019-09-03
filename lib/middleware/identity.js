const config = require('../util/config')
const matchNetworks = require('../util/netaddr')
const Team = require('../model/team')

module.exports = function (request, response, next) {
  request.identity = null
  const remoteAddr = request.remoteAddr

  const matchingTeamAddr = matchNetworks(config.network.team, remoteAddr)
  if (matchingTeamAddr) {
    request.identity = 'teams'
    Team
      .where('network', matchingTeamAddr.toString())
      .fetch()
      .then(function (team) {
        request.identityId = team.id
        next()
      })
      .catch(function (err) {
        next(err)
      })
  } else {
    const matchingInternalAddr = matchNetworks(config.network.internal, remoteAddr)
    if (matchingInternalAddr) {
      request.identity = 'internal'
    } else {
      request.identity = 'external'
    }
    next()
  }
}
