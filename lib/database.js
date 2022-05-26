const mongoose = require('mongoose')
const schemas = {assignment:{}, course:{}, user:{}, submission:{}}
const models = {assignment:{}, course:{}, user:{}, submission:{}}

const mongoHost = process.env.MONGO_HOST;
const mongoPort = process.env.MONGO_PORT || 27017;
const mongoUser = process.env.MONGO_USER;
const mongoPassword = process.env.MONGO_PASSWORD;
const mongoDBName = process.env.MONGO_DB_NAME;
const mongoURL = `mongodb://${mongoUser}:${mongoPassword}@${mongoHost}:${mongoPort}/${mongoDBName}?authSource=${mongoDBName}`;

exports.connect = () => {
    const promise = mongoose.connect(mongoURL)
    schemas.business = mongoose.Schema({
        ownerid: Number,
        name: String,
        address: String,
        city: String,
        state: String,
        zip: {
            type: String, 
            match: [/[0-9]{5}$/, 
                "Expects a 5 digit zip code in zip field, got {VALUE}"
            ]
        },
        phone: {
            type: String, 
            match: [/^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/, 
            "Expects a phone number, got {VALUE}"]
        },
        category: String,
        subcategory: String,
        website: String
    })
    schemas.review = mongoose.Schema({
        userid: Number,
        businessid: String,
        dollars: {
            type: Number, 
            min: [1, "Expects a value between 1 and 4, got {VALUE}"], 
            max: [4, "Expects a value between 1 and 4, got {VALUE}"]
        },
        stars: {type: Number, min: 0, max: 5},
        review: String
    })
    schemas.photo = mongoose.Schema({
        userid: Number,
        businessid: String,
        caption: String
    })

    models.business = mongoose.model('business', schemas.business)
    models.review = mongoose.model('review', schemas.review)
    models.photo = mongoose.model('photo', schemas.photo)
    return promise
}

exports.models = models