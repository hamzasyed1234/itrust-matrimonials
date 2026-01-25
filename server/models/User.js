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
    enum: ['Male', 'Female', 'male', 'female']
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  // Changed from token to code
  verificationCode: {
    type: String,
    default: null
  },
  verificationCodeExpires: {
    type: Date,
    default: null
  },
  
  // Add this field
  isAdmin: {
    type: Boolean,
    default: false
  },

  // Phase 2 - Profile
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

  residencyStatus: {
  type: String,
  default: '',
  enum: ['', 'Citizen', 'Permanent Resident (PR)', 'Student Visa', 'Work Permit', 'Visitor / Tourist', 'Other']
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
    enum: ['', 'Never Married', 'Annulled/Dissolved', 'Divorced', 'Widowed', 'Married']
  },
  
  // Phone Number for WhatsApp connection
  phoneNumber: {
    type: String,
    default: '',
    trim: true
  },
  
  customFields: {
    type: Map,
    of: String,
    default: {}
  },
  

   // NEW: Tags field for user descriptions
  tags: {
    type: [String],
    default: [],
    validate: {
      validator: function(tags) {
        // Max 10 tags
        if (tags.length > 10) return false;
        // Each tag max 20 characters
        return tags.every(tag => tag.length <= 20);
      },
      message: 'Maximum 10 tags allowed, each up to 20 characters'
    }
  },

  
  // Match system
  activeMatches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  matchCount: {
    type: Number,
    default: 0,
    
  },
  pendingMatchRequests: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);