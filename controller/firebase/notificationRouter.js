const express = require("express");
const router = express.Router();
const {saveFCM} = require("./notificationController.js");

router.post("/save-fcm", saveFCM);

module.exports = router;