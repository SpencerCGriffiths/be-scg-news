const db = require("../../db/connection")
const fs = require("fs/promises")

exports.selectAllTopics = () => { 
    return db.query(`SELECT * FROM topics`)
}

exports.retrieveJsonEndPoints = () => { 
    return fs.readFile("endpoints.json")
    .then((result) => { 
        const endpoints = JSON.parse(result)
        return endpoints
    })
}

exports.selectArticleById = (articleId) => { 
    return db.query(`
    SELECT *
    FROM articles
    WHERE article_id = $1`, [articleId])
    .then(({rows}) => {
        if (rows.length === 0) { 
            return Promise.reject({status: 404, msg: "no article found"})
        } else { 
            return rows[0]
        }
    })
}