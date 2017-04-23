import config from '../utils/config'
import matchNetworks from '../utils/netaddr'
import Team from '../models/team'

export default function (request, response, next) {
  request.identity = null
  const remoteAddr = request.remoteAddr

  const matchingTeamAddr = matchNetworks(config.network.team, remoteAddr)
  if (matchingTeamAddr) {
    request.identity = 'teams'
    Team
      .where('network', matchingTeamAddr.toString())
      .fetch()
      .then(function(team) {
        request.identityId = team.id
        next()
      })
      .catch(function (err) {
        next()
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
