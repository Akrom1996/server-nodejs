const express = require("express");
const router = express.Router();
const path = require("path")
const {
    getComments,
    postComment
} = require("./commentController");

router.get("/getComments/:itemId", getComments);

router.post("/postComment/:itemId", postComment);


module.exports = router;