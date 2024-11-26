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

  describe("GET /api/articles", () => {
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
              comment_count: expect.any(Number),
            });
            expect(article.body).toBeUndefined();
          });
          expect(articles).toBeSortedBy("created_at", {
            descending: true,
            coerce: true,
          });
        });
    });
  });

  describe("GET /api/articles/:article_id/comments", () => {
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

    test("200: Should return an empty array if article ID exists but no comments are present", () => {
      return request(app)
        .get("/api/articles/2/comments")
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(comments).toEqual([]);
        });
    });

    test("404: Should return not found for well-formed ID that isn't present", () => {
      return request(app)
        .get("/api/articles/999/comments")
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Article not found");
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

  describe("POST /api/articles/:article_id/comments", () => {
    test("201: Should respond with the newly posted comment", () => {
      const newComment = {
        username: "butter_bridge",
        body: "This is the test comment",
      };
      return request(app)
        .post("/api/articles/1/comments")
        .send(newComment)
        .expect(201)
        .then(({ body: { comment } }) => {
          expect(comment).toMatchObject({
            comment_id: expect.any(Number),
            body: newComment.body,
            article_id: 1,
            author: newComment.username,
            votes: 0,
            created_at: expect.any(String),
          });
        });
    });

    test("400: Should respond with bad request if body is not formatted correctly", () => {
      const newComment = {
        username: "butter_bridge",
      };
      return request(app)
        .post("/api/articles/1/comments")
        .send(newComment)
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });

    test("404: Should return not found if article ID cannot be found", () => {
      // unsure if this should be 404 or 400
      const newComment = {
        username: "butter_bridge",
        body: "This is the test comment",
      };
      return request(app)
        .post("/api/articles/1000/comments")
        .send(newComment)
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Article not found");
        });
    });

    test("404: Should return not found if username is not found", () => {
      // unsure if this should be 404 or 400
      const newComment = {
        username: "invalid_username",
        body: "This is the test comment",
      };
      return request(app)
        .post("/api/articles/1/comments")
        .send(newComment)
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("User not found");
        });
    });
  });

  describe("PATCH /api/articles/:article_id", () => {
    test("200: Should respond with the updated article when passed valid object", () => {
      const testVote = { inc_votes: 5 };
      return request(app)
        .patch("/api/articles/1")
        .send(testVote)
        .expect(200)
        .then(({ body: { article } }) => {
          expect(article).toMatchObject({
            article_id: 1,
            title: "Living in the shadow of a great man",
            topic: "mitch",
            author: "butter_bridge",
            body: "I find this existence challenging",
            created_at: expect.any(String),
            votes: 105,
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          });
        });
    });

    test("200: Should respond with the updated article when passed valid object with negative votes", () => {
      const testVote = { inc_votes: -5 };
      return request(app)
        .patch("/api/articles/1")
        .send(testVote)
        .expect(200)
        .then(({ body: { article } }) => {
          expect(article).toMatchObject({
            article_id: 1,
            title: "Living in the shadow of a great man",
            topic: "mitch",
            author: "butter_bridge",
            body: "I find this existence challenging",
            created_at: expect.any(String),
            votes: 95,
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          });
        });
    });

    test("400: Should respond with bad request if body is formatted incorrectle", () => {
      const testVote = { incorrect_key: "test" };
      return request(app)
        .patch("/api/articles/1")
        .send(testVote)
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });

    test("400: Should return bad request if value of key on body isn't a number", () => {
      const testVote = { inc_votes: "invalid" };
      return request(app)
        .patch("/api/articles/1")
        .send(testVote)
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });

    test("404: Should respond with not found if id is well formed but not found", () => {
      const testVote = { inc_votes: 5 };
      return request(app)
        .patch("/api/articles/1000")
        .send(testVote)
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Article not found");
        });
    });

    test("400: Should respond with bad request if id is not correct type", () => {
      const testVote = { inc_votes: 5 };
      return request(app)
        .patch("/api/articles/invalid")
        .send(testVote)
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });
  });
});
