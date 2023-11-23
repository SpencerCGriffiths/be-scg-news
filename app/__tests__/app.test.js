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
    describe("-- query tests- filter by topic", () => {
        test("200: responds with 200 status code and the articles filtered by the topic query value i.e. 'mitch'", () => {
            return request(app)
            .get("/api/articles?topic=mitch")
            .expect(200)
            .then(({body}) => {
                body.articles_by_topic.map((article) => { 
                    expect(article.topic).toBe('mitch')
                })
                expect(body.articles_by_topic.length).toBe(12)
            })
        })
        test("200: responds with 200 status code and an empty object when searching for a topic that has no articles i.e. 'paper'", () => {
            return request(app)
            .get("/api/articles?topic=paper")
            .expect(200)
            .then(({body}) => {
                expect(body.articles_by_topic).toEqual([])
                expect(body.articles_by_topic.length).toBe(0)
            })
        })
    describe("-- query tests- filter by topic -- error", () => {
        test("404: responds with topic not found if trying to search by a non existant topic", () => {
            return request(app)
            .get("/api/articles?topic=trees")
            .expect(404)
            .then(({body}) => {
             expect(body.msg).toBe('topic not found')
                })
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

describe("POST /api/articles/:article_id/comments", () => {
    describe("-- functionality tests", () => {
        test("201: responds with 201 status code, takes a username and body and creates the comment with the relevant article id and key value pairs", () => {
            
            const newComment = { 
                username: "lurker", 
                body: "This is a test comment",
            }
            return request(app)
            .post("/api/articles/5/comments")
            .send(newComment)
            .expect(201)
            .then((result) => {
                expect(result.body.new_comment).toMatchObject({                
                    comment_id: 19,
                    body: 'This is a test comment',
                    article_id: 5,
                    author: 'lurker',
                    votes: 0,
                    created_at: expect.any(String)
                })
            })
        })
        test('201: expect newComment to still be logged if user provides too many fields', () => {
            const newComment = { 
                username: "lurker", 
                body: "This is a test comment",
                OutOfTen: "10"
            }
            return request(app)
            .post("/api/articles/5/comments")
            .send(newComment)
            .expect(201)
            .then((response) => {
                expect(response.body.new_comment).toMatchObject({                
                    comment_id: 19,
                    body: 'This is a test comment',
                    article_id: 5,
                    author: 'lurker',
                    votes: 0,
                    created_at: expect.any(String)
                })
            })
        })
    })

  
describe("-- Error Handling", () => {
    test('400: error received as there is a missed criteria that is required for the inserting of data', () => {
        const newComment = { 
            username: "lurker", 
        }
        return request(app)
        .post("/api/articles/5/comments")
        .send(newComment)
        .expect(400)
        .then(({body}) => {
            expect(body.msg).toBe("bad request")
        })
    });

    test('400: error received as the username referenced does not exist (no current user in data base)', () => {
        const newComment = { 
            username: "TestUser", 
            body: "This is a test comment",
        }
        return request(app)
        .post("/api/articles/5/comments")
        .send(newComment)
        .expect(400)
        .then(({body}) => {
            expect(body.msg).toBe("bad request")
        })
    });

    test('404: error received as the article number is incorrect and as such the comment is not posted', () => {
        const newComment = { 
            username: "lurker", 
            body: "This is a test comment",
        }
        return request(app)
        .post("/api/articles/19/comments")
        .send(newComment)
        .expect(404)
        .then(({body}) => {
            expect(body.msg).toBe("not found")
        })
    })
    test('400: error received as the path to post the comment is incorrect (wrong value for article number)', () => {
        const newComment = { 
            username: "lurker", 
            body: "This is a test comment",
        }
        return request(app)
        .post("/api/articles/banana/comments")
        .send(newComment)
        .expect(400)
        .then(({body}) => {
            expect(body.msg).toBe("bad request")
        })
    })
    }); 
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

describe("PATCH /api/articles/:article_id", () => {
    describe("-- functionality tests", () => {
        test("200: responds with 200 status code and updates the number of votes for the identified article", () => {
            const updatedVotes = { 
                inc_votes: 1
            }
            return request(app)
            .patch("/api/articles/3")
            .send(updatedVotes)
            .expect(200)
            .then(({body}) => {
                expect(body.updatedArticle).toMatchObject({
                    article_id: 3,
                    title: 'Eight pug gifs that remind me of mitch',
                    topic: 'mitch',
                    author: 'icellusedkars',
                    body: 'some gifs',
                    created_at: '2020-11-03T09:12:00.000Z',
                    votes: 1,
                    article_img_url: 'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700'
                })
            })
        })
        test("200: votes can have large positive increments", () => {
            const updatedVotes = { 
                inc_votes: 200
            }
            return request(app)
            .patch("/api/articles/3")
            .send(updatedVotes)
            .expect(200)
            .then(({body}) => {
                expect(body.updatedArticle).toMatchObject({
                    article_id: 3,
                    title: 'Eight pug gifs that remind me of mitch',
                    topic: 'mitch',
                    author: 'icellusedkars',
                    body: 'some gifs',
                    created_at: '2020-11-03T09:12:00.000Z',
                    votes: 200,
                    article_img_url: 'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700'
                })
            })
        })
        test("200: votes can be reduced from any specified article", () => {
            const updatedVotes = { 
                inc_votes: -25
            }
            return request(app)
            .patch("/api/articles/1")
            .send(updatedVotes)
            .expect(200)
            .then(({body}) => {
                expect(body.updatedArticle).toMatchObject({
                    article_id: 1,
                    title: 'Living in the shadow of a great man',
                    topic: 'mitch',
                    author: 'butter_bridge',
                    body: 'I find this existence challenging',
                    created_at: '2020-07-09T20:11:00.000Z',
                    votes: 75,
                    article_img_url: 'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700'
                  })
            })
        })
        test("200: quantity of votes can be a negative if downvoted below 0", () => {
            const updatedVotes = { 
                inc_votes: -10
            }
            return request(app)
            .patch("/api/articles/3")
            .send(updatedVotes)
            .expect(200)
            .then(({body}) => {
                expect(body.updatedArticle).toMatchObject({
                    article_id: 3,
                    title: 'Eight pug gifs that remind me of mitch',
                    topic: 'mitch',
                    author: 'icellusedkars',
                    body: 'some gifs',
                    created_at: '2020-11-03T09:12:00.000Z',
                    votes: -10,
                    article_img_url: 'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700'
                })
            })
        })
        test("200: if more fields are provided these will be ignored and the patch will still take place", () => {
            const updatedVotes = { 
                inc_votes: 1, 
                author: "simon", 
                article_id: 6
            }
            return request(app)
            .patch("/api/articles/3")
            .send(updatedVotes)
            .expect(200)
            .then(({body}) => {
                expect(body.updatedArticle).toMatchObject({
                    article_id: 3,
                    title: 'Eight pug gifs that remind me of mitch',
                    topic: 'mitch',
                    author: 'icellusedkars',
                    body: 'some gifs',
                    created_at: '2020-11-03T09:12:00.000Z',
                    votes: 1,
                    article_img_url: 'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700'
                })
            })
        }) 
    })
    describe("-- error tests", () => {
        test("400: error received as there is a missed criteria required for inserting data", () => {
            const updatedVotes = { 
            }
            return request(app)
            .patch("/api/articles/3")
            .send(updatedVotes)
            .expect(400)
        .then(({body}) => {
            expect(body.msg).toBe("bad request")
            })
        })
        test("400: responds with error when given the wrong data type in the input object", () => {
            const updatedVotes = { 
                inc_votes: "one"
            }
            return request(app)
            .patch("/api/articles/3")
            .send(updatedVotes)
            .expect(400)
        .then(({body}) => {
            expect(body.msg).toBe("bad request")
            })
        })
        test("404: error received as article you are updating does not exist", () => {
            const updatedVotes = { 
            }
            return request(app)
            .patch("/api/articles/19")
            .send(updatedVotes)
            .expect(404)
        .then(({body}) => {
            expect(body.msg).toBe("not found")
            })
        })
        test("400: error received as the path for the patch request is invalid, i.e. article/banana", () => {
            const updatedVotes = { 
            }
            return request(app)
            .patch("/api/articles/banana")
            .send(updatedVotes)
            .expect(400)
        .then(({body}) => {
            expect(body.msg).toBe("bad request")
            })
        })

    })
}) 