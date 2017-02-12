const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const routes  = require('./routes/index')


const middleware = {
  logger: (req, res, next) => {
    console.log('Request: ' + req.method + ' ' + req.originalUrl)
    next()
  }
}

app.set('port', process.env.PORT || 3000)
app.set('views', __dirname + '/views')
app.set('view engine', 'jsx')

// registers react-views as the server-side template engine
app.engine('jsx', require('express-react-views').createEngine())

// for logging request method and endpoint
app.use(middleware.logger)

// for parsing application/json
app.use(bodyParser.json())

// for parsing application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/', routes)

app.use(express.static(__dirname + '/public'))

app.use((req, res, next) => { 
  res.status(404)
  res.render('404')
})

app.use((err, req, res, next) => { 
  console.error(err.stack)
  res.status(500)
  res.render('500')
})

app.listen(app.get('port'), () => {
  console.log( 'Express started on http://localhost:' +
  	app.get('port') + '; press Ctrl-C to terminate.' )
})
