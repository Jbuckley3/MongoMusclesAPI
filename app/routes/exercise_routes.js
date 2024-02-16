const express = require('express')
const passport = require('passport')
const Exercise = require('../models/exercise')
const customErrors = require('../../lib/custom_errors')
const handle404 = customErrors.handle404
const requireOwnership = customErrors.requireOwnership
const removeBlanks = require('../../lib/remove_blank_fields')
const exercise = require('../models/exercise')
const requireToken = passport.authenticate('bearer', { session: false })
const router = express.Router()

// INDEX
// GET /exercises
    router.get('/exercises', (req, res, next) => {
        Exercise.find()
            .populate('owner')
            .then((exercises) => {

                return exercises.map((exercise) => exercise.toObject())
            })
            .then((exercises) => res.status(200).json({ exercises: exercises }))
            .catch(next)
    })


// SHOW
router.get('/exercises/:id', (req, res, next) => {
    // req.params.id will be set based on the `:id` in the route
    Exercise.findById(req.params.id)
        .populate('owner')
        .then(handle404)
        // if `findById` is succesful, respond with 200 and "exercise" JSON
        .then((exercise) => res.status(200).json({ exercise: exercise.toObject() }))
        // if an error occurs, pass it to the handler
        .catch(next)
})


// CREATE
router.post('/exercises', requireToken, (req, res, next) => {
    // set owner of new exercises to be current user
    req.body.exercise.owner = req.user.id

    Exercise.create(req.body.exercise)
        .then((exercise) => {
            res.status(201).json({ exercise: exercise.toObject() })
        })
        .catch(next)
})

// UPDATE
router.patch('/exercises/:id', requireToken, removeBlanks, (req, res, next) => {
	delete req.body.exercise.owner

	Exercise.findById(req.params.id)
		.then(handle404)
		.then((exercise) => {
			requireOwnership(req, exercise)
			return exercise.updateOne(req.body.exercise)
		})
		.then(() => res.sendStatus(204))
		.catch(next)
})

// DELETE 
router.delete('/exercises/:id', requireToken, (req, res, next) => {
	Exercise.findById(req.params.id)
		.then(handle404)
		.then((exercise) => {
			requireOwnership(req, exercise)
			exercise.deleteOne()
		})
		.then(() => res.sendStatus(204))
		.catch(next)
})

module.exports = router
