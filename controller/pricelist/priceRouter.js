const {
    priceList
} = require("../../module/database");

const {
    ErrorResponse,
    SuccessResponse
} = require("../../response/Response")
const express = require('express');
const router = express.Router();
router.get("/getPrice", async (req, res) => {
    priceList.findOne().then((data)=>{
        return res.status(200).json(
            new SuccessResponse(null, "0", "Success", data)
            );
    }).catch((error)=>{
        return res.status(400).json(new ErrorResponse(error, "1", "BAD_REQUEST"))
    })
})

module.exports = router;