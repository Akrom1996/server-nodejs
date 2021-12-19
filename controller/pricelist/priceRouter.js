const {
    priceList
} = require("../../module/database");

const express = require('express');
const router = express.Router();
router.get("/getPrice", async (req, res) => {
    priceList.findOne().then((data)=>{
        return res.status(200).json({
            error: null,
            errorCode: "0",
            message: "SUCCESS",
            data: data
        });
    }).catch((error)=>{
        return res.status(400).json({
            error: error,
            errorCode: "1",
            message: "BAD_REQUEST"
        })
    })
})

module.exports = router;