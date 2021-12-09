const fcmModel = require("../../module/notification.js")
const {
    admin
} = require('../../controller/firebase/getToken')

exports.fcmFunc = async (data) => {
    //console.log(data);
    const fcm = fcmModel(data);
    fcmModel.findOne({
        "userId": data.userId
    }).then((userFCM) => {
        //update if user exists
        if (userFCM) {
            userFCM.fcmId = id;
            userFCM.save().then((result) => console.log("fcm updated ", result));
        }
        // save
        else {
            fcm.save().then((result) => console.log("fcm saved ", result));
        }
        return;
    }).catch((error) => {
        //console.log("error ", error);
        return;
    })
}

exports.saveFCM = async (req, res) => {
    //console.log(req.body);
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
        //update if user exists
        if (userFCM) {
            userFCM.fcmId = id;
            userFCM.save().then((result) => res.status(200).json({
                error: null,
                errorCode: "0",
                message: "SUCCESS",
                data: result,

            }));
        }
        // save
        else {
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

exports.subscribe = async (req, res) => {
    const {
        fcmToken,
        topic
    } = req.body;
    admin.messaging().subscribeToTopic(fcmToken, topic)
        .then((result) => {
            //console.log(`${fcmToken.substring(0,20)}... successfully subscribed to ${topic}`);
            return res.status(200).json({
                error: null,
                errorCode: "0",
                message: "SUCCESS",
                data: result,
            })
        }).catch((error) => {
            //console.log(error);
            return res.status(400).json({
                error: error.message,
                errorCode: "1",
                message: "BAD_REQUEST"
            })
        })
}

exports.unsubscribe = async (req, res) => {
    const {
        fcmToken,
        topic
    } = req.body;
    fcmToken.substring(0, 10)
    admin.messaging().unsubscribeFromTopic(fcmToken, topic)
        .then((result) => {
            //console.log(`${fcmToken.substring(0,10)}... successfully unsubscribed from ${topic}`);
            return res.status(200).json({
                error: null,
                errorCode: "0",
                message: "SUCCESS",
                data: result,
            })
        }).catch((error) => {
            //console.log(error);
            return res.status(400).json({
                error: error.message,
                errorCode: "1",
                message: "BAD_REQUEST"
            })
        })
}

exports.sendToTopicFunction = async (data, topic) => {
     var payload = {
        "notification": {
            title: topic,
            body: "Yangi e'lon berildi"
        },
        "data": {
            data: JSON.stringify(data),
            type: "topic",
            click_action: "FLUTTER_NOTIFICATION_CLICK",
        }

    };
    //console.log("data ", data);
    //console.log("payload ", payload);
    admin.messaging().sendToTopic(topic, payload)
        .then((result) => {
            //console.log(`successfully send to ${result}`);
            return result;
        }).catch((error) => {
            //console.log(error);
            return error;
        })
}

exports.sendToTopic = async (req, res) => {
    const {
        data,
        topic
    } = req.body;
    
    delete data.user
    //console.log(data);
    var payload = {
        "notification": {
            title: topic,
            body: "Yangi e'lon berildi"
        },
        "data": {
            data: JSON.stringify(data),
            type: "topic",
            click_action: "FLUTTER_NOTIFICATION_CLICK",
        }

    };
    admin.messaging().sendToTopic(String(topic).split(' ')[0].toLowerCase(), payload)
        .then((result) => {
            //console.log(`successfully send to ${result}`);
            return res.status(200).json({
                error: null,
                errorCode: "0",
                message: "SUCCESS",
                data: result,
            })
        }).catch((error) => {
            //console.log(error);
            return res.status(400).json({
                error: error.message,
                errorCode: "1",
                message: "BAD_REQUEST"
            })
        })
}