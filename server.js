const cluster = require("cluster");
const cpus = require("os").cpus
const express = require("express")
require('dotenv').config();


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
const server = require('http').createServer(app)
const io = require("socket.io")(server)

app.use(express.json());
const userRouter = require("./controller/users/userRouter");
const itemRouter = require("./controller/items/itemRouter.js");
const commentsRouter = require("./controller/comments/commentRouter.js");

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

io.on("connection", socket => {
    // either with send()
    console.log(socket.id);
    socket.emit("Hello! "+socket.id);

    // or with emit() and custom event names
    socket.emit("greetings", "Hey!", {
        "ms": "jane"
    }, Buffer.from([4, 3, 3, 1]));

    // handle the event sent with socket.send()
    socket.on("message", (data) => {
        console.log(data);
        socket.emit("greetings",`Hi ${data}`)
    });

    // handle the event sent with socket.emit()
    socket.on("salutations", (elem1, elem2, elem3) => {
        console.log(elem1, elem2, elem3);
    });
});
server.listen(process.env.PORT || 5000, () => console.log(`${process.pid} Server is listening on port ${process.env.PORT}`));
// }