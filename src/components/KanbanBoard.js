import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  IconButton,
  Chip,
  Avatar,
  Tooltip
} from '@mui/material';
import {
  DragIndicator as DragIndicatorIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

const columns = [
  { id: 'Backlog', title: 'Backlog', color: '#FF6B6B' },
  { id: 'Selected for Development', title: 'Selected for Development', color: '#4ECDC4' },
  { id: 'In Progress', title: 'In Progress', color: '#45B7D1' },
  { id: 'Done', title: 'Done', color: '#96CEB4' },
  { id: 'Ready for Review', title: 'Ready for Review', color: '#FFEAA7' },
  { id: 'In Review', title: 'In Review', color: '#DDA0DD' },
  { id: 'Ready for Test', title: 'Ready for Test', color: '#98D8C8' },
  { id: 'Testing', title: 'Testing', color: '#F7DC6F' }
];

const KanbanBoard = ({ tasks = [], onTaskCreate, onTaskEdit, onTaskUpdate, onTaskReorder }) => {
  const [localTasks, setLocalTasks] = useState(tasks);

  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const getTasksByColumn = (columnId) => {
    return localTasks
      .filter(task => task.column === columnId)
      .sort((a, b) => a.position - b.position);
  };

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.setData('sourceColumn', localTasks.find(t => t._id === taskId)?.column || '');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, columnId) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    const sourceColumn = e.dataTransfer.getData('sourceColumn');
    const task = localTasks.find(t => t._id === taskId);
    
    if (!task) return;

    // Get all tasks in the target column (sorted by position)
    const columnTasks = getTasksByColumn(columnId);
    
    if (sourceColumn === columnId) {
      // Reordering within the same column - KPI 18
      const currentIndex = columnTasks.findIndex(t => t._id === taskId);
      if (currentIndex === -1) return;
      
      // Get drop position relative to other tasks
      const dropY = e.clientY;
      const columnElement = e.currentTarget;
      
      // Find the task element at the drop position
      const taskElements = columnElement.querySelectorAll('.task-card');
      let dropIndex = columnTasks.length - 1; // Default to bottom
      
      for (let i = 0; i < taskElements.length; i++) {
        const taskElement = taskElements[i];
        const taskRect = taskElement.getBoundingClientRect();
        const taskMiddleY = taskRect.top + taskRect.height / 2;
        
        if (dropY < taskMiddleY) {
          dropIndex = i;
          break;
        }
      }
      
      // Adjust drop index if dragging from above to below
      if (currentIndex < dropIndex) {
        dropIndex--; // Account for removal of the dragged task
      }
      
      // Remove from current position and insert at drop position
      const newColumnTasks = [...columnTasks];
      newColumnTasks.splice(currentIndex, 1);
      newColumnTasks.splice(dropIndex, 0, task);
      
      // Update positions
      const updatedTasks = newColumnTasks.map((t, index) => ({
        ...t,
        position: index
      }));
      
      // Update local state
      setLocalTasks(prev =>
        prev.map(t => {
          const updatedTask = updatedTasks.find(ut => ut._id === t._id);
          return updatedTask || t;
        })
      );
      
      // Call reorder API
      if (onTaskReorder) {
        const taskOrder = newColumnTasks.map(t => t._id);
        onTaskReorder(columnId, taskOrder);
      }
      
      return;
    }
    
    // Moving between columns
    if (task.column !== columnId) {
      const updatedTask = { ...task, column: columnId };
      setLocalTasks(prev => prev.map(t => t._id === taskId ? updatedTask : t));
      if (onTaskUpdate) {
        onTaskUpdate(taskId, { column: columnId });
      }
    }
  };

  const TaskCard = ({ task }) => {
    const handleClick = (e) => {
      // Prevent click when dragging
      if (e.defaultPrevented) return;
      if (onTaskEdit) {
        onTaskEdit(task);
      }
    };

    return (
      <Card
        className="task-card"
        sx={{
          mb: 2,
          cursor: 'pointer',
          '&:hover': { boxShadow: 3, transform: 'translateY(-2px)', transition: 'transform 0.2s' }
        }}
        draggable
        onDragStart={(e) => handleDragStart(e, task._id)}
        onClick={handleClick}
      >
      <CardContent sx={{ p: 2 }}>
        <Box display="flex" alignItems="flex-start">
          <DragIndicatorIcon sx={{ color: 'text.secondary', mr: 1, mt: 0.5 }} />
          <Box flex={1}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                {task.title}
              </Typography>
              {task.ticketNumber && (
                <Chip
                  size="small"
                  label={`#${task.ticketNumber}`}
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}
                />
              )}
            </Box>
            
            {task.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {task.description.length > 100 
                  ? `${task.description.substring(0, 100)}...` 
                  : task.description}
              </Typography>
            )}

            <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
              {task.assignee && (
                <Chip
                  size="small"
                  icon={<PersonIcon />}
                  label={task.assignee}
                  variant="outlined"
                />
              )}
              
              {task.dueDate && (
                <Chip
                  size="small"
                  icon={<CalendarIcon />}
                  label={format(new Date(task.dueDate), 'MMM dd')}
                  variant="outlined"
                  color={new Date(task.dueDate) < new Date() ? 'error' : 'default'}
                />
              )}
            </Box>

            <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
              <Typography variant="caption" color="text.secondary">
                Created by: {task.createdByEmail || 'Unknown'}
              </Typography>
              <Avatar sx={{ width: 24, height: 24, bgcolor: '#1976d2' }}>
                {task.createdByEmail?.charAt(0).toUpperCase() || '?'}
              </Avatar>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Kanban Board
        </Typography>
        <Tooltip title="Add new task">
          <IconButton
            color="primary"
            sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
            onClick={() => onTaskCreate && onTaskCreate()}
          >
            <AddIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{
        position: 'relative',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        p: 2,
        mb: 2,
        backgroundColor: '#fafafa'
      }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, ml: 1 }}>
          Scroll horizontally to view all columns →
        </Typography>
        
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
            lg: 'repeat(8, 1fr)'
          },
          gap: 3,
          overflowX: 'auto',
          overflowY: 'hidden',
          pb: 3,
          pt: 1,
          // Custom decorative scrollbar at top
          '&::-webkit-scrollbar': {
            height: '10px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'linear-gradient(90deg, #f1f1f1 0%, #e0e0e0 100%)',
            borderRadius: '10px',
            margin: '0 10px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'linear-gradient(90deg, #1976d2 0%, #2196f3 100%)',
            borderRadius: '10px',
            border: '2px solid #f1f1f1',
            '&:hover': {
              background: 'linear-gradient(90deg, #1565c0 0%, #1976d2 100%)',
            }
          },
          // Firefox scrollbar styling
          scrollbarWidth: 'thin',
          scrollbarColor: '#1976d2 #f1f1f1',
        }}>
          {columns.map((column) => (
            <Paper
              key={column.id}
              sx={{
                p: 2,
                minHeight: '70vh',
                minWidth: '250px',
                backgroundColor: `${column.color}15`,
                borderTop: `4px solid ${column.color}`,
                borderRadius: 2
              }}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold">
                  {column.title}
                </Typography>
                <Chip
                  label={getTasksByColumn(column.id).length}
                  size="small"
                  sx={{ bgcolor: column.color, color: 'white' }}
                />
              </Box>
              
              <Box>
                {getTasksByColumn(column.id).map((task) => (
                  <TaskCard key={task._id} task={task} />
                ))}
                
                {getTasksByColumn(column.id).length === 0 && (
                  <Box
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      border: '2px dashed #ccc',
                      borderRadius: 1,
                      color: 'text.secondary'
                    }}
                  >
                    <Typography>Drop tasks here</Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default KanbanBoard;