import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URLS } from '../config';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Snackbar,
  Alert,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import { Logout as LogoutIcon, Dashboard as DashboardIcon, BarChart as BarChartIcon } from '@mui/icons-material';
import KanbanBoard from './KanbanBoard';
import TaskForm from './TaskForm';
import TimeReport from './TimeReport';

const Dashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openTaskForm, setOpenTaskForm] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(API_URLS.TASKS.BASE, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load tasks. Please try again.');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTask = (task) => {
    setTaskToEdit(task);
    setOpenTaskForm(true);
  };

  const handleCreateTask = async (taskData) => {
    try {
      const token = localStorage.getItem('token');
      let response;
      
      if (taskToEdit) {
        // Update existing task
        response = await axios.put(`http://localhost:5000/api/tasks/${taskToEdit._id}`, taskData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setTasks(prev => prev.map(task =>
          task._id === taskToEdit._id ? response.data : task
        ));
        setSnackbar({
          open: true,
          message: 'Task updated successfully!',
          severity: 'success'
        });
        setTaskToEdit(null);
      } else {
        // Create new task
        response = await axios.post(API_URLS.TASKS.BASE, {
          ...taskData,
          createdBy: user?.id,
          createdByEmail: user?.email
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setTasks(prev => [...prev, response.data]);
        setSnackbar({
          open: true,
          message: 'Task created successfully!',
          severity: 'success'
        });
      }
      
      fetchTasks(); // Refresh tasks
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.error || (taskToEdit ? 'Failed to update task' : 'Failed to create task'),
        severity: 'error'
      });
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URLS.TASKS.BASE}/${taskId}`, updates, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setTasks(prev => prev.map(task =>
        task._id === taskId ? { ...task, ...updates } : task
      ));
    } catch (err) {
      console.error('Error updating task:', err);
      // Revert local state on error
      fetchTasks();
    }
  };

  const handleReorderTasks = async (columnId, taskOrder) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(API_URLS.TASKS.REORDER, {
        column: columnId,
        taskOrder
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh tasks to get updated positions
      fetchTasks();
    } catch (err) {
      console.error('Error reordering tasks:', err);
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            VibeFlow Kanban
          </Typography>
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              textColor="inherit"
              sx={{
                '& .MuiTab-root': { color: 'rgba(255, 255, 255, 0.7)' },
                '& .Mui-selected': { color: 'white' }
              }}
            >
              <Tab
                icon={<DashboardIcon />}
                iconPosition="start"
                label="Board"
                sx={{ minHeight: 64 }}
              />
              <Tab
                icon={<BarChartIcon />}
                iconPosition="start"
                label="Time Report"
                sx={{ minHeight: 64 }}
              />
            </Tabs>
          </Box>
          <Typography variant="body1" sx={{ mr: 2 }}>
            {user?.email}
          </Typography>
          <Button
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {activeTab === 0 ? (
          <KanbanBoard
            tasks={tasks}
            onTaskCreate={() => {
              setTaskToEdit(null);
              setOpenTaskForm(true);
            }}
            onTaskEdit={handleEditTask}
            onTaskUpdate={handleUpdateTask}
            onTaskReorder={handleReorderTasks}
          />
        ) : (
          <TimeReport user={user} />
        )}
      </Container>

      <TaskForm
        open={openTaskForm}
        onClose={() => {
          setOpenTaskForm(false);
          setTaskToEdit(null);
        }}
        onSubmit={handleCreateTask}
        user={user}
        task={taskToEdit}
        mode={taskToEdit ? 'edit' : 'create'}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;