const router = require('express').Router()
const registration = require('../app/controllers/registration')
const launch = require('../app/controllers/launch')

router.get('/', (req, res) => {
  res.send('Hello Express')
})

// LTI registration endpoint
router.post('/register', registration.register)

// LTI launch endpoint
router.post('/launch', launch.similarityDetection)

module.exports = router
