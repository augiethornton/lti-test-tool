const app = require('express')()
const bodyParser = require('body-parser')
const routes  = require('./routes/api/routes')

const PORT = 8080

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

app.use('/api', routes)

app.listen(PORT, () => {
  console.log(`Express Server listening on port ${PORT}`)
})
