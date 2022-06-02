const { ObjectId } = require('bson');
const mongoose = require('mongoose');
const { createBucket } = require('mongoose-gridfs')

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
    await mongoose.connect(mongoURL)
    callback()
}

exports.models = models

/* Multer data storage engine */
function gridFsFileStorage (opts) {
    this.bucketName = opts.bucketName
}

gridFsFileStorage.prototype._handleFile = (req, file, callback) => {

}