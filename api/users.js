const { Router } = require('express')
const { optionalAuthentication, authenticateUser, genAuthToken } = require('../lib/auth')

const { models, errorHandler } = require('../lib/database')
const { roles } = require('../models/user')

const router = Router()

// Create a new user
router.post('/', optionalAuthentication, (req, res, next) => {
    const user = req.body
    // Check auth requirements
    if (user.role && user.role === roles.instructor) {
        // Require authentication
        if (!(req.role === roles.instructor || req.role === roles.admin)){
            return res.status(403).json({
                error: "Forbidden: Only an authorized user can create an instructor!"
            })
        }
    } else if (user.role && user.role === roles.admin) {
        if (req.role !== roles.admin){
            return res.status(403).json({
                error: "Forbidden: Only an authorized user can create an admin"
            })
        }
    }
    models.user.create(user).then( newUser => {
        res.status(201).json({
            id: newUser._id,
        })
    }).catch( err => {
        res.status(400).send(errorHandler(err))
    })
})

// Log in a user
router.post('/login', async (req, res, next) => {
    const user = req.body
    if (user && user.email && user.password){
        try {
            if (await authenticateUser(user.email, user.password)){
                const token = await genAuthToken(user.email)
                res.status(200).json({ token: token })
            } else {
                res.status(401).json({
                    error: "Invalid login credentials"
                })
            }
        } catch (err) {
            res.status(500).json({
                error: "Erorr logging in. Try again later."
            })
        }
    } else {
        res.status(400).json({
            error: "Request body needs an email and password"
        })
    }
})

// Fetch data about a specific user
router.get('/:id', (req, res, next) => {
    next()
})

module.exports = router
