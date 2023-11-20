const express = require("express");
const { getAllTopics, fourOhFour } = require("./controllers/controllers");
const { handlePsqlErrors, handleCustomErrors, handleServerErrors } = require("./errors");


const app = express()
app.use(express.json())

app.get("/api/topics", getAllTopics)

app.all("*", fourOhFour)

app.use(handlePsqlErrors)
app.use(handleCustomErrors)
app.use(handleServerErrors)

module.exports = app