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
const Multer = require("multer");


router.get("/getNotifications", ensureToken, getNotifications);

router.post("/postNotification", ensureToken, Multer({
    storage: Multer.memoryStorage(),
    limits: {
        fileSize: 10000000
    },
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single("upload"), postNotification);

router.put("/putView/:messageId/:userId", ensureToken, putView);

function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    // const mimetype = filetypes.test(file.mimetype);
    if (extname) {
        return cb(null, true);
    } else {
        cb("Error: Images Only!");
    }
}
module.exports = router;