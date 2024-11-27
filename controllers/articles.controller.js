const {
  selectArticleById,
  selectArticles,
  updateArticle,
} = require("../models/articles.models");

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;
  selectArticleById(article_id)
    .then((articles) => {
      res.status(200).send({ articles });
    })
    .catch(next);
};

exports.getArticles = (req, res, next) => {
  const { sort_by, order, topic } = req.query;
  selectArticles(sort_by, order, topic)
    .then((articles) => {
      res.status(200).send({ articles });
    })
    .catch(next);
};

exports.patchArticle = (req, res, next) => {
  const {
    params: { article_id },
    body: { inc_votes },
  } = req;

  const articlePromise = [
    updateArticle(article_id, inc_votes),
    selectArticleById(article_id),
  ];
  Promise.all(articlePromise)
    .then(([article]) => {
      res.status(200).send({ article });
    })
    .catch(next);
};
