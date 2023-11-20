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
        return rows[0]
    })
}