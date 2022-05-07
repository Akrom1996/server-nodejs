const express = require("express");
const router = express.Router();
const fs = require("fs");
const request = require("request");
const {
    OTPModel
} = require("../../module/otp.js")
const {publishMessage,consumeMessage} = require("../../mq/rabbit")

const getToken = async () => {
    var responseData;
    const options = {
        method: "POST",
        url: "https://notify.eskiz.uz/api/auth/login",
        headers: {
            "Content-Type": "multipart/form-data"
        },
        formData: {
            "email": "test@eskiz.uz",
            "password": "j6DWtQjjpLDNjWEk74Sx"
        }
    }
    return new Promise((resolve, reject) => {
        request(options, (err, res, body) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                responseData = JSON.parse(body).data.token;
                fs.writeFile(__dirname + "/sms_token.txt", responseData, (err) => {
                    if (err) console.log("writing error: ", err);
                });
                resolve(responseData);
            }
        })
    })


}

const updateToken = async (oldToken) => {
    var responseData;
    const options = {
        method: "PATCH",
        url: "https://notify.eskiz.uz/api/auth/refresh",
        headers: {
            "Authorization": "Bearer " + oldToken
        },
    }
    return new Promise((resolve, reject) => {
        request(options, (err, res, body) => {
            if (err) {
                console.log(err);
                reject(err)
            } else {
                responseData = JSON.parse(body).data.token;
                fs.writeFile(__dirname + "/sms_token.txt", responseData, (err) => {
                    if (err) console.log("writing error: ", err);
                });
                resolve(responseData);
            }
        })
    })

}

const sendOTP = async (token, phoneNumber, otp) => {
    var responseData;
    const options = {
        method: "POST",
        url: "https://notify.eskiz.uz/api/message/sms/send",
        headers: {
            "Authorization": "Bearer " + token,
            "Content-Type": "multipart/form-data"
        },
        formData: {
            "mobile_phone": phoneNumber,
            "message": `'Alibazar' dan ro'yxatdan o'tishdagi bir martalik mahfiy kod - ${otp}.`,
            "from": "4546"
        }
    }
    return new Promise((resolve, reject) => {
        request(options, (err, res, body) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                // console.log("send body: ", body);

                responseData = JSON.parse(body);
                resolve(responseData);
            }
        })
    })


}

const generateOTP = async () => {
    let otp = "";
    for (let i = 0; i < 5; i++) {
        otp += Math.floor(Math.random() * 10).toString()
    }
    return otp;
}

router.post("/send-otp", async (req, res) => {
    const {
        phoneNumber
    } = req.body;
    let otp = await generateOTP();
    console.log(otp, " ", phoneNumber);
    //check
    var results = await OTPModel.find({
        phoneNumber: phoneNumber
    });
    if (results.length == 0) {
        await OTPModel({
            phoneNumber: phoneNumber,
            otp: otp
        }).save()

    } else {
        let counter = 0;
        results.forEach((element) => {
            var createdDate = new Date(element.createdAt);
            var today = new Date();
            if (createdDate.getDate() == today.getDate() && createdDate.getMonth() == today.getMonth() && createdDate.getFullYear() == today.getFullYear()) {
                counter++
            }
        })
        // console.log("counter: ", counter);
        if (counter < 10) {
            await OTPModel({
                phoneNumber: phoneNumber,
                otp: otp
            }).save()

        } else {
            // console.log("more than 3");
            return res.status(400).json({
                error: "error",
                errorCode: "1",
                message: "Bugungi mahfiy bir martalik kodlar olish soni tugadi. Iltimos ertaga yana urunib ko'ring."
            })
        }
    }

    //send otp
    publishMessage(otp);
    consumeMessage()
    return res.status(200).json({
        error: null,
        errorCode: "0",
        message: "SUCCESS",
        otp: otp
    });

    // modem.on("onSendingMessage", () => {
    //     setTimeout(() => {
    //         modem.close(() => {
    //             console.log("modem closed")
    //         })
    //         return res.status(200).json({
    //             error: null,
    //             errorCode: "0",
    //             message: "SUCCESS",
    //             otp: otp
    //         });

    //     }, 1000)

    // })

    // console.log("result: ", response);


})

module.exports = router;

/**
 *  if (fs.existsSync(__dirname + "/sms_token.txt")) {
        fs.readFile(__dirname + "/sms_token.txt", 'utf8', async (err, data) => {
            if (err) console.log(err)
            // var response = await sendOTP(data, phoneNumber, otp);

            modem.open("/dev/ttyUSB0", options, function (err, result) {
                if (err) {
                    console.log("error in open modem", err);
                }
                if (result) {
                    console.log("modem open", result);
                }
            });
            modem.on('open', function () {
                modem.initializeModem(function (msg, err) {
                    if (err) {
                        console.log('Error Initializing Modem - ', err);
                    } else {
                        console.log('InitModemResponse: ', JSON.stringify(msg));
                        modem.sendSMS(phoneNumber, `sms code - ${otp}`, false, function (result) {
                            console.log(result)
                        });
    
                    }
                })
            });
            modem.on("onSendingMessage", result=>{
                console.log("result: ", result)
                modem.close(()=>{
                    console.log("modem closed")
                })
            })
            // console.log("res data: ", response.status);
            return res.status(200).json({
                error: null,
                errorCode: "0",
                message: "SUCCESS",
                otp: otp
            });
        });
    } else {
        var token = await getToken();
        //  var response = await
        //    sendOTP(token, phoneNumber, otp)
        modem.open("/dev/ttyUSB0", options, function (err, result) {
            if (err) {
                console.log("error in open modem", err);
            }
            if (result) {
                console.log("modem open", result);
            }
        });
        modem.on('open', function () {
            modem.initializeModem(function (msg, err) {
                if (err) {
                    console.log('Error Initializing Modem - ', err);
                } else {
                    console.log('InitModemResponse: ', JSON.stringify(msg));
                    modem.sendSMS(phoneNumber, `sms code - ${otp}`, false, function (result) {
                        console.log(result)
                    });

                }
            })
        });
        modem.on("onSendingMessage", result=>{
            console.log("result: ", result)
            modem.close(()=>{
                console.log("modem closed")
            })
        })
        // console.log("result: ", response);
        return res.status(200).json({
            error: null,
            errorCode: "0",
            message: "SUCCESS",
            otp: otp
        });
    }
 */