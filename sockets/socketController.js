const {
    collection,
    chatCollection,
    userCollection,
    itemCollection,
} = require("../module/database")
const OnlineSchema = require("../module/online.js")
const {
    ObjectId
} = require("mongodb");

exports.joinToComments = (socket,roomId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let result = await collection.findOne({
                "_id": roomId
            });
            if (!result) {
                await collection.insertOne({
                    "_id": roomId,
                    messages: []
                });
            }
            socket.join(roomId);
            socket.emit("joined", roomId);
            socket.activeRoom = roomId;
            resolve();
        } catch (e) {
            reject(e);
        }
    })
}

exports.setOnline = (io, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let resultOnline = await OnlineSchema.findOneAndUpdate({}, {
                "$addToSet": {
                    "onlineUsers": data.id
                }
            }, {
                returnOriginal: false
            })
            // console.log(resultOnline);
            io.to(data.roomId).emit("user online", resultOnline ? resultOnline.onlineUsers : [])
            resolve();
        } catch (error) {
            reject(error)
        }
    })
}
exports.joinToPrivateChats = (socket, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let result = await chatCollection.findOne({
                "_id": ObjectId(data.roomId)
            });
            // if chat does not exist create new
            if (!result) {
                await chatCollection.insertOne({
                    "_id": ObjectId(data.roomId),
                    "itemId": data.itemId,
                    "ownerId": data.ownerId,
                    "user2": data.userId,
                    // "user1": {
                    //     "id": data.ownerId,
                    //     "username": data.userName1.trim(),
                    //     "image": data.ownerImage,
                    //     "fcm": data.ownerFCM,
                    // },
                    // "user2": {
                    //     "id": data.userId,
                    //     "username": data.userName2.trim(),
                    //     "image": data.userImage,
                    //     "fcm": data.userFCM,
                    // },
                    "messages": [],
                });


            }
            socket.join(data.roomId);
            socket.emit("chat joined", data.roomId);
            socket.activeRoom = data.roomId;
            resolve();
        } catch (e) {
            reject(e);
        }
    })
}

exports.createAndGetPrivateMessages = (socket, message, itemId) => {
    return new Promise(async (resolve, reject) => {
        try {
            message.id = new ObjectId()

            await chatCollection.updateOne({
                "_id": ObjectId(socket.activeRoom)
            }, {
                "$push": {
                    "messages": message
                }
            });
            await itemCollection.updateOne({
                "_id": ObjectId(itemId)
            }, {
                "$addToSet": {
                    "chats": socket.activeRoom
                }
            })
            // for user 1
            await userCollection.updateOne({
                "_id": ObjectId(message.from)
            }, {
                "$addToSet": {
                    "chats": socket.activeRoom
                }
            })
            //for user 2
            await userCollection.updateOne({
                "_id": ObjectId(message.to)
            }, {
                "$addToSet": {
                    "chats": socket.activeRoom
                }
            })
            resolve();
        } catch (error) {
            reject(error)
        }
    })

}

exports.createAndGetComments=(socket, io, message)=>{
    return new Promise(async (resolve,reject)=>{
        try {
            message.id = new ObjectId()
            // console.log(message);
            await itemCollection.updateOne({
                "_id": ObjectId(socket.activeRoom)
            }, {
                "$push": {
                    "comments": message.id
                }
            })
            //.then((data)=>//console.log(data));
            await collection.updateOne({
                "_id": socket.activeRoom
            }, {
                "$push": {
                    "messages": message
                }
            });
            var user = await userCollection.findOne({
                "_id": ObjectId(message.userId)
            })
            // console.log("user: ", user, " ", message.userId);
            if (user)
                io.to(socket.activeRoom).emit("message", {
                    "id": message.id,
                    "userName": user.userName,
                    "address": user.address,
                    "image": user.image,
                    "postedTime": message.postedTime,
                    "thumb": message.thumb,
                    "content": message.content
                });
            else {
                io.to(socket.activeRoom).emit("message", {
                    "id": message.id,
                    "userName": "O'chirilgan Profil",
                    "address": "",
                    "image": "/images/app-images/images.jpeg",
                    "postedTime": message.postedTime,
                    "thumb": message.thumb,
                    "content": message.content
                });
            }
            resolve();
        } catch (error) {
            reject(error);
        }
    })
}

exports.getMessagesFromPrivate = (socket, io, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            chatCollection.updateMany({
                    "_id": ObjectId(socket.activeRoom) || ObjectId(data.itemId),

                }, {
                    $set: {
                        "messages.$[elem].isSeen": true
                    }
                }, {
                    "arrayFilters": [{
                        "elem.to": data.userId
                    }],
                    "multi": true
                }, {
                    returnOriginal: false
                }, )
                .then(() => {
                    chatCollection.findOne({
                        "_id": ObjectId(socket.activeRoom) || ObjectId(data.itemId)
                    }).then(chats => io.to(socket.id).emit("message chats", chats.messages));
                })
        } catch (error) {
            reject(error);
        }
    })
}

exports.getComments = async (comments) => {
    // console.log("comments: ", comments);
    return new Promise(async (resolve, reject) => {
        var messages = []
        if (comments.length == 0) resolve([])
        comments.forEach(async (comment) => {
            userCollection.findOne({
                "_id": ObjectId(comment.userId)
            }).then((user) => {
                if (user)
                    messages.push({
                        "id": comment.id,
                        "userName": user.userName,
                        "address": user.address1,
                        "image": user.image,
                        "postedTime": comment.postedTime,
                        "thumb": comment.thumb,
                        "content": comment.content
                    })
                else
                    messages.push({
                        "id": comment.id,
                        "userName": "O'chirilgan Profil",
                        "address": "",
                        "image": "/images/app-images/images.jpeg",
                        "postedTime": comment.postedTime,
                        "thumb": comment.thumb,
                        "content": comment.content
                    })
                if (messages.length === comments.length) {
                    resolve(messages);
                }
            }).catch(error => reject(error))
        })
    })
}

