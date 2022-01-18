const express = require("express");
const router = express.Router();
const {makeComplain, checkComplain} = require("./complainController.js")
const {
    ensureToken
} = require('../../security/jwt')
// send complain
router.post("/make-complain",ensureToken, makeComplain);

// check complained by complainer
router.get("/check-complain",ensureToken, checkComplain);

module.exports = router;