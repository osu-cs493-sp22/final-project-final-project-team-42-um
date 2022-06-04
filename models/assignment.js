const { ObjectId } = require('mongodb');
const mongoose = require('mongoose')

exports.schema =  mongoose.Schema({
    courseId: { type: ObjectId, required: true, validate: {
        validator: async function(courseId) {
            const course = await mongoose.model('course').findById(courseId)
            return !!course
        },
        message: "Assignment courseId doesn't exist"
    }},
    title: { type: String, required: true },
    points: { type: Number, required: true },
    due: { type: Date, required: true },
})

exports.model = mongoose.model('assignment', exports.schema)