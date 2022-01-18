const express = require("express");
const router = express.Router();
const path = require("path")
const {
    getChats,
    getChatsOfUser,
    getChatsOfUserToSell
} = require("./chatsController");
const {
    ensureToken
} = require('../../security/jwt')

router.get("/getChats/:id",ensureToken, getChats);

router.get("/getChatsOfUser",ensureToken, getChatsOfUser);

router.get("/getChatsOfUserToSell",ensureToken, getChatsOfUserToSell);

module.exports = router;