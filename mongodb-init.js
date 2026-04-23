// MongoDB initialization script
db = db.getSiblingDB('kanban-auth');

// Create collections if they don't exist
db.createCollection('users');
db.createCollection('tasks');
db.createCollection('worklogs');
db.createCollection('assignmenthistories');
db.createCollection('counters');

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.tasks.createIndex({ column: 1 });
db.tasks.createIndex({ assignee: 1 });
db.tasks.createIndex({ ticketNumber: 1 }, { unique: true });
db.worklogs.createIndex({ taskId: 1 });
db.worklogs.createIndex({ userId: 1 });
db.assignmenthistories.createIndex({ taskId: 1 });

// Initialize counter for ticket numbers
db.counters.insertOne({
  _id: 'ticketNumber',
  sequence_value: 0
});

print('MongoDB initialization completed');