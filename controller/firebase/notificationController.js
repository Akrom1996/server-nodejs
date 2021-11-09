const fcmModel = require("../../module/notification.js")

exports.saveFCM = async (req, res) => {
    console.log(req.body);
    const {
        id,
        userId
    } = req.body;
    const fcm = fcmModel({
        "userId": userId,
        "fcmId": id
    });
    fcmModel.findOne({
        "userId": userId
    }).then((userFCM) => {

        if (userFCM) {
            userFCM.fcmId = id;
            userFCM.save().then((result) => res.status(200).json({
                error: null,
                errorCode: "0",
                message: "SUCCESS",
                data: result,

            }));
        } else {
            fcm.save().then((result) => res.status(200).json({
                error: null,
                errorCode: "0",
                message: "SUCCESS",
                data: result,

            }))
        }
    }).catch((error) => {
        return res.status(400).json({
            error: error.message,
            errorCode: "1",
            message: "BAD_REQUEST"
        })
    })
}