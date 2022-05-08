const {
    modem,
    options
} = require('../controller/otp/sms')
const dotenv = require('dotenv');
dotenv.config();
const queue = 'sms-task';
const open = require('amqplib').connect(process.env.AMQP_SERVER);
// Publisher		
const publishMessage = payload => open.then(connection => connection.createChannel()).then(channel => channel.assertQueue(queue).then(() => channel.sendToQueue(queue, Buffer.from(JSON.stringify(payload))))).catch(error => console.warn(error));
// Consumer		
const consumeMessage = () => {
    open.then(connection => connection.createChannel()).then(channel => channel.assertQueue(queue).then(() => {
        console.log(' [*] Waiting for messages in %s. To exit press CTRL+C', queue);
        channel.prefetch(1)
        return channel.consume(queue, (msg) => {
            if (msg !== null) {
                const {
                    phoneNumber,
                    otp
                } = JSON.parse(msg.content)
                console.log(phoneNumber, otp);
                modem.open("/dev/ttyUSB0", options, function (err, result) {
                    if (err) {
                        console.log("error in open modem", err);
                        // channel.nack(msg);
                    }
                    if (result) {
                        console.log("modem open", result);
                    }
                });
                modem.on('open', function (open) {
                    console.log("open: ", open);
                    modem.sendSMS(phoneNumber,
                        `'Alibazar' dan ro'yxatdan o'tishdagi bir martalik mahfiy kod - ${otp}.`,
                        false,
                        function (result) {
                            console.log("sendSMS: ", result)
                        });
                });

                modem.on('onSendingMessage', (result) => {
                    console.log("sending result ", result);
                    setTimeout(() => {
                        modem.close(() => {
                            console.log("modem closed: ")
                        })
                        channel.ack(msg);
                        channel.close();
                    }, 2000)
                })
                console.log(' [x] Received %s', msg); // send email via aws ses	
                // EmailService.sendMail(mail, subject, template).then(() => {
                //     channel.ack(msg);
                // });
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