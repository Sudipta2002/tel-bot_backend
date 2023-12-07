const { Telegraf, Input } = require('telegraf');
const { message } = require('telegraf/filters');
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const {
    createChannel,
    publishMessage,
    subscribedMessage
} = require('./messageQueue/queue');
const { BINDING_KEY } = require('./config/serverConfig');
const connectDB = require('./config/dbConfig');
const Messages = require('./models/messageModel');

const app = express();
const bot = new Telegraf("6790884283:AAEhKliCKEfIc1wqYGc4K9W8cGX6_szxiig");
let websocketServer = null;
bot.start((ctx) => ctx.reply("Welcome to BOT World!"));
bot.help((ctx) => ctx.reply('Send me a sticker'));

bot.on(message('sticker'), async(ctx) => await ctx.replyWithPhoto(Input.fromURL("https://shorturl.at/ackK0")));
bot.command('echo', ctx => {
    const message = ctx.message.text.split(' ');
    message.shift();
    ctx.reply(message.join(' '));
});

// const subs = async() => {
//     const channel = await createChannel();
//     subscribedMessage(channel, undefined, BINDING_KEY);
// }
// subs();
const server = http.createServer(app);
// Create WebSocket server
websocketServer = new WebSocket.Server({ server });
// WebSocket connection handler
websocketServer.on('connection', (ws) => {
    // Handle new WebSocket connection
    console.log('New WebSocket connection');

    // Send a welcome message to the client
    ws.send('Welcome to the WebSocket server');
    // Fetch previous messages from MongoDB and send them to the client
    // Messages.find({}, 'message', (error, messages) => {
    //     if (error) {
    //         console.error('Error fetching previous messages:', error);
    //         return;
    //     }
    //     console.log(messages);
    //     messages.forEach((message) => {
    //         ws.send(message.content);
    //     });
    // });
    Messages.find().then((messages) => {
            console.log(messages);
            messages.forEach((message) => {
                ws.send(message.message);
            });
        })
        // Handle WebSocket disconnection
    ws.on('close', () => {
        console.log('WebSocket connection closed');
    });
});
const serverRun = async() => {
    const res = await connectDB();
    const channel = await createChannel();

    await subscribedMessage(channel, websocketServer, BINDING_KEY);
    // Create WebSocket server
    // websocketServer = new WebSocket.Server({ serverRun });
    bot.launch();
    const port = 5000;
    server.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
};
bot.on('message', async(ctx) => {
    const channel = await createChannel();

    const data = { message: ctx.message.text };
    console.log(data);
    publishMessage(channel, BINDING_KEY, JSON.stringify(data));
    console.log(ctx.message.text);
});
serverRun();