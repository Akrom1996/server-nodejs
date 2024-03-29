const userModel = require('../../module/User');
require('dotenv').config();
const {
    ObjectId,
    MongoClient
} = require("mongodb");
const Chat = require("../../module/Chat");
const {
    chatCollection
} = require('../../module/database');

const {
    ErrorResponse,
    SuccessResponse
} = require("../../response/Response")
// const client = new MongoClient("mongodb://localhost:27017/myKarrot");
// client.connect();
// const db = client.db("myKarrot");
// const {chatCollection} = db.collection("chats");
// ishlatilmaydi
exports.getChats = async (req, res) => {
    //console.log(req.params);
    chatCollection.findOne({
            "_id": req.params.id
        })
        .then((data) => {
            //console.log(data)
            return res.status(200).json(
                new SuccessResponse(null, "0", "SUCCESS", data)
            );
        })
        .catch((err) => {
            //console.log(err.message);
            return res.status(400).json(
                new ErrorResponse(err, "1", "BAD_REQUEST")
            );
        });
}

exports.getChatsOfUser = async (req, res) => {
    const {
        id
    } = req.query;
    userModel.findById(id)
    .then(user=>{
        if (!user) {
            return res.status(400).json(new ErrorResponse("BAD_REQUEST", "1", "Foydalanuvchi mavjud emas"))
        }
        if (user.chats.length > 0) {
            var chats = [];
            for (let i = 0; i < user.chats.length; i++) {
                chats.push(ObjectId(user.chats[i]))
            }
            Chat.find({
                "_id": {
                    $in: chats
                }
            }).then(async (results) => {
                var result = []
                let nullCounter = 0;
                if (results.length == 0) {
                    return res.status(200).json(
                        new SuccessResponse(null, "0", "SUCCESS", [])
                    );
                }
                for (let i = 0; i < results.length; i++) {
                    // console.log(results[i]);
                    var ownerData = await userModel.findById(results[i].toJSON().ownerId);
                    var userData = await userModel.findById(results[i].toJSON().user2);
                    if (!ownerData || !userData) {
                        nullCounter++;
                    } else {
                        result.push({
                            "id": results[i].id,
                            "itemId": results[i].itemId,
                            "owner": {
                                "id": ownerData.id,
                                "userName": ownerData.userName,
                                "image": ownerData.image,
                                "fcm": ownerData.fcmToken
                            },
                            "user": {
                                "id": userData.id,
                                "userName": userData.userName,
                                "image": userData.image,
                                "fcm": userData.fcmToken
                            },
                            "messages": results[i].messages
                        })
                    }
                    if (result.length == results.length - nullCounter) {
                        return res.status(200).json(
                            new SuccessResponse(null, "0", "SUCCESS", result)
                        );
                    }
                }
            }).catch(err => {
                return res.status(400).json(
                    new ErrorResponse(err, "1", "BAD_REQUEST")
                );
            })
    
        } else {
            return res.status(200).json(
                new SuccessResponse(null, "0", "SUCCESS", [])
            );
        }
    })
    .catch(error=>{
        return res.status(400).json(new ErrorResponse(error.message, "1", "BAD_REQUEST"))
    })
    //.lean().populate('chats').then(data=>res.json(data));
    // console.log("user chats: ", user);
   
}

exports.getChatsOfUserToSell = async (req, res) => {
    const {
        id,
        itemId
    } = req.query;
    Chat.find({
        "itemId": itemId,
        "ownerId": id
    }).then(async (results) => {
        var result = [];
        if (results.length == 0) {
            return res.status(200).json(
                new SuccessResponse(null, "0", "SUCCESS", [])
            );
        }
        let nullCounter = 0;
        for (let i = 0; i < results.length; i++) {
            // console.log("data ", results);
            // var parsed = JSON.parse(results);
            // console.log(Object.keys(results[0].toJSON()));
            userModel.findById(results[i].toJSON().user2).then(data => {
                // console.log("data ", data);
                if (!data) {
                    nullCounter++;
                } else {
                    result.push({
                        "id": data._id,
                        "userName": data.userName,
                        "image": data.image
                    })
                }
                // console.log("result ", result);
                if (result.length == results.length - nullCounter)
                    return res.status(200).json(
                        new SuccessResponse(null, "0", "SUCCESS", result)
                    );
            })
        }
    }).catch(err => {
        return res.status(400).json(
            new ErrorResponse(err, "1", "BAD_REQUEST")
        );
    })

}