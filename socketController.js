// var io = require('socket.io')
var DataManager = require(process.cwd() + '/dataManager')['DataManager']
var logger = require(process.cwd() + '/utils/logger')
var moment = require('moment')

module.exports = function (socket) {
  if (!socket.handshake.session.accessToken) {
    return socket.emit('haz error', 'INVALID_SESSION_ID')
  }

  var dataManager = new DataManager(socket.handshake.session)
  dataManager.conn.instanceUrl = socket.handshake.session.instanceUrl
  dataManager.conn.accessToken = socket.handshake.session.accessToken

  socket.on('disconnect', function () {
    // console.log('user disconnected')
  })

  socket.on('error', function (err) {
    logger.error('socket errorz', err)
  })

  socket.on('get some data', function (options) {
    dataManager.getServerTimestamp(function (err, time) {
      if (err) {
        logger.error('There was an error while querying serverTimestamp', err)
        return socket.emit('haz error', 'Couldn\'t get serverTimestamp')
      }

      var now = moment(time).toISOString()
      options.timestamp = socket.handshake.session.lastPull || now

      if (options.timeframe) {
        options.timestamp = moment(time).subtract(options.timeframe, 'hours').toISOString()
      }

      socket.handshake.session.lastPull = now

      dataManager.getLatestEntries(options, function (err, data) {
        if (err) {
          logger.error('There was an error while getting data.', err)
          return socket.emit('haz error', err.errorCode || err)
        } else {
          socket.emit('data', data)
        }

        socket.emit('apiUsed', socket.handshake.session.apiUsed)
      })
    })
  })
}
