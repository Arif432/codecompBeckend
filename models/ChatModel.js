const mongoose = require('mongoose');

// Define the message schema
const messageSchema = new mongoose.Schema({
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true }, // Link to Project
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' }, // Link to Workspace
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User'}, // Link to User
    content: { type: String}, // Message content
    timestamp: { type: Date, default: Date.now }, // Timestamp of the message
});

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
