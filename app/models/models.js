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


exports.selectCommentsById = (articleId) => { 
    return db.query(`
    SELECT * 
    FROM comments
    WHERE article_id = $1
    ORDER BY created_at DESC`, [articleId])
    .then(({rows})=> {
        return rows
    })
}

exports.checkArticleExists = (articleId) => { 
    return db.query(`SELECT *
    FROM articles
    WHERE article_id = $1;`, [articleId])
    .then((result) => { 
        if(result.rows.length === 0) { 
            return Promise.reject({status: 404, msg: "not found"})
        }
}
      
exports.selectAllArticles = () => { 
    return db.query(
        `SELECT articles.*, COUNT(comments.comment_id) AS comment_count
        FROM articles
        LEFT JOIN comments ON comments.article_id = articles.article_id
        GROUP BY articles.article_id
        ORDER BY created_at DESC;`
    ).then(({rows}) => { 
        const result = rows.map((article) => { 
            delete article.body
            return article
        })
        return result
    })
}