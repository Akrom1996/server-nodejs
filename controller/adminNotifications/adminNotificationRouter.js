const express = require("express");
const router = express.Router();
const path = require("path")
const {
    getNotifications,
    postNotification,
    putView
} = require("./adminNotificationController");

router.get("/getNotifications", getNotifications);

router.post("/postNotification", postNotification);

router.put("/putView/:messageId/:userId",putView);


module.exports = router;