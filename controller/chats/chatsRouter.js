const express = require("express");
const router = express.Router();
const path = require("path")
const {
    getChats,
    getChatsOfUser,
    getChatsOfUserToSell
} = require("./chatsController");

router.get("/getChats/:id", getChats);

router.get("/getChatsOfUser", getChatsOfUser);

router.get("/getChatsOfUserToSell", getChatsOfUserToSell);

module.exports = router;