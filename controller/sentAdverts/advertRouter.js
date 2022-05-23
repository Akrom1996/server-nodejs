const express = require("express")
const router = express.Router();
const {
    ensureToken
} = require('../../security/jwt')
const {sendAdvert} = require("./advertController")

router.post("/submit",ensureToken, sendAdvert)

module.exports = router;