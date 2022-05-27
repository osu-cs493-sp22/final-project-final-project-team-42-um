const { ObjectId } = require('bson');
const mongoose = require('mongoose');
const schemas = {assignment:{}, course:{}, user:{}, submission:{}}
const models = {assignment:{}, course:{}, user:{}, submission:{}}

const mongoHost = process.env.MONGO_HOST;
const mongoPort = process.env.MONGO_PORT || 27017;
const mongoUser = process.env.MONGO_USER;
const mongoPassword = process.env.MONGO_PASSWORD;
const mongoDBName = process.env.MONGO_DB_NAME;
const mongoURL = `mongodb://${mongoUser}:${mongoPassword}@${mongoHost}:${mongoPort}/${mongoDBName}?authSource=${mongoDBName}`;

exports.connectToDb = async (callback) => {
    const promise = mongoose.connect(mongoURL)
    schemas.assignment = mongoose.Schema({
        courseId: ObjectId,
        title: String,
        points: Number,
        date: Date
    })
    schemas.course = mongoose.Schema({
        subject: String,
        number: String, 
        title: String,
        term: String,
        instructorId: ObjectId
    })
    schemas.user = mongoose.Schema({
        name: String,
        email: String,
        // Note this password is stored as a hash
        password: String,
        role: String
    })
    schemas.submission = mongoose.Schema({
        assignmentId: ObjectId,
        studentId: ObjectId,
        timestamp: Date,
        grade: Number,
        file: String
    })

    models.assignment = mongoose.model('assignment', schemas.assignment)
    models.course = mongoose.model('course', schemas.course)
    models.user = mongoose.model('user', schemas.user)
    models.submission = mongoose.model('submission', schemas.submission)
    await promise
    callback()
}

exports.models = models