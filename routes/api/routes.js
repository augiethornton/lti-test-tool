const router = require('express').Router()
const registration = require('../../app/controllers/registration')

router.get('/', (req, res) => {
  res.send('Hello Express')
})

// LTI registration endpoint
router.post('/api/register', registration.register)

module.exports = router
