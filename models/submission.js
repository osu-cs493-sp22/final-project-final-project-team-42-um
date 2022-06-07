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
            const user = await mongoose.model('user').findById(studentId)
            return !!user
        },
        message: "Submission assignmentId doesn't exist"
    } },
    timestamp: { type: Date, required: false, immutible: true },
    grade: { type: Number, required: false },
    // Route where to download submission
    file: { type: String, required: false },
    // Allows for GridFS to store stuff it needs in here
}, { strict: false} )
exports.schema.pre('save', function (next) {
    this.set({ 
        // Sets the timestamp to submission time
        timestamp: Date.now(),
    })
    next()
})
exports.schema.post('validate', function (doc) {
    doc.set({
        file: `/submissions/${doc._id}`
    })
})

exports.model = mongoose.model('submission.file', exports.schema)