const {
    complainModel
} = require("../../module/complain")

const {
    ErrorResponse,
    SuccessResponse
} = require("../../response/Response")
exports.makeComplain = async (req, res) => {
    var complain = new complainModel(req.body);
    complain.save().then(result => {
        return res.status(200).json(
            new SuccessResponse(null, "0", "SUCCESS", result)
        )
    }).catch(error => {
        return res.status(400).json(new ErrorResponse(error, "1", "BAD_REQUEST"))
    })
}

exports.checkComplain = async (req, res) => {
    const {
        complainerId,
        userId
    } = req.query;
    complainModel.find({
        "complainerId": complainerId,
        "userId": userId
    }).then(result => {
        return res.status(200).json(
            new SuccessResponse(null, "0", "SUCCESS", result)
        )
    }).catch(error => {
        return res.status(400).json(new ErrorResponse(error, "1", "BAD_REQUEST"))
    })
}