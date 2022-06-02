const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');

exports.schema = mongoose.Schema({
    subject: { type: String, required: true },
    number: { type: String,  required: true },
    title: { type: String, required: true },
    term: { type: String, required: true },
    instructorId: { type: ObjectId, required: true, 
        validator: async function(instructorId) {
            const user = await mongoose.model('user').findById(instructorId)
            if (user && user.role === "instructor"){
                next()
            } else {
                next("Course instructorId is not in fact an instructor")
            }
        }
    },
})

exports.model = mongoose.model('course', exports.schema)