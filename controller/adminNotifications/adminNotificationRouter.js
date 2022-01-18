const express = require("express");
const router = express.Router();
const path = require("path")
const {
    getNotifications,
    postNotification,
    putView
} = require("./adminNotificationController");
const {
    ensureToken
} = require('../../security/jwt')

router.get("/getNotifications",ensureToken, getNotifications);

router.post("/postNotification",ensureToken, postNotification);

router.put("/putView/:messageId/:userId",ensureToken,putView);


module.exports = router;