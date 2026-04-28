const axios = require('axios');

async function testFilterAPI() {
  const baseURL = 'http://localhost:5000/api/tasks';
  
  // First, get a token (you'll need to login first)
  console.log('Testing server-side filtering API...');
  console.log('Note: This test requires a valid JWT token');
  console.log('Make sure you have logged in and have tasks in the database');
  
  // Example of how the API would be called with filters:
  console.log('\nExample API calls with filters:');
  console.log('1. Search filter: GET ' + baseURL + '?search=test');
  console.log('2. Assignee filter: GET ' + baseURL + '?assignee=john@example.com');
  console.log('3. Priority filter: GET ' + baseURL + '?priority=High');
  console.log('4. Ticket number filter: GET ' + baseURL + '?ticketNumber=123');
  console.log('5. Due date filter: GET ' + baseURL + '?dueDate=2024-12-31');
  console.log('6. Combined filters: GET ' + baseURL + '?search=bug&priority=High&assignee=alice@example.com');
  
  console.log('\nTo test manually:');
  console.log('1. Login to the application');
  console.log('2. Open browser DevTools Network tab');
  console.log('3. Apply filters in KanbanBoard');
  console.log('4. Check the request URL for /api/tasks with query parameters');
  console.log('5. Verify the response contains only filtered tasks');
}

testFilterAPI().catch(console.error);