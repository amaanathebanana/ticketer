const { Schema } = require('mongoose')
const mongoose = require('mongoose')

const ticketSchema = new Schema({
    type: String,
    userId: String,
    channelId: String,
    started: Boolean,
    messageId: String
})

module.exports = mongoose.model('ticket', ticketSchema);
