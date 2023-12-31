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
        test("200: Responds with a 200 status code, correct key value pairs including comment count and only one response object as the article id is unique", () => {
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
                article_img_url: expect.any(String),
                comment_count: "2"
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
                body.articles.map((article) => { 
                    expect(article.topic).toBe('mitch')
                })
                expect(body.articles.length).toBe(12)
            })
        })
        test("200: responds with 200 status code and an empty object when searching for a topic that has no articles i.e. 'paper'", () => {
            return request(app)
            .get("/api/articles?topic=paper")
            .expect(200)
            .then(({body}) => {
                expect(body.articles).toEqual([])
                expect(body.articles.length).toBe(0)
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
     describe("-- query tests- sort_by, ASC, DESC", () => {
        test("200: responds with 200 status code and defaults to an array of all topics sorted by created_at descending", () => {
            return request(app)
            .get("/api/articles?sort_by")
            .expect(200)
            .then(({body}) => {
             expect(body.articles).toBeSortedBy('created_at', { descending: true})
                })
            })
        test("200: sort_by can be used with any valid column", () => {
            return request(app)
            .get("/api/articles?sort_by=title")
            .expect(200)
            .then(({body}) => {
                expect(body.articles).toBeSortedBy('title', {descending: true})
                })
            })
        test("200: sort_by can be used with comment_count column", () => {
            return request(app)
            .get("/api/articles?sort_by=comment_count")
            .expect(200)
            .then(({body}) => {
                const commentCountToNumber = body.articles.map(article => ({
                    ...article,
                    comment_count: Number(article.comment_count)
                  }));
                expect(commentCountToNumber).toBeSortedBy('comment_count', {descending: true})
                })
            })
        test("200: sort_by can be set to ascending or descending for any valid column", () => {
            return request(app)
            .get("/api/articles?sort_by=title&order_by=asc")
            .expect(200)
            .then(({body}) => {
                expect(body.articles).toBeSortedBy('title', {ascending: true})
                })
            })
        test("200: responds with 200 status code and defaults to an array of all topics sorted by created_at descending", () => {
            return request(app)
            .get("/api/articles?sort_by")
            .expect(200)
            .then(({body}) => {
                expect(body.articles).toBeSortedBy('created_at', { descending: true})
                })
            })
        test("200: should be able to order without a sort by query", () => {
            return request(app)
            .get("/api/articles?order_by=asc")
            .expect(200)
            .then(({body}) => {
                expect(body.articles).toBeSortedBy('created_at', { ascending: true})
                })
            })
        test("200: should be able to indicate a topic, sort and order alongside topic", () => {
            return request(app)
            .get("/api/articles?topic=cats&sort_by=votes&order_by=desc")
            .expect(200)
            .then(({body}) => {
                expect(body.articles).toBeSortedBy('votes', { descending: true})
                })
            })
        test("200: testing further topics/sort/order", () => {
            return request(app)
            .get("/api/articles?topic=mitch&sort_by=comment_count&order_by=asc")
            .expect(200)
            .then(({body}) => {
                const commentCountToNumber = body.articles.map(article => ({
                    ...article,
                    comment_count: Number(article.comment_count)
                  }));
                expect(commentCountToNumber).toBeSortedBy('comment_count', { ascending: true})
                })
            })
    describe("-- query tests- errors", () => {
        test("400: should return bad request when sorting by an invalid category i.e. chair", () => {
            return request(app)
            .get("/api/articles?sort_by=chair")
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toBe('bad request')
                })
            })
        test("400: should return bad request when sorting by an invalid value i.e. 1234", () => {
            return request(app)
            .get("/api/articles?sort_by=1234")
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toBe('bad request')
                })
            })
        test("400: should return bad request when sorting by a valid collumn that is not accepted in the sort by parameter i.e. article_id", () => {
            return request(app)
            .get("/api/articles?sort_by=article_id")
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toBe('bad request')
                })
            })
        test("400: should return bad request when order by invalid value i.e. descs", () => {
            return request(app)
            .get("/api/articles?order_by=descs")
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toBe('bad request')
                })
            })
        test("400: should return bad request when order by invalid value i.e. 12345", () => {
            return request(app)
            .get("/api/articles?order_by=descs")
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toBe('bad request')
                })
            })
        test("400: should return bad request when order by and sort by are invalid", () => {
            return request(app)
            .get("/api/articles?sort_by=article_id&order_by=descs")
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toBe('bad request')
                })
            })
        test("400: should return bad request when order by is invalid and sort by is valid", () => {
            return request(app)
            .get("/api/articles?sort_by=title&order_by=descs")
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toBe('bad request')
                })
            })
        test("400: should return bad request when sort by is invalid and order by is valid", () => {
            return request(app)
            .get("/api/articles?sort_by=article_id&order_by=desc")
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toBe('bad request')
                })
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


describe("GET /api/users", () => {
    describe("-- functionality tests", () => {
        test("200: responds with 200 status code, and an array of all user objects with key value pair", () => {
        return request(app)
        .get("/api/users")
        .expect(200)
        .then(({body}) => { 
            const userArr = body.users
            userArr.forEach((user) => { 
                expect(user).toMatchObject({
                    username: expect.any(String), 
                    name: expect.any(String),
                    avatar_url: expect.any(String)
                })
            })
            expect(userArr.length).toBe(4)
        })
        }) 
    })
});     


describe("DELETE /api/comments/:comment_id", () => {
    describe("-- functionality testing", () => {
    test("200: responds with a 200 status and the deleted comment with the comment id", () => {
        return request(app)
        .delete("/api/comments/1")
        .expect(200)
        .then(({body}) => {
            expect(body.deleted_comment).toMatchObject({
                    comment_id: 1,
                    body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
                    article_id: 9,
                    author: 'butter_bridge',
                    votes: 16,
                    created_at: '2020-04-06T12:17:00.000Z'
            })
        })
    })
    test("200: responds with a 200 status and the resulting data set should be reduced by one comment (length -1)", () => {
        return request(app)
        .delete("/api/comments/1")
        .expect(200)
        .then(() => {
            return db.query(`SELECT COUNT(*) AS comment_count FROM comments;`)
            .then((result) => {
                const commentCountAfterDeletion = result.rows[0].comment_count;
                expect(commentCountAfterDeletion).toBe("17");
            });
        })
    })
    })
    describe("-- error testing", () => {
    test("404: responds with 404 not found when trying to delete a comment with comment id that does not exist", () => {
        return request(app)
        .delete("/api/comments/25")
        .expect(404)
        .then(({body}) => {
            expect(body.msg).toBe("not found")
        })
    })
    test("400: responds with 400 bad request when trying to delete a comment with the wrong path i.e. /banana", () => {
        return request(app)
        .delete("/api/comments/banana")
        .expect(400)
        .then(({body}) => {
            expect(body.msg).toBe("bad request")
        })
    })
    })
})