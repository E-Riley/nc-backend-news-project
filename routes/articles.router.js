const express = require("express");
const articlesRouter = express.Router();
const {
  getArticleById,
  getArticles,
  patchArticle,
} = require("../controllers/articles.controller");
const {
  getCommentsByArticle,
  postCommentToArticle,
} = require("../controllers/comments.controller");

articlesRouter.get("/", getArticles);
articlesRouter.get("/:article_id", getArticleById);
articlesRouter.patch("/:article_id", patchArticle);
articlesRouter.get("/:article_id/comments", getCommentsByArticle);
articlesRouter.post("/:article_id/comments", postCommentToArticle);

module.exports = articlesRouter;
