const express = require("express");
const router = express.Router()

router.post("/send-message-from-db",sendMessageFromDB)
module.exports = router;
