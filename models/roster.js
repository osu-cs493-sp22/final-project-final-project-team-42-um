const { ObjectId } = require('bson');
const mongoose = require('mongoose')

exports.schema = mongoose.Schema({
    students: [{ type: ObjectId, required: true, validate: {
        validator: async function(instructorId) {
            const user = await mongoose.model('user').findById(instructorId)
            return user && user.role === "student"
        },
        message: "Course instructorId is not in fact an instructor"
    }}]
})

exports.model = mongoose.model('roster', exports.schema)
