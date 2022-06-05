const {sendImageToChannel} = require('./sniffer');
async function sendMessage(){
  await  sendImageToChannel("http://mandarinstorage.ngrok.io/images/item-images/dee9273d-be2f-4d92-be47-ad38d95eb620.jpg","first message")
}

sendMessage()