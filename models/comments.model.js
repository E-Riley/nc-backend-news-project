const db = require("../db/connection");

exports.selectCommentsByArticle = (article_id) => {
  return db
    .query(
      "SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC",
      [article_id]
    )
    .then(({ rows }) => {
      return rows;
    });
};

exports.selectCommentById = (comment_id) => {
  return db
    .query("SELECT * FROM comments WHERE comment_id = $1", [comment_id])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Comment not found" });
      }
    });
};

exports.insertComment = (article_id, username, body) => {
  return db
    .query(
      `INSERT INTO comments (body, article_id, author) VALUES ($1, $2, $3) RETURNING *`,
      [body, article_id, username]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};

exports.deleteCommentDb = (comment_id) => {
  return db
    .query("DELETE FROM comments WHERE comment_id = $1 RETURNING *", [
      comment_id,
    ])
    .then(({ rows }) => {
      if (!rows.length) {
        return Promise.reject({ status: 404, msg: "Comment not found" });
      }
    });
};

exports.updateComment = (comment_id, votes) => {
  return db
    .query(
      "UPDATE comments SET votes = votes + $1 WHERE comment_id = $2 RETURNING *",
      [votes, comment_id]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};
