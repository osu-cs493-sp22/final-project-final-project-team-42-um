const { ObjectId } = require('bson');
const mongoose = require('mongoose')

const bcrypt = require('bcryptjs');
const saltLength = 8

exports.schema = mongoose.Schema({
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
exports.schema.pre('save', function (next) {
    // Converts password to salted hash before saving in the database
    this.set({ password: bcrypt.hashSync(this.password, saltLength)})
    next()
})