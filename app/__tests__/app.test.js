const request = require("supertest")
const app = require("../app")
const db = require("../../db/connection")
const data = require("../../db/data/test-data/index")
const seed = require("../../db/seeds/seed")

beforeEach(() => {
    return seed(data);
})
afterAll(() => {
    return db.end();
})

describe("GET /topics", () => {
    describe("-- functionality tests", () => {
        test("200: responds with a 200 status code and an array of length 3 with topic objects with appropriate key value pairs", () => {
            return request(app)
            .get("/api/topics")
            .expect(200)
            .then(({body}) => {
                expect(body.topics.length >= 1).toBe(true)
                body.topics.forEach( (topic) =>{ 
                    expect(topic).toHaveProperty('description'); 
                    expect(topic).toHaveProperty('slug');     
                })
            })
        })
    })
})


describe("GET /not-a-path", () => {
        test("404: responds with a 404 if path not found with an appropriate msg", () => {
            return request(app)
            .get("/api/5446546")
            .expect(404)
            .then(({body}) => {
                expect(body.msg).toBe("path not found")
            })
        })
})

