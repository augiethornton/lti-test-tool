const router = require('express').Router()
const consumerRegistration = require('../controllers/consumerRegistration')
const developerRegistration = require('../controllers/developerRegistration')
const launch = require('../controllers/launch')

router.get('/', (req, res) => {
  res.render('index', { title: 'LTI Test Tool' })
})

router.post('/register_oauth', consumerRegistration.register)

router.post('/register', developerRegistration.register)

router.post('/launch', launch.similarityDetection)

module.exports = router
