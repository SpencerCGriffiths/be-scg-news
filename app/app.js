const express = require("express");
const { getAllTopics, fourOhFour, getAllEndpoints } = require("./controllers/controllers");
const { handlePsqlErrors, handleCustomErrors, handleServerErrors } = require("./errors");


const app = express()

app.get("/api/topics", getAllTopics)

app.get("/api", getAllEndpoints)

app.all("*", fourOhFour)

app.use(handlePsqlErrors)
app.use(handleCustomErrors)
app.use(handleServerErrors)

module.exports = app