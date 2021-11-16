const express = require("express");
const router = express.Router();
const {saveFCM, subscribe, unsubscribe, sendToTopic} = require("./notificationController.js");

// (update) saving user fcm to the database
router.post("/save-fcm", saveFCM);

// subscribe to topic
router.post("/subscribe", subscribe);

// unsubscribe from topic
router.post("/unsubscribe", unsubscribe);

// send to topic
router.post("/notify-topic", sendToTopic);
module.exports = router;