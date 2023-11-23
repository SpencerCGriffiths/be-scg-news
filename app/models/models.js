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

exports.insertCommentByArticleId = (articleId, newComment) => { 
    const {username, body} = newComment
    return db.query(`
    INSERT INTO comments (body, article_id, author)
        VALUES (
            $1,
            (SELECT article_id FROM articles WHERE article_id = $2),
            (SELECT username FROM users WHERE username = $3)
        )
        RETURNING *;`, [body, articleId, username])
        .then(({rows}) => { 
            return rows[0]
        })
        .catch(() => { 
            return Promise.reject({status: 400, msg: "bad request"})
        })
}

exports.checkArticleExists = (articleId) => { 
    return db.query(`
    SELECT *
    FROM articles
    WHERE article_id = $1`, [articleId])
    .then(({rows}) => { 
        if(rows.length === 0){ 
            return Promise.reject({status: 404, msg: "not found"})
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


exports.updateArticleVotes = (articleId, incVotes) => { 
    return db.query(`
    UPDATE articles
    SET votes = votes + $1
    WHERE article_id = $2
    RETURNING *;`, [incVotes, articleId])
    .then((result) => { 
       return result.rows[0]
    })
}

exports.selectArticlesByTopic = (topic) => { 
    return db.query(`
    SELECT *
    FROM articles
    WHERE topic = $1`, [topic])
    .then(({rows}) => { 
        return rows
    })
}

exports.checkTopicExists = (topic) => { 
    return db.query(`
    SELECT * 
    FROM topics
    WHERE slug = $1`, [topic])
    .then(({rows}) => { 
        if(rows.length === 0){ 
            return Promise.reject({status: 404, msg: "topic not found"})
        }
    })
}