const res = require('express/lib/response');
const mongoose = require('mongoose');
const { createBucket } = require('mongoose-gridfs');

const mongoHost = process.env.MONGO_HOST;
const mongoPort = process.env.MONGO_PORT || 27017;
const mongoUser = process.env.MONGO_USER;
const mongoPassword = process.env.MONGO_PASSWORD;
const mongoDBName = process.env.MONGO_DB_NAME;
const mongoAuthDB = process.env.MONGO_AUTH_DB_NAME
const mongoURL = `mongodb://${mongoUser}:${mongoPassword}@${mongoHost}:${mongoPort}/${mongoDBName}?authSource=${mongoAuthDB}`;

exports.models = {
    user: require('../models/user').model,
    assignment: require('../models/assignment').model,
    course: require('../models/course').model,
    submission: require('../models/submission').model,
    roster: require('../models/roster').model
}

exports.schemas = {
    user: require('../models/user').schema,
    assignment: require('../models/assignment').schema,
    course: require('../models/course').schema,
    submission: require('../models/submission').schema,
    roster: require('../models/roster').schema
}

exports.connectToDb = async (callback) => {
    console.log("Connecting to database...")
    await mongoose.connect(mongoURL)
    console.log("Connected!")
    callback()
}

exports.closeDbConnection = async (callback) => {
    await mongoose.connection.close()
    callback()
}

exports.getDbReference = () => {
    return mongoose.connection.db
}

exports.errorHandler = (err) => {
    // Mongoose errors are ugly, clean up certain errors here:
    if (err.name === "ValidationError") {
        let errors = {}
        Object.keys(err.errors).every( 
            key => errors[key] = err.errors[key].message
        )
        return errors
    } 
    else {
        return err
    }
}

function gridFsStorage (opts) {
    this.bucketName = opts.bucketName
}

gridFsStorage.prototype._handlefile = function (req, file, callback) {
    createBucket( { bucketName: this.bucketName } )._handlefile(req, file, callback)
}

gridFsStorage.prototype._removefile = function (req, file, callback) {
    createBucket( { bucketName: this.bucketName } )._removefile(req, file, callback)
}

exports.gridFsStorage = gridFsStorage
