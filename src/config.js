// API configuration
// In Docker, REACT_APP_API_URL should be empty string for relative URLs (nginx proxy)
// In development, it should be 'http://localhost:5000'
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Helper to ensure URLs are properly formatted
const buildUrl = (path) => {
  if (API_BASE_URL && API_BASE_URL !== '') {
    return `${API_BASE_URL}${path}`;
  }
  return path; // Relative URL
};

export const API_URLS = {
  AUTH: {
    LOGIN: buildUrl('/api/auth/login'),
    REGISTER: buildUrl('/api/auth/register'),
  },
  TASKS: {
    BASE: buildUrl('/api/tasks'),
    USERS: buildUrl('/api/tasks/users'),
    TIME_REPORT: buildUrl('/api/tasks/time'),
    REORDER: buildUrl('/api/tasks/reorder'),
    NOTIFICATIONS: buildUrl('/api/tasks/notifications'),
    NOTIFICATIONS_READ_ALL: buildUrl('/api/tasks/notifications/read-all'),
  },
  COMMENTS: {
    BASE: buildUrl('/api/comments'),
    TASK_COMMENTS: (taskId) => buildUrl(`/api/comments/task/${taskId}`),
  },
  ATTACHMENTS: {
    BASE: buildUrl('/api/attachments'),
    TASK_ATTACHMENTS: (taskId) => buildUrl(`/api/attachments/task/${taskId}`),
    DOWNLOAD: (attachmentId) => buildUrl(`/api/attachments/${attachmentId}/download`),
  },
  getTask: (taskId) => buildUrl(`/api/tasks/${taskId}`),
  getTaskById: (taskId) => buildUrl(`/api/tasks/getTaskById/${taskId}`),
  getTaskHistory: (taskId) => buildUrl(`/api/tasks/${taskId}/history`),
  getTaskWorklogs: (taskId) => buildUrl(`/api/tasks/${taskId}/worklogs`),
  addWorklog: (taskId) => buildUrl(`/api/tasks/${taskId}/worklogs`),
  getNotificationRead: (notificationId) => buildUrl(`/api/tasks/notifications/${notificationId}/read`),
  deleteNotification: (notificationId) => buildUrl(`/api/tasks/notifications/${notificationId}`),
};

export default API_BASE_URL;