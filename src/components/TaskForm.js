import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URLS } from '../config';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar
} from '@mui/material';
import {
  Close as CloseIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

const TaskForm = ({ open, onClose, onSubmit, user, task = null, mode = 'create' }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignee: '',
    dueDate: '',
    ticketNumber: '',
  });
  const [errors, setErrors] = useState({});
  const [users, setUsers] = useState([]);
  const [assignmentHistory, setAssignmentHistory] = useState([]);
  const [worklogs, setWorklogs] = useState([]);
  const [showWorklogForm, setShowWorklogForm] = useState(false);
  const [worklogForm, setWorklogForm] = useState({
    hours: '',
    description: ''
  });
  const [worklogLoading, setWorklogLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch users for dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(API_URLS.TASKS.USERS, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(response.data);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };

    if (open) {
      fetchUsers();
    }
  }, [open]);

  // Fetch assignment history if editing existing task
  useEffect(() => {
    const fetchAssignmentHistory = async () => {
      if (mode === 'edit' && task && task._id) {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(API_URLS.getTaskHistory(task._id), {
            headers: { Authorization: `Bearer ${token}` }
          });
          setAssignmentHistory(response.data);
        } catch (err) {
          console.error('Error fetching assignment history:', err);
        }
      }
    };

    if (open && mode === 'edit') {
      fetchAssignmentHistory();
    }
  }, [open, mode, task]);

  // Fetch worklogs if editing existing task
  useEffect(() => {
    const fetchWorklogs = async () => {
      if (mode === 'edit' && task && task._id) {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(API_URLS.getTaskWorklogs(task._id), {
            headers: { Authorization: `Bearer ${token}` }
          });
          setWorklogs(response.data);
        } catch (err) {
          console.error('Error fetching worklogs:', err);
        }
      }
    };

    if (open && mode === 'edit') {
      fetchWorklogs();
    }
  }, [open, mode, task]);

  // Initialize form data when task changes
  useEffect(() => {
    if (task && mode === 'edit') {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        assignee: task.assignee || '',
        dueDate: task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '',
        ticketNumber: task.ticketNumber || ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        assignee: '',
        dueDate: '',
        ticketNumber: ''
      });
    }
    setErrors({});
    setAssignmentHistory([]);
  }, [task, mode, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 255) {
      newErrors.title = 'Title cannot exceed 255 characters';
    }
    
    if (formData.description.length > 1000) {
      newErrors.description = 'Description cannot exceed 1000 characters';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const { ticketNumber, ...restData } = formData;
      const taskData = {
        ...restData,
        createdBy: user?.id || 'unknown',
        createdByEmail: user?.email || 'unknown@example.com'
      };

      // If editing, include task ID
      if (mode === 'edit' && task) {
        taskData._id = task._id;
      }

      await onSubmit(taskData);
      handleClose();
    } catch (error) {
      console.error('Error submitting task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      assignee: '',
      dueDate: '',
      ticketNumber: ''
    });
    setErrors({});
    setAssignmentHistory([]);
    setWorklogs([]);
    setShowWorklogForm(false);
    setWorklogForm({ hours: '', description: '' });
    onClose();
  };

  const formatHistoryDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch (err) {
      return dateString;
    }
  };

  const handleWorklogChange = (e) => {
    const { name, value } = e.target;
    setWorklogForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleWorklogSubmit = async (e) => {
    e.preventDefault();
    if (!worklogForm.hours || parseFloat(worklogForm.hours) <= 0) {
      return;
    }

    setWorklogLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        API_URLS.addWorklog(task._id),
        {
          hours: parseFloat(worklogForm.hours),
          description: worklogForm.description || ''
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Add new worklog to the list
      setWorklogs(prev => [response.data, ...prev]);
      // Reset form
      setWorklogForm({ hours: '', description: '' });
      setShowWorklogForm(false);
    } catch (err) {
      console.error('Error logging work:', err);
    } finally {
      setWorklogLoading(false);
    }
  };

  const formatWorklogDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch (err) {
      return dateString;
    }
  };

  const totalWorklogHours = worklogs.reduce((sum, log) => sum + log.hours, 0);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          {mode === 'create' ? 'Create New Task' : `Ticket Number: ${formData.ticketNumber ? `#${formData.ticketNumber}` : 'N/A'}`}
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Title *"
              name="title"
              value={formData.title}
              onChange={handleChange}
              error={!!errors.title}
              helperText={errors.title}
              fullWidth
              autoFocus
              placeholder="Enter task title"
              inputProps={{ maxLength: 255 }}
            />
            
            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              error={!!errors.description}
              helperText={errors.description || `${formData.description.length}/1000`}
              fullWidth
              multiline
              rows={3}
              placeholder="Enter task description"
              inputProps={{ maxLength: 1000 }}
            />
            
            <FormControl fullWidth>
              <InputLabel>Assignee</InputLabel>
              <Select
                name="assignee"
                value={formData.assignee}
                onChange={handleChange}
                label="Assignee"
              >
                <MenuItem value="">
                  <em>Unassigned</em>
                </MenuItem>
                {users.map((user) => (
                  <MenuItem key={user._id} value={user.email}>
                    {user.email}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                Select a team member to assign this task to
              </FormHelperText>
            </FormControl>
            
            <TextField
              label="Due Date"
              name="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            
            {mode === 'create' && (
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="column"
                  value="Backlog"
                  label="Status"
                  disabled
                >
                  <MenuItem value="Backlog">Backlog (Default)</MenuItem>
                </Select>
                <FormHelperText>
                  New tasks are always created in Backlog column
                </FormHelperText>
              </FormControl>
            )}
            
            <Box mt={1}>
              <Typography variant="caption" color="text.secondary">
                Created by: {user?.email || 'Current user'}
              </Typography>
            </Box>

            {/* Assignment History Section - Only shown in edit mode */}
            {mode === 'edit' && assignmentHistory.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    <HistoryIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Assignment History
                  </Typography>
                  <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
                    {assignmentHistory.map((history, index) => (
                      <ListItem key={index} alignItems="flex-start">
                        <ListItemAvatar>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: '#1976d2' }}>
                            {history.changedByEmail?.charAt(0).toUpperCase() || '?'}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="body2">
                              <strong>{history.changedByEmail}</strong> changed assignee
                              {history.oldAssignee ? ` from "${history.oldAssignee}"` : ' from Unassigned'}
                              {history.newAssignee ? ` to "${history.newAssignee}"` : ' to Unassigned'}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              {formatHistoryDate(history.changedAt)}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </>
            )}

            {/* Worklog Section - Only shown in edit mode */}
            {mode === 'edit' && (
              <>
                <Divider sx={{ my: 2 }} />
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Time Logged
                      {worklogs.length > 0 && (
                        <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          (Total: {totalWorklogHours.toFixed(1)} hours)
                        </Typography>
                      )}
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setShowWorklogForm(!showWorklogForm)}
                      startIcon={showWorklogForm ? <CloseIcon /> : null}
                    >
                      {showWorklogForm ? 'Cancel' : 'Log Work'}
                    </Button>
                  </Box>

                  {/* Worklog Form */}
                  {showWorklogForm && (
                    <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Log Work Time
                      </Typography>
                      <Box display="flex" gap={2} alignItems="flex-start">
                        <TextField
                          label="Hours *"
                          name="hours"
                          type="number"
                          value={worklogForm.hours}
                          onChange={handleWorklogChange}
                          required
                          size="small"
                          sx={{ width: 120 }}
                          inputProps={{ step: 0.1, min: 0.1, max: 168 }}
                          helperText="Decimal hours (0.1-168)"
                        />
                        <TextField
                          label="Description"
                          name="description"
                          value={worklogForm.description}
                          onChange={handleWorklogChange}
                          size="small"
                          sx={{ flex: 1 }}
                          placeholder="What did you work on?"
                          inputProps={{ maxLength: 500 }}
                        />
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleWorklogSubmit}
                          disabled={!worklogForm.hours || worklogLoading}
                          sx={{ mt: 0.5 }}
                        >
                          {worklogLoading ? 'Logging...' : 'Log'}
                        </Button>
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Worklogs are immutable and associated with your account ({user?.email})
                      </Typography>
                    </Box>
                  )}

                  {/* Worklog List */}
                  {worklogs.length > 0 ? (
                    <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
                      {worklogs.map((log) => (
                        <ListItem key={log._id} alignItems="flex-start">
                          <ListItemAvatar>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#4caf50' }}>
                              {log.userEmail?.charAt(0).toUpperCase() || '?'}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="body2">
                                <strong>{log.userEmail}</strong> logged <strong>{log.hours.toFixed(1)} hours</strong>
                                {log.description && `: ${log.description}`}
                              </Typography>
                            }
                            secondary={
                              <Typography variant="caption" color="text.secondary">
                                {formatWorklogDate(log.loggedAt)}
                              </Typography>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      No work time logged yet
                    </Typography>
                  )}
                </Box>
              </>
            )}
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose} color="inherit">
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={!formData.title.trim() || loading}
          >
            {loading ? 'Saving...' : (mode === 'create' ? 'Create Task' : 'Save Changes')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TaskForm;