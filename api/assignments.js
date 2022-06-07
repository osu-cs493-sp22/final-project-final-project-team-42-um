const { Router } = require('express')

const { 
    models, 
    errorHandler, 
    uploadSubmission, 
    getSubmissionBucket 
} = require('../lib/database')

const roles = require('../models/user').roles

const { createBucket } = require('mongoose-gridfs')
const mongoose = require('mongoose')

const multer = require('multer')
const { requireAuthentication } = require('../lib/auth')

const router = Router()

// Create a new assignment
router.post('/', requireAuthentication, async (req, res, next) => {
    const assignment = req.body 
    if (assignment.courseId){
        // Check authorization status
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
    if (!mongoose.Types.ObjectId.isValid(req.params.id)){
        next()
    }
    models.assignment.findById(req.params.id).then( (assignment) => {
        if (assignment) {
            res.status(200).send(assignment)
        } else {
            next()
        }
    }).catch( err => res.status(400).send( errorHandler(err) ) )
})

// Update data for a specific assignment
router.patch('/:id', requireAuthentication, async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)){
        next()
    }
    try{
        let assignment = await models.assignment.findById(req.params.id)
        if (assignment) {
            // Update assignment fields
            Object.keys(req.body).every(
                key => assignment[key] = req.body[key]
            )
            // Check authorization status
            const course = await models.course.findById(assignment.courseId)
            if (course) {
                if (req.role === roles.admin || req.user == course.instructorId){
                    // Finally update assignment
                    await assignment.save()
                    res.status(200).send()
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
        } else {
            next()
        }
    } catch(err) {
        res.status(400).send(errorHandler(err))
    }
})

// Remove a specific assignment from the database
router.delete('/:id', requireAuthentication, async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)){
        next()
    }
    try{
        const assignment = await models.assignment.findById(req.params.id)
        if (assignment) {
            // Check authorization status
            const course = await models.course.findById(assignment.courseId)
            if (req.role === roles.admin || (course && course.instructorId == req.user)){
                // Delete the assignment
                await models.assignment.findByIdAndDelete(req.params.id)
                res.status(204).send()
            } else {
                res.status(403).json({
                    error: "Only an authorized user can delete an assignment"
                })
            }
        } else {
            next()
        }
    } catch(err){
        res.status(400).send( errorHandler(err) )
    }
})

// Fetch the list of all submissions for an assignment
router.get('/:id/submissions', requireAuthentication, async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)){
        next()
    }
    try{
        const assignment = await models.assignment.findById(req.params.id)
        if (assignment) {
            // Check authorization status
            const course = await models.course.findById(assignment.courseId)
            if (req.role === roles.admin || (course && course.instructorId == req.user)){
                // Paginate responses
                let page = parseInt(req.query.page) || 1
                let filter = { assignmentId: req.params.id }
                if (req.query.studentId){
                    filter.studentId = req.query.studentId
                }
                const numSubmissions = await models.submission.countDocuments(filter)
                const numPerPage = 10
                const lastPage = Math.ceil(numSubmissions / numPerPage)
                page = page > lastPage ? lastPage : page
                page = page < 1 ? 1 : page

                const start = (page - 1) * numPerPage

                const foundSubmissions = await models.submission.find(filter).skip(start).limit(numPerPage)
                res.status(200).json({
                    submissions: foundSubmissions
                })
            } else {
                res.status(403).json({
                    error: "Only an authorized user can view submissions"
                })
            }
        } else {
            next()
        }
    } catch(err){
        res.status(400).send( errorHandler(err) )
    }
})

// Middleware to check authorization status before committing to upload
async function submissionAuthorization (req, res, next) {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)){
        res.status(404).json({
            error: "Requested resource " + req.originalUrl + " does not exist"
            })
    }
    try{
        const assignment = await models.assignment.findById(req.params.id)
        if (assignment) {
            // Check if student is enrolled in course
            const roster = await models.roster.findById(assignment.courseId)
            if (roster && roster.students.includes(req.user)) {
                // Call the upload middleware
                next()
            } else {
                res.status(403).json({
                    error: "Only a student enrolled in this class can submit an assignment"
                })
            }
        } else {
            res.status(404).json({
                error: "Requested resource " + req.originalUrl + " does not exist"
              })
        }
    } catch(err) {
        res.status(400).send( errorHandler(err) )
    }
}

// Create a new submission for an assignment 
router.post('/:id/submissions', 
    requireAuthentication, 
    submissionAuthorization, 
    uploadSubmission.single('file'),
    async (req, res, next) => {
        if (req.file && req.body){
            if (req.body.assignmentId == req.params.id){
                if (req.body.studentId == req.user){
                    let submission = await models.submission.findById(req.file._id) 
                    // This overrides the strict: false for this documet only
                    // allowing this document to undergo validation but keeping
                    // GridFS data
                    submission = new models.submission(submission, true)
                    submission.set(req.body)
                    submission.grade = null
                    try{
                        await submission.save()
                        res.status(201).json({
                            id: req.file._id
                        })
                    } catch(err) {
                        const bucket = await createBucket({bucketName: "submission"})
                        bucket.deleteFile(req.file._id, (error, results) => {
                            if (error){
                                console.log(error)
                            }
                            res.status(400).send( errorHandler(err) )
                        })
                    }
                } else {
                    const bucket = await getSubmissionBucket()
                        bucket.deleteFile(req.file._id, (error, results) => {
                            if (error){
                                console.log(error)
                            }
                            res.status(400).json({
                                error: "Students may only submit their own assignment"
                            })
                        })
                }
            } else {
                const bucket = await getSubmissionBucket()
                await bucket.unlink({_id: req.file._id})
                res.status(400).json({
                    error: `assignmentId in submission doesn't match assignmentId in url:\
                    submission: ${req.body.assignmentId}\
                    url: ${req.params.assignmentId}`
                })
            }
        } else {
            res.status(400).send({
                error: "Request expects a multipart form with a file field"
            })
        }
})

module.exports = router