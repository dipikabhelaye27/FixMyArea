const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  headOfficer: {
    type: String,
    default: 'Department Officer'
  },
  phone: {
    type: String,
    default: '1800-CIVIC-FIX'
  },
  color: {
    type: String,
    default: '#0284c7'
  },
  categoriesHandled: [{
    type: String
  }],
  slaHours: {
    critical: { type: Number, default: 12 },
    high: { type: Number, default: 24 },
    medium: { type: Number, default: 48 },
    low: { type: Number, default: 72 }
  }
}, { timestamps: true });

module.exports = mongoose.model('Department', DepartmentSchema);

