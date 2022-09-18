const express = require("express");
const request = require("request");
const router = express.Router()
const Item = require("../module/Item")
const ensureToken = require("../security/jwt")
const formData = require("form-data")
require('dotenv').config();
const {
    minioClient
} = require('../module/minio');
const getObjectFromMinio = async (fileName) => {
    let size = 0
    return new Promise((resolve, reject) => {
        var buff = [];
        minioClient.getObject("p2p-market", fileName.substring(1, fileName.length), function (err, dataStream) {
            if (err) {
                console.log(err)
                reject(err)
            }
            dataStream.on('data', function (chunk) {
                buff.push(chunk)
            })
            dataStream.on('end', function () {
                console.log(buff)
                resolve(Buffer.concat(buff))
            })
            dataStream.on('error', function (err) {
                console.log(err)
            })
        })
    })

}

router.post("/send-message-from-db", async (req, res) => {
    let obj = {}
    await Item.find().then(async (result) => {
        obj.media = []
        let caption = `#${result[0].title.replace(" ", "")} #${result[0].location}\n${result[0].description}\n${result[0].price}\n}`
        for (let i = 0; i < result[0].images.length; i++) { //
            let imageObj
                if (i == 0) {
                    imageObj = Object.fromEntries(Object.entries(new BotImageObjFirst("photo", `http://mandarinstorage.ngrok.io/p2p-market${result[0].images[i]}`, caption)))
                } else {
                    imageObj = Object.fromEntries(Object.entries(new BotImageObjOther("photo", `http://mandarinstorage.ngrok.io/p2p-market${result[0].images[i]}`)))
                }
                obj.media.push(imageObj)
        }
        let tBotUrl = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMediaGroup?chat_id=${process.env.CHANNEL_ID}`
    
        request.post({
            url: tBotUrl,
            json: true, // very important
            body: obj
        }, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log("body ", body);
                return res.status(200).json({
                    data: body
                })
            } else if (error) {
                console.log("error ", error)
                return res.status(400).json({
                    "error": error
                })
            } else {
                console.log("response ", response.body)
                return res.status(response.statusCode).json(
                    JSON.parse(response.body)
                )
            }
        })
    }).catch(err => {
        console.log(err)
        return res.status(400).json({
        err: err
    })})
})
class BotImage {
    constructor(type, media) {
        this.type = type
        this.media = media
    }
}
class BotImageObjFirst extends BotImage {
    constructor(type, media, caption) {
        super(type, media)
        this.caption = caption
    }
}
class BotImageObjOther extends BotImage {
    constructor(type, media) {
        super(type, media)
    }
}

module.exports = router;