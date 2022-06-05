const { Router } = require('express')
const { requireAuthentication } = require('../lib/auth')

const { models, errorHandler } = require('../lib/database')
const { roles } = require('../models/user')

const router = Router()

// Create a new course 
router.post('/', requireAuthentication, (req, res, next) => {
  if (req.role === roles.admin){
    models.course.create(req.body).then( newCourse => {
      res.status(201).json({
        id: newCourse._id
      })
    }).catch( err => {
      res.status(400).send(errorHandler(err))
    })
  } else {
    res.status(403).json({
      error: "Only an authenticated user can create a course"
    })
  }
})

// Fetch the list of all courses
router.get('/', async (req, res, next) => {
  let page = parseInt(req.query.page) || 1
  let subject = req.query.subject 
  let number = req.query.number 
  let term = req.query.term 

  let filter = {}

  if (subject) {
    filter.subject = subject
  }
  if (number) {
    filter.number = number
  }
  if (term) {
    filter.term = term
  }

  const numCourses = await models.course.countDocuments()
  const numPerPage = 10
  const lastPage = Math.ceil(numCourses / numPerPage)
  page = page > lastPage ? lastPage : page
  page = page < 1 ? 1 : page

  const start = (page - 1) * numPerPage
  const end = start + numPerPage

  console.log("page: ", page)
  console.log("lastPage: ", lastPage)
  const links = {}
  if (page < lastPage) {
    links.nextPage = `/courses?page=${page + 1}`
    links.lastPage = `/courses?page=${lastPage}`
  }
  if (page > 1) {
    links.prevPage = `/courses?page=${page - 1}`
    links.firstPage = `/courses?page=1`
  }

  const foundCourses = await models.course.find(filter).skip(start).limit(numPerPage)
  res.status(200).json({
    courses: foundCourses,
    links: links
  })
})

// Fetch data about a specific course
router.get('/:id', async (req, res, next) => {
  try {
    const courses = await models.course.findById(req.params.id);
    res.status(200).json({
      course: courses
    })
  }
  catch {
    next()
  }
})

// Update data for a specific course
router.patch('/:id', async (req, res, next) => {
  try {
    const course = await models.course.findByIdAndUpdate(req.params.id, req.body)
    if (course) {
      res.status(200).end()
    }
    else {
      next()
    }
  }
  catch (err){
    console.log(err.message)
    res.status(400).send({"Error":"Invalid Course Data"})
  }
})

// Remove a specific course from the database
router.delete('/:id', async (req, res, next) => {
  try {
    const course = await models.course.findByIdAndDelete(req.params.id)
    await course.remove()
    res.status(204).end()
  }
  catch (err){
    next()
  }
})

// Fetch a list of students enrolled in the class
router.get('/:id/students', (req, res, next) => {
  next()
})

// Update enrollment for a course
router.patch('/:id/students', (req, res, next) => {
  next()
})

// Fetch a CSV file containing a list of the students enrolled in the course
router.get('/:id/roster', (req, res, next) => {
  next()
})

// Fetch a list of the assignments for the course
router.get('/:id/assignments', (req, res, next) => {
  next()
})

module.exports = router
