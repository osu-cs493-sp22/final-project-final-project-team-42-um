const { Router } = require('express')

const { models, errorHandler, gridFsStorage } = require('../lib/database')

const roles = require('../models/user').roles

const { createBucket } = require('mongoose-gridfs')
const mongoose = require('mongoose')

const multer = require('multer')
const { requireAuthentication } = require('../lib/auth')

const uploadSubmission = multer({
    storage: gridFsStorage({ bucketName: "submission" })
}).single('file')

const router = Router()

// Create a new assignment
router.post('/', requireAuthentication, async (req, res, next) => {
    const assignment = req.body 
    if (assignment.courseId){
        // Check authentication status
        const course = await models.course.findById(assignment.courseId)
        if (course) {
            if (course.instructorId == req.user || req.role === roles.admin) {
                // Finally create assignment
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
    models.assignment.findById(req.params.id).then( (assignment) => {
        if (assignment) {
            res.status(200).send(assignment)
        } else {
            next()
        }
    }).catch( err => res.status(400).send( errorHandler(err) ) )
})

// Update data for a specific assignment
router.patch('/:id', requireAuthentication, (req, res, next) => {
    models.assignment.findById(req.params.id).then( assignment => {
        if (assignment) {
            // Update assignment fields
            Object.keys(req.body).every(
                key => assignment[key] = req.body[key]
            )
            // Check authenication status
            models.course.findById(assignment.courseId).then( course => {
                if (course) {
                    if (req.role === roles.admin || req.user == course.instructorId){
                        // Finally update assignment
                        assignment.save().then( () => {
                            res.status(200).send()
                        }).catch( 
                            err => res.status(400).send( errorHandler(err) ) 
                        )
                    } else {
                        res.status(403).json({
                            error: "Only an authorized user can modify an assignment"
                        })
                    }
                } else {
                    res.status(400).json({
                        error: "Assignment courseId doesn't exist"
                    })
                }
            }).catch( 
                err => res.status(400).send( errorHandler(err) )
            )
        } else {
            next()
        }
    }).catch( 
        err => res.status(400).send(errorHandler(err))
    )
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