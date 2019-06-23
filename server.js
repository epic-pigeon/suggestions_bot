const Telegram = require('telegram-bot-api');
const CHANNEL_ID = "fridrixxx";
const GROUP_ID = -1001366233526;

const api = new Telegram({
    token: '830368677:AAFV5f2EtaGi1BQ-tuLeUM_U5FhQZbDKHrs',
    updates: {
        enabled: true
    }
});

api.on('message', function (message) {
    console.log(message);
    if (message.chat.type === "private") {
        if (message.text !== "/start") {
            api.sendMessage({
                chat_id: message.chat.id,
                text: "Спасибо за предложение!",
                reply_to_message_id: message.message_id
            });
            api.sendMessage({
                chat_id: GROUP_ID,
                text: "Предложение от " + generateString(message.chat, message.from)
            });
            api.forwardMessage({
                chat_id: GROUP_ID,
                from_chat_id: message.chat.id,
                message_id: message.message_id
            });
        } else api.sendMessage({
            chat_id: message.chat.id,
            text: "Здравствуйте!\nЭто бот-предложка канала Фридрих IV (@" + CHANNEL_ID + ").\nКидайте сюда свои смехуечки.",
        })
    }
});

function generateString(chat, from) {
    let message = "";
    if (chat.first_name) message += chat.first_name + " ";
    if (chat.last_name) message += chat.last_name + " ";
    if (chat.username) message += "@" + chat.username + " ";
    return message;
}