const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
  name: { type: String, required: true },
  country: { type: String, required: true },
  displayName: { type: String, required: true },
  population: { type: Number, default: 0 },
  verified: { type: Boolean, default: true },
  latitude: { type: Number },
  longitude: { type: Number }
}, {
  timestamps: true
});

// Indexes for fast searching
citySchema.index({ name: 1, population: -1 });
citySchema.index({ displayName: 1, population: -1 });

module.exports = mongoose.model('City', citySchema);