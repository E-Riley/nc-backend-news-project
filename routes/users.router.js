const express = require("express");
const usersRouter = express.Router();
const { getUsers } = require("../controllers/users.controller");

usersRouter.get("/", getUsers);

module.exports = usersRouter;
