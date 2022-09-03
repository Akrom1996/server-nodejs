const {
    ADVERTModel
} = require("../../module/sendAdvert");
const {
    publishMessage
} = require("../../mq/rabbit");

const {
    ErrorResponse,
    SuccessResponse
} = require("../../response/Response")
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
        return res.status(400).json(new ErrorResponse(error, "1", "BAD_REQUEST"));
    })
    return res.status(200).json(new SuccessResponse(null, "0", "SUCCESS", null));

}
exports.sendPrevious = async (req, res) => {
    let storedNumbers = [];
    ADVERTModel.find({}).then((results) => {
        let counter = 0
        results.forEach(async (result) => {

            if (result.timeStamp.split('T')[0] === new Date().toISOString().split('T')[0] && counter < 1) {
                storedNumbers.push(result.phoneNumber)

                await publishMessage({
                    message: req.body.message,
                    phoneNumber: result.phoneNumber
                }, 'advert-task')
                counter++
            }
        })
        return res.status(200).json(
            new SuccessResponse(null, "0", req.body.message, storedNumbers)
        )
    });

}