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
app.use(express.json());
const userRouter = require("./controller/users/userRouter");
const itemRouter = require("./controller/items/itemRouter.js");

// adding user router
app.use('/user', userRouter);

// adding item router
app.use("/item", itemRouter);

// 404 Error message
app.all('*', (req, res) => {
    res.status(401).json({
        errorCode: "1",
        errorMessage: "Xato URL"
    });
})
app.listen(process.env.PORT || 5000, () => console.log(`${process.pid} Server is listening on port ${process.env.PORT}`));
// }