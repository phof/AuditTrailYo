'use strict'

var config = require('config')
var jsforce = require('jsforce')
var logger = require(process.cwd() + '/utils/logger')

var authController = {}

authController.login = function (req, res) {
  var oauthConfig = config.get('oauth')
  var oauth = new jsforce.OAuth2(oauthConfig)
  req.session.oauth = oauth // store oauth data in session
  res.redirect(oauth.getAuthorizationUrl({
    scope: 'id chatter_api api'
  })) // redirect to auth
}

authController.loginCallback = function (req, res) {
  var code = req.query.code
  var conn = new jsforce.Connection({
    oauth2: req.session.oauth
  })

  conn.authorize(code, function (err, userInfo) {
    if (err) {
      logger.error('Error while authorizing', err)
      return res.send('Oops, there was an error while authorizing!')
    }

    logger.info('Connected to %s as %s', userInfo.organizationId, userInfo.id)
    conn.identity()
      .then(function (userData) {
        delete req.session.oauth // don't need this anymore
        req.session.user = userData
        req.session.accessToken = conn.accessToken
        req.session.instanceUrl = conn.instanceUrl
        req.session.apiUsed = 0

        var redirectUrl = '/query'
        if (req.session.redirectUrl) {
          redirectUrl = req.session.redirectUrl
          req.session.redirectUrl = null
        }
        res.redirect(redirectUrl)
      }, function (err) {
        if (err) { return res.send('Oops, there was an error while getting userData!') }
      })
  })
}

authController.logout = function (req, res) {
  req.session.destroy()
  res.redirect('/')
}

module.exports = authController
