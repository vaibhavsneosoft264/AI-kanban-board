const mongoose = require('mongoose');

const WorklogSchema = new mongoose.Schema({
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  hours: {
    type: Number,
    required: true,
    min: 0.1,
    max: 24 * 7 // Maximum 1 week of work in a single entry
  },
  description: {
    type: String,
    default: '',
    maxlength: 500
  },
  loggedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries by task and user
WorklogSchema.index({ task: 1, loggedAt: -1 });
WorklogSchema.index({ user: 1, loggedAt: -1 });

module.exports = mongoose.model('Worklog', WorklogSchema);