const express = require("express");
const { getAllTopics, fourOhFour, getArticleById, getAllEndpoints, getAllArticles, getCommentsById, patchArticleVotes, postCommentByArticleId, removeComment, getAllUsers } = require("./controllers/controllers");
const { handlePsqlErrors, handleCustomErrors, handleServerErrors } = require("./errors");
const apiRouter = require("./routes/api-router");


const app = express()

app.use(express.json())

app.use("/api", apiRouter)

app.all("*", fourOhFour)

app.use(handlePsqlErrors)
app.use(handleCustomErrors)
app.use(handleServerErrors)

module.exports = app