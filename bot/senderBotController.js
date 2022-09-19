const Item = require("../module/Item")
const ensureToken = require("../security/jwt")
const formData = require("form-data")
const request = require("request");
require('dotenv').config();
const {
    minioClient
} = require('../module/minio');
const {
    SuccessResponse
} = require("../response/Response");



const sendMessageToBot = async (body) => {
    return new Promise((resolve, reject) => {
        let tBotUrl = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMediaGroup?chat_id=${process.env.CHANNEL_ID}`
        request.post({
            url: tBotUrl,
            json: true, // very important
            body: body
        }, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // console.log("body ", body);
                resolve(body)
            } else if (error) {
                console.log("error ", error)
                reject(error)
            } else {
                console.log("response ", response.body)
                resolve(body)
            }
        })
    })
}

exports.sendMessageFromDB = async (req, res) => {
    await Item.find().then(async (result) => {
        let counter = 0;
        for (let j = 15; j < Math.floor(result.length * 0.2); j++) {
            let caption = `#${result[j].title.replace(" ", "")} #${result[j].location}\n\n${result[j].description}\n${result[j].price}\n\nBarcha turdagi e'lonlaringizni tez va bepul joylashda 'Mandarin market' ilovasidan foydalaning.\nIlova uchun 👉 https://mandarinmarket.page.link/NEAo\n Kanalga ulanish uchun 👉 https://t.me/+gN5bCUJUHWZhYzA9`
            let obj = {}
            obj.media = []

            for (let i = 0; i < result[j].images.length; i++) { //
                let imageObj
                if (i == 0) {
                    imageObj = Object.fromEntries(Object.entries(new BotImageObjFirst("photo", `http://mandarinstorage.ngrok.io/p2p-market${result[j].images[i]}`, caption)))
                } else {
                    imageObj = Object.fromEntries(Object.entries(new BotImageObjOther("photo", `http://mandarinstorage.ngrok.io/p2p-market${result[j].images[i]}`)))
                }
                obj.media.push(imageObj)
            }
            if(result[j].images.length == 0){
                console.log("image is empty")
                let imageObj
                imageObj = Object.fromEntries(Object.entries(new BotImageObjFirst("photo", "https://www.vectorstock.com/royalty-free-vector/photo-icon-vector-21180230", caption)))
                obj.media.push(imageObj)
            }
            await new Promise(r => setTimeout(r, 2000));
            await sendMessageToBot(obj).then((data) => counter++).catch(error => console.log(error))

        }
        if (counter === Math.floor(result.length * 0.1)) {
            return res.status(200).json(new SuccessResponse("0", "0", "Successfully send data to telegram"))
        }
    }).catch(err => {
        console.log(err)
        return res.status(400).json({
            err: err
        })
    })
}
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
