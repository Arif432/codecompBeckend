const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['admin', 'team_member'],
    default:"team_member"
  },
  workspaces: [{
      workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' }, 
      role: {
          type: String,
          enum: ['admin', 'team_lead', 'team_member'],
          default:"team_member",
          required: true
      }
  }]
});

const User = mongoose.model('User', userSchema);
module.exports = User;
