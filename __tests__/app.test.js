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
  test("404: Responds with not found for invalid endpoint", () => {
    return request(app)
      .get("/api/invalid")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Endpoint not found");
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

  describe("GET /api/articles/:article_id", () => {
    test("200: Responds with an article object with correct properties", () => {
      return request(app)
        .get("/api/articles/1")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles.article_id).toBe(1);
          expect(articles).toMatchObject({
            author: expect.any(String),
            title: expect.any(String),
            article_id: expect.any(Number),
            body: expect.any(String),
            topic: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
          });
        });
    });

    test("404: Responds with 'Not found' if a valid number is passed, but doesn't match to an article", () => {
      return request(app)
        .get("/api/articles/999")
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Article not found");
        });
    });

    test("400: Responds with bad request if invalid ID passed", () => {
      return request(app)
        .get("/api/articles/invalid")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });
  });

  describe("/api/articles", () => {
    test("200: Should return an array of article objects, sorted by created_at in descending order", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles.length).toBe(13);
          articles.forEach((article) => {
            expect(article).toMatchObject({
              author: expect.any(String),
              title: expect.any(String),
              article_id: expect.any(Number),
              topic: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              article_img_url: expect.any(String),
              comment_count: expect.any(String),
            });
          });
          expect(articles).toBeSortedBy("created_at", {
            descending: true,
            coerce: true,
          });
        });
    });
  });

  describe("/api/articles/:article_id/comments", () => {
    test("200: Should return an array of comment objects for the specified article", () => {
      return request(app)
        .get("/api/articles/1/comments")
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(comments.length).toBe(11);
          comments.forEach((comment) => {
            expect(comment).toMatchObject({
              comment_id: expect.any(Number),
              votes: expect.any(Number),
              created_at: expect.any(String),
              author: expect.any(String),
              body: expect.any(String),
              article_id: 1,
            });
          });

          expect(comments).toBeSortedBy("created_at", {
            descending: true,
            coerce: true,
          });
        });
    });

    test("404: Should return not found for valid ID that isnt present", () => {
      return request(app)
        .get("/api/articles/999/comments")
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Comments not found for this article");
        });
    });

    test("400: Should return bad request for invalid ID", () => {
      return request(app)
        .get("/api/articles/invalid_id/comments")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });
  });
});
