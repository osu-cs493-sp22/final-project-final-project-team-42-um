const express = require('express')
const morgan = require('morgan')

const api = require('./api')
const { connectToDb } = require('./lib/database')
const { redisClient, rateLimit } = require('./lib/redis')

const { optionalAuthentication } = require('./lib/auth')

const app = express()
const port = process.env.PORT || 8000

/*
 * Morgan is a popular logger.
 */
app.use(morgan('dev'))

app.use(express.json())
app.use(express.static('public'))

app.use(optionalAuthentication)

app.use(rateLimit)

/*
 * All routes for the API are written in modules in the api/ directory.  The
 * top-level router lives in api/index.js.  That's what we include here, and
 * it provides all of the routes.
 */
app.use('/', api)

app.use('*', function (req, res, next) {
  res.status(404).json({
    error: "Requested resource " + req.originalUrl + " does not exist"
  })
})

app.use("*", function (req, res, next, err){
  console.error(err)
  console.log(req)
  res.status(500).json({
    error: "Server error, try again later"
  })
})

connectToDb(async function () {
  try {
    await redisClient.connect()
    app.listen(port, function () {
      console.log("== Server is running on port", port)
    })
  }
  catch (err) {
    console.error(err)
  }
})
