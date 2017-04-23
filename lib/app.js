import express from 'express'
import logger from './utils/logger'
import getRemoteAddr from './middleware/addr'
import getIdentity from './middleware/identity'
import getLastEventId from './middleware/last-event-id'
import { BaseError, UnknownIdentityError } from './utils/errors'
import eventStream from './utils/event-stream'
import ServerSentEvent from './models/server-sent-event'

let app = express()
app.set('trust proxy', true)
app.set('x-powered-by', false)

function writeEvent (response, event, data) {
  response.write(eventStream.format(
      event.attributes.id,
      event.attributes.name,
      5000,
      Object.assign(data, { __metadataCreated: event.attributes.created.toISOString() })
    )
  )
}

function fetchRecentEvents (request, response, callback) {
  let lastEventId = request.lastEventId

  if (lastEventId != null) {
    ServerSentEvent
      .where('id', '>', lastEventId)
      .fetchAll()
      .then(function (allEvents) {
        allEvents.forEach(function (event) {
          if (request.identity === 'internal' && event.attributes.data.internal) {
            writeEvent(response, event, event.attributes.data.internal)
          } else if (request.identity === 'teams') {
            if (event.attributes.data.teams) {
              writeEvent(response, event, event.attributes.data.teams)
            }
            if (event.attributes.data.team && event.attributes.data.team.hasOwnProperty(request.identityId)) {
              writeEvent(response, event, event.attributes.data.team[request.identityId])
            }
          } else if (request.identity === 'external' && event.attributes.data.external) {
            writeEvent(response, event, event.attributes.data.external)
          }
        })

        callback(null)
      })
      .catch(function (err) {
        callback(err)
      })
  } else {
    callback(null)
  }
}

app.get('/stream', getRemoteAddr, getIdentity, getLastEventId, function (request, response) {
  if (request.identity == null) {
    throw new UnknownIdentityError()
  }

  response.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  })
  response.write('\n')

  fetchRecentEvents(request, response, function (err) {
    if (err) {
      throw new BaseError()
    }

    const pushEvent = function (data) {
      response.write(data)
    }

    const channel = `event:${request.identity}`
    let directChannel = null
    if (request.identity === 'teams') {
      directChannel = `event:team-${request.identityId}`
    }

    eventStream.on(channel, pushEvent)
    if (directChannel) {
      eventStream.on(directChannel, pushEvent)
    }

    request.once('close', function () {
      eventStream.removeListener(channel, pushEvent)
      if (directChannel) {
        eventStream.removeListener(directChannel, pushEvent)
      }
    })
  })
})

app.use(function (err, request, response, next) {
  if (err instanceof BaseError) {
    response.status(err.getHttpStatus())
    response.json(err.message)
  } else {
    logger.error(err)
    response.status(500)
    response.json('Internal Server Error')
  }
})

export default app
