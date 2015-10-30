'use strict'

var express = require('express')
var authControllers = require('./authController')

// var auth = require('./index')
var authRouter = express.Router()

authRouter.get('/login/:env', authControllers.login)
authRouter.get('/callback', authControllers.loginCallback)
authRouter.get('/logout', authControllers.logout)

module.exports = authRouter
