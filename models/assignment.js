const { ObjectId } = require('mongodb');
const mongoose = require('mongoose')

exports.schema =  mongoose.Schema({
    courseId: { type: ObjectId, required: true },
    title: { type: String, required: true },
    points: { type: Number, required: true },
    date: { type: Date, required: true },
})

exports.model = mongoose.model('assignment', exports.schema)