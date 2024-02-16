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
// router.get('/exercises', requireToken, (req, res, next) => {
    router.get('/exercises', (req, res, next) => {
        Exercise.find()
            .populate('owner')
            .then((exercises) => {

                return exercises.map((exercise) => exercise.toObject())
            })
            // respond with status 200 and JSON of the pets
            .then((exercises) => res.status(200).json({ exercises: exercises }))
            // if an error occurs, pass it to the handler
            .catch(next)
    })
    
// show route for only the logged in user's exercises
// GET /pets/mine
// requireToken gives us access to req.user.id
router.get('/exercises/mine', requireToken, (req, res, next) => {
	Exercise.find({ owner: req.user.id })
		.then((exercises) => {
			// `exercises` will be an array of Mongoose documents
			// we want to convert each one to a POJO, so we use `.map` to
			// apply `.toObject` to each one
			return exercises.map((pet) => exercise.toObject())
		})
		// respond with status 200 and JSON of the pets
		.then((exercises) => res.status(200).json({ exercises: exercises }))
		// if an error occurs, pass it to the handler
		.catch(next)
})



// SHOW
// GET /exercises/5a7db6c74d55bc51bdf39793
// router.get('/exercises/:id', requireToken, (req, res, next) => {
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
// POST /exercises
router.post('/exercises', requireToken, (req, res, next) => {
    // set owner of new exercises to be current user
    req.body.exercise.owner = req.user.id

    Exercise.create(req.body.exercise)
        // respond to succesful `create` with status 201 and JSON of new "exercise"
        .then((exercise) => {
            res.status(201).json({ exercise: exercise.toObject() })
        })
        // if an error occurs, pass it off to our error handler
        // the error handler needs the error message and the `res` object so that it
        // can send an error message back to the client
        .catch(next)
})



// UPDATE
// PATCH /exercises/5a7db6c74d55bc51bdf39793
router.patch('/exercises/:id', requireToken, removeBlanks, (req, res, next) => {
	delete req.body.exercise.owner

	Exercise.findById(req.params.id)
		.then(handle404)
		.then((exercise) => {
			// pass the `req` object and the Mongoose record to `requireOwnership`
			// it will throw an error if the current user isn't the owner
			requireOwnership(req, exercise)

			// pass the result of Mongoose's `.update` to the next `.then`
			return exercise.updateOne(req.body.exercise)
		})
		// if that succeeded, return 204 and no JSON
		.then(() => res.sendStatus(204))
		// if an error occurs, pass it to the handler
		.catch(next)
})

// DESTROY
// DELETE /exercises/5a7db6c74d55bc51bdf39793
router.delete('/exercises/:id', requireToken, (req, res, next) => {
	Exercise.findById(req.params.id)
		.then(handle404)
		.then((exercise) => {
			// throw an error if current user doesn't own `exercise`
			requireOwnership(req, exercise)
			// delete the exercise ONLY IF the above didn't throw
			exercise.deleteOne()
		})
		// send back 204 and no content if the deletion succeeded
		.then(() => res.sendStatus(204))
		// if an error occurs, pass it to the handler
		.catch(next)
})

module.exports = router
