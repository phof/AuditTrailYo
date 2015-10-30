'use strict'

var _ = require('underscore')
var jsforce = require('jsforce')
var logger = require(process.cwd() + '/utils/logger')
var printf = require('util').format

var DataManager = function (session) {
  var self = this
  self.conn = new jsforce.Connection()

  self.getServerTimestamp = function (cb) {
    self.conn.getServerTimestamp(function (err, result) {
      if (err) { return cb(err, null) }
      return cb(null, result)
    })
  }

  self.getLatestEntries = function (options, cb) {
    var recs = []

    var query = printf('SELECT Id,Action,CreatedBy.Username,CreatedDate,Display FROM SetupAuditTrail where CreatedDate>%s order by createddate asc', options.timestamp)

    if (options.userId && options.action) {
      query = printf('SELECT Id,Action,CreatedBy.Username,CreatedDate,Display FROM SetupAuditTrail where CreatedDate>%s AND CreatedById=\'%s\' AND Action=\'%s\' order by createddate asc', options.timestamp, options.userId, options.action)
    } else if (options.userId) {
      query = printf('SELECT Id,Action,CreatedBy.Username,CreatedDate,Display FROM SetupAuditTrail where CreatedDate>%s AND CreatedById=\'%s\' order by createddate asc', options.timestamp, options.userId)
    } else if (options.action) {
      query = printf('SELECT Id,Action,CreatedBy.Username,CreatedDate,Display FROM SetupAuditTrail where CreatedDate>%s AND Action=\'%s\' order by createddate asc', options.timestamp, options.action)
    }

    logger.debug('[%s] Request is %s', session.accessToken.substring(session.accessToken.length - 5), query)
    self.conn.query(query, function (err, result) {
      session.apiUsed++; session.save()
      if (err) {
        return cb(err, null)
      }
      self.getMore(recs, result, cb)
    })
  }

  self.getMore = function (recs, result, cb) {
    logger.debug('Received %s records', result.records.length)
    recs = _.union(recs, result.records)

    if (!result.done) {
      self.conn.queryMore(result.nextRecordsUrl, function (err, result) {
        session.apiUsed++; session.save()
        if (err) {
          return console.error(err)
        }
        self.getMore(recs, result, cb)
      })
    } else {
      logger.debug('Got all data')
      cb(null, recs)
    }
  }
}

module.exports = {
  DataManager: DataManager
}
