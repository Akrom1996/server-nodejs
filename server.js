const cluster = require("cluster");
const cpus = require("os").cpus
const express = require("express")
require('dotenv').config();
const {
    MongoClient,
    ObjectId
} = require("mongodb");
const {
    collection,
    chatCollection,
    userCollection,
    itemCollection
} = require("./module/database")

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

// if (cluster.isMaster) {

//     for (let i = 0; i < cpus().length; i++) {
//         cluster.fork()

//     }
//     cluster.on('exit', (worker, code, signal) => {
//         console.log(`worker ${worker.process.pid} died`);
//         // cluster.fork()
//     });
// } else {
const app = express()
app.use(express.json())
app.use(morgan('dev', /*{stream: accessLogStream}*/ ))

const server = require('http').createServer(app)
const io = require("socket.io")(server)


const userRouter = require("./controller/users/userRouter");
const itemRouter = require("./controller/items/itemRouter.js");
const commentsRouter = require("./controller/comments/commentRouter.js");
const chatsRouter = require("./controller/chats/chatsRouter.js");

// adding user router
app.use('/user', userRouter);

// adding item router
app.use("/item", itemRouter);

// adding comments router
app.use("/comments", commentsRouter);

app.use("/chats", chatsRouter);


// 404 Error message
app.all('*', (req, res) => {
    res.status(401).json({
        errorCode: "1",
        errorMessage: "Xato URL"
    });
})

let onlineUsers = new Set();

io.on("connection", (socket) => {
    // join to comments
    socket.on("join", async (roomId) => {
        console.log("join ", roomId);
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
        } catch (e) {
            console.error(e);
        }
    });

    // join to private chats
    socket.on("chat join", async (data) => {
        try {
            let result = await chatCollection.findOne({
                "_id": data.roomId
            });
            if (!result) {
                await chatCollection.insertOne({
                    "_id": data.roomId,
                    "itemId": data.itemId,
                    "ownerId": data.ownerId,
                    "user1": {
                        "id": data.ownerId,
                        "username": data.userName1.trim(),
                        "image": data.ownerImage,
                        "fcm": data.ownerFCM,
                    },
                    "user2": {
                        "id": data.userId,
                        "username": data.userName2.trim(),
                        "image": data.userImage,
                        "fcm": data.userFCM,
                    },
                    "messages": [],
                });


            }
            // set online
            onlineUsers.add(data.userId);
            socket.join(data.roomId);
            console.log("Online users", onlineUsers, " ", data.ownerId);
            socket.to(data.roomId).emit("user online", onlineUsers)
            socket.emit("chat joined", data.roomId);
            socket.activeRoom = data.roomId;
        } catch (e) {
            console.error(e);
        }
    });

    socket.on("set online", (id) => {
        onlineUsers.add(id)
    })

    // create and get messages from comments
    socket.on("message", async (message) => {
        message.id = new ObjectId()
        console.log(message);
        itemCollection.updateOne({
            "_id": ObjectId(socket.activeRoom)
        }, {
            "$push": {
                "comments": message.id
            }
        })
        //.then((data)=>console.log(data));
        collection.updateOne({
            "_id": socket.activeRoom
        }, {
            "$push": {
                "messages": message
            }
        });
        io.to(socket.activeRoom).emit("message", message);
    });

    // create and get private chat messages
    socket.on("chat message", async (message, itemId, fcmToken) => {
        console.log(message, " ", itemId);
        message.id = new ObjectId()

        await chatCollection.updateOne({
            "_id": socket.activeRoom
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
        const fcm = {
            notification: {
                title: message.toUserName,
                body: message.content,
                imageUrl: `http://localhost:9000/p2p-market/images/item-images/9bf98691-8225-4e3c-93f0-75b61d9ebbc1.jpg`
            },
            data: {
                type: "/message_screen",
            },

        };
        console.log("sending to ", fcmToken);
        io.to(socket.activeRoom).emit("chat message", message);
        //if fcm token user is not online send message notification
        !onlineUsers.has(message.to) ?
            admin.messaging().sendToDevice(fcmToken, fcm, options).then(data => console.log(data)).catch(err => console.log(err)) : null;

    });

    // get messages from private chats
    socket.on("get chats", async (data) => {
        console.log(socket.id, " ", socket.activeRoom || data.itemId); //socket.activeRoom is replaced with data
        // chatCollection.findOne({
        //     "_id": socket.activeRoom || data.itemId
        // }).then((chats) => {
        //     // console.log("chats ",chats);
        //     // var messages =[];
        //     //  chats.messages.forEach((element)=>{
        //     //     if(element.from != data.userId){
        //     //         console.log("elem: ", element);
        //     //         element.isSeen = true;
        //     //         messages.push(element); 
        //     //     }
        //     //     else{
        //     //         messages.push(element)
        //     //     }
        //     // })
        //     // console.log("messages ", messages);

        //     io.to(socket.id).emit("message chats", chats.messages);
        // })
        console.log(data);
        chatCollection.updateMany({
                "_id": socket.activeRoom || data.itemId,

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
                    "_id": socket.activeRoom || data.itemId
                }).then(chats => io.to(socket.id).emit("message chats", chats.messages));
            })

    })

    // get messages from comments
    socket.on("get comments", async (data) => {
        console.log(socket.id, " ", socket.activeRoom || data); //socket.activeRoom is replaced with data
        collection.findOne({
            "_id": socket.activeRoom || data
        }).then((comments) => {
            io.to(socket.id).emit("message comments", comments.messages);
        })

    })

    socket.on("dis join", (data) => {
        console.log("deleting socket ", data.id, " ", data.roomId);
        onlineUsers.delete(data.id);
        console.log(onlineUsers);
        console.log("roomid ", data.roomId);
        socket.to(data.roomId).emit("user online", onlineUsers)
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
// }