const jwt = require("jsonwebtoken")

exports.ensureToken = (req, res, next) => {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(" ");
        const bearerToken = bearer[1];
        // req.token = bearerToken;
        jwt.verify(bearerToken, 'my_key', async function (err, data) {
            if (err) {
                return res.status(403).json({
                    error: err.message,
                    errorCode: "1",
                    message: "Authorization forbidden"
                })
            }
            next();
        });
        
    } else {
        res.status(403).json({
            error: "",
            errorCode: "1",
            message: "Unauthorized user"
        })
    }
}

exports.generateToken = async(req,res)=>{
    let token = jwt.sign(req.params.phoneNumber, 'my_key')
    return res.status(200).json({
        error: null,
        errorCode: "1",
        message: "Success",
        data: token
    })
}