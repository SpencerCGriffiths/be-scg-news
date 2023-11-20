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
        test("200: responds with a status of 200 when there is an appropriate request", () => {
            return request(app)
            .get("/api/topics")
            .expect(200)
        })
        test("200: responds with an array of topic objects", () => {
            return request(app)
            .get("/api/topics")
            .expect(200)
            .then(({body}) => {
                expect(Array.isArray(body.topics)).toBe(true)
            })
        })
        test("200: responds with an array of topic objects with properties slug and description", () => {
            return request(app)
            .get("/api/topics")
            .expect(200)
            .then(({body}) => {
                expect(body.topics[0]).toHaveProperty(['description']); 
                expect(body.topics[0]).toHaveProperty(['slug']); 
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