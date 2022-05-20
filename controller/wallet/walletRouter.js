const express = require("express")
const router = express.Router();
const {
    ensureToken
} = require('../../security/jwt')
const {getBalance, updateBalance}= require("./walletController")


router.get("/getBalance/:id", ensureToken, getBalance)

router.put("/updateBalance/:id", ensureToken, updateBalance)

module.exports = router;