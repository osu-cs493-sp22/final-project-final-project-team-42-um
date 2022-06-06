const { ObjectId } = require('bson');
const mongoose = require('mongoose')

exports.schema = mongoose.Schema({
    students: [{ type: ObjectId, required: true, validate: {
        validator: async function(studentId) {
            const user = await mongoose.model('user').findById(studentId)
            return user && user.role === "student"
        },
        message: "Roster studentId is not in fact an student"
    }}]
})

exports.model = mongoose.model('roster', exports.schema)
