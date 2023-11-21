const { selectAllTopics, retrieveJsonEndPoints, selectArticleById, selectCommentsById, checkArticleExists  } = require("../models/models")

exports.fourOhFour = (req, res, next) => {
    res.status(404).send({msg: "path not found"})
}

exports.getAllTopics = (req, res, next) => { 
    return selectAllTopics()
    .then(({rows}) => { 
        res.status(200).send({topics : rows})
    })
    .catch((err) => { 
        next(err)
    })
}

exports.getArticleById = (req, res, next) => { 
    const articleId = req.params.article_id
    return selectArticleById(articleId).
    then((result) => { 
        res.status(200).send({article : result})
    })
    .catch((err) => { 
        next(err)
    })
}

exports.getAllEndpoints = (req, res, next) => { 
    return retrieveJsonEndPoints()
    .then((result) => { 
        res.status(200).send({ endpoints : result })
    })
} 

exports.getCommentsById = (req, res, next) => { 
    const articleId = req.params.article_id

    const commentPromises = [selectCommentsById(articleId), checkArticleExists(articleId)]

    Promise.all(commentPromises)
    .then((result) => { 
        const commentById = result[0]
        res.status(200).send({ comments : commentById})
    }).catch((err) => { 
        next(err)
    })
} 