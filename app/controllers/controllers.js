const { selectAllTopics, selectArticleById } = require("../models/models")

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
    console.log("controller")
    return selectArticleById()
}