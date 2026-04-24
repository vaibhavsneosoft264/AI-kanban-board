const mongoose = require('mongoose');

// Create a separate counter schema for ticket numbers
const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 } // Start from 0, first increment will be 1
});

const Counter = mongoose.model('Counter', CounterSchema);

const TaskSchema = new mongoose.Schema({
  ticketNumber: {
    type: Number,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 255,
    trim: true
  },
  description: {
    type: String,
    default: '',
    maxlength: 1000
  },
  column: {
    type: String,
    enum: ['Backlog', 'Selected for Development', 'In Progress', 'Done', 'Ready for Review', 'In Review', 'Ready for Test', 'Testing'],
    default: 'Backlog'
  },
  assignee: {
    type: String,
    default: ''
  },
  dueDate: {
    type: Date,
    default: null
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdByEmail: {
    type: String,
    required: true
  },
  position: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Function to generate ticket number
async function getNextTicketNumber() {
  const counter = await Counter.findByIdAndUpdate(
    { _id: 'taskTicket' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq; // Return just the number, not "TICKET-XXXX"
}

// Pre-save middleware to generate ticket number
TaskSchema.pre('save', async function() {
  // Only generate ticket number for new tasks
  if (this.isNew && !this.ticketNumber) {
    try {
      this.ticketNumber = await getNextTicketNumber();
    } catch (error) {
      return error;
    }
  }
  
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('Task', TaskSchema);