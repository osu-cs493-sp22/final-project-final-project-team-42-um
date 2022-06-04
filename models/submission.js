const { ObjectId } = require('bson');
const mongoose = require('mongoose')

exports.schema = mongoose.Schema({
    assignmentId: { type: ObjectId, required: true, validate: {
        validator: async function(assignmentId) {
            const assignment = await mongoose.model('assignment').findById(assignmentId)
            return !!assignment
        },
        message: "Submission assignmentId doesn't exist"
    }},
    studentId: { type: ObjectId, required: true, validate: {
        validator: async function(studentId) {
            const user = await mongoose.model('user').findById(assignmentId)
            return !!user
        },
        message: "Submission assignmentId doesn't exist"
    } },
    timestamp: { type: Date, required: false, immutible: true },
    grade: { type: Number, required: false },
    // Route where to download submission
    file: { type: String, required: true },
})
exports.schema.pre('save', function (next) {
    this.set({ 
        // Sets the timestamp to submission time
        timestamp: Date.now(),
        // Ensures a grade isn't included with the submission
        grade: null
    })
    next()
})

exports.model = mongoose.model('submission.file', exports.schema)