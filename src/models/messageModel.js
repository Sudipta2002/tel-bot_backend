const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
    message: { type: String },
}, { timestamps: true });

const Messages = mongoose.model("Messages", messageSchema);
module.exports = Messages;