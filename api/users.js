const { Router } = require('express')

const userModel = require('../models/user')

const router = Router()

// Create a new user
router.post('/', (req, res, next) => {
    // Still need authentication
    const user = req.body
    userModel.create(user).then( newUser => {
        res.status(201).json({
            id: newUser._id,
        })
    }).catch(err => {
        res.status(400).json({
            error: err
        })
    })
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
