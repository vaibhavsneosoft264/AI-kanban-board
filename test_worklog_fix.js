// Quick test to verify worklog API endpoints are working
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testWorklogEndpoints() {
  console.log('Testing worklog endpoints...\n');
  
  try {
    // 1. Register a user
    console.log('1. Registering test user...');
    const registerRes = await axios.post(`${API_BASE}/auth/register`, {
      email: 'worklogtest@example.com',
      password: 'password123'
    });
    const token = registerRes.data.token;
    console.log('   ✓ User registered');

    // 2. Create a task
    console.log('\n2. Creating a task...');
    const taskRes = await axios.post(`${API_BASE}/tasks`, {
      title: 'Worklog Test Task',
      description: 'Task for testing worklog functionality',
      assignee: 'worklogtest@example.com',
      column: 'To Do'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const taskId = taskRes.data._id;
    console.log('   ✓ Task created with ID:', taskId);

    // 3. Create a worklog
    console.log('\n3. Creating a worklog...');
    const worklogRes = await axios.post(`${API_BASE}/tasks/${taskId}/worklogs`, {
      hours: 3.5,
      description: 'Testing worklog creation'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('   ✓ Worklog created:', worklogRes.data.hours, 'hours');
    console.log('   ✓ Worklog ID:', worklogRes.data._id);
    console.log('   ✓ Associated user:', worklogRes.data.userEmail);

    // 4. Fetch worklogs for the task
    console.log('\n4. Fetching worklogs...');
    const worklogsRes = await axios.get(`${API_BASE}/tasks/${taskId}/worklogs`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('   ✓ Found', worklogsRes.data.length, 'worklog(s)');
    console.log('   ✓ Total hours:', worklogsRes.data.reduce((sum, log) => sum + log.hours, 0));

    // 5. Test time report
    console.log('\n5. Testing time report...');
    const reportRes = await axios.get(`${API_BASE}/reports/time`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('   ✓ Time report generated');
    console.log('   ✓ Grand total:', reportRes.data.grandTotal, 'hours');
    
    const taskInReport = reportRes.data.tasks.find(t => t._id === taskId);
    if (taskInReport) {
      console.log('   ✓ Task found in report with', taskInReport.totalHours, 'hours');
    }

    console.log('\n✅ All worklog endpoints are working correctly!');
    console.log('\nThe fix for nested forms in TaskForm.js should now allow worklog creation from the UI.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    process.exit(1);
  }
}

// Run test
testWorklogEndpoints();