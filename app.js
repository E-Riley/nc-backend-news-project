const express = require("express");
const { getEndpoints } = require("./controllers/api.controller");

const app = express();

app.get("/api", getEndpoints);

module.exports = app;
