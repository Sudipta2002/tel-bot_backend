const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    BOT_TOKEN: process.env.BOT_TOKEN,
    EXCHANGE_NAME: process.env.EXCHANGE_NAME,
    BINDING_KEY: process.env.BINDING_KEY,
    MESSAGE_BROKER_URL: process.env.MESSAGE_BROKER_URL,
    MONGO_URI: process.env.MONGO_URI
}