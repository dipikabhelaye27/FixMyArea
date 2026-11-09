const mongoose = require('mongoose');

const IssueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Roads & Potholes',
        'Solid Waste & Garbage',
        'Water Supply & Drainage',
        'Streetlights & Electricity',
        'Public Infrastructure',
        'Other'
      ],
      default: 'Roads & Potholes'
    },
    subCategory: {
      type: String,
      default: 'General'
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
        required: true
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      }
    },
    address: {
      type: String,
      default: 'Location pinpointed on map'
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
    landmark: {
      type: String,
      default: ''
    },
    ward: {
      type: String,
      default: 'Ward 1 - Alandi Devachi'
    },
    imageUrl: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['Reported', 'Verified', 'In Progress', 'Resolved', 'Citizen Confirmed', 'Reopened'],
      default: 'Reported'
    },
    severity: {
      type: Number,
      min: 1,
      max: 5,
      default: 3
    },
    hazardLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium'
    },
    priorityScore: {
      type: Number,
      default: 50 // Scaled 0 to 100
    },
    aiAnalysis: {
      detectedCategory: String,
      confidence: Number,
      severity: Number,
      hazardLevel: String,
      detectedHazards: [String],
      estimatedTurnaroundHours: Number,
      aiSummary: String,
      recommendations: [String],
      assignedDepartment: String,
      detectedLanguage: String,
      originalVoiceText: String,
      translatedEnglishText: String,
      smartRoutingReason: String
    },
    originalVoiceText: {
      type: String,
      default: ''
    },
    detectedLanguage: {
      type: String,
      default: 'Marathi'
    },
    translatedEnglishText: {
      type: String,
      default: ''
    },
    voiceAudioUrl: {
      type: String,
      default: ''
    },
    department: {
      type: String,
      default: 'Roads & Infrastructure'
    },
    assignedWorker: {
      name: { type: String, default: '' },
      phone: { type: String, default: '' },
      assignedAt: { type: Date }
    },
    resolutionProof: {
      afterImageUrl: { type: String, default: '' },
      resolvedAt: { type: Date },
      resolvedBy: { type: String, default: '' },
      resolutionNotes: { type: String, default: '' },
      aiVerificationScore: { type: Number, default: 0 },
      aiVerificationNotes: { type: String, default: '' },
      aiVerificationPass: { type: Boolean, default: false }
    },
    citizenVerification: {
      isVerified: { type: Boolean, default: false },
      status: { type: String, enum: ['Pending', 'Confirmed', 'Reopened'], default: 'Pending' },
      comment: { type: String, default: '' },
      rating: { type: Number, min: 1, max: 5 },
      verifiedAt: { type: Date }
    },
    upvotes: [
      {
        citizenId: { type: String },
        timestamp: { type: Date, default: Date.now }
      }
    ],
    upvoteCount: {
      type: Number,
      default: 1
    },
    reportedBy: {
      name: { type: String, default: 'Anonymous Citizen' },
      phone: { type: String, default: '' },
      email: { type: String, default: '' },
      citizenId: { type: String }
    },
    coReporters: [
      {
        name: { type: String, default: 'Citizen' },
        phone: { type: String, default: '' },
        reportedAt: { type: Date, default: Date.now },
        voiceNote: { type: String, default: '' },
        imageUrl: { type: String, default: '' },
        note: { type: String, default: '' }
      }
    ],
    reportersCount: {
      type: Number,
      default: 1
    },
    isMaster: {
      type: Boolean,
      default: false
    },
    masterIssueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Issue',
      default: null
    },
    linkedReports: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Issue'
      }
    ],
    linkedReportCount: {
      type: Number,
      default: 0
    },
    slaDeadline: {
      type: Date
    },
    timeline: [
      {
        status: { type: String },
        timestamp: { type: Date, default: Date.now },
        updatedBy: { type: String },
        comment: { type: String }
      }
    ]
  },
  {
    timestamps: true
  }
);

// 2dsphere index for ultra-fast spatial search & deduplication
IssueSchema.index({ location: '2dsphere' });
IssueSchema.index({ status: 1, priorityScore: -1 });
IssueSchema.index({ department: 1, status: 1 });

module.exports = mongoose.model('Issue', IssueSchema);

