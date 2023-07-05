const amqplib = require('amqplib');
const { EXCHANGE_NAME, MESSAGE_BROKER_URL } = require('../config/serverConfig');
const Messages = require('../models/messageModel');
const WebSocket = require('ws');
// let websocketServer = null;

const createChannel = async() => {
    // const queue = 'tasks';
    try {
        const connection = await amqplib.connect(MESSAGE_BROKER_URL);
        const channel = await connection.createChannel();
        await channel.assertExchange(EXCHANGE_NAME, 'direct', false);
        return channel;
    } catch (error) {
        console.log(error);
    }
}

const subscribedMessage = async(channel, websocketServer, binding_key) => {
    try {
        const applicationQueue = await channel.assertQueue('QUEUE_NAME');

        channel.bindQueue(applicationQueue.queue, EXCHANGE_NAME, binding_key);
        channel.consume(applicationQueue.queue, async(msg) => {
            console.log('sending message from queue');
            const message = JSON.parse(msg.content.toString()).message;
            console.log(message);
            await Messages.create({ message });
            // console.log(msg.content.toString());
            // Send message to connected WebSocket clients
            // console.log(websocketServer)
            websocketServer.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    console.log("From WebSocket", message);
                    client.send(message);
                }
            });
            channel.ack(msg);
        });
    } catch (error) {
        throw error;
    }
}
const publishMessage = async(channel, binding_key, message) => {
    try {
        await channel.assertQueue('QUEUE_NAME');
        await channel.publish(EXCHANGE_NAME, binding_key, Buffer.from(message));
    } catch (error) {
        throw error;
    }
}
module.exports = {
    subscribedMessage,
    createChannel,
    publishMessage
}