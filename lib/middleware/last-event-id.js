module.exports = function (request, response, next) {
  const val = request.headers['last-event-id']
  request.lastEventId = (val != null) ? parseInt(val, 10) : null
  next()
}
