const mongoose = require('mongoose');
const workspaceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the admin
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // Users added to this workspace
  });
  
  const Workspace = mongoose.model('Workspace', workspaceSchema);
  module.exports = Workspace;
  