const { ObjectId } = require('bson');
const mongoose = require('mongoose');
const { createBucket } = require('mongoose-gridfs')
const schemas = {assignment:{}, course:{}, user:{}, submission:{}}
const models = {assignment:{}, course:{}, user:{}, submission:{}}

const mongoHost = process.env.MONGO_HOST;
const mongoPort = process.env.MONGO_PORT || 27017;
const mongoUser = process.env.MONGO_USER;
const mongoPassword = process.env.MONGO_PASSWORD;
const mongoDBName = process.env.MONGO_DB_NAME;
const mongoURL = `mongodb://${mongoUser}:${mongoPassword}@${mongoHost}:${mongoPort}/${mongoDBName}?authSource=${mongoDBName}`;

const bcrypt = require('bcryptjs');
const { UserClientFields } = require('../../assignment-3-binarybrain11/models/user');
const saltLength = 8

exports.connectToDb = async (callback) => {
    const promise = mongoose.connect(mongoURL)
    schemas.assignment = mongoose.Schema({
        courseId: { type: ObjectId, required: true },
        title: { type: String, required: true },
        points: { type: Number, required: true },
        date: { type: Date, required: true },
    })
    schemas.course = mongoose.Schema({
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
    schemas.user = mongoose.Schema({
        name: { type: String, required: true },
        email: { type: String, required: true },
        // Note this password is stored as a hash by pre('save') middleware below
        password: { type: String, required: true },
        role: { 
            type: String, 
            values: ["student", "instructor", "admin"], 
            default: "student" ,
            required: true
        }
    })
    // Note: not triggered on update
    schemas.user.pre('save', function (next) {
        // Converts password to salted hash before saving in the database
        this.set({ password: bcrypt.hashSync(this.password, saltLength)})
        next()
    })
    schemas.submission = mongoose.Schema({
        assignmentId: { type: ObjectId, required: true },
        studentId: { type: ObjectId, required: true },
        timestamp: { type: Date, required: false, immutible: true },
        grade: { type: Number, required: false },
        file: { type: String, required: true },
    })
    schemas.submission.pre('save', function (next) {
        this.set({ 
            // Sets the timestamp to submission time
            timestamp: Date.now(),
            // Ensures a grade isn't included with the submission
            grade: null
        })
        next()
    })

    models.assignment = mongoose.model('assignment', schemas.assignment)
    models.course = mongoose.model('course', schemas.course)
    models.user = mongoose.model('user', schemas.user)
    models.submission = mongoose.model('submission', schemas.submission)
    await promise
    callback()
}

exports.models = models

/* Multer data storage engine */
function gridFsFileStorage (opts) {
    this.bucketName = opts.bucketName
}

gridFsFileStorage.prototype._handleFile = (req, file, callback) => {

}