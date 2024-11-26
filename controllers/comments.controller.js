const { selectArticleById } = require("../models/articles.models");
const {
  selectCommentsByArticle,
  insertComment,
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

  console.log(commentPromises);

  Promise.all(commentPromises)
    .then((promiseRes) => {
      res.status(201).send({ comment: promiseRes[2] });
    })
    .catch(next);
};
