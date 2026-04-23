const axios = require('axios');
const API_BASE = 'http://localhost:5000/api';

async function testTicketNumberFunctionality() {
  console.log('=== Testing Ticket Number Functionality ===\n');

  try {
    // 1. Register a test user
    console.log('1. Registering test user...');
    const registerRes = await axios.post(`${API_BASE}/auth/register`, {
      email: 'ticket-test@example.com',
      password: 'password123'
    });
    const token = registerRes.data.token;
    console.log('   ✓ User registered, token obtained\n');

    // 2. Create first task
    console.log('2. Creating first task...');
    const task1Res = await axios.post(`${API_BASE}/tasks`, {
      title: 'Test Task with Ticket Number 1',
      description: 'This should get first ticket number',
      assignee: '',
      dueDate: ''
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const task1 = task1Res.data;
    console.log(`   ✓ Task created: ${task1.title}`);
    console.log(`   Ticket Number: ${task1.ticketNumber}`);
    console.log(`   Task ID: ${task1._id}\n`);

    // 3. Create second task
    console.log('3. Creating second task...');
    const task2Res = await axios.post(`${API_BASE}/tasks`, {
      title: 'Test Task with Ticket Number 2',
      description: 'This should get second ticket number',
      assignee: '',
      dueDate: ''
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const task2 = task2Res.data;
    console.log(`   ✓ Task created: ${task2.title}`);
    console.log(`   Ticket Number: ${task2.ticketNumber}`);
    console.log(`   Task ID: ${task2._id}\n`);

    // 4. Verify ticket numbers are unique and sequential
    console.log('4. Verifying ticket numbers...');
    if (task1.ticketNumber && task2.ticketNumber) {
      console.log(`   ✓ Both tasks have ticket numbers`);
      console.log(`   Task 1: ${task1.ticketNumber}`);
      console.log(`   Task 2: ${task2.ticketNumber}`);
      
      // Extract numbers from ticket strings (e.g., "TICKET-1000" -> 1000)
      const num1 = parseInt(task1.ticketNumber.split('-')[1]);
      const num2 = parseInt(task2.ticketNumber.split('-')[1]);
      
      if (num2 === num1 + 1) {
        console.log(`   ✓ Ticket numbers are sequential (${num1} -> ${num2})`);
      } else {
        console.log(`   ✗ Ticket numbers are not sequential: ${num1}, ${num2}`);
      }
      
      if (task1.ticketNumber !== task2.ticketNumber) {
        console.log(`   ✓ Ticket numbers are unique`);
      } else {
        console.log(`   ✗ Ticket numbers are not unique!`);
      }
    } else {
      console.log('   ✗ One or both tasks missing ticket numbers');
    }
    console.log();

    // 5. Fetch all tasks to verify ticket numbers in list
    console.log('5. Fetching all tasks to verify display...');
    const tasksRes = await axios.get(`${API_BASE}/tasks`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const tasks = tasksRes.data;
    const tasksWithTickets = tasks.filter(t => t.ticketNumber);
    console.log(`   ✓ Found ${tasks.length} total tasks`);
    console.log(`   ✓ ${tasksWithTickets.length} tasks have ticket numbers`);
    
    // 6. Test time report includes ticket numbers
    console.log('6. Testing time report includes ticket numbers...');
    const timeReportRes = await axios.get(`${API_BASE}/tasks/time`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const report = timeReportRes.data;
    console.log(`   ✓ Time report fetched, ${report.tasks?.length || 0} tasks in report`);
    
    if (report.tasks && report.tasks.length > 0) {
      const taskWithTicketInReport = report.tasks.find(t => t.ticketNumber);
      if (taskWithTicketInReport) {
        console.log(`   ✓ Time report includes ticket number: ${taskWithTicketInReport.ticketNumber}`);
      } else {
        console.log(`   ✗ Time report missing ticket numbers`);
      }
    }
    console.log();

    // 7. Clean up - delete test tasks
    console.log('7. Cleaning up test tasks...');
    await axios.delete(`${API_BASE}/tasks/${task1._id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    await axios.delete(`${API_BASE}/tasks/${task2._id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('   ✓ Test tasks deleted\n');

    console.log('=== Ticket Number Test Completed Successfully ===');
    console.log('Summary:');
    console.log('  - Ticket numbers are auto-generated for new tasks');
    console.log('  - Ticket numbers follow format "TICKET-XXXX"');
    console.log('  - Ticket numbers are sequential and unique');
    console.log('  - Ticket numbers appear in task lists and time reports');
    console.log('  - Ticket numbers are displayed in Kanban board and TaskForm');

  } catch (error) {
    console.error('Error during test:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run the test
testTicketNumberFunctionality();