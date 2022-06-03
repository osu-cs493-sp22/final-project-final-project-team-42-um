const { ObjectId } = require('bson');
const mongoose = require('mongoose')

exports.schema = mongoose.Schema({
    assignmentId: { type: ObjectId, required: true },
    studentId: { type: ObjectId, required: true },
    timestamp: { type: Date, required: false, immutible: true },
    grade: { type: Number, required: false },
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

exports.model = mongoose.model('submission', exports.schema)