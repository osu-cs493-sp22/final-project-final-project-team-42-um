const { Router } = require('express')
const { default: mongoose } = require('mongoose')
const { requireAuthentication } = require('../lib/auth')
const { models, getSubmissionBucket } = require('../lib/database')
const { roles } = require('../models/user')

const router = Router()

router.get('/:id', requireAuthentication, async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)){
        next()
    }
    const submission = await models.submission.findById(req.params.id)
    if (!submission){
        return next()
    }
    if (req.role !== roles.admin){
        console.log(submission)
        console.log(req.user)
        console.log(req.role)
        if (!(req.role === roles.student && req.user == submission.studentId)){
            const assignment = models.assignment.findById(submission.assignmentId)
            if (!(req.role === roles.instructor && assignment && req.user == assignment.instructorId)){
                return res.status(403).json({
                    error: "Only an authorized user can download a submission"
                })
            }
        }
    }
    const bucket = await getSubmissionBucket()
    const stream = await bucket.createReadStream({_id: submission._id})
    stream.on('file', (file) => {
        res.status(200).type(file.contentType)
    })
    .on('error', (err) => {
        if (err.code === 'ENOENT'){
            next()
        } else {
            next(err)
        }
    })
    .pipe(res)
})

module.exports = router