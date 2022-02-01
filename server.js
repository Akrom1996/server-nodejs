const cluster = require("cluster");
const cpus = require("os").cpus
const express = require("express")
require('dotenv').config();
const {
    ObjectId
} = require("mongodb");
const {
    collection,
    chatCollection,
    userCollection,
    itemCollection,

} = require("./module/database")
const OnlineSchema = require("./module/online.js")
const {
    v4
} = require("uuid")

const {
    admin
} = require('./controller/firebase/getToken')


const path = require("path")
const morgan = require("morgan")
const fs = require("fs")
const accessLogStream = fs.createWriteStream(path.join(__dirname, "access.log"), {
    flags: 'a'
})
const {
    createClient
} = require("redis");
const {
    createAdapter
} = require("@socket.io/redis-adapter");

if (cluster.isMaster) {

    var server = require('http').createServer();
    var io = require('socket.io')(server);


    var redis = require('socket.io-redis');
    io.adapter(redis({
        host: process.env.HOST,
        port: 6379
    }));
 
    // const pubClient = createClient({
    //     url: "redis://localhost:6379"
    // });
    // const subClient = pubClient.duplicate();
    // io.adapter(createAdapter(pubClient, subClient));

    for (let i = 0; i < cpus().length; i++) {
        cluster.fork()

    }
    cluster.on('exit', (worker, code, signal) => {
        //console.log(`worker ${worker.process.pid} died`);
        // cluster.fork()
    });
} else if (cluster.isWorker) {
    const app = express()
    app.use(express.json())
    app.use(morgan('common', {
        stream: accessLogStream
    }))
    const server = require('http').createServer(app)
    const io = require("socket.io")(server)


    var redis = require('socket.io-redis');
    io.adapter(redis({
        host: process.env.HOST,
        port: 6379
    }));

    // const pubClient = createClient({
    //     url: "redis://localhost:6379"
    // });
    // const subClient = pubClient.duplicate();

    // io.adapter(createAdapter(pubClient, subClient));

    const userRouter = require("./controller/users/userRouter");
    const itemRouter = require("./controller/items/itemRouter.js");
    const fcmRouter = require("./controller/firebase/notificationRouter");
    const commentsRouter = require("./controller/comments/commentRouter.js");
    const chatsRouter = require("./controller/chats/chatsRouter.js");
    const messagesRouter = require("./controller/adminNotifications/adminNotificationRouter.js");
    const priceRouter = require("./controller/pricelist/priceRouter.js");
    const download = require("./controller/document/documentation.js");
    const otp = require("./controller/otp/otpRouter.js");
    const complainRouter = require("./controller/complain/complainRouter.js")
    const jwtRouter = require("./security/jwtRouter.js")

    // adding user router
    app.use('/user', userRouter);

    // adding item router
    app.use("/item", itemRouter);

    app.use("/fcm", fcmRouter);

    // adding comments router
    app.use("/comments", commentsRouter);

    app.use("/chats", chatsRouter);

    // document
    app.use("/messages", messagesRouter);

    //otp
    app.use("/otp", otp)

    //adding price data 
    app.use("/price", priceRouter);

    // download user guide
    app.use("/file", download);

    //make compilation
    app.use("/complain", complainRouter)

    //generate jwt
    app.use("/jwt", jwtRouter)

    // 404 Error message
    app.all('*', (req, res) => {
        res.status(401).json({
            errorCode: "1",
            message: "Xato URL"
        });
    })


    const getMessages = async (comments) => {
        // console.log("comments: ", comments);
        return new Promise((resolve, reject) => {
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
                })
            })
        })
    }

    io.on("connection", (socket) => {
        // join to comments
        socket.on("join", async (roomId) => {
            //console.log("join ", roomId);
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
                console.log("joined ", roomId);
                socket.join(roomId);
                socket.emit("joined", roomId);
                socket.activeRoom = roomId;
            } catch (e) {
                console.error(e);
            }
        });


        socket.on("set online", async (data) => {
            // set online
            let resultOnline = await OnlineSchema.findOneAndUpdate({}, {
                "$addToSet": {
                    "onlineUsers": data.id
                }
            }, {
                returnOriginal: false
            })
            // console.log(resultOnline);
            io.to(data.roomId).emit("user online", resultOnline ?resultOnline.onlineUsers :[])

        })

        // join to private chats
        socket.on("chat join", async (data) => {
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
            } catch (e) {
                console.error(e);
            }
        });

        // create and get private chat messages
        socket.on("chat message", async (message, itemId, fcmToken) => {
            //console.log(message, " ", itemId);
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
            // firebase cloud messaging here
            const options = {
                priority: "high",
                timeToLive: 60 * 60 * 24
            };
            const fcmMessage = {
                notification: {
                    title: "message",
                    body: message.content,
                    image: `http://${process.env.HOST}:${process.env.MINIO_PORT}/p2p-market/images/app-images/carrot.png` //9bf98691-8225-4e3c-93f0-75b61d9ebbc1.jpg`
                },
                data: {
                    type: "/message_screen",
                },

            };
            //if fcm token user is not online send message notification
            let usersOnline = await OnlineSchema.findOne({});
            //console.log(usersOnline);
            if (fcmToken) {
                !usersOnline.onlineUsers.includes(message.to) ?
                    admin.messaging().sendToDevice(fcmToken, fcmMessage, options).then(data => console.log(data)).catch(err => console.log(err)) : null;
                console.log("sending to ", !usersOnline.onlineUsers.includes(message.to) ? fcmToken : null);
            }
            io.to(socket.activeRoom).emit("chat message", message);
        });

        // get messages from private chats
        socket.on("get chats", async (data) => {

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

        })

        // create and get messages from comments
        socket.on("message", async (message) => {
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
        });

        // get messages from comments
        socket.on("get comments", async (data) => {
            // console.log(socket.id, " ", socket.activeRoom || data); //socket.activeRoom is replaced with data
            var comments = await collection.findOne({
                "_id": socket.activeRoom || data
            })
            var messages = [];
            messages = await getMessages(comments.messages);
            // .then((messages) => {
            io.to(socket.id).emit("message comments", messages);
            // })
        })

        socket.on("dis join", async (data) => {
            //console.log("deleting socket ", data.id, " ", data.roomId);
            // onlineUsers.delete(data.id);
            // //console.log(onlineUsers);
            // //console.log("roomid ", data.roomId);
            let resultOnline = await OnlineSchema.findOneAndUpdate({}, {
                "$pullAll": {
                    "onlineUsers": [data.id]
                }
            }, {
                returnOriginal: false
            }) //Array.from(
            //console.log(resultOnline);
            socket.to(data.roomId).emit("user online", resultOnline.onlineUsers)
        })

    });
    server.listen(process.env.PORT || 5000, async () => {
        console.log(`${process.pid} Server is listening on port ${process.env.PORT}`);
        try {

            console.log("Listening on port :%s...", server.address().port);
        } catch (e) {
            console.error(e);
        }
    });
}