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
        test("200: responds with 200 status code and all articles, articles should be in descending date order, have a comment count and no body key", () => {
            return request(app)
            .get("/api/articles")
            .expect(200)
            .then(({body}) => {
                const newestArticle = {
                    article_id: 3,
                    title: 'Eight pug gifs that remind me of mitch',
                    topic: 'mitch',
                    author: 'icellusedkars',
                    created_at: '2020-11-03T09:12:00.000Z',
                    votes: 0,
                    article_img_url: 'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700',
                    num_of_comments: '2'
                }
                const oldestArticle = {
                    article_id: 7,
                    title: 'Z',
                    topic: 'mitch',
                    author: 'icellusedkars',
                    created_at: '2020-01-07T14:08:00.000Z',
                    votes: 0,
                    article_img_url: 'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700',
                    num_of_comments: '0'
                }
                expect(body.articles.length).toBe(13)
                expect(body.articles[0]).toEqual(newestArticle)
                expect(body.articles[12]).toEqual(oldestArticle)
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