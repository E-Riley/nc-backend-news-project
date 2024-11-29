const { selectTopicBySlug } = require("../models/api.models");
const {
  selectArticleById,
  selectArticles,
  updateArticle,
  insertArticle,
} = require("../models/articles.models");
const { selectUser } = require("../models/users.models");

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
  const promiseArr = [selectArticles(sort_by, order, topic)];
  if (topic) {
    promiseArr.push(selectTopicBySlug(topic));
  }
  Promise.all(promiseArr)
    .then(([articles]) => {
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

exports.postArticle = (req, res, next) => {
  const {
    body: { author, title, body, topic, article_img_url },
  } = req;

  const articlePromise = [
    selectUser(author),
    selectTopicBySlug(topic),
    insertArticle(author, title, body, topic, article_img_url),
  ];

  Promise.all(articlePromise)
    .then((promiseResult) => {
      const article = { ...promiseResult[2], comment_count: 0 };
      res.status(201).send({ article });
    })
    .catch(next);
};
