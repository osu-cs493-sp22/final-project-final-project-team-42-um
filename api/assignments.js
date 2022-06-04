const { Router } = require('express')

const { models, errorHandler } = require('../lib/database')

const roles = require('../models/user').roles

const { createBucket } = require('mongoose-gridfs')
const mongoose = require('mongoose')

const multer = require('multer')
const { requireAuthentication } = require('../lib/auth')
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
        }).single('file')
        uploadSubmission(req, res, next)
    } else {
        next()
    }
}

const router = Router()

// Create a new assignment
router.post('/', requireAuthentication, (req, res, next) => {
    const assignment = req.body 
    console.log(req.body)
    if (assignment.courseId){
        const course = models.course.findById(assignment.courseId)
        if (course) {
            if (course.instructorId == req.user || req.role === roles.admin) {
                models.assignment.create(assignment).then( newAss => {
                    res.status(201).json({
                        id: newAss._id
                    })
                }).catch( err => {
                    res.status(400).send(errorHandler(err))
                })
            } else {
                res.status(403).json({
                    error: "Only an authorized user can create an assignment"
                })
            }

        } else {
            res.status(400).json({
                error: "Assignment courseId doesn't exist"
            })
        }
    } else {
        res.status(400).json({
            error: "Assignment expects a courseId, "
        })
    }
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
router.post('/:id/submissions', 
    requireAuthentication, 
    uploadSubmission, 
    (req, res, next) => {
        // TODO All of the verification and stuff.
        if (req.file && req.body){
            res.status(201).json({
                id: req.file._id
            })
        } else {
            res.status(400).send({
                error: "Request expects a multipart form with a file field"
            })
        }
})

module.exports = router