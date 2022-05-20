const {
    WalletModel
} = require("../../module/wallet")
const {
    ObjectId
} = require("mongodb");
const {
    error
} = require("winston");

const createNewBalance = async (id) => {
    let wallet = new WalletModel({
        "_id": new ObjectId(id),
        history: [{
            _id: new ObjectId(),
            change_amount: 0,
            current_amount: 0,
            timeStamp: new Date().toISOString()
        }]
    })
    return new Promise(async (resolve, reject) => {
        try {
            let result = await wallet.save();
            resolve(result)
        } catch (error) {
            reject(error)
        }
    });
}

exports.getBalance = async (req, res) => {
    const {
        id
    } = req.params;
    WalletModel.findById(id).then((walletData) => {
        if (walletData) {
            return res.status(200).json({
                error: null,
                errorCode: "0",
                message: "SUCCESS",
                data: walletData,
                currentBalance: walletData.history[0].current_amount
            })
        } else {
            createNewBalance(id).then((result) => res.status(200).json({
                    error: null,
                    errorCode: "0",
                    message: "SUCCESS",
                    data: result
                }))
                .catch((err) => {
                    console.log(err);
                    throw err
                });
        }
    }).catch(error => {
        return res.status(400).json({
            error: error,
            errorCode: "2",
            message: "BAD_REQUEST"
        });
    })
}

exports.updateBalance = async (req, res) => {
    const {
        id
    } = req.params;
    const {
        amount
    } = req.body;

    WalletModel.findById(id).then((walletData) => {
        if (walletData) {

            let newHistory = {
                _id: new ObjectId(),
                change_amount: Number(amount),
                current_amount: walletData.history[0].current_amount + Number(amount),
                timeStamp: new Date().toISOString()
            }
            // console.log(newHistory);
            // if(walletData.history.length>50){
            //     walletData.history.pop()
            // }
            walletData.history.unshift(newHistory);
            walletData.save().then(result => {
                return res.status(200).json({
                    error: null,
                    errorCode: "0",
                    message: "SUCCESS",
                    data: result,
                    currentBalance: newHistory.current_amount
                })
            }).catch(err => {
                console.log(err);
                throw err
            });

        } else {
            createNewBalance(id).then((result) => res.status(200).json({
                    error: null,
                    errorCode: "0",
                    message: "SUCCESS",
                    data: result
                }))
                .catch((err) => {
                    console.log(err);
                    throw err
                });
        }
    }).catch(error => {
        return res.status(400).json({
            error: error,
            errorCode: "2",
            message: "BAD_REQUEST"
        });
    })
}