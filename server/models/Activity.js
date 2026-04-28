const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  field: {
    type: String,
    enum: ['assignee', 'status', 'dueDate', 'priority', 'title', 'description'],
    required: true
  },
  oldValue: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  newValue: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  changedByEmail: {
    type: String,
    required: true
  },
  changedAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for faster queries by task
ActivitySchema.index({ task: 1, changedAt: -1 });

// Create compound index for common queries
ActivitySchema.index({ task: 1, field: 1, changedAt: -1 });

module.exports = mongoose.model('Activity', ActivitySchema);