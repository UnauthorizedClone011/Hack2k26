const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  college: {
    type: String,
    required: true,
    trim: true,
  },
  skills: {
    type: [String],
    default: [],
  },
  tools: {
    type: [String],
    default: [],
  },
  trustTier: {
    type: String,
    enum: ['Bronze', 'Silver', 'Gold', 'Verified Pro'],
    default: 'Bronze',
  },
  trustScore: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalEarnings: {
    type: Number,
    default: 0,
    min: 0,
  },
  bio: {
    type: String,
    default: '',
  },
  portfolioLink: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Student', studentSchema);
