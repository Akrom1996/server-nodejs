const express = require("express");
const router = express.Router()
const {sendMessageFromDB} = require("./senderBotController")
router.post("/send-message-from-db",sendMessageFromDB)
module.exports = router;
