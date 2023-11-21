const { selectAllTopics, retrieveJsonEndPoints, selectArticleById, selectAllArticles, insertCommentByArticleId  } = require("../models/models")

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

exports.getAllEndpoints = (req, res, next) => { 
    return retrieveJsonEndPoints()
    .then((result) => { 
        res.status(200).send({ endpoints : result })
    })
} 

exports.getAllArticles = (req, res, next) => { 
    return selectAllArticles()
    .then((result) => { 
        res.status(200).send({ articles: result})
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

exports.postCommentByArticleId = (req, res, next) => { 
    const articleId = req.params.article_id
    const newComment = req.body
    return insertCommentByArticleId(articleId, newComment)
    .then((result) => { 
        res.status(201).send({ new_comment: result})
    })
}

