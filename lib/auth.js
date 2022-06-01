const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const jwtKey = "Super secret key"

const { models } = require('../lib/database')

exports.authenticateUser = async (userName, password) => {
    const user = await models.user.findOne({ name: userName })
    return user && await bcrypt.compare(password, user.password)
}

exports.genAuthToken = async (userName) => {
    const user = await models.user.findOne({ name: userName })
    if (user) {
        const payload = { sub: user._id, role: user.role }
        return await jwt.sign(payload, jwtKey, { expiresIn: "24h" })
    } else {
        return null
    }
}

exports.requireAuthentication = async function (req, res, next) {
    const authHeader = req.get('Authorization') || ''
    const authHeaderParts = authHeader.split(' ')
    const token = authHeaderParts[0] === "Bearer" ? authHeaderParts[1] : null
    try {
        const payload = jwt.verify(token, jwtKey)
        req.user = payload.sub 
        req.role = payload.role 
        next()
    } catch (err) {
        res.status(401).json({
            error: "Invalid authentication token provided."
        })
    }
}

exports.optionalAuthentication = async function (req, res, next) {
    const authHeader = req.get('Authorization') || ''
    const authHeaderParts = authHeader.split(' ')
    const token = authHeaderParts[0] === "Bearer" ? authHeaderParts[1] : null
    try {
        const payload = jwt.verify(token, jwtKey)
        req.user = payload.sub 
        req.role = payload.role 
        next()
    } catch (err) {
        next()
    }
}