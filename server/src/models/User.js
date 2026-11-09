const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
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
  role: {
    type: String,
    enum: ['admin', 'officer'],
    default: 'officer'
  },
  department: {
    type: String,
    default: 'All'
  },
  designation: {
    type: String,
    default: 'Municipal Officer'
  },
  city: {
    type: String,
    default: 'Alandi',
    index: true
  },
  district: {
    type: String,
    default: 'Pune'
  },
  state: {
    type: String,
    default: 'Maharashtra'
  },
  municipality: {
    type: String,
    default: 'Alandi Municipal Council',
    index: true
  },
  ward: {
    type: String,
    default: 'All Wards'
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);

