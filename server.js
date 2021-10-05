const cluster = require("cluster");
const cpus = require("os").cpus
const express = require("express")
require('dotenv').config();
const {
    MongoClient,
    ObjectId
} = require("mongodb");
const client = new MongoClient("mongodb://localhost:27017/myKarrot");
const {
    v4
} = require("uuid")


// if(cluster.isMaster){

//     for(let i = 0; i < cpus().length;i++){
//         cluster.fork()

//     }
//     cluster.on('exit', (worker, code, signal) => {
//         console.log(`worker ${worker.process.pid} died`);
//         // cluster.fork()
//       });
// }else{
const app = express()
app.use(express.json());

const server = require('http').createServer(app)
const io = require("socket.io")(server)


const userRouter = require("./controller/users/userRouter");
const itemRouter = require("./controller/items/itemRouter.js");
const commentsRouter = require("./controller/comments/commentRouter.js");
const {
    WebSocketServer
} = require("ws");
// adding user router
app.use('/user', userRouter);

// adding item router
app.use("/item", itemRouter);

// adding comments router
app.use("/comments", commentsRouter);


// 404 Error message
app.all('*', (req, res) => {
    res.status(401).json({
        errorCode: "1",
        errorMessage: "Xato URL"
    });
})

io.on("connection", (socket) => {
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
            console.log("emitting join");
            socket.emit("joined", roomId);
            socket.activeRoom = roomId;
        } catch (e) {
            console.error(e);
        }
    });

    socket.on("message", async (message) => {
        message.id = v4()
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

    socket.on("get comments", async (data) => {
        console.log(socket.id, " ", socket.activeRoom || data); //socket.activeRoom is replaced with data
        collection.findOne({
            "_id": socket.activeRoom || data
        }).then((comments) => {
            io.to(socket.id).emit("message comments", comments.messages);
        })

    })

});
server.listen(process.env.PORT || 5000, async () => {
    console.log(`${process.pid} Server is listening on port ${process.env.PORT}`);
    try {
        await client.connect();
        const db = client.db("myKarrot");
        collection = db.collection("comments1");
        itemCollection = db.collection("items");
        console.log("Listening on port :%s...", server.address().port);
    } catch (e) {
        console.error(e);
    }
});
// }