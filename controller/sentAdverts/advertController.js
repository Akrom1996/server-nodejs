const {
    ADVERTModel
} = require("../../module/sendAdvert");
const {
    publishMessage
} = require("../../mq/rabbit");

const sendMessage = (number, message) => {
    return new Promise(async (resolve, reject) => {
        try {
            await publishMessage({
                message: message,
                phoneNumber: number
            }, 'advert-task')
            let newAdvert = ADVERTModel({
                message: message,
                phoneNumber: number,
                timeStamp: new Date().toISOString()
            })
            await newAdvert.save();
            resolve();
        } catch (error) {
            reject(error)
        }
    })

}
exports.sendAdvert = async (req, res) => {
    const {
        phoneNumbers,
        message
    } = req.body;
    ADVERTModel.find({}).then((results) => {
        let storedNumbers = [];
        results.forEach((result) => {
            storedNumbers.push(result.phoneNumber)
        })
        phoneNumbers.forEach(async (number) => {
            if (!storedNumbers.includes(number)) {
                await sendMessage(number, message)
            } else if (storedNumbers.length == 0) {
                await sendMessage(number, message)
            }
        })
    }).catch(error => {
        return res.status(400).json({
            error: error,
            errorCode: "2",
            message: "BAD_REQUEST"
        });
    })
    return res.status(200).json({
        error: null,
        errorCode: "0",
        message: "SUCCESS",
    });

}
exports.sendPrevious = async (req, res) => {
    let storedNumbers = [];
    ADVERTModel.find({}).then((results) => {

        results.forEach(async (result) => {
            if (result.timeStamp.split('T')[0] !== new Date().toISOString().split('T')[0] && storedNumbers.length < 2) {
                await publishMessage({
                    message: req.body.message,
                    phoneNumber: result.phoneNumber
                }, 'advert-task')
                storedNumbers.push(result.phoneNumber)
            }
        })
        return res.status(200).json({
            error: null,
            errorCode: "0",
            message: req.body.message,
            data: storedNumbers
        })
    });

}