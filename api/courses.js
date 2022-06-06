const { Router } = require('express')
const { requireAuthentication } = require('../lib/auth')

const { models, errorHandler } = require('../lib/database')
const { roles } = require('../models/user')

const router = Router()

// Create a new course 
router.post('/', requireAuthentication, async (req, res, next) => {
  if (req.role === roles.admin){
    try {
      const course = await models.course.create(req.body)
      const rosterbody = {_id: course._id, students: []}
      const roster = await models.roster.create(rosterbody)
      res.status(201).json({"id": course.id})
    } catch (err) {
      console.log(err)
      res.status(400).json({ error: "Invalid Course Data" })
    }
  } else {
    res.status(403).json({ error: "You are not authorized to create a course" })
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

  const numCourses = await models.course.countDocuments(filter)
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
    if (courses) {
      res.status(200).json({
        course: courses
      })
    } else {
      next()
    }
  }
  catch (err) {
    next()
  }
})

// Update data for a specific course
router.patch('/:id', requireAuthentication, async (req, res, next) => {
  try {
    if (req.role === roles.admin || req.role === roles.instructor){
      if (req.role === roles.instructor){
        const course = await models.course.findById(req.params.id)
        console.log(course)
        if (!course)
        {
          next()
          return
        }
        console.log(course.instructorId)
        if (course.instructorId.toString() !== req.user){
          res.status(403).json(
            {"error": "You are not authorized to update this course"}
          )
          return
        }
      }

      const course = await models.course.findByIdAndUpdate(req.params.id, req.body)
      if (course) {
        res.status(200).end()
      }
      else {
        next()
      }
    } else {
      res.status(403).json({"error":"You are not authorized to update this course"})
    }
  }
  catch (err){
    console.log(err.message)
    res.status(400).send({"error":"Invalid Course Data"})
  }
})

// Remove a specific course from the database
router.delete('/:id', requireAuthentication, async (req, res, next) => {
  if (req.role === roles.admin){
    try {
      const course = await models.course.findByIdAndDelete(req.params.id)
      await course.remove()
      res.status(204).end()
    }
    catch (err){
      next()
    }
  }
  else {
    res.status(403).json(
      {"error":"You are not authorized to delete this course"}
    )
  }
})

// Fetch a list of students enrolled in the class
router.get('/:id/students', requireAuthentication, async (req, res, next) => {
  try {
    if (req.role === roles.admin || req.role === roles.instructor){
      const course = await models.course.findById(req.params.id)
      if (!course) {
        next()
        return
      }
      if (req.role === roles.instructor){
        if (course.instructorId.toString() !== req.user){
          res.status(403).json(
            {"error": "You are not authorized to view this course"}
          )
          return
        }
      }
    const roster = await models.roster.findById(req.params.id)
    res.status(200).json({students: roster.students})
    }
    else {
      res.status(403).json(
        {"error":"You are not authorized to view this information"}
      )
    }
  }
  catch (err){
    next()
  }
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
router.get('/:id/assignments', async (req, res, next) => {
})

module.exports = router
