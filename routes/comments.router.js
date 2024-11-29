const express = require("express");
const commentsRouter = express.Router();
const {
  deleteComment,
  patchComment,
} = require("../controllers/comments.controller");

commentsRouter.delete("/:comment_id", deleteComment);
commentsRouter.patch("/:comment_id", patchComment);

module.exports = commentsRouter;