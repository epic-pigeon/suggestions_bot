const Telegram = require('telegram-bot-api');
const CHANNEL_ID = "fridrixxx";
const GROUP_ID = -1001366233526;
const blocked = [];

Array.prototype.remove = function() {
    let what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

let args = {};
for (let arg of process.argv.slice(2)) {
    let arr = arg.split("=");
    if (arr.length === 1) {
        args[arr[1]] = "";
    } else {
        for (let key of arr.slice(0, arr.length - 1)) {
            args[key] = arr[arr.length - 1];
        }
    }
}
if (args.debug === 'true') console.log(args);

const api = new Telegram({
    token: '830368677:AAFV5f2EtaGi1BQ-tuLeUM_U5FhQZbDKHrs',
    updates: {
        enabled: true
    }
});

function replyToMessage(msg, text) {
        api.sendMessage({
            chat_id: msg.chat.id,
            text: text,
            reply_to_message_id: msg.message_id
        }).catch(console.log);
}

const CommandProcessor = new (require('./commandsprocessor'))([
    {
        name: "help",
        description: "Helps with understanding commands :)",
        usage: "help ?command",
        action: function (msg, arguments, self) {
            if (arguments.length === 0) {
                let string = 'All commands list:\n\t';
                let commandNames = [];
                self.commands.forEach(command => {commandNames.push(command.name)});
                string += commandNames.join('\n\t');
                replyToMessage(msg, string);
            } else if (arguments.length === 1) {
                let command = arguments[0].value;
                let commandObject;
                self.commands.forEach(comm => {
                    if (comm.name === command.toLowerCase()) commandObject = comm;
                });
                if (typeof commandObject === "undefined") throw {message: "Such a command doesn't exist"};
                let string = "Command name: " + commandObject.name + "\nCommand description: " + commandObject.description + "\nCommand usage: " + commandObject.usage + (commandObject.adminOnly ? "\nAdmin only!" : "");
                replyToMessage(msg, string)
            }
        }
    },
    {
        name: "block",
        description: "Restricts user from sending suggestions",
        usage: "block <user id>",
        action: function (msg, arguments, self) {
            if (arguments.length === 0) {
                replyToMessage(msg, "Not enough arguments!")
            } else {
                let toBlock = arguments[0].value;
                if (!isNaN(parseInt(toBlock))) {
                    blocked.push(parseInt(toBlock));
                    replyToMessage(msg, "User with ID " + toBlock + " blocked!")
                } else replyToMessage(msg,"Wrong 1st argument type");
            }
        }
    },
    {
        name: "unblock",
        description: "Returns the right to send messages",
        usage: "unblock <user id>",
        action: function (msg, arguments, self) {
            if (arguments.length === 0) {
                replyToMessage(msg, "Not enough arguments!")
            } else {
                let toBlock = arguments[0].value;
                if (!isNaN(parseInt(toBlock))) {
                    if (blocked.some(id => id == message.chat.id)) {
                        blocked.remove(parseInt(toBlock));
                        replyToMessage(msg, "User with ID " + toBlock + " unblocked!")
                    } else {
                        replyToMessage(msg, "User with ID " + toBlock + " is not blocked!")
                    }
                } else replyToMessage("Wrong 1st argument type");
            }
        }
    }
]);

api.on('message', function (message) {
    if (args.debug === 'true') console.log(message);
    if (message.chat.type === "private") {
        if (message.text !== "/start") {
            if (args.debug === 'true') console.log(blocked);
            if (args.debug === 'true') console.log(message.chat.id);
            if (args.debug === 'true') console.log(blocked.some(id => id == message.chat.id));
            if (!blocked.some(id => id == message.chat.id)) {
                replyToMessage(message, "Спасибо за предложение!");
                api.forwardMessage({
                    chat_id: GROUP_ID,
                    from_chat_id: message.chat.id,
                    message_id: message.message_id
                }).then(function(data) {
                    if (args.debug === 'true') console.log(data);
                        api.sendMessage({
                            chat_id: GROUP_ID,
                            text: "Предложение от " + generateString(message.chat),
                            reply_to_message_id: data.message_id
                        }).catch(console.log);
                }).catch(console.log);
            } else {
                replyToMessage(message, "Вы заблокированы! Обращайтесь к админам @" + CHANNEL_ID)
            }
        } else api.sendMessage({
            chat_id: message.chat.id,
            text: "Здравствуйте!\nЭто бот-предложка канала Фридрих IV (@" + CHANNEL_ID + ").\nКидайте сюда свои смехуечки.",
        }).catch(console.log)
    } else if (message.chat.id == GROUP_ID) {
        if (message.text.startsWith("/")) {
            let command = message.text.slice(1);
            CommandProcessor.process(command, message);
        }
    }
});

function generateString(chat) {
    let message = "";
    if (chat.first_name) message += chat.first_name + " ";
    if (chat.last_name) message += chat.last_name + " ";
    if (chat.username) message += "@" + chat.username + " ";
    if (chat.id) message += "(id: " + chat.id + ") ";
    return message;
}