const { Router } = require('express')

const submissionModel = require('../models/submission')
const assignmentModel = require('../models/assignment')

const { createBucket } = require('mongoose-gridfs')
const mongoose = require('mongoose')

const multer = require('multer')
/* This function needs mongoose to have a connection, so it's a 
 * dummy function until the connection is established, after 
 * which it redefines itself with intended purpose. Since 
 * the server starts after the connection is established, the 
 * dummy version should never be executed 
 */
var uploadSubmission = (req, res, next) => {
    if (mongoose.connection) {
        uploadSubmission = multer({ 
            storage: createBucket({
                bucketName: "submissions"
            }) 
        })
    } else {
        next()
    }
}

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
router.post('/:id/submissions', uploadSubmission, (req, res, next) => {
    // TODO All of the verification and stuff.
    next()
})

module.exports = router