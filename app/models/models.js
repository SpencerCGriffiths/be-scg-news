const db = require("../../db/connection")

exports.selectAllTopics = () => { 
    return db.query(`SELECT * FROM topics`)
}

exports.selectArticleById = (articleId) => { 
    return db.query(`
    SELECT *
    FROM articles
    WHERE article_id = $1`, [articleId])
    .then(({rows}) => {
        if (rows.length === 0) { 
            return Promise.reject({status: 400, msg: "no article found"})
        } else { 
            return rows[0]
        }
    })
}