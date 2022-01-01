const express = require("express");
const router = express.Router();

router.get("/download-file", async (req, res) => {
    const {
        documentation
    } = req.query;
    const filePath = __dirname;
    res.download(filePath + "/" + documentation, (err) => {
        if(err) console.log("error occured on download: ", err);
    });
    // res.end();
})
module.exports = router;