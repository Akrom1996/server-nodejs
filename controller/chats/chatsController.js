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
            return res.status(200).json({
                error: null,
                errorCode: "0",
                message: "SUCCESS",
                data: data
            });
        })
        .catch((err) => {
            //console.log(err.message);
            return res.status(400).json({
                error: err,
                errorCode: "1",
                message: "BAD_REQUEST",
            });
        });
}

exports.getChatsOfUser = async (req, res) => {
    // var results = [];
    // let count = 0;
    const {
        id,
        itemId
    } = req.query;
    console.log(req.query);
    if (!itemId) {
        var user = await userModel.findById(id) //.lean().populate('chats').then(data=>res.json(data));
        console.log("user chats: ", user.chats);
        if (user.chats.length > 0) {
            var chats = [];
            for (let i = 0; i < user.chats.length; i++) {
                chats.push(ObjectId(user.chats[i]))
            }
            console.log(chats);
            Chat.find({
                "_id": {
                    $in: chats
                }
            }).then(async (results) => {
                console.log("results: ", results);
                var result = []
                for (let i = 0; i < results.length; i++) {
                    var ownerData = await userModel.findById(results[i].ownerId);
                    result.push({
                        "id": results[i].id,
                        "itemId": results[i].itemId,
                        "owner": {
                            "id": ownerData.id,
                            "userName": ownerData.userName,
                            "image": ownerData.image,
                            "fcm": ownerData.fcmToken
                        },
                        "userId": user.id,
                        // {
                        //     "id": user.id,
                        //     "userName": user.userName,
                        //     "image": user.image
                        // },
                        "messages": results[i].messages
                    })
                    if (result.length == results.length) {
                        return res.status(200).json({
                            error: null,
                            errorCode: "0",
                            message: "SUCCESS",
                            data: result

                        });
                    }
                }


            }).catch(err => {
                return res.status(400).json({
                    error: err,
                    errorCode: "1",
                    message: "BAD_REQUEST",
                });
            })
            // await user.chats.forEach(async (i) => {
            //     var chat;
            //     if (itemId) {
            //         chat = await chatCollection.findOne({
            //             "_id": i
            //         })
            //     } else {
            //         chat = await chatCollection.findOne({
            //             "_id": i,
            //             "itemId": itemId
            //         })
            //     }
            //     // delete chat.messages;
            //     results.push(chat);
            //     // //console.log("chat: ", chat);
            //     count++;
            //     if (count === user.chats.length) {
            //         return res.status(200).json({
            //             error: null,
            //             errorCode: "0",
            //             message: "SUCCESS",
            //             data: results
            //         });
            //     }
            // })
        } else {
            return res.status(200).json({
                error: null,
                errorCode: "0",
                message: "SUCCESS",
                data: []
            });
        }
    }else{
        
    }
}