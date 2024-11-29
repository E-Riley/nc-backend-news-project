const db = require("../db/connection");

exports.selectTopics = () => {
  return db.query("SELECT * FROM topics").then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: "No topics were found" });
    }
    return rows;
  });
};

exports.selectTopicBySlug = (topic) => {
  if (!topic) {
    return Promise.reject({ status: 400, msg: "Bad request" });
  }
  return db
    .query("SELECT * FROM topics WHERE slug = $1", [topic])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Topic not found" });
      }
    });
};
