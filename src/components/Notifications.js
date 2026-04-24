import React, { useState, useEffect } from 'react';
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Task as TaskIcon,
  Person as PersonIcon,
  Comment as CommentIcon,
  AttachFile as AttachFileIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import axios from 'axios';
import { API_URLS } from '../config';

const Notifications = ({ user }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const open = Boolean(anchorEl);

  useEffect(() => {
    if (open && user) {
      fetchNotifications();
    }
  }, [open, user]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(API_URLS.TASKS.NOTIFICATIONS, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(API_URLS.getNotificationRead(notificationId), {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(notifications.map(n => 
        n._id === notificationId ? { ...n, read: true } : n
      ));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(API_URLS.TASKS.NOTIFICATIONS_READ_ALL, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(API_URLS.deleteNotification(notificationId), {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(notifications.filter(n => n._id !== notificationId));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'task_assigned':
        return <TaskIcon sx={{ color: '#1a237e' }} />;
      case 'task_due':
        return <ScheduleIcon sx={{ color: '#d32f2f' }} />;
      case 'comment_added':
        return <CommentIcon sx={{ color: '#388e3c' }} />;
      case 'attachment_added':
        return <AttachFileIcon sx={{ color: '#f57c00' }} />;
      case 'task_updated':
        return <CheckCircleIcon sx={{ color: '#1976d2' }} />;
      case 'mention':
        return <PersonIcon sx={{ color: '#7b1fa2' }} />;
      default:
        return <NotificationsIcon sx={{ color: '#757575' }} />;
    }
  };

  const getNotificationTitle = (type) => {
    switch (type) {
      case 'task_assigned': return 'Task Assigned';
      case 'task_due': return 'Task Due Soon';
      case 'comment_added': return 'New Comment';
      case 'attachment_added': return 'Attachment Added';
      case 'task_updated': return 'Task Updated';
      case 'mention': return 'You Were Mentioned';
      default: return 'Notification';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{
          position: 'relative',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 380,
            maxHeight: 500,
            borderRadius: 2,
            mt: 1,
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="600">
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Button
              size="small"
              onClick={handleMarkAllAsRead}
              sx={{ textTransform: 'none' }}
            >
              Mark all as read
            </Button>
          )}
        </Box>

        <Divider />

        {error && (
          <Alert severity="error" sx={{ mx: 2, my: 1 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : notifications.length > 0 ? (
          <List sx={{ p: 0 }}>
            {notifications.map((notification) => (
              <ListItem
                key={notification._id}
                sx={{
                  py: 1.5,
                  px: 2,
                  backgroundColor: notification.read ? 'transparent' : '#f0f4ff',
                  borderLeft: notification.read ? 'none' : '3px solid #1a237e',
                  '&:hover': {
                    backgroundColor: notification.read ? '#f5f5f5' : '#e8eaf6',
                  },
                }}
                secondaryAction={
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => handleMarkAsRead(notification._id)}
                      title="Mark as read"
                    >
                      <CheckCircleIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteNotification(notification._id)}
                      title="Delete"
                      sx={{ ml: 0.5 }}
                    >
                      <ErrorIcon fontSize="small" />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'transparent' }}>
                    {getNotificationIcon(notification.type)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="subtitle2" fontWeight={notification.read ? 400 : 600}>
                      {getNotificationTitle(notification.type)}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" color="text.primary">
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {format(new Date(notification.createdAt), 'MMM dd, HH:mm')}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <NotificationsIcon sx={{ fontSize: 48, color: '#e0e0e0', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No notifications
            </Typography>
          </Box>
        )}

        <Divider />
        
        <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
          <Button size="small" onClick={handleClose} sx={{ textTransform: 'none' }}>
            Close
          </Button>
        </Box>
      </Menu>
    </>
  );
};

export default Notifications;