const { getAllArticles, getArticleById, postCommentByArticleId, getCommentsById, patchArticleVotes } = require('../controllers/controllers')

const articlesRouter = require('express').Router()

articlesRouter
.route("/")
.get(getAllArticles);

articlesRouter
.route("/:article_id")
.get(getArticleById);

articlesRouter
.route("/:article_id/comments")
.post(postCommentByArticleId)
.get(getCommentsById)


articlesRouter
.route("/:article_id")
.patch(patchArticleVotes)

module.exports = articlesRouter