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

describe("GET /api", () => {
    describe("-- functionality tests", () => {
        test("200: responds with 200 status code and a JSON object with description, queries and exampleResponse keys with correct data types", () => {
            return request(app)
            .get("/api")
            .expect(200)
            .then(({body}) => {
                const endPointsObj = body.endpoints
                for(let key in endPointsObj) { 
                    expect(endPointsObj[key]).toMatchObject({
                        description: expect.any(String), 
                        queries: expect.any(Object),
                        exampleResponse: expect.any(Object)
                    })
                }
                
            })
        })
        test("200: responds with 200 status code and the queries key is a valid array, this array can be empty", () => {
            return request(app)
            .get("/api")
            .expect(200)
            .then(({body}) => {
                const endPointsObj = body.endpoints
                for(let key in endPointsObj) { 
                    expect(Array.isArray(endPointsObj[key].queries)).toBe(true)
                }                
            })
        })
        test("200: responds with 200 status code, an example response with the correct key value body response format containing at least one example response", () => {
            return request(app)
            .get("/api")
            .expect(200)
            .then(({body}) => {
                const endPointsObj = body.endpoints
                for(let key in endPointsObj) { 
                    const exampleResKey = endPointsObj[key].exampleResponse
                    for (let key in exampleResKey) { 
                        const resArray = exampleResKey[key]
                        expect(typeof resArray[0]).toBe("object")
                        expect(Object.keys(resArray[0]).length >= 1).toBe(true)
                    }
                }                
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