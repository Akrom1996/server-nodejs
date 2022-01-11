const express = require("express");
const router = express.Router();
const {makeComplain, checkComplain} = require("./complainController.js")
// send complain
router.post("/make-complain", makeComplain);

// check complained by complainer
router.get("/check-complain", checkComplain);

module.exports = router;