const express = require("express");
const router = express.Router();
const fs = require("fs");
const request = require("request");
const {
    OTPModel
} = require("../../module/otp.js")

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
            "message": `Sizning <Sabzi market> dan o'tishdagi bir martalik mahfiy kodingiz - ${otp}`,
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
    console.log(otp);
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
        if (counter < 3) {
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
    if (fs.existsSync(__dirname + "/sms_token.txt")) {
        fs.readFile(__dirname + "/sms_token.txt", 'utf8', async (err, data) => {
            if (err) console.log(err)
            var response = await sendOTP(data, phoneNumber, otp);
            console.log("res data: ", response.status);
            return res.status(200).json({
                error: null,
                errorCode: "0",
                message: "SUCCESS",
                otp: otp
            });
        });
    } else {
        var token = await getToken();
         var response = await
       sendOTP(token, phoneNumber, otp)
        // console.log("result: ", response);
        return res.status(200).json({
            error: null,
            errorCode: "0",
            message: "SUCCESS",
            otp: otp
        });
    }


})

module.exports = router;