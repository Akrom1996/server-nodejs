const express = require("express")
const router = express.Router();
const {
    ensureToken
} = require('../../security/jwt')
const {sendAdvert, sendPrevious} = require("./advertController")

router.post("/submit",ensureToken, sendAdvert)
router.post("/submit-previous",ensureToken,sendPrevious);
module.exports = router;