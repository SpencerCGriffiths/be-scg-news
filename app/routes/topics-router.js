const { getAllTopics } = require('../controllers/controllers')

const topicsRouter = require('express').Router()

topicsRouter
.route("/")
.get(getAllTopics)

module.exports = topicsRouter;