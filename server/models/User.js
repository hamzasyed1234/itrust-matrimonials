const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Phase 1 - Registration
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    required: true,
    enum: ['male', 'female']
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  
  // Phase 2 - Profile (optional, can be completed later)
  profileCompleted: {
    type: Boolean,
    default: false
  },
  profilePicture: {
    type: String,
    default: ''
  },
  ethnicity: {
    type: String,
    default: ''
  },
  height: {
    type: String,
    default: ''
  },
  birthPlace: {
    type: String,
    default: ''
  },
  currentLocation: {
    type: String,
    default: ''
  },
  profession: {
    type: String,
    default: ''
  },
  education: {
    type: String,
    default: ''
  },
  languages: {
    type: [String],
    default: []
  },
  maritalStatus: {
    type: String,
    default: '',
    enum: ['', 'Never Married', 'Divorced', 'Widowed', 'Other']
  },
  
  customFields: {
    type: Map,
    of: String,
    default: {}
  },
  
  // Match system
  activeMatches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  matchCount: {
    type: Number,
    default: 0,
    max: 3
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);