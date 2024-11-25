const db = require("../db/connection");

exports.selectTopics = () => {
  return db.query("SELECT * FROM topics").then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: "No topics were found" });
    }
    return rows;
  });
};

exports.selectArticleById = (article_id) => {
  let sqlQuery = `SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, 
    articles.article_img_url`;
  const queryValues = [];

  if (article_id) {
    sqlQuery += ", articles.body FROM articles WHERE articles.article_id = $1";
    queryValues.push(article_id);
  } else {
    sqlQuery += `, COUNT(comments.article_id) AS comment_count FROM articles LEFT OUTER JOIN comments ON articles.article_id = comments.article_id 
      GROUP BY articles.article_id ORDER BY articles.created_at DESC`;
  }

  return db.query(sqlQuery, queryValues).then(({ rows }) => {
    if (article_id) {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article not found" });
      }
      return rows[0];
    } else {
      return rows;
    }
  });
};
