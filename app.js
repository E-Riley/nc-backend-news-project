const express = require("express");
const { getEndpoints, getTopics } = require("./controllers/api.controller");

const app = express();

app.get("/api", getEndpoints);

app.get("/api/topics", getTopics);

app.all("*", (req, res, next) => {
  res.status(400).send({ msg: "Bad request" });
  next();
});

app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
});

module.exports = app;
