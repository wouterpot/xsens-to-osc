const express = require('express')
const segments = require('./sensors')
const router = express.Router()

router.get('/', async (req, res) => {
    res.send(segments)
})
  

module.exports = router