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
const bot = new Telegraf("6009895764:AAEeNw9U--jLpJZyyogSEj1TcSdmS4e9nyI");
let websocketServer = null;
bot.start((ctx) => ctx.reply("Welcome to sonagachi!"));
bot.help((ctx) => ctx.reply('Send me a sticker'));

bot.on(message('sticker'), async(ctx) => await ctx.replyWithPhoto(Input.fromURL("https://www.google.com/imgres?imgurl=https%3A%2F%2Fimages.news18.com%2Fibnlive%2Fuploads%2F2023%2F04%2Fthis-moment-when-we-are-together.jpg&tbnid=AvVShbvYujlQkM&vet=12ahUKEwi76Nbi0bH_AhVmKrcAHcCyCVkQMygiegUIARDfAQ..i&imgrefurl=https%3A%2F%2Fwww.news18.com%2Flifestyle%2Fwhy-a-healthy-and-satisfying-sex-life-is-good-for-your-mental-health-7547197.html&docid=3VgejO6w6pbG8M&w=2048&h=1365&q=sex&ved=2ahUKEwi76Nbi0bH_AhVmKrcAHcCyCVkQMygiegUIARDfAQ")));
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