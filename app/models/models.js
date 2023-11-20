const db = require("../../db/connection")

exports.selectAllTopics = () => { 
    return db.query(`SELECT * FROM topics`)
}

exports.selectArticleById = () => { 
    console.log("model")
}