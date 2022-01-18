const express = require("express");
const router = express.Router();
const {saveFCM, subscribe, unsubscribe, sendToTopic} = require("./notificationController.js");
const {
    ensureToken
} = require('../../security/jwt')
// (update) saving user fcm to the database
router.post("/save-fcm",ensureToken, saveFCM);

// subscribe to topic
router.post("/subscribe",ensureToken, subscribe);

// unsubscribe from topic
router.post("/unsubscribe",ensureToken, unsubscribe);

// send to topic
router.post("/notify-topic",ensureToken, sendToTopic);
module.exports = router;