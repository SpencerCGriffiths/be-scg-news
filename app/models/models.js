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