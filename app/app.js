const express = require("express");
const { getAllTopics, fourOhFour, getArticleById, getAllEndpoints  } = require("./controllers/controllers");
const { handlePsqlErrors, handleCustomErrors, handleServerErrors } = require("./errors");


const app = express()

app.get("/api/topics", getAllTopics)

app.get("/api", getAllEndpoints)

app.get("/api/articles/:article_id", getArticleById)

app.all("*", fourOhFour)

app.use(handlePsqlErrors)
app.use(handleCustomErrors)
app.use(handleServerErrors)

module.exports = app