module.exports = {
  oauth: {
    clientId: process.env.clientId,
    clientSecret: process.env.clientSecret,
    redirectUri: process.env.redirectUri
  },
  express: {
    cookieSecret: process.env.cookieSecret,
    port: process.env.PORT || 8080
  }
}
