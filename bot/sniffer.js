require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.BOT_TOKEN||"5498177893:AAHSJBliqBCaDIKtzhjPThqTDXmZByLAmN4";
console.log(token);
// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});
const channelId = process.env.CHANNEL_ID||"-1001689263482";
exports.sendImageToChannel = (image, text) => {
    return new Promise((resolve, reject) => {
        try {
            bot.sendPhoto(channelId, image, {
                caption: text
            })
        } catch (error) {
            reject(error)
        }
    })
}