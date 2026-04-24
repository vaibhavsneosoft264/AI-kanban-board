import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  Avatar,
  Chip,
  IconButton,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  CircularProgress,
  Alert,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Tooltip,
} from '@mui/material';
import {
  Close as CloseIcon,
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Work as WorkIcon,
  History as HistoryIcon,
  Description as DescriptionIcon,
  Label as LabelIcon,
  Chat as ChatIcon,
  Attachment as AttachmentIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import axios from 'axios';
import { API_URLS } from '../config';

const TaskDetails = ({ taskId, open, onClose, user, setTasks }) => {
  const [task, setTask] = useState({ _id: '', title: '', description: '', column: '', assignee: null, dueDate: null, priority: 'Medium',ticketNumber : "" });
  const [comments, setComments] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [newAttachment, setNewAttachment] = useState(null);
  const [attachmentDescription, setAttachmentDescription] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [submittingAttachment, setSubmittingAttachment] = useState(false);
  const [error, setError] = useState('');
  
  // Editing states
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTask, setEditedTask] = useState({});
  const [saving, setSaving] = useState(false);
  const [worklogs, setWorklogs] = useState([]);
  // Log work states
  const [showLogWork, setShowLogWork] = useState(false);
  const [workLog, setWorkLog] = useState({ hours: 0, description: '' });
  const [submittingWorkLog, setSubmittingWorkLog] = useState(false);
  
  // Active tab for bottom section
  const [activeTab, setActiveTab] = useState(0);

  // Users for assignee dropdown
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Column options for status dropdown
  const columnOptions = [
    'Backlog',
    'Selected for Development',
    'In Progress',
    'Done',
    'Ready for Review',
    'In Review',
    'Ready for Test',
    'Testing'
  ];

  useEffect(() => {
    if (open && task) {
      fetchComments();
      fetchAttachments();
      fetchUsers();
      setEditedTask({ ...task });
    }
    fetchWorklogs();
  }, [open, task]);


  useEffect(() => {
    fetchWorklogs();
  }, [showLogWork]);

  useEffect(() => {
    fetchTaskDetails()
  }, [taskId]);

      const fetchWorklogs = async () => {
        if (taskId) {
          try {
            const token = localStorage.getItem('token');
            const response = await axios.get(API_URLS.getTaskWorklogs(taskId), {
              headers: { Authorization: `Bearer ${token}` }
            });
            setWorklogs(response.data);
          } catch (err) {
            console.error('Error fetching worklogs:', err);
          }
        }
      };

      const fetchTaskDetails = async () => {
        // if (taskId) {
          try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
        API_URLS.getTaskById(taskId),
        { headers: { Authorization: `Bearer ${token}` } }
      );
            setTask(response.data);
          } catch (err) {
            console.error('Error fetching task details:', err);
          }
        // }
      };

  const fetchComments = async () => {
    if (!taskId) return;
    setLoadingComments(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(API_URLS.COMMENTS.TASK_COMMENTS(taskId), {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComments(response.data);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments');
    } finally {
      setLoadingComments(false);
    }
  };

  const fetchAttachments = async () => {
    if (!taskId) return;
    setLoadingAttachments(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(API_URLS.ATTACHMENTS.TASK_ATTACHMENTS(taskId), {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAttachments(response.data);
    } catch (err) {
      console.error('Error fetching attachments:', err);
      setError('Failed to load attachments');
    } finally {
      setLoadingAttachments(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(API_URLS.TASKS.USERS, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    
    setSubmittingComment(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        API_URLS.COMMENTS.BASE,
        { taskId: taskId, content: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments([...comments, response.data]);
      setNewComment('');
    } catch (err) {
      console.error('Error submitting comment:', err);
      setError('Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleUploadAttachment = async () => {
    if (!newAttachment) return;
    
    setSubmittingAttachment(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('taskId', task._id);
      formData.append('file', newAttachment);
      if (attachmentDescription) {
        formData.append('description', attachmentDescription);
      }
      
      const response = await axios.post(API_URLS.ATTACHMENTS.BASE, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setAttachments([...attachments, response.data]);
      setNewAttachment(null);
      setAttachmentDescription('');
      if(document.getElementById('file-input')){
        document.getElementById('file-input').value = '';
      }
    } catch (err) {
      console.error('Error uploading attachment:', err);
      setError('Failed to upload attachment');
    } finally {
      setSubmittingAttachment(false);
    }
  };

  const handleDownloadAttachment = async (attachment) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(API_URLS.ATTACHMENTS.DOWNLOAD(attachment._id), {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', attachment.originalName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error downloading attachment:', err);
      setError('Failed to download attachment');
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    if (!window.confirm('Are you sure you want to delete this attachment?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(API_URLS.ATTACHMENTS.BASE + `/${attachmentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAttachments(attachments.filter(a => a._id !== attachmentId));
    } catch (err) {
      console.error('Error deleting attachment:', err);
      setError('Failed to delete attachment');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSaveTask = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        API_URLS.getTask(task._id),
        editedTask,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // setTasks(prevTasks => prevTasks.map(t => t._id === task._id ? editedTask : t));
      setTask({ ...task, ...editedTask });
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task');
    } finally {
      setSaving(false);
    }
  };

  const updateField = async (field, value) => {
    const updated = { ...editedTask, [field]: value };
    setEditedTask(updated);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        API_URLS.getTask(task._id),
        updated,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks(prevTasks => prevTasks.map(t => t._id === task._id ? updated : t));
      setTask({ ...task, ...updated });
      // Optionally trigger a refresh of parent component
    } catch (err) {
      console.error(`Error updating ${field}:`, err);
      setError(`Failed to update ${field}`);
      // Revert optimistic update
      setEditedTask({ ...editedTask });
    }
  };

  const handleLogWorkSubmit = async () => {
    if (!workLog.hours && !workLog.minutes) return;
    
    setSubmittingWorkLog(true);
    try {
      const token = localStorage.getItem('token');
      
      await axios.post(
        API_URLS.addWorklog(task._id),
        {
          hours: workLog.hours,
          description: workLog.description
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setWorkLog({ hours: 0, description: '' });
      setShowLogWork(false);
      setError('');
    } catch (err) {
      console.error('Error logging work:', err);
      setError('Failed to log work');
    } finally {
      setSubmittingWorkLog(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (!task) return null;

  const priorityData = ['High', 'Medium', 'Low'];

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return '#ae2a19';
      case 'Medium': return '#f97462';
      case 'Low': return '#2684c0';
      default: return '#626f86';
    }
  };

  const getStatusColor = (column) => {
    const statusColors = {
      'Backlog': '#b3bac5',
      'Selected for Development': '#4bcdfe',
      'In Progress': '#fec57b',
      'Done': '#61bd4f',
      'Ready for Review': '#c377e0',
      'In Review': '#fd7792',
      'Ready for Test': '#44546f',
      'Testing': '#1f8aed',
    };
    return statusColors[column] || '#b3bac5';
  };
    const formatWorklogDate = (dateString) => {
      try {
        return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
      } catch (err) {
        return dateString;
      }
    };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 1,
          minHeight: '85vh',
          maxHeight: '95vh',
        }
      }}
    >
      {/* Jira-style Header */}
      <Box sx={{ 
        bgcolor: 'white', 
        p: 2.5,
        borderBottom: '1px solid #dfe1e6',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
      }}>
          <Box
            sx={{
              position: 'relative',
              '&:hover .edit-title-icon': {
                opacity: 1
              }
            }}
          >
            
            {isEditingTitle ? (
              <div style={{ display: 'flex', flexDirection: "row", gap: 8 }}>
              { task.ticketNumber && <Chip
              label={`#${task.ticketNumber}`}
              size="small"
              sx={{
                bgcolor: '#deebff',
                color: '#0055cc',
                fontWeight: 'bold',
                fontSize: '0.75rem'
              }}
            />}
              <TextField
                value={editedTask.title || ''}
                onChange={(e) => updateField('title', e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setIsEditingTitle(false);
                  }
                }}
                size="small"
                autoFocus
                fullWidth
                sx={{
                  mb: 1,
                }}
              />
              </div>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  cursor: 'pointer',
                  minHeight: '40px',
                  '&:hover': {
                    bgcolor: '#f7f8f9',
                    borderRadius: 1
                  }
                }}
                onClick={() => setIsEditingTitle(true)}
              >
                 { task.ticketNumber &&   <Chip
              label={`#${task.ticketNumber}`}
              size="small"
              sx={{
                bgcolor: '#deebff',
                color: '#0055cc',
                fontWeight: 'bold',
                fontSize: '0.75rem'
              }}
            />}
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: '#161b22',
                    flex: 1,
                    py: 0.5,
                    px: 1
                  }}
                >
                  {editedTask.title || task.title || 'Untitled'}
                </Typography>
                <Tooltip title="Edit title">
                  <IconButton
                    size="small"
                    className="edit-title-icon"
                    sx={{
                      opacity: 0,
                      transition: 'opacity 0.2s',
                      color: '#0055cc'
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Box>
        
        <IconButton onClick={onClose} sx={{ color: '#626f86' }}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Box sx={{ 
        bgcolor: 'white', 
        p: 2.5,
        borderBottom: '1px solid #dfe1e6',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
        gap: 3

      }}>

          <Grid item xs={8} md={8} lg={8} sx={{ borderRight: { md: '1px solid #dfe1e6' }, overflowY: 'auto', height: '100%' }}>
            <Box sx={{ p: 3 }}>
              {/* Description Section */}
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle2" fontWeight="700" sx={{ color: '#161b22' }}>
                    Description
                  </Typography>
                  {!isEditing && (
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => setIsEditing(true)} sx={{ color: '#0055cc' }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
                
                {isEditing ? (
                  <TextField
                    fullWidth
                    multiline
                    rows={6}
                    value={editedTask.description || ''}
                    onChange={(e) => setEditedTask({...editedTask, description: e.target.value})}
                    variant="outlined"
                    size="small"
                    sx={{ mb: 2 }}
                  />
                ) : (
                  <Typography variant="body2" sx={{ color: '#626f86', lineHeight: 1.6, whiteSpace: 'pre-wrap', minHeight: 60 }}>
                    {task.description || 'No description provided.'}
                  </Typography>
                )}
                
                {isEditing && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        setIsEditing(false);
                        setEditedTask({ ...task });
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handleSaveTask}
                      disabled={saving}
                      sx={{ bgcolor: '#0055cc', textTransform: 'none' }}
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </Button>
                  </Box>
                )}
              </Box>

              
              <Divider sx={{ my: 3, borderColor: '#dfe1e6' }} />

              {/* Attachments Section */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle2" fontWeight="700" sx={{ color: '#161b22', mb: 2 }}>
                  Attachments
                </Typography>

                {/* Upload Attachment */}
                <Paper sx={{ p: 2, mb: 3, bgcolor: '#f7f8f9', border: '1px solid #dfe1e6' }}>
                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="caption" fontWeight="600" sx={{ color: '#161b22', display: 'block', mb: 1 }}>
                      Add file
                    </Typography>
                    <input
                      id="file-input"
                      type="file"
                      onChange={(e) => setNewAttachment(e.target.files[0])}
                      style={{
                        padding: '8px',
                        border: '1px solid #dfe1e6',
                        borderRadius: '4px',
                        width: '100%',
                        cursor: 'pointer'
                      }}
                    />
                  </Box>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Description (optional)"
                    value={attachmentDescription}
                    onChange={(e) => setAttachmentDescription(e.target.value)}
                    sx={{ mb: 1.5 }}
                  />
                  <Button
                    fullWidth
                    variant="contained"
                    size="small"
                    onClick={handleUploadAttachment}
                    disabled={submittingAttachment || !newAttachment}
                    sx={{ bgcolor: '#0055cc', textTransform: 'none' }}
                  >
                    {submittingAttachment ? 'Uploading...' : 'Upload'}
                  </Button>
                </Paper>

                {/* Attachments List */}
                {loadingAttachments ? (
                  <Box display="flex" justifyContent="center" py={2}>
                    <CircularProgress size={24} />
                  </Box>
                ) : attachments.length > 0 ? (
                  <Box>
                    {attachments.map((attachment) => (
                      <Paper
                        key={attachment._id}
                        sx={{
                          p: 1.5,
                          mb: 1.5,
                          bgcolor: '#f7f8f9',
                          border: '1px solid #dfe1e6',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight="600" sx={{ color: '#0055cc', cursor: 'pointer' }}>
                            {attachment.originalName}
                          </Typography>
                          <Box display="flex" gap={1} alignItems="center">
                            <Typography variant="caption" color="text.secondary">
                              {formatFileSize(attachment.size)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {format(new Date(attachment.uploadedAt), 'MMM dd, yyyy')}
                            </Typography>
                          </Box>
                          {attachment.description && (
                            <Typography variant="caption" sx={{ color: '#626f86', display: 'block', mt: 0.5 }}>
                              {attachment.description}
                            </Typography>
                          )}
                        </Box>
                        <Box>
                          <Tooltip title="Download">
                            <IconButton
                              size="small"
                              onClick={() => handleDownloadAttachment(attachment)}
                              sx={{ color: '#0055cc' }}
                            >
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteAttachment(attachment._id)}
                              sx={{ color: '#ae2a19' }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    No attachments yet
                  </Typography>
                )}
              </Box>

              <Divider sx={{ my: 3, borderColor: '#dfe1e6' }} />

              {/* Comments Section */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle2" fontWeight="700" sx={{ color: '#161b22', mb: 2 }}>
                  Activity
                </Typography>

                {/* Add Comment */}
                <Paper sx={{ p: 2, mb: 3, bgcolor: '#f7f8f9', border: '1px solid #dfe1e6' }}>
                  <Box display="flex" gap={1}>
                    <Avatar sx={{ bgcolor: '#0055cc', width: 36, height: 36, fontSize: '0.9rem' }}>
                      {user?.email?.charAt(0).toUpperCase() || '?'}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        variant="outlined"
                        size="small"
                        sx={{ mb: 1 }}
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={handleSubmitComment}
                          disabled={submittingComment || !newComment.trim()}
                          sx={{ bgcolor: '#0055cc', textTransform: 'none' }}
                        >
                          Save
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </Paper>

                {/* Comments List */}
                {loadingComments ? (
                  <Box display="flex" justifyContent="center" py={2}>
                    <CircularProgress size={24} />
                  </Box>
                ) : comments.length > 0 ? (
                  <Box>
                    {comments.map((comment) => (
                      <Box key={comment._id} sx={{ mb: 2, display: 'flex', gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: '#0055cc', width: 32, height: 32, fontSize: '0.8rem' }}>
                          {comment.authorEmail?.charAt(0).toUpperCase() || '?'}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="subtitle2" fontWeight="600" sx={{ color: '#161b22' }}>
                              {comment.authorEmail?.split('@')[0]}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {format(new Date(comment.createdAt), 'MMM dd, yyyy HH:mm')}
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ color: '#626f86', mt: 0.5 }}>
                            {comment.content}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    No comments yet
                  </Typography>
                )}
              </Box>

              {error && (
                <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError('')}>
                  {error}
                </Alert>
              )}

            </Box>
          </Grid>

          <Grid item xs={4} md={4} lg={4} sx={{ bgcolor: '#f7f8f9', overflowY: 'auto', height: '100%' }}>
            <Box sx={{ p: 3 }}>
              <Typography variant="subtitle2" fontWeight="700" sx={{ color: '#161b22', mb: 2.5 }}>
                Details
              </Typography>

              {/* Status */}
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="caption" fontWeight="600" sx={{ color: '#626f86', display: 'block', mb: 0.75 }}>
                  Status
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={editedTask.column || ''}
                    onChange={(e) => updateField('column', e.target.value)}
                    displayEmpty
                  >
                    {columnOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Priority */}
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="caption" fontWeight="600" sx={{ color: '#626f86', display: 'block', mb: 0.75 }}>
                  Priority
                </Typography>
                {task.priority ? (
                  <Box display="flex" alignItems="center" gap={0.75}>
                    <Box sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: getPriorityColor(task.priority)
                    }} />
                    <FormControl fullWidth size="small">
                  <Select
                    value={editedTask.priority || ''}
                    onChange={(e) => updateField('priority', e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="">Unassigned</MenuItem>
                    {priorityData.map((item,ind) => (
                      <MenuItem key={ind} value={item}>
                        {item}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                  </Box>
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    No priority
                  </Typography>
                )}
              </Box>

              <Divider sx={{ my: 2.5, borderColor: '#dfe1e6' }} />

              {/* Assignee */}
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="caption" fontWeight="600" sx={{ color: '#626f86', display: 'block', mb: 0.75 }}>
                  Assignee
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={editedTask.assignee || ''}
                    onChange={(e) => updateField('assignee', e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="">Unassigned</MenuItem>
                    {users.map((user) => (
                      <MenuItem key={user._id} value={user.email}>
                        {user.email}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Due Date */}
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="caption" fontWeight="600" sx={{ color: '#626f86', display: 'block', mb: 0.75 }}>
                  Due Date
                </Typography>
                <TextField
                  fullWidth
                  type="date"
                  size="small"
                  value={editedTask.dueDate ? editedTask.dueDate.split('T')[0] : ''}
                  onChange={(e) => updateField('dueDate', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>

              <Divider sx={{ my: 2.5, borderColor: '#dfe1e6' }} />

              {/* Created By */}
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="caption" fontWeight="600" sx={{ color: '#626f86', display: 'block', mb: 0.75 }}>
                  Created
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Avatar sx={{ bgcolor: '#0055cc', width: 28, height: 28, fontSize: '0.8rem' }}>
                    {task.createdByEmail?.charAt(0).toUpperCase() || '?'}
                  </Avatar>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#161b22', fontWeight: 500, display: 'block' }}>
                      {task.createdByEmail?.split('@')[0]}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {task.updatedAt ? format(new Date(task.updatedAt), 'MMM dd, yyyy') : 'Recently'}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Log Work Button */}
              <Button
                fullWidth
                variant="outlined"
                size="small"
                onClick={() => setShowLogWork(!showLogWork)}
                sx={{ 
                  textTransform: 'none',
                  color: '#0055cc',
                  borderColor: '#dfe1e6',
                  '&:hover': { bgcolor: '#f7f8f9' }
                }}
              >
                {showLogWork ? 'Hide' : 'Log Work'}
              </Button>

              {showLogWork && (
                <Paper sx={{ p: 2, mt: 2, bgcolor: 'white', border: '1px solid #dfe1e6' }}>
                  <Typography variant="caption" fontWeight="600" sx={{ color: '#161b22', display: 'block', mb: 1 }}>
                    Log Time
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <TextField
                        type="number"
                        label="Hours"
                        size="small"
                        fullWidth
                        value={workLog.hours}
                        onChange={(e) => setWorkLog({...workLog, hours: e.target.value})}
                        inputProps={{ min: 0 }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        multiline
                        rows={2}
                        label="Description"
                        size="small"
                        fullWidth
                        value={workLog.description}
                        onChange={(e) => setWorkLog({...workLog, description: e.target.value})}
                        placeholder="What did you work on?"
                      />
                    </Grid>
                  </Grid>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => setShowLogWork(false)}
                      sx={{ textTransform: 'none' }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={handleLogWorkSubmit}
                      disabled={submittingWorkLog}
                      sx={{ bgcolor: '#0055cc', textTransform: 'none' }}
                    >
                      Log Time
                    </Button>
                  </Box>
                </Paper>
              )}
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
          </Grid>
          </Box>

      <DialogActions sx={{ p: 2.5, borderTop: '1px solid #dfe1e6', bgcolor: 'white' }}>
          <Button onClick={onClose} sx={{ textTransform: 'none', color: '#626f86' }}>
            Close
          </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskDetails;
