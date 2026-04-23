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
  CardContent
} from '@mui/material';
import { Download as DownloadIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { format } from 'date-fns';

const TimeReport = ({ user }) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          Time Report
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchTimeReport}
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={exportToCSV}
          >
            Export CSV
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Tasks Tracked
              </Typography>
              <Typography variant="h4">
                {report?.tasks?.length || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Hours Logged
              </Typography>
              <Typography variant="h4">
                {report?.grandTotal?.toFixed(2) || '0.00'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Average Hours per Task
              </Typography>
              <Typography variant="h4">
                {report?.tasks?.length > 0
                  ? (report.grandTotal / report.tasks.length).toFixed(2)
                  : '0.00'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="subtitle1" gutterBottom>
        Time logged across all tasks
      </Typography>

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell><strong>Ticket #</strong></TableCell>
              <TableCell><strong>Task Title</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Assignee</strong></TableCell>
              <TableCell align="right"><strong>Total Hours</strong></TableCell>
              <TableCell><strong>Logged At</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {report?.tasks?.length > 0 ? (
              report.tasks.map((task) => (
                <TableRow key={task._id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium" color="primary">
                      {task.ticketNumber ? `#${task.ticketNumber}` : 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {task.title}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={task.status}
                      color={getStatusColor(task.status)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {task.assignee || (
                      <Typography variant="body2" color="text.secondary">
                        Unassigned
                      </Typography>
                    )}
                  </TableCell>
                  
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="bold">
                      {task.totalHours.toFixed(2)} hrs
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {task.loggedAt ? format(new Date(task.loggedAt), 'MMM dd, yyyy HH:mm') : (
                      <Typography variant="body2" color="text.secondary">
                        N/A
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No time logged yet. Start logging work on tasks to see reports.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {report?.tasks?.length > 0 && (
              <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                <TableCell colSpan={4} align="right">
                  <Typography variant="body1" fontWeight="bold">
                    Grand Total:
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body1" fontWeight="bold">
                    {report.grandTotal.toFixed(2)} hrs
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box mt={3}>
        <Typography variant="body2" color="text.secondary">
          <strong>Note:</strong> This report shows total hours logged per task across all users. 
          Worklogs are immutable and associated with the user who logged them.
        </Typography>
      </Box>
    </Box>
  );
};

export default TimeReport;