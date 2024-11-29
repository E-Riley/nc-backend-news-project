const { selectArticleById } = require("../models/articles.models");
const {
  selectCommentsByArticle,
  insertComment,
  deleteCommentDb,
  updateComment,
  selectCommentById,
} = require("../models/comments.model");
const { selectUser } = require("../models/users.models");

exports.getCommentsByArticle = (req, res, next) => {
  const { article_id } = req.params;
  const articlePromises = [
    selectCommentsByArticle(article_id),
    selectArticleById(article_id),
  ];

  Promise.all(articlePromises)
    .then(([comments]) => {
      res.status(200).send({ comments });
    })
    .catch(next);
};

exports.postCommentToArticle = (req, res, next) => {
  const {
    params: { article_id },
    body: { username, body },
  } = req;

  const commentPromises = [
    selectArticleById(article_id),
    selectUser(username),
    insertComment(article_id, username, body),
  ];

  Promise.all(commentPromises)
    .then((promiseRes) => {
      res.status(201).send({ comment: promiseRes[2] });
    })
    .catch(next);
};

exports.deleteComment = (req, res, next) => {
  const { comment_id } = req.params;
  deleteCommentDb(comment_id)
    .then(() => {
      res.status(204).send();
    })
    .catch(next);
};

exports.patchComment = (req, res, next) => {
  const {
    params: { comment_id },
    body: { inc_votes },
  } = req;

  const commentPromise = [
    updateComment(comment_id, inc_votes),
    selectCommentById(comment_id),
  ];

  Promise.all(commentPromise)
    .then(([comment]) => {
      res.status(200).send({ comment });
    })
    .catch(next);
};
