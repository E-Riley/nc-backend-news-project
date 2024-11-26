const db = require("../db/connection");

exports.selectArticleById = (article_id) => {
  return db
    .query(
      `SELECT author, title, article_id, topic, created_at, 
      votes, article_img_url, body FROM articles WHERE article_id = $1`,
      [article_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article not found" });
      }
      return rows[0];
    });
};

exports.selectArticles = () => {
  return db
    .query(
      `SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, 
      articles.article_img_url, CAST(COUNT(comments.article_id) as INT) AS comment_count FROM articles LEFT OUTER JOIN comments ON 
      articles.article_id = comments.article_id GROUP BY articles.article_id ORDER BY articles.created_at DESC`
    )
    .then(({ rows }) => {
      return rows;
    });
};