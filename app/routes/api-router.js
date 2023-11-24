const { getAllEndpoints } = require("../controllers/controllers");
const articlesRouter = require("./articles-router");
const commentRouter = require("./comment-router");
const topicsRouter = require("./topics-router");
const userRouter = require("./user-router");

const apiRouter = require("express").Router();

apiRouter.get('/', getAllEndpoints)

apiRouter.use('/topics', topicsRouter)

apiRouter.use("/articles", articlesRouter)

apiRouter.use("/users", userRouter)

apiRouter.use("/comments", commentRouter)

module.exports = apiRouter;