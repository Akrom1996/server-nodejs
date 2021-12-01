const express = require("express");
const router = express.Router();
const path = require("path")
const {
    getComments,
    postComment,
    putThumb
} = require("./commentController");

router.get("/getComments/:itemId", getComments);

router.post("/postComment/:itemId", postComment);

router.put("/putThumb/:itemId/:commentId/:userId",putThumb);


module.exports = router;