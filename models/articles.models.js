const db = require("../db/connection");

exports.selectArticleById = (article_id) => {
  return db
    .query(
      `SELECT articles.*, CAST(COUNT(comments.article_id) AS INT) AS comment_count FROM articles 
      LEFT OUTER JOIN comments ON articles.article_id = comments.article_id WHERE articles.article_id = $1 GROUP BY articles.article_id`,
      [article_id]
    )
    .then(({ rows }) => {
      if (!rows.length) {
        return Promise.reject({ status: 404, msg: "Article not found" });
      }
      return rows[0];
    });
};

exports.selectArticles = (sort_by = "created_at", order = "desc", topic) => {
  const validSortBy = [
    "article_id",
    "title",
    "topic",
    "author",
    "body",
    "created_at",
    "votes",
  ];

  const validOrder = ["ASC", "DESC"];

  const validTopic = ["paper", "cats", "mitch"];

  if (
    !validSortBy.includes(sort_by) ||
    !validOrder.includes(order.toUpperCase())
  ) {
    return Promise.reject({
      status: 400,
      msg: "Bad request",
    });
  }

  let sqlQuery = `SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, 
  articles.article_img_url, CAST(COUNT(comments.article_id) as INT) AS comment_count FROM articles LEFT OUTER JOIN comments ON 
  articles.article_id = comments.article_id `;
  const queryValues = [];

  if (topic) {
    if (!validTopic.includes(topic)) {
      return Promise.reject({ status: 400, msg: "Bad request" });
    }
    sqlQuery += `WHERE articles.topic = $1 `;
    queryValues.push(topic);
  }

  sqlQuery += `GROUP BY articles.article_id ORDER BY articles.${sort_by} ${order}`;

  return db.query(sqlQuery, queryValues).then(({ rows }) => {
    return rows;
  });
};

exports.updateArticle = (article_id, inc_votes) => {
  return db
    .query(
      `UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING *`,
      [inc_votes, article_id]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};
