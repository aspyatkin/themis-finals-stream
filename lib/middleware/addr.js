const Addr = require('netaddr').Addr

module.exports = function (request, response, next) {
  request.remoteAddr = Addr(request.ip)
  next()
}
