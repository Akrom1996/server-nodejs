const {
  sendImageToChannel
} = require('./sniffer');
const itemModel = require('../module/Item');

const request = require("request")
async function sendMessage() {
  // await  sendImageToChannel("192.168.0.200:9000/p2p-market/images/item-images/dee9273d-be2f-4d92-be47-ad38d95eb620.jpg","first message").catch(error=>console.log(error))
  const items = itemModel.find().then(result=>{
    console.log(result)
  }).catch(err=>{
    console.log(err)
  })
  // request.post("https://api.telegram.org/bot5498177893:AAHSJBliqBCaDIKtzhjPThqTDXmZByLAmN4/sendPhoto?chat_id=-1001373544642&photo=192.168.0.200:9000/p2p-market/images/item-images/dee9273d-be2f-4d92-be47-ad38d95eb620.jpg&caption=firstmessage", (err, res, body) => {
  //   if (err) {
  //     console.error(err) 
  //     return
  //   }
  //   console.log(body)
  // })
}

sendMessage()