const router = require('express').Router()
const registration = require('../controllers/registration_controller')
const launch = require('../controllers/launch_controller')

router.get('/', (req, res) => {
  res.render('index', { title: 'LTI Test Tool' })
})

router.post('/register', registration.register)

router.post('/launch', launch.similarityDetection)

module.exports = router