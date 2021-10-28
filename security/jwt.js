const jwt = require("jsonwebtoken")

exports.ensureToken = (req, res, next)=>{
    const bearerHeader = req.headers['authorization'];
    if(typeof bearerHeader !== 'undefined'){
        const bearer = bearerHeader.split(" ");
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    }   else{
        res.status(403).json({
            error: "",
            errorCode: "1",
            message: "Unauthorized user"
        })
    }
}