const { removeComment } = require('../controllers/controllers')

const commentRouter = require('express').Router()

commentRouter
.route("/:comment_id")
.delete(removeComment)

module.exports = commentRouter