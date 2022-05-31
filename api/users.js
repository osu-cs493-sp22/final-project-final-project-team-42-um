const { Router } = require('express')

const router = Router()

// Create a new user
router.post('/', (req, res, next) => {
    next()
})

// Log in a user
router.post('/login', (req, res, next) => {
    next()
})

// Fetch data about a specific user
router.get('/:id', (req, res, next) => {
    next()
})

module.exports = router
