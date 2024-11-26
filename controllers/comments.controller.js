const { selectArticleById } = require("../models/articles.models");
const { selectCommentsByArticle } = require("../models/comments.model");

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
