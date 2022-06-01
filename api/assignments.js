const { Router } = require('express')

const router = Router()

// Create a new assignment
router.post('/', (req, res, next) => {
    next()
})

// Fetch data about a specific assignment
router.get('/:id', (req, res, next) => {
    next()
})

// Update data for a specific assignment
router.patch('/:id', (req, res, next) => {
    next()
})

// Remove a specific assignment from the database
router.delete('/:id', (req, res, next) => {
    next()
})

// Fetch the list of all submissions for an assignment
router.get('/:id/submissions', (req, res, next) => {
    next()
})

// Create a new submission for an assignment 
router.post('/:id/submissions', (req, res, next) => {
    next()
})

module.exports = router