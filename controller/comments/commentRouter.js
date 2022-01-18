const express = require("express");
const router = express.Router();
const path = require("path")
const {
    getComments,
    postComment,
    putThumb
} = require("./commentController");
const {
    ensureToken
} = require('../../security/jwt')
router.get("/getComments/:itemId",ensureToken, getComments);

router.post("/postComment/:itemId",ensureToken, postComment);

router.put("/putThumb/:itemId/:commentId/:userId",ensureToken,putThumb);


module.exports = router;