const cluster = require("cluster");
const cpus = require("os").cpus
const express = require("express")
require('dotenv').config();


const {collection}  = require("./module/database")
const {
    admin
} = require('./controller/firebase/getToken')
const OnlineSchema = require("./module/online.js")


const path = require("path")
const morgan = require("morgan")
const fs = require("fs")
const accessLogStream = fs.createWriteStream(path.join(__dirname, "access.log"), {
    flags: 'a'
})
// const {
//     createClient
// } = require("redis");
// const {
//     createAdapter
// } = require("@socket.io/redis-adapter");
const {
    getComments,
    getMessagesFromPrivate,
    createAndGetPrivateMessages,
    joinToComments,
    joinToPrivateChats,
    setOnline,
    createAndGetComments
} = require("./sockets/socketController")

if (cluster.isMaster) {
    const {
        consumeMessage,
        consumeMessageAdvert
    } = require("./mq/rabbit")
    consumeMessage("sms-task")
    consumeMessageAdvert("advert-task")
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
    const walletRouter = require("./controller/wallet/walletRouter")
    const advertRouter = require("./controller/sentAdverts/advertRouter")
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

    //user wallet
    app.use("/wallet", walletRouter)

    //advert sent
    app.use("/adverts", advertRouter)

    //generate jwt
    app.use("/jwt", jwtRouter)

    // 404 Error message
    app.all('*', (req, res) => {
        res.status(401).json({
            errorCode: "1",
            message: "Xato URL"
        });
    })




    io.on("connection", (socket) => {
        // join to comments
        socket.on("join", async (roomId) => {
            //console.log("join ", roomId);
            await joinToComments(socket,roomId)
        });

        socket.on("set online", async (data) => {
            // set online
            await setOnline(io, data);
        })

        // join to private chats
        socket.on("chat join", async (data) => {
            await joinToPrivateChats(socket, data)
        });

        // create and get private chat messages
        socket.on("chat message", async (message, itemId, fcmToken) => {
            //console.log(message, " ", itemId);
            await createAndGetPrivateMessages(socket, message, itemId)
            // firebase cloud messaging here
            const options = {
                priority: "high",
                timeToLive: 60 * 60 * 24
            };
            const fcmMessage = {
                notification: {
                    title: "message",
                    body: message.content,
                    image: `http://${process.env.HOST}:${process.env.MINIO_PORT}/p2p-market/images/app-images/logo.png` //9bf98691-8225-4e3c-93f0-75b61d9ebbc1.jpg`
                },
                data: {
                    type: "message",
                    click_action: "FLUTTER_NOTIFICATION_CLICK",
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

            await getMessagesFromPrivate(socket, io, data);

        })

        // create and get messages from comments
        socket.on("message", async (message) => {
            await createAndGetComments(socket,io,message);
        });

        // get messages from comments
        socket.on("get comments", async (data) => {
            // console.log(socket.id, " ", socket.activeRoom || data); //socket.activeRoom is replaced with data
            var comments = await collection.findOne({
                "_id": socket.activeRoom || data
            })
            var messages = [];
            messages = await getComments(comments.messages);
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