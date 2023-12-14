const e = require("express")
const db = require("../../db/connection")
const fs = require("fs/promises")
const { Query } = require("pg")

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
    let queryStr = `SELECT articles.*, COUNT(comments.comment_id) AS comment_count
        FROM articles
        LEFT JOIN comments ON comments.article_id = articles.article_id 
        WHERE articles.article_id = $1
        GROUP BY articles.article_id`
    return db.query(queryStr, [articleId])
    .then(({rows}) => {
        if (rows.length === 0) { 
            return Promise.reject({status: 404, msg: "no article found"})
        } else { 
            return rows[0]
        }
    })
}

exports.selectAllArticles = ({sort_by, order_by, topic}) => { 
    
    const queryVals = []

    let queryStr = `SELECT articles.*, COUNT(comments.comment_id) AS comment_count
    FROM articles
    LEFT JOIN comments ON comments.article_id = articles.article_id `

    const validSort = ["title", "topic", "author", "created_at", "votes", "comment_count"]
    const validOrder = ["desc", "asc"]


    if(sort_by && !validSort.includes(sort_by)) { 
        return Promise.reject({status: 400, msg: "bad request"})
    }

    if (order_by && !validOrder.includes(order_by)) { 
        return Promise.reject({status: 400, msg: "bad request"})
    }

    let order = `DESC`

    if(order_by) { 
        order = `ASC`
    }

    if (!topic && !sort_by) { 
            queryStr += `GROUP BY articles.article_id ORDER BY created_at ${order}`
        }

    if (topic) { 
        queryStr += `WHERE articles.topic = $1 GROUP BY articles.article_id ` 
        queryVals.push(topic)  
    } 

    if(sort_by) { 
        queryStr += `GROUP BY articles.article_id ORDER BY articles.${sort_by} ${order} ` 
    }

    return db.query(queryStr, queryVals)
    .then(({rows}) => { 
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

exports.selectAllUsers = () => { 
    return db.query(`
    SELECT *
    FROM users;`)
    .then(({rows}) => { 
        return rows
    })
}



exports.deleteComment = (commentId) => { 
    return db.query(
        `DELETE FROM comments
        WHERE comment_id = $1
        RETURNING *;`, [commentId])
    .then(({rows}) =>{ 
        if(rows.length === 0) { 
        return Promise.reject({status: 404, msg: "not found"})
        } else { 
            return rows[0]
          }
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