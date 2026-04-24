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
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CssBaseline,
  Avatar,
  IconButton,
  Tooltip,
  Paper,
  Chip
} from '@mui/material';
import {
  Logout as LogoutIcon,
  Dashboard as DashboardIcon,
  BarChart as BarChartIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { styled, useTheme } from '@mui/material/styles';
import KanbanBoard from './KanbanBoard';
import TaskForm from './TaskForm';
import TimeReport from './TimeReport';

// Styled components for premium sidebar
const drawerWidth = 280;

const SidebarHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2, 3),
  justifyContent: 'flex-start',
  backgroundColor: '#1a237e',
  color: 'white',
  minHeight: '64px',
}));

const SidebarFooter = styled('div')(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: '1px solid rgba(255, 255, 255, 0.12)',
  marginTop: 'auto',
}));

const MainContent = styled('main')(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: 0,
  backgroundColor: '#f5f7fa',
  minHeight: '100vh',
}));

const Dashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openTaskForm, setOpenTaskForm] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [activeView, setActiveView] = useState('board');
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleViewChange = (view) => {
    setActiveView(view);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* Premium AppBar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: '#ffffff',
          color: '#1a237e',
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
          borderBottom: '1px solid #e0e0e0'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="toggle sidebar"
            onClick={toggleSidebar}
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Typography variant="h5" component="div" sx={{
              fontWeight: 700,
              background: 'linear-gradient(90deg, #1a237e 0%, #283593 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              ml: 1
            }}>
              VibeFlow Enterprise
            </Typography>
            
            <Box sx={{ ml: 4, display: 'flex', gap: 1 }}>
              <Chip
                label="PRODUCTION"
                size="small"
                sx={{
                  backgroundColor: '#4caf50',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.7rem'
                }}
              />
              <Chip
                label="v2.1.0"
                size="small"
                variant="outlined"
                sx={{
                  borderColor: '#1a237e',
                  color: '#1a237e',
                  fontSize: '0.7rem'
                }}
              />
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title="Notifications">
              <IconButton sx={{ color: '#1a237e' }}>
                <NotificationsIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Settings">
              <IconButton sx={{ color: '#1a237e' }}>
                <SettingsIcon />
              </IconButton>
            </Tooltip>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
              <Avatar sx={{ width: 36, height: 36, bgcolor: '#1a237e' }}>
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a237e' }}>
                  {user?.email?.split('@')[0] || 'User'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#666' }}>
                  {user?.email || 'user@example.com'}
                </Typography>
              </Box>
            </Box>
            
            <Tooltip title="Logout">
              <IconButton
                onClick={handleLogout}
                sx={{
                  ml: 2,
                  color: '#1a237e',
                  '&:hover': { backgroundColor: 'rgba(26, 35, 126, 0.1)' }
                }}
              >
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Premium Sidebar */}
      <Drawer
        variant="persistent"
        anchor="left"
        open={sidebarOpen}
        sx={{
          width: sidebarOpen ? drawerWidth : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: sidebarOpen ? drawerWidth : 0,
            boxSizing: 'border-box',
            backgroundColor: '#1a237e',
            color: 'white',
            borderRight: 'none',
            boxShadow: '3px 0 20px rgba(0,0,0,0.1)',
          },
        }}
      >
        <SidebarHeader>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <DashboardIcon sx={{ mr: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Dashboard
            </Typography>
          </Box>
        </SidebarHeader>
        
        <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.12)' }} />
        
        <List sx={{ p: 2 }}>
          <ListItem
            button
            selected={activeView === 'board'}
            onClick={() => handleViewChange('board')}
            sx={{
              borderRadius: 2,
              mb: 1,
              '&.Mui-selected': {
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                },
              },
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
              },
            }}
          >
            <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText
              primary="Kanban Board"
              primaryTypographyProps={{ fontWeight: activeView === 'board' ? 600 : 400 }}
            />
            {activeView === 'board' && (
              <Box sx={{ width: 4, height: 20, backgroundColor: '#4fc3f7', borderRadius: 2 }} />
            )}
          </ListItem>
          
          <ListItem
            button
            selected={activeView === 'time-report'}
            onClick={() => handleViewChange('time-report')}
            sx={{
              borderRadius: 2,
              mb: 1,
              '&.Mui-selected': {
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                },
              },
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
              },
            }}
          >
            <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
              <BarChartIcon />
            </ListItemIcon>
            <ListItemText
              primary="Time Reports"
              primaryTypographyProps={{ fontWeight: activeView === 'time-report' ? 600 : 400 }}
            />
            {activeView === 'time-report' && (
              <Box sx={{ width: 4, height: 20, backgroundColor: '#4fc3f7', borderRadius: 2 }} />
            )}
          </ListItem>
        </List>
        
        <SidebarFooter>
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', display: 'block', mb: 1 }}>
            Active Projects
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#4caf50', mr: 1 }} />
            <Typography variant="body2" sx={{ color: 'white' }}>
              Kanban Board ({tasks.length} tasks)
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            Last updated: {new Date().toLocaleDateString()}
          </Typography>
        </SidebarFooter>
      </Drawer>

      {/* Main Content */}
      <MainContent >
        <Toolbar /> {/* Spacer for AppBar */}
        
        <Container maxWidth="xl" sx={{ mt: 3 }}>
          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(244, 67, 54, 0.2)'
              }}
            >
              {error}
            </Alert>
          )}

          {activeView === 'board' ? (
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
      </MainContent>

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
          sx={{
            width: '100%',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;