const express = require('express')
const app = express()
const PORT = 3000

const middleware = {
  logger: (req, res, next) => {
    console.log('Request: ' + req.method + ' ' + req.originalUrl)
    next()
  }
}

app.use(middleware.logger)

app.get('/', (req, res) => {
  res.send('Hello Express')
})

app.listen(PORT, () => {
  console.log(`Express Server listening on port ${PORT}`)
})
