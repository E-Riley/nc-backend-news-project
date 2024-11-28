const express = require("express");
const apiRouter = require("./routes/api.router");

const app = express();
app.use(express.json());

app.use("/api", apiRouter);

app.all("*", (req, res, next) => {
  res.status(404).send({ msg: "Endpoint not found" });
  next();
});

app.use((err, req, res, next) => {
  if (err.code === "22P02" || err.code === "23502" || err.code === "23503") {
    res.status(400).send({ msg: "Bad request" });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
});

module.exports = app;
