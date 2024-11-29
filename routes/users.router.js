const express = require("express");
const usersRouter = express.Router();
const { getUsers, getUserByName } = require("../controllers/users.controller");

usersRouter.get("/", getUsers);
usersRouter.get("/:username", getUserByName);

module.exports = usersRouter;
