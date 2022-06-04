const { Router } = require('express')
const { requireAuthentication } = require('../lib/auth')

const { models, errorHandler } = require('../lib/database')
const { roles } = require('../models/user')

const router = Router()

// Create a new course 
router.post('/', requireAuthentication, (req, res, next) => {
    if (req.role === roles.admin){
        models.course.create(req.body).then( newCourse => {
            res.status(201).json({
                id: newCourse._id
            })
        }).catch( err => {
            res.status(400).send(errorHandler(err))
        })
    } else {
        res.status(403).json({
            error: "Only an authenticated user can create a course"
        })
    }
})

// Fetch the list of all courses
router.get('/', (req, res, next) => {
    next()
})

// Fetch data about a specific course
router.get('/:id', (req, res, next) => {
    next()
})

// Update data for a specific course
router.patch('/:id', (req, res, next) => {
    next()
})

// Remove a specific course from the database
router.delete('/:id', (req, res, next) => {
    next()
})

// Fetch a list of students enrolled in the class
router.get('/:id/students', (req, res, next) => {
    next()
})

// Update enrollment for a course
router.patch('/:id/students', (req, res, next) => {
    next()
})

// Fetch a CSV file containing a list of the students enrolled in the course
router.get('/:id/roster', (req, res, next) => {
    next()
})

// Fetch a list of the assignments for the course
router.get('/:id/assignments', (req, res, next) => {
    next()
})

module.exports = router