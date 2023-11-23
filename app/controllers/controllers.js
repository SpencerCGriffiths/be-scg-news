
const { selectAllTopics, retrieveJsonEndPoints, selectArticleById, selectAllArticles, selectCommentsById, checkArticleExists, insertCommentByArticleId, updateArticleVotes, selectArticlesByTopic, checkTopicExists } = require("../models/models")

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
    if(Object.keys(req.query).length) {
        const topic = req.query.topic
        const artTopicPromises = [selectArticlesByTopic(topic), checkTopicExists(topic)]
        return Promise.all(artTopicPromises) 
        .then((result) => { 
            res.status(200).send({ articles_by_topic : result[0]})
        })
        .catch((err) => { 
            next(err)
        })
    } else { 
        return selectAllArticles()
        .then((result) => { 
            res.status(200).send({ articles: result})
        })
        .catch((err) => { 
            next(err)
        })
    }
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

    checkArticleExists(articleId)
    .then(() => { 
        return insertCommentByArticleId(articleId, newComment)
    })
    .then((result) => { 
        res.status(201).send({ new_comment: result})
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

exports.patchArticleVotes = (req, res, next) => { 
    const articleId = req.params.article_id
    const incVotes = req.body.inc_votes

    const patchPromises = [updateArticleVotes(articleId, incVotes), checkArticleExists(articleId)]

    Promise.all(patchPromises)
    .then((result) => { 
        res.status(200).send({ updatedArticle: result[0]})
    })
    .catch((err) => { 
        next(err)
    })
}
