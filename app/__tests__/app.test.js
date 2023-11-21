const request = require("supertest")
const app = require("../app")
const db = require("../../db/connection")
const data = require("../../db/data/test-data/index")
const seed = require("../../db/seeds/seed")
const endpointJsonFile = require("../../endpoints.json")

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

describe("GET /articles/:article_id", () => {
    describe("-- functionality tests", () => {
        test("200: Responds with a 200 status code, correct key value pairs and only one response object as the article id is unique", () => {
            return request(app)
            .get("/api/articles/3")
            .expect(200)
            .then(({body}) => {
            expect(body.article).toMatchObject({
                article_id: 3, 
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
    describe("-- error tests", () => {
        test("404: Should respond with 404 not found error code, when given an invalid numerical id", () => {
            return request(app)
            .get("/api/articles/18")
            .expect(404)
            .then(({body}) => {
            expect(body.msg).toBe('no article found')
            })
        })
        test("400: Should respond with 400 bad request error code, when given an invalid search value", () => {
            return request(app)
            .get("/api/articles/banana")
            .expect(400)
            .then(({body}) => {
            expect(body.msg).toBe('bad request')
            })
        })
    })
})

describe("GET /api/articles", () => {
    describe("-- functionality tests", () => {
        test("200: responds with 200 status code and all articles with comment count and no body key", () => {
            return request(app)
            .get("/api/articles")
            .expect(200)
            .then(({body}) => {
                expect(body.articles.length).toBe(13)
                body.articles.forEach((article) => { 
                    expect(article).toHaveProperty('comment_count')
                    expect(article).not.toHaveProperty('body')
                })
            })
        })
        test("200: responds with 200 status code and all articles should be in descending date order", () => {
            return request(app)
            .get("/api/articles")
            .expect(200)
            .then(({body}) => {
                expect(body.articles).toBeSortedBy('created_at', {descending: true})
            })
        })

    })
})


describe("GET /api", () => {
    describe("-- functionality tests", () => {
        test("200: responds with 200 status code and the endpoints.json file and object", () => {
            return request(app)
            .get("/api")
            .expect(200)
            .then(({body}) => {
                const endPointsObj = body.endpoints
                expect(endPointsObj).toMatchObject(endpointJsonFile)
                })
        })
    })
})


describe("GET /api/articles/:article_id/comments", () => {
    describe("-- functionality tests", () => {
        test("200: should respond with 200 and request should return an array", () => {
            return request(app)
            .get("/api/articles/3/comments")
            .expect(200)
            .then(({body}) => {
                expect(Array.isArray(body.comments)).toBe(true)
                })
        })
        test("200: Array of comments should be for the relevant article id and have additional correct key value pairs", () => {
            return request(app)
            .get("/api/articles/3/comments")
            .expect(200)
            .then(({body}) => {
                body.comments.forEach((comment) => { 
                    expect(comment).toMatchObject({
                        comment_id: expect.any(Number),
                        body: expect.any(String),
                        article_id: 3,
                        author: expect.any(String),
                        votes: expect.any(Number),
                        created_at: expect.any(String)
                })
                })
            })
        })
        test("200:array of comments should be ordered by most recent comment first", () => {
            return request(app)
            .get("/api/articles/3/comments")
            .expect(200)
            .then(({body}) => {
                expect(body.comments).toBeSortedBy("created_at",{descending: true})
                })
            })
        });
    describe("-- error handling", () => {
        test("404: should respond with error message when the article doesn't exist", () => {
            return request(app)
            .get("/api/articles/21/comments")
            .expect(404)
            .then(({body}) => {
                expect(body.msg).toBe("not found")
                })
        })
        test("200: should respond with 200 and an empty array if article id does exist but there are no comments", () => {
            return request(app)
            .get("/api/articles/2/comments")
            .expect(200)
            .then(({body}) => {
                expect(body.comments).toEqual([]) 
                })
        })
        test("400: should respond with 400 and error message when inputing the range value type for article id", () => {
            return request(app)
            .get("/api/articles/banana/comments")
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toBe("bad request") 
                })
        })
    })
})

