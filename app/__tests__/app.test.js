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

describe.only("GET /articles/:article_id", () => {
    describe("-- functionality tests", () => {
        test("200: Responds with a 200 status code, correct key value pairs and only one response object as the article id is unique", () => {
            return request(app)
            .get("/api/articles/3")
            .expect(200)
            .then(({body}) => {
            expect(body.article).toMatchObject({
                article_id: expect.any(Number), 
                title: expect.any(String),
                topic: expect.any(String),
                author: expect.any(String),
                body: expect.any(String),
                created_at: expect.any(String),
                votes: expect.any(Number),
                article_img_url: expect.any(String)
            })
            expect(Object.keys(body).length).toBe(1)
            })
        })
    })
})

// error: 
// should return bad request when put in an invalid article id 
// should return bad request when put in an invalid value for the article id i.e. banana 
// should return bad request when 

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