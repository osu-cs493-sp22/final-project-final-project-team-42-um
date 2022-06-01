const { Router } = require('express')
const { optionalAuthentication } = require('../lib/auth')

const { models } = require('../lib/database')

const router = Router()

// Create a new user
router.post('/', optionalAuthentication, (req, res, next) => {
    const user = req.body
    // Check auth requirements
    if (user.role && user.role === "instructor") {
        // Require authentication
        if (!(req.role === "instructor" || req.role === "admin")){
            return res.status(403).json({
                error: "Forbidden: Only an authorized user can create an instructor!"
            })
        }
    }
    models.user.create(user).then( newUser => {
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
