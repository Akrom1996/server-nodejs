const express = require("express");
const router = express.Router();
const path = require("path")
const {
    getChats,
    getChatsOfUser
} = require("./chatsController");

router.get("/getChats/:id", getChats);

router.get("/getChatsOfUser", getChatsOfUser);

module.exports = router;