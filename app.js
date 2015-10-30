'use strict'

/* Modules */

var http = require('http')
var express = require('express')
var expressSession = require('express-session')
var bodyParser = require('body-parser')
var flash = require('connect-flash')
var engines = require('consolidate')
var config = require('config')
var logger = require(process.cwd() + '/utils/logger')

var authRouter = require('./auth/authRouter')
var socketController = require('./socketController')

/* Express */

var app = express()

var sessionMiddleware = expressSession({
  name: 'sessionId',
  secret: config.get('express.cookieSecret'),
  proxy: true,
  resave: true,
  saveUninitialized: true,
  cookie: { path: '/', httpOnly: true, secure: true, maxAge: 3600000 }
})

app.set('views', __dirname + '/views')
  .use('/public', express.static(__dirname + '/public'))
  .engine('html', engines.swig)
  .set('view engine', 'html')
  .disable('x-powered-by')
  // .set('trust proxy', true)
  .use(sessionMiddleware) // use the middleware
  .use(flash()) // session flash messaging
  .use(bodyParser.urlencoded({ extended: true })) // parse form data

var ensureAuthenticated = function (req, res, next) {
  if (req.session.accessToken) {
    res.locals.user = req.session.user
    return next()
  }
  req.session.redirectUrl = req.url
  res.redirect('/login')
}

/* Http */

var httpServer = http.createServer(app)

/* Socket.io */

var ios = require('socket.io-express-session')
var io = require('socket.io')(httpServer)
io.use(ios(sessionMiddleware)) // session support
io.on('connection', socketController)

/* App */

app
  .use(authRouter)
  .get('/', function (req, res) { res.render('index') })
  .get('/query', ensureAuthenticated, function (req, res) {
    res.render('query', {
      userId: req.query.userId,
      action: req.query.action,
      timeframe: req.query.timeframe,
      run: req.query.run,
      stream: req.query.stream,
      apiUsed: req.session.apiUsed
    })
  })
  .use(function (err, req, res, next) {
    if (err.code === 'EBADCSRFTOKEN') {
      // handle CSRF token errors here
      res.status(403).send('Session expired or invalid CSRF token!')
    } else {
      logger.error('Generic error handler', err)
    }
  })

httpServer.listen(config.get('express.port'))
logger.info('Express listening on port %s', config.get('express.port'))
