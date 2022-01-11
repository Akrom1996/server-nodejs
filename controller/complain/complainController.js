const {complainModel} = require("../../module/complain")
exports.makeComplain = async (req,res)=>{
    var complain = new complainModel(req.body);
    complain.save().then(result=>{
        return res.status(200).json({
            error: null,
            errorCode: "0",
            message: "SUCCESS",
            data: result,
        })
    }).catch(err=>{
        return res.status(400).json({
            error: err,
            errorCode: "1",
            message: "BAD_REQUEST"
        })
    })
}

exports.checkComplain = async (req,res)=>{
    const {complainerId, userId} = req.query;
    complainModel.find({
        "complainerId": complainerId,
        "userId":userId
    }).then(result=>{
        return res.status(200).json({
            error: null,
            errorCode: "0",
            message: "SUCCESS",
            data: result,
        })
    }).catch(err=>{
        return res.status(400).json({
            error: err,
            errorCode: "1",
            message: "BAD_REQUEST"
        })
    })
}