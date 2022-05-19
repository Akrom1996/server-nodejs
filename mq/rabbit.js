const {
    modem,
    options
} = require('../controller/otp/sms')
const dotenv = require('dotenv');
dotenv.config();
const queue = 'sms-task';
const open = require('amqplib').connect(process.env.AMQP_SERVER);
// Publisher		
const publishMessage = payload => open.then(connection => connection.createChannel())
    .then(channel => channel.assertQueue(queue)
        .then(() => channel.sendToQueue(queue, Buffer.from(JSON.stringify(payload)))))
    .catch(error => console.warn(error));
// Consumer		
const consumeMessage = () => {
    open.then(connection => connection.createChannel()).then(channel => channel.assertQueue(queue).then(() => {
        console.log(`[*] Waiting for messages from ${queue}.`)
        channel.prefetch(1)
        return channel.consume(queue, (msg) => {
            if (msg !== null) {
                const {
                    phoneNumber,
                    otp
                } = JSON.parse(msg.content)
                modem.open("/dev/ttyUSB0", options, function (err, result) {
                    if (err) {
                        console.log("error in open modem", err);
                    }
                    if (result) {
                        // console.log("modem open", result);
                        modem.sendSMS(phoneNumber,
                            `'Mandarin' dan ro'yxatdan o'tishdagi bir martalik mahfiy kod - ${otp}.`,
                            false,
                            function (result) {
                                // console.log("sendSMS: ", result);
                                if(result.data.recipient != undefined){
                                    modem.close(() => {
                                        console.log("modem closed: sent sms to %s, otp is %s",result.data.recipient, otp)
                                        try {
                                            channel.ack(msg);
                                        } catch (error) {
                                            console.log(error);
                                        }

                                    })
                                }
                            
                            });
                    }
                });
            }
        }, {
            noAck: false
        });
    })).catch(error => console.warn(error));
};
module.exports = {
    publishMessage,
    consumeMessage
}