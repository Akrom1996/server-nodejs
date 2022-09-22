const Item = require("../module/Item")
const User = require("../module/User")
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
        console.log(`sending to tBot`);
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
const getImagePath = (category) => {
    let path
    switch (category) {
        case "Elektronika":
            path = "/images/app-images/tv.png"
            break;
        case "Avtomobil":
            path = "/images/app-images/car.jpg"
            break;
        case "Biznes":
            path = "/images/app-images/business.jpg"
            break;
        case "Uy-jihozlari":
            path = "/images/app-images/sofa.jpg"
            break;
        case "Maishiy texnika":
            path = "/images/app-images/fridge.jpg"
            break;
        case "Uy-jihozlari":
            path = "/images/app-images/fridge.jpg"
            break;
        case "Oziq-ovqatlar":
            path = "/images/app-images/food.jpg"
            break;
        case "Uy-joy":
            path = "/images/app-images/real-estate.jpg"
            break;
        case "Qurilish mat.":
            path = "/images/app-images/material.jpg"
            break;
        case "Ishlab chiq. uskunalari":
            path = "/images/app-images/manufacturing.jpg"
            break;
        case "Ishchi-Xodim":
            path = "/images/app-images/staff.jpg"
            break;
        case "Go'zallik":
            path = "/images/app-images/cosmetic.jpg"
            break;
        case "Kiyimlar":
            path = "/images/app-images/clothes.jpg"
            break;
        default:
            path = "/images/app-images/car.jpg"
            break;
    }
    return path
}
exports.sendMessageFromDB = async (req, res) => {
    await Item.find().then(async (result) => {
        let counter = 0;
        for (let j = 0; j < result.length; j++) {
            const user = await User.findById(result[j].user)
            let caption = `#${result[j].title} #${result[j].location}\n<b>${result[j].position!=="null"?result[j].position:""}</b>\n${result[j].description}\n<b>${result[j].price}</b>\t<b>${result[j].isNegotiable?"Kelishamiz":"Oxirgi narxi"}</b>\n\nAloqa uchun: <u><a href='tel:+${user.phoneNumber.replace(/[^0-9.]/g, '')}'>${user.phoneNumber}</a></u>\n\nBarcha turdagi e'lonlaringizni <b>tez</b> va <b>bepul</b> joylashda <a href='https://mandarinmarket.page.link/NEAo'>Mandarin market</a> ilovasidan foydalaning.\nKanalga ulanish uchun 👉 https://t.me/+gN5bCUJUHWZhYzA9`
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
            if (result[j].images.length == 0) {
                console.log("image is empty")
                let imageObj
                let imagePath = getImagePath(result[j].category)
                imageObj = Object.fromEntries(Object.entries(new BotImageObjFirst("photo", `http://mandarinstorage.ngrok.io/p2p-market${imagePath}`, caption)))
                obj.media.push(imageObj)
            }
            await new Promise(resolve => setTimeout(
                resolve, 8000)).then(async () => {
                await sendMessageToBot(obj)
                    .then((data) => counter++)
                    .catch(error => console.log(error))
            });
        }
        if (counter === result.length) {
            return res.status(200).json(new SuccessResponse("0", "0", "Successfully send data to telegram"))
        }
    }).catch(err => {
        console.log(err)
        return res.status(400).json({
            err: err
        })
    })
}
exports.sendItemToBot = async (result, userId) => {
    const user = await User.findById(userId)
    let caption = `#${result.title} #${result.location}\n<b>${result.position!=="null"?result.position:""}</b>\n${result.description}\n<b>${result.price}</b>\t<b>${result.isNegotiable?"Kelishamiz":"Oxirgi narxi"}</b>\n\nAloqa uchun: <u><a href='tel:+${user.phoneNumber.replace(/[^0-9.]/g, '')}'>${user.phoneNumber}</a></u>\n\nBarcha turdagi e'lonlaringizni <b>tez</b> va <b>bepul</b> joylashda <a href='https://mandarinmarket.page.link/NEAo'>Mandarin market</a> ilovasidan foydalaning.\nKanalga ulanish uchun 👉 https://t.me/+gN5bCUJUHWZhYzA9`
    let obj = {}
    obj.media = []
    for (let i = 0; i < result.images.length; i++) { //
        let imageObj
        if (i == 0) {
            imageObj = Object.fromEntries(Object.entries(new BotImageObjFirst("photo", `http://mandarinstorage.ngrok.io/p2p-market${result.images[i]}`, caption)))
        } else {
            imageObj = Object.fromEntries(Object.entries(new BotImageObjOther("photo", `http://mandarinstorage.ngrok.io/p2p-market${result.images[i]}`)))
        }
        obj.media.push(imageObj)
    }
    if (result.images.length == 0) {
        console.log("image is empty")
        let imageObj
        let imagePath = getImagePath(result.category)
        imageObj = Object.fromEntries(Object.entries(new BotImageObjFirst("photo", `http://mandarinstorage.ngrok.io/p2p-market${imagePath}`, caption)))
        obj.media.push(imageObj)
    }
    await new Promise(resolve => setTimeout(
        resolve, 8000)).then(async () => {
        await sendMessageToBot(obj)
            .catch(error => console.log(error))
    });
    return true
}
class BotImage {
    constructor(type, media) {
        this.type = type
        this.media = media
        this.parse_mode = "HTML"
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
