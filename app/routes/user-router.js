const { getAllUsers } = require('../controllers/controllers')

const userRouter = require('express').Router()

userRouter
.route("/")
.get(getAllUsers)

module.exports = userRouter