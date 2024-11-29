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
            author: "butter_bridge",
            title: "Living in the shadow of a great man",
            article_id: 1,
            body: "I find this existence challenging",
            topic: "mitch",
            created_at: expect.any(String),
            votes: 100,
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          });
        });
    });
    article_id: expect.any(Number);

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

    test("200: Should return a response article object containing a comment count", () => {
      return request(app)
        .get("/api/articles/1")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles.article_id).toBe(1);
          expect(articles).toMatchObject({
            author: "butter_bridge",
            title: "Living in the shadow of a great man",
            article_id: 1,
            body: "I find this existence challenging",
            topic: "mitch",
            created_at: expect.any(String),
            votes: 100,
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
            comment_count: 11,
          });
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

    test("200: Should accept sort_by query which will change the column that the array is sorted by", () => {
      return request(app)
        .get("/api/articles?sort_by=article_id")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles.length).toBe(13);
          expect(articles).toBeSortedBy("article_id", { descending: true });
        });
    });

    test("200: Should accept order query which will change the ascending or descending order of the sort", () => {
      return request(app)
        .get("/api/articles?order=asc")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles.length).toBe(13);
          expect(articles).toBeSortedBy("created_at");
        });
    });

    test("200: Should accept both sort_by and order queries and sort accordingly", () => {
      return request(app)
        .get("/api/articles?sort_by=title&order=asc")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles.length).toBe(13);
          expect(articles).toBeSortedBy("title");
        });
    });

    test("400: Should return bad request if passed an invalid sort_by", () => {
      return request(app)
        .get("/api/articles?sort_by=invalid")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });

    test("400: Should return bad request if passed an invalid order", () => {
      return request(app)
        .get("/api/articles?order=; DROP articles")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });

    test("200: Should return an array of articles filtered by passed topic query", () => {
      return request(app)
        .get("/api/articles?topic=mitch")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles.length).toBe(12);
          articles.forEach((article) => {
            expect(article.topic).toBe("mitch");
          });
        });
    });

    test("200: Should return an empty array when passed a topic that doesn't have any articles", () => {
      return request(app)
        .get("/api/articles?topic=paper")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles.length).toBe(0);
        });
    });

    test("404: Should return not found if passed invalid topic that does not exist", () => {
      return request(app)
        .get("/api/articles?topic=banana")
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Topic not found");
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

    test("400: Should return bad request if invalid url parameter", () => {
      const newComment = {
        username: "invalid_username",
        body: "This is the test comment",
      };
      return request(app)
        .post("/api/articles/invalid/comments")
        .send(newComment)
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
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

    test("400: Should respond with bad request if body is formatted incorrectly", () => {
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

  describe("DELETE /api/comments/:comment_id", () => {
    test("204: Should return no content upon succesful deletion", () => {
      return request(app).delete("/api/comments/1").expect(204);
    });

    test("400: Should return bad request if comment id isn't well formed", () => {
      return request(app)
        .delete("/api/comments/invalid")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });

    test("404: Should return not found in comment id is well formed but cannot be found", () => {
      return request(app)
        .delete("/api/comments/9999")
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Comment not found");
        });
    });
  });

  describe("GET /api/users", () => {
    test("200: Should respond with an array of user objects with correct properties", () => {
      return request(app)
        .get("/api/users")
        .expect(200)
        .then(({ body: { users } }) => {
          expect(users.length).toBe(4);
          users.forEach((user) => {
            expect(user).toMatchObject({
              username: expect.any(String),
              name: expect.any(String),
              avatar_url: expect.any(String),
            });
          });
        });
    });
  });

  describe("GET /api/users/:username", () => {
    test("200: Should respond with a user object when passed a valid username", () => {
      return request(app)
        .get("/api/users/butter_bridge")
        .expect(200)
        .then(({ body: { user } }) => {
          expect(user).toMatchObject({
            username: "butter_bridge",
            name: "jonny",
            avatar_url:
              "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
          });
        });
    });

    test("404: Should return not found if username does not exist", () => {
      return request(app)
        .get("/api/users/invalid_username")
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("User not found");
        });
    });
  });

  describe("PATCH /api/comments/:comment_id", () => {
    test("200: Should return the newly updated comment with votes increased", () => {
      const testVote = { inc_votes: 5 };
      return request(app)
        .patch("/api/comments/1")
        .send(testVote)
        .expect(200)
        .then(({ body: { comment } }) => {
          expect(comment).toMatchObject({
            comment_id: 1,
            body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
            votes: 21,
            article_id: 9,
            created_at: expect.any(String),
          });
        });
    });

    test("200: Should correctly reduce the number of votes when passed a negative number", () => {
      const testVote = { inc_votes: -5 };
      return request(app)
        .patch("/api/comments/1")
        .send(testVote)
        .expect(200)
        .then(({ body: { comment } }) => {
          expect(comment).toMatchObject({
            comment_id: 1,
            body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
            votes: 11,
            article_id: 9,
            created_at: expect.any(String),
          });
        });
    });

    test("400: Should return bad request if body is formatted incorrectly", () => {
      const testVote = { invalid: 5 };
      return request(app)
        .patch("/api/comments/1")
        .send(testVote)
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });

    test("400: Should return bad request if value of inc_votes is not a number", () => {
      const testVote = { inc_votes: "invalid" };
      return request(app)
        .patch("/api/comments/1")
        .send(testVote)
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });

    test("400: Should return bad request if comment_id isn't well formed", () => {
      const testVote = { inc_votes: 5 };
      return request(app)
        .patch("/api/comments/invalid_id")
        .send(testVote)
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });

    test("404: Should return not found if comment_id is well formed but is not found", () => {
      const testVote = { inc_votes: 5 };
      return request(app)
        .patch("/api/comments/1000")
        .send(testVote)
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Comment not found");
        });
    });
  });

  describe("POST /api/articles", () => {
    test("201: Should return the newly posted article if body well formed with default article_img_url", () => {
      const newArticle = {
        author: "butter_bridge",
        title: "This is a test",
        body: "Testing post articles",
        topic: "paper",
      };
      return request(app)
        .post("/api/articles")
        .send(newArticle)
        .expect(201)
        .then(({ body: { article } }) => {
          expect(article).toMatchObject({
            author: "butter_bridge",
            title: "This is a test",
            body: "Testing post articles",
            topic: "paper",
            article_img_url:
              "https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700",
            article_id: 14,
            votes: 0,
            created_at: expect.any(String),
            comment_count: 0,
          });
        });
    });

    test("201: Should return the newly posted article if body well formed with new article_img_url", () => {
      const newArticle = {
        author: "butter_bridge",
        title: "This is a test",
        body: "Testing post articles",
        topic: "paper",
        article_img_url: "this-is-a-test-url.com",
      };
      return request(app)
        .post("/api/articles")
        .send(newArticle)
        .expect(201)
        .then(({ body: { article } }) => {
          expect(article).toMatchObject({
            author: "butter_bridge",
            title: "This is a test",
            body: "Testing post articles",
            topic: "paper",
            article_img_url: "this-is-a-test-url.com",
            article_id: 14,
            votes: 0,
            created_at: expect.any(String),
            comment_count: 0,
          });
        });
    });

    test("404: Should return not found if passed an author that doesn't exist", () => {
      const newArticle = {
        author: "invalid_author",
        title: "This is a test",
        body: "Testing post articles",
        topic: "paper",
        article_img_url: "this-is-a-test-url.com",
      };

      return request(app)
        .post("/api/articles")
        .send(newArticle)
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("User not found");
        });
    });

    test("404: Should return not found when passed a topic that doesn't exist", () => {
      const newArticle = {
        author: "butter_bridge",
        title: "This is a test",
        body: "Testing post articles",
        topic: "invalid_topic",
        article_img_url: "this-is-a-test-url.com",
      };

      return request(app)
        .post("/api/articles")
        .send(newArticle)
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Topic not found");
        });
    });

    test("400: Should return bad request if body is not well formed", () => {
      const newArticle = {
        author: "butter_bridge",
        title: "This is a test",
      };

      return request(app)
        .post("/api/articles")
        .send(newArticle)
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });
  });
});
