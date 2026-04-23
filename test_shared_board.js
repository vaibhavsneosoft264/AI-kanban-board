const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testSharedBoard() {
  console.log('Testing Shared Board Visibility...\n');
  
  try {
    // Generate unique timestamps for test users
    const timestamp = Date.now();
    
    // Register first user
    const user1Email = `user1_${timestamp}@test.com`;
    console.log(`1. Registering first user (${user1Email})...`);
    const user1Res = await axios.post(`${API_BASE}/auth/register`, {
      email: user1Email,
      password: 'password123'
    });
    const user1Token = user1Res.data.token;
    console.log('   ✓ User1 registered, token received\n');

    // Register second user
    const user2Email = `user2_${timestamp}@test.com`;
    console.log(`2. Registering second user (${user2Email})...`);
    const user2Res = await axios.post(`${API_BASE}/auth/register`, {
      email: user2Email,
      password: 'password123'
    });
    const user2Token = user2Res.data.token;
    console.log('   ✓ User2 registered, token received\n');

    // User1 creates a task
    console.log('3. User1 creating a task...');
    const task1Res = await axios.post(`${API_BASE}/tasks`, {
      title: 'Task created by User1',
      description: 'This task should be visible to User2',
      assignee: 'User1',
      dueDate: '2026-12-31'
    }, {
      headers: { Authorization: `Bearer ${user1Token}` }
    });
    const task1Id = task1Res.data._id;
    console.log(`   ✓ Task created with ID: ${task1Id}\n`);

    // User2 creates a task
    console.log('4. User2 creating a task...');
    const task2Res = await axios.post(`${API_BASE}/tasks`, {
      title: 'Task created by User2',
      description: 'This task should be visible to User1',
      assignee: 'User2',
      dueDate: '2026-12-31'
    }, {
      headers: { Authorization: `Bearer ${user2Token}` }
    });
    const task2Id = task2Res.data._id;
    console.log(`   ✓ Task created with ID: ${task2Id}\n`);

    // User1 fetches all tasks (should see both tasks)
    console.log('5. User1 fetching all tasks...');
    const user1TasksRes = await axios.get(`${API_BASE}/tasks`, {
      headers: { Authorization: `Bearer ${user1Token}` }
    });
    const user1Tasks = user1TasksRes.data;
    console.log(`   ✓ User1 sees ${user1Tasks.length} tasks`);
    user1Tasks.forEach(task => {
      console.log(`     - "${task.title}" (created by: ${task.createdByEmail})`);
    });

    // User2 fetches all tasks (should see both tasks)
    console.log('\n6. User2 fetching all tasks...');
    const user2TasksRes = await axios.get(`${API_BASE}/tasks`, {
      headers: { Authorization: `Bearer ${user2Token}` }
    });
    const user2Tasks = user2TasksRes.data;
    console.log(`   ✓ User2 sees ${user2Tasks.length} tasks`);
    user2Tasks.forEach(task => {
      console.log(`     - "${task.title}" (created by: ${task.createdByEmail})`);
    });

    // Verify shared board
    console.log('\n7. Verifying shared board visibility...');
    if (user1Tasks.length === 2 && user2Tasks.length === 2) {
      console.log('   ✓ SUCCESS: Both users see the same 2 tasks (shared board working)');
      
      // Check that tasks show creator info
      const task1 = user1Tasks.find(t => t._id === task1Id);
      const task2 = user1Tasks.find(t => t._id === task2Id);
      
      if (task1 && task1.createdByEmail === user1Email) {
        console.log(`   ✓ Task1 correctly shows creator: ${user1Email}`);
      }
      if (task2 && task2.createdByEmail === user2Email) {
        console.log(`   ✓ Task2 correctly shows creator: ${user2Email}`);
      }
      
      console.log('\n✅ SHARED BOARD TEST PASSED: All authenticated users see the same tasks with creator information.');
    } else {
      console.log('   ❌ FAILED: Users do not see the same number of tasks');
      console.log(`     User1 tasks: ${user1Tasks.length}, User2 tasks: ${user2Tasks.length}`);
    }

  } catch (error) {
    console.error('\n❌ TEST FAILED WITH ERROR:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Error: ${error.response.data.error || error.message}`);
    } else {
      console.error(`   Error: ${error.message}`);
    }
    process.exit(1);
  }
}

// Run test
testSharedBoard();