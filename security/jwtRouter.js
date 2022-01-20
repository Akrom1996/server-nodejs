const express = require("express");
const router = express.Router();
const {generateToken} = require("./jwt")

router.get("/generateJWT/:phoneNumber", generateToken)

module.exports = router;