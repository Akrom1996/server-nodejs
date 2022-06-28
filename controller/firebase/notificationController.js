const fcmModel = require("../../module/notification.js")
const {
    admin
} = require('../../controller/firebase/getToken')


const {
    ErrorResponse,
    SuccessResponse
} = require("../../response/Response")

exports.fcmFunc = async (data) => {
    // console.log(data);
    const fcm = fcmModel(data);

    return new Promise((resolve, reject) => {
        fcmModel.findOne({
            "userId": data.userId
        }).then((userFCM) => {
            //update if user exists
            // console.log("userFCM:",userFCM);
            if (userFCM) {
                userFCM.fcmId = data.fcmId;
                // console.log("NEW userFCM:",userFCM);
                userFCM.save().then((result) => console.log("fcm updated ", result));
            }
            // save
            else {
                fcm.save().then((result) => console.log("fcm saved ", result));
            }
            resolve();
        }).catch((error) => {
            //console.log("error ", error);
            reject(error);
        })
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
            userFCM.save().then((result) => res.status(200).json(
                new SuccessResponse(null, "0", "SUCCESS", result)
            ));
        }
        // save
        else {
            fcm.save().then((result) => res.status(200).json(new SuccessResponse(null, "0", "SUCCESS", result)))
        }
    }).catch((error) => {
        return res.status(400).json(new ErrorResponse(error, "1", "BAD_REQUEST"))
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
            return res.status(200).json(new SuccessResponse(null, "0", "SUCCESS", result))
        }).catch((error) => {
            //console.log(error);
            return res.status(400).json(new ErrorResponse(error, "1", "BAD_REQUEST"))
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
            return res.status(200).json(new SuccessResponse(null, "0", "SUCCESS", result))
        }).catch((error) => {
            //console.log(error);
            return res.status(400).json(new ErrorResponse(error, "1", "BAD_REQUEST"))
        })
}

exports.sendToTopicFunction = async (data, topic) => {
    var payload = {
        "notification": {
            title: topic,
            sound: "default",
            body: "Yangi e'lon berildi. Bilidirishnomalarni tekshiring"
        },
        "data": {
            data: JSON.stringify(data),
            type: "topic",
            click_action: "FLUTTER_NOTIFICATION_CLICK",
        }

    };
    // console.log("data ", topic);
    //console.log("payload ", payload);
    return new Promise((resolve, reject) => {
        admin.messaging().sendToTopic("/topics/" + topic.toLowerCase(), payload)
            .then((result) => {
                //console.log(`successfully send to ${result}`);
                resolve(result);
            }).catch((error) => {
                //console.log(error);
                reject(error);
            })
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
            sound: "default",
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
            return res.status(200).json(new SuccessResponse(null, "0", "SUCCESS", result))
        }).catch((error) => {
            //console.log(error);
            return res.status(400).json(new ErrorResponse(error, "1", "BAD_REQUEST"))
        })
}