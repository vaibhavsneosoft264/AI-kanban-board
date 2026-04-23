const mongoose = require('mongoose');

const AssignmentHistorySchema = new mongoose.Schema({
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  oldAssignee: {
    type: String,
    default: null
  },
  newAssignee: {
    type: String,
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
AssignmentHistorySchema.index({ task: 1, changedAt: -1 });

module.exports = mongoose.model('AssignmentHistory', AssignmentHistorySchema);