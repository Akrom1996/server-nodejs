const connection = require("../../module/database");
const userModel = require('../../module/User');
require('dotenv').config();
// const Chat = require("../../module/Chat");
const {
    MongoClient,
} = require("mongodb");

const client = new MongoClient("mongodb://localhost:27017/myKarrot");
client.connect();
const db = client.db("myKarrot");
chatCollection = db.collection("chats");
// ishlatilmaydi
exports.getChats = async (req, res) => {
    console.log(req.params);
    chatCollection.findOne({
            "_id": req.params.id
        })
        .then((data) => {
            console.log(data)
            return res.status(200).json({
                error: null,
                errorCode: "0",
                message: "SUCCESS",
                data: data
            });
        })
        .catch((err) => {
            console.log(err.message);
            return res.status(400).json({
                error: err,
                errorCode: "1",
                message: "BAD_REQUEST",
            });
        });
}

exports.getChatsOfUser = async (req, res) => {
    var results = [];
    let count = 0;
    console.log(req.params.id);
    var user = await userModel.findById(req.params.id);
    console.log("user ", user);
    if (user.chats.length > 0) {
        await user.chats.forEach(async (i) => {
            var chat = await chatCollection.findOne({
                "_id": i
            })
            // delete chat.messages;
            results.push(chat);
            // console.log("chat: ", chat);
            count++;
            if (count === user.chats.length) {
                return res.status(200).json({
                    error: null,
                    errorCode: "0",
                    message: "SUCCESS",
                    data: results
                });
            }
        })
    } else {
        return res.status(200).json({
            error: null,
            errorCode: "0",
            message: "SUCCESS",
            data: []
        });
    }


    // .then((data) => {
    //     obj.push(data.chats.forEach((i) => chatCollection.findOne({
    //         "_id": i
    //     }).then((response) => response).catch((err) => {
    //         return res.status(400).json({
    //             error: err,
    //             errorCode: "1",
    //             message: "BAD_REQUEST",
    //         });
    //     })))
    //     console.log(obj);
    // }).catch((err) => {
    //     return res.status(400).json({
    //         error: err,
    //         errorCode: "1",
    //         message: "BAD_REQUEST",
    //     });
    // });
}