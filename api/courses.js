const { Router } = require('express')

const router = Router()

// Create a new course 
router.post('/', (req, res, next) => {
    next()
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