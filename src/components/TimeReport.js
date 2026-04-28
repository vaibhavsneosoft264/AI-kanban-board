import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URLS } from '../config';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Grid,
  Card,
  CardContent,
  alpha,
  useTheme
} from '@mui/material';
import {
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Task as TaskIcon,
  AccessTime as TimeIcon,
  TrendingUp as TrendingIcon,
  Description as ReportIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

const TimeReport = ({ user }) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const theme = useTheme();

  const fetchTimeReport = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(API_URLS.TASKS.TIME_REPORT, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReport(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load time report. Please try again.');
      console.error('Error fetching time report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeReport();
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      'Backlog': 'default',
      'To Do': 'info',
      'In Progress': 'warning',
      'In Review': 'secondary',
      'Testing': 'primary',
      'Done': 'success',
      'Deployed': 'success',
      'Archived': 'default'
    };
    return colors[status] || 'default';
  };

  const exportToCSV = () => {
    if (!report || !report.tasks) return;

    const headers = ['Ticket #', 'Task Title', 'Status', 'Assignee', 'Total Hours', 'Logged At'];
    const rows = report.tasks.map(task => [
      task.ticketNumber ? `#${task.ticketNumber}` : 'N/A',
      task.title,
      task.status,
      task.assignee || 'Unassigned',
      task.totalHours.toFixed(2),
      task.loggedAt ? format(new Date(task.loggedAt), 'MMM dd, yyyy HH:mm') : 'N/A'
    ]);

    // Add grand total row
    rows.push(['', '', '', 'Grand Total', report.grandTotal.toFixed(2)]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `time-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header Section */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          mb: 4,
          p: 3,
          backgroundColor: alpha(theme.palette.primary.main, 0.08),
          borderRadius: 3,
          borderLeft: `6px solid ${theme.palette.primary.main}`,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}
      >
        <Box sx={{ mb: { xs: 2, md: 0 } }}>
          <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <ReportIcon sx={{ mr: 2, fontSize: 36, color: theme.palette.primary.main }} />
            Time Report Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ ml: 6 }}>
            Track and analyze time spent across all tasks with detailed insights
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchTimeReport}
            sx={{ borderRadius: 2, borderWidth: 2, '&:hover': { borderWidth: 2 } }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={exportToCSV}
            sx={{ borderRadius: 2, boxShadow: 3, background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)` }}
          >
            Export CSV
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
              background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.15)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
              border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 16px 32px rgba(0,0,0,0.15)'
              }
            }}
          >
            <CardContent sx={{ p: 3, position: 'relative' }}>
              <Box display="flex" alignItems="center" mb={2}>
                <Box
                  sx={{
                    backgroundColor: alpha(theme.palette.info.main, 0.2),
                    borderRadius: 3,
                    p: 2,
                    mr: 2,
                    boxShadow: `0 4px 8px ${alpha(theme.palette.info.main, 0.3)}`
                  }}
                >
                  <TaskIcon sx={{ color: theme.palette.info.main, fontSize: 32 }} />
                </Box>
                <Box>
                  <Typography sx={{mt : 2}} color="text.secondary" variant="body2" fontWeight="medium">
                    Total Tasks Tracked
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color="info.main" sx={{ mt: 1 }}>
                    {report?.tasks?.length || 0}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                Across all statuses and assignees
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
              background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.15)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
              border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 16px 32px rgba(0,0,0,0.15)'
              }
            }}
          >
            <CardContent sx={{ p: 3, position: 'relative' }}>
              <Box display="flex" alignItems="center" mb={2}>
                <Box
                  sx={{
                    backgroundColor: alpha(theme.palette.success.main, 0.2),
                    borderRadius: 3,
                    p: 2,
                    mr: 2,
                    boxShadow: `0 4px 8px ${alpha(theme.palette.success.main, 0.3)}`
                  }}
                >
                  <TimeIcon sx={{ color: theme.palette.success.main, fontSize: 32 }} />
                </Box>
                <Box>
                  <Typography sx={{mt : 2}} color="text.secondary" variant="body2" fontWeight="medium">
                    Total Hours Logged
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color="success.main" sx={{ mt: 1 }}>
                    {report?.grandTotal?.toFixed(2) || '0.00'}
                    <Typography component="span" variant="h6" color="text.secondary" sx={{ ml: 1 }}>
                      hrs
                    </Typography>
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                Sum of all worklogs
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
              background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.15)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`,
              border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 16px 32px rgba(0,0,0,0.15)'
              }
            }}
          >
            <CardContent sx={{ p: 3, position: 'relative' }}>
              <Box display="flex" alignItems="center" mb={2}>
                <Box
                  sx={{
                    backgroundColor: alpha(theme.palette.warning.main, 0.2),
                    borderRadius: 3,
                    p: 2,
                    mr: 2,
                    boxShadow: `0 4px 8px ${alpha(theme.palette.warning.main, 0.3)}`
                  }}
                >
                  <TrendingIcon sx={{ color: theme.palette.warning.main, fontSize: 32 }} />
                </Box>
                <Box>
                  <Typography sx={{mt : 2}} color="text.secondary" variant="body2" fontWeight="medium">
                    Average Hours per Task
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color="warning.main" sx={{ mt: 1 }}>
                    {report?.tasks?.length > 0
                      ? (report.grandTotal / report.tasks.length).toFixed(2)
                      : '0.00'}
                    <Typography component="span" variant="h6" color="text.secondary" sx={{ ml: 1 }}>
                      hrs
                    </Typography>
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                Mean time per task
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Table Section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', color: theme.palette.primary.dark }}>
          <CalendarIcon sx={{ mr: 2, fontSize: 28, color: theme.palette.primary.main }} />
          Time Logged Across All Tasks
        </Typography>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 3,
          boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
          overflow: 'hidden',
          border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
          background: `linear-gradient(to bottom, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.7)})`
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{
              background: `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(theme.palette.primary.main, 0.08)} 100%)`,
              borderBottom: `3px solid ${alpha(theme.palette.primary.main, 0.4)}`
            }}>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem', py: 3, color: theme.palette.primary.dark }}>
                <Box display="flex" alignItems="center">
                  <Typography fontWeight="bold" sx={{ fontSize: '1rem' }}>Ticket #</Typography>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem', py: 3, color: theme.palette.primary.dark }}>
                <Box display="flex" alignItems="center">
                  <Typography fontWeight="bold" sx={{ fontSize: '1rem' }}>Task Title</Typography>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem', py: 3, color: theme.palette.primary.dark }}>
                <Box display="flex" alignItems="center">
                  <Typography fontWeight="bold" sx={{ fontSize: '1rem' }}>Status</Typography>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem', py: 3, color: theme.palette.primary.dark }}>
                <Box display="flex" alignItems="center">
                  <PersonIcon sx={{ fontSize: 18, mr: 1, color: theme.palette.primary.main }} />
                  <Typography fontWeight="bold" sx={{ fontSize: '1rem' }}>Assignee</Typography>
                </Box>
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1rem', py: 3, color: theme.palette.primary.dark }}>
                <Box display="flex" alignItems="center" justifyContent="flex-end">
                  <TimeIcon sx={{ fontSize: 18, mr: 1, color: theme.palette.primary.main }} />
                  <Typography fontWeight="bold" sx={{ fontSize: '1rem' }}>Total Hours</Typography>
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem', py: 3, color: theme.palette.primary.dark }}>
                <Box display="flex" alignItems="center">
                  <CalendarIcon sx={{ fontSize: 18, mr: 1, color: theme.palette.primary.main }} />
                  <Typography fontWeight="bold" sx={{ fontSize: '1rem' }}>Logged At</Typography>
                </Box>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {report?.tasks?.length > 0 ? (
              report.tasks.map((task, index) => (
                <TableRow
                  key={task._id}
                  hover
                  sx={{
                    backgroundColor: index % 2 === 0 ? 'transparent' : alpha(theme.palette.action.hover, 0.06),
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.12)
                    }
                  }}
                >
                  <TableCell sx={{ py: 2.5 }}>
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      color="primary"
                      sx={{
                        backgroundColor: alpha(theme.palette.primary.main, 0.12),
                        display: 'inline-block',
                        px: 2,
                        py: 1,
                        borderRadius: 2
                      }}
                    >
                      {task.ticketNumber ? `#${task.ticketNumber}` : 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 2.5 }}>
                    <Typography variant="body1" fontWeight="medium">
                      {task.title}
                    </Typography>
                    {task.description && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        {task.description.substring(0, 60)}...
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ py: 2.5 }}>
                    <Chip
                      label={task.status}
                      color={getStatusColor(task.status)}
                      size="small"
                      variant="filled"
                      sx={{
                        fontWeight: 'bold',
                        borderRadius: 1
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ py: 2.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      {task.assignee || 'Unassigned'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ py: 2.5 }}>
                    <Typography
                      variant="body1"
                      fontWeight="bold"
                      color="success.main"
                      sx={{
                        fontSize: '1.1rem',
                        backgroundColor: alpha(theme.palette.success.main, 0.12),
                        display: 'inline-block',
                        px: 2,
                        py: 1,
                        borderRadius: 2
                      }}
                    >
                      {task.totalHours.toFixed(2)} hrs
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 2.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      {task.loggedAt
                        ? format(new Date(task.loggedAt), 'MMM dd, yyyy HH:mm')
                        : 'N/A'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <TimeIcon
                      sx={{
                        fontSize: 64,
                        color: alpha(theme.palette.text.secondary, 0.3),
                        mb: 2
                      }}
                    />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No time logs recorded
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Start logging time to see your entries here
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Grand Total Footer */}
      {report?.tasks?.length > 0 && (
        <Box
          sx={{
            mt: 4,
            p: 3,
            backgroundColor: alpha(theme.palette.success.main, 0.1),
            borderRadius: 2,
            border: `2px solid ${alpha(theme.palette.success.main, 0.3)}`
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexDirection: { xs: 'column', sm: 'row' }
            }}
          >
            <Box>
              <Typography variant="h6" fontWeight="bold" color="text.primary" gutterBottom>
                Total Time Investment
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Across all {report?.tasks?.length} tasks tracked
              </Typography>
            </Box>
            <Typography
              variant="h4"
              fontWeight="bold"
              color="success.main"
              sx={{
                mt: { xs: 2, sm: 0 },
                fontSize: { xs: '1.8rem', md: '2.2rem' }
              }}
            >
              {report?.grandTotal?.toFixed(2)} hours
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default TimeReport;
