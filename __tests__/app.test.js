const endpointsJson = require("../endpoints.json");
const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const data = require("../db/data/test-data");
const seed = require("../db/seeds/seed");
const { string } = require("pg-format");
/* Set up your test imports here */

/* Set up your beforeEach & afterAll functions here */
beforeEach(() => {
  return seed(data);
});

afterAll(() => {
  return db.end();
});

describe("GET /api", () => {
  test("200: Responds with an object detailing the documentation for each endpoint", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(endpointsJson);
      });
  });
  test("400: Responds with bad request if request made to invalid endpoint", () => {
    return request(app)
      .get("/api/invalid")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request");
      });
  });
  describe("GET /api/topics", () => {
    test("200: Responds with an array of topic objects, with the properties of slug and description", () => {
      return request(app)
        .get("/api/topics")
        .expect(200)
        .then(({ body: { topics } }) => {
          expect(topics.length).toBe(3);
          topics.forEach((topic) => {
            expect(topic).toMatchObject({
              slug: expect.any(String),
              description: expect.any(String),
            });
          });
        });
    });

    test("404: Responds with 'No topics found' if no topics are found in the database", () => {
      return db
        .query("DELETE FROM comments")
        .then(() => {
          return db.query("DELETE FROM articles");
        })
        .then(() => {
          return db.query("DELETE FROM topics");
        })
        .then(() => {
          return request(app)
            .get("/api/topics")
            .expect(404)
            .then(({ body: { msg } }) => {
              expect(msg).toBe("No topics were found");
            });
        });
    });
  });
});
