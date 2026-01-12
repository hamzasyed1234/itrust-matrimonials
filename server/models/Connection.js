const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending'
  }
}, {
  timestamps: true  // Automatically creates and manages createdAt and updatedAt
});

// Create indexes for faster queries
connectionSchema.index({ sender: 1, receiver: 1 });
connectionSchema.index({ receiver: 1, status: 1 });
connectionSchema.index({ sender: 1, status: 1 });

module.exports = mongoose.model('Connection', connectionSchema);