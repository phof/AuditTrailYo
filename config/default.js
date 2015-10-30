module.exports = {
  oauth: {
    loginUrl: 'https://login.salesforce.com',
    clientId: process.env.clientId,
    clientSecret: process.env.clientSecret,
    redirectUri: process.env.redirectUri
  },
  express: {
    cookieSecret: process.env.cookieSecret,
    port: process.env.PORT || 8080
  }
}
