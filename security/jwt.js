const jwt = require("jsonwebtoken")

exports.ensureToken = (req, res, next) => {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(" ");
        const bearerToken = bearer[1];
        console.log(bearerToken);
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