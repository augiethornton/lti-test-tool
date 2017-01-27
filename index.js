const app = require('express')()
const bodyParser = require('body-parser')
const routes  = require('./routes/routes')

const PORT = 3000

const middleware = {
  logger: (req, res, next) => {
    console.log('Request: ' + req.method + ' ' + req.originalUrl)
    next()
  }
}

// for logging request method and endpoint
app.use(middleware.logger)

// for parsing application/json
app.use(bodyParser.json())

// for parsing application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/', routes)

app.listen(PORT, () => {
  console.log(`Express server listening on port ${PORT}`)
})
