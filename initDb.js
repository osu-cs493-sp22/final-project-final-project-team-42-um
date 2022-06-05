/*
 * This file contains a simple script to populate the database with initial
 * data from the files in the data/ directory.  The following environment
 * variables must be set to run this script:
 *
 *   MONGO_DB_NAME - The name of the database into which to insert data.
 *   MONGO_USER - The user to use to connect to the MongoDB server.
 *   MONGO_PASSWORD - The password for the specified user.
 *   MONGO_AUTH_DB_NAME - The database where the credentials are stored for
 *     the specified user.
 *
 * In addition, you may set the following environment variables to create a
 * new user with permissions on the database specified in MONGO_DB_NAME:
 *
 *   MONGO_CREATE_USER - The name of the user to create.
 *   MONGO_CREATE_PASSWORD - The password for the user.
 */

const { connectToDb, getDbReference, closeDbConnection } = require('./lib/database')

const courseData = require('./data/courses.json')
const userData = require('./data/users.json')

const mongoCreateUser = process.env.MONGO_CREATE_USER
const mongoCreatePassword = process.env.MONGO_CREATE_PASSWORD

connectToDb(async function () {
    try {
        /*
         * Create a new, lower-privileged database user if the correct environment
         * variables were specified.
         */
        if (mongoCreateUser && mongoCreatePassword) {
            const db = getDbReference()
            const result = await db.addUser(mongoCreateUser, mongoCreatePassword, {
                roles: "readWrite"
            })
            console.log("== New user created:", result)
        }

        /* add initial data to the database */
        const db = getDbReference()
        let result = await db.collection('users').insertMany(userData)
        console.log("== Initial user data added:", result)
        const instructorId = result.insertedIds['1']
        courseData.forEach((element, index) => {
          element.instructorId = instructorId
          courseData[index] = element
        })
        result = await db.collection('courses').insertMany(courseData)
        console.log("== Initial course data added:", result)


        closeDbConnection(function () {
            console.log("== DB connection closed")
        })
    } catch (err) {
        /* Catch error so docker compose doesn't loop forever */
        console.log(err)
    }
})
