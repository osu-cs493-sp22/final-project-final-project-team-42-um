const { ObjectId } = require('mongodb');
const mongoose = require('mongoose')

exports.schema = mongoose.Schema({
    subject: { type: String, required: true },
    number: { type: String,  required: true },
    title: { type: String, required: true },
    term: { type: String, required: true },
    instructorId: { type: ObjectId, required: true, validate: {
        validator: async function(instructorId) {
            const user = await mongoose.model('user').findById(instructorId)
            return user && user.role === "instructor"
        },
        message: "Course instructorId is not in fact an instructor"
    }},
})

exports.model = mongoose.model('course', exports.schema)