const express = require("express");
const { getEndpoints, getTopics } = require("./controllers/api.controller");
const {
  getArticleById,
  getArticles,
} = require("./controllers/articles.controller");
const { getCommentsByArticle } = require("./controllers/comments.controller");

const app = express();

app.get("/api", getEndpoints);

app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id", getArticleById);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id/comments", getCommentsByArticle);

app.all("*", (req, res, next) => {
  res.status(404).send({ msg: "Endpoint not found" });
  next();
});

app.use((err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ msg: "Bad request" });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
});

module.exports = app;
