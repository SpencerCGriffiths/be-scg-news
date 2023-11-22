const express = require("express");
const { getAllTopics, fourOhFour, getArticleById, getAllEndpoints, getAllArticles, getCommentsById, patchArticleVotes, postCommentByArticleId } = require("./controllers/controllers");
const { handlePsqlErrors, handleCustomErrors, handleServerErrors } = require("./errors");


const app = express()
app.use(express.json())

app.get("/api/topics", getAllTopics)

app.get("/api", getAllEndpoints)

app.get("/api/articles", getAllArticles)

app.get("/api/articles/:article_id", getArticleById)

app.post("/api/articles/:article_id/comments", postCommentByArticleId)

app.get("/api/articles/:article_id/comments", getCommentsById)

app.patch("/api/articles/:article_id", patchArticleVotes)

app.all("*", fourOhFour)

app.use(handlePsqlErrors)
app.use(handleCustomErrors)
app.use(handleServerErrors)

module.exports = app