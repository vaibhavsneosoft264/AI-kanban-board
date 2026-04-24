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
      if (e.defaultPrevented) return;
      if (onTaskEdit) {
        onTaskEdit(task);
      }
    };

    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
    const columnColor = columns.find(col => col.id === task.column)?.color || '#1a237e';

    const getPriorityColor = (priority) => {
      switch(priority) {
        case 'High': return '#ef5350';
        case 'Medium': return '#ffa726';
        case 'Low': return '#66bb6a';
        default: return '#bdbdbd';
      }
    };

    return (
      <Card
        className="task-card"
        elevation={0}
        sx={{
          mb: 2,
          cursor: 'pointer',
          border: `1px solid #e0e0e0`,
          borderLeft: `4px solid ${columnColor}`,
          borderRadius: 1,
          backgroundColor: 'white',
          transition: 'all 0.2s ease',
          padding: 1.5,
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            borderColor: columnColor,
          },
        }}
        draggable
        onDragStart={(e) => handleDragStart(e, task._id)}
        onClick={handleClick}
      >
        {/* Title and Ticket */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
          
          {task.ticketNumber && (
            <Chip
              label={`#${task.ticketNumber}`}
              size="small"
              sx={{
                fontWeight: 'bold',
                fontSize: '0.7rem',
                height: 20,
                minWidth: 'auto',
                px: 0.5,
                ml: 0.5,
                flexShrink: 0
              }}
            />
          )}
          <Typography variant="subtitle2" fontWeight="600" sx={{
            color: '#1a237e',
            fontSize: '0.9rem',
            lineHeight: 1.3,
            flex: 1,
            wordBreak: 'break-word'
          }}>
            {task.title}
          </Typography>
        </Box>

        {/* Metadata row */}
        <Box display="flex" justifyContent="space-between" alignItems="center" gap={0.5} flexWrap="wrap">
          <Box display="flex" gap={0.5} alignItems="center">
            {task.priority && (
              <Chip
                label={task.priority}
                size="small"
                sx={{
                  fontSize: '0.65rem',
                  height: 18,
                  backgroundColor: getPriorityColor(task.priority),
                  color: 'white',
                  fontWeight: 'bold',
                  minWidth: 'auto',
                  px: 0.75
                }}
              />
            )}
            {task.assignee && (
              <Chip
                icon={<PersonIcon sx={{ fontSize: '0.7rem' }} />}
                label={task.assignee?.split(' ')[0]}
                size="small"
                variant="outlined"
                sx={{
                  fontSize: '0.65rem',
                  height: 18,
                  borderColor: '#b3e5fc',
                  backgroundColor: '#e1f5fe'
                }}
              />
            )}
          </Box>
          
          {task.dueDate && (
            <Chip
              icon={<CalendarIcon sx={{ fontSize: '0.7rem' }} />}
              label={format(new Date(task.dueDate), 'MMM dd')}
              size="small"
              sx={{
                fontSize: '0.65rem',
                height: 18,
                backgroundColor: isOverdue ? '#ffebee' : '#f5f5f5',
                color: isOverdue ? '#d32f2f' : '#424242',
                fontWeight: isOverdue ? 600 : 400,
                borderColor: isOverdue ? '#ef5350' : 'transparent',
                border: isOverdue ? '1px solid' : 'none'
              }}
            />
          )}
        </Box>
      </Card>
    );
  };

  return (
    <Box sx={{ p: 3 }}>

      {/* 2x4 Grid Layout */}
      <Box sx={{
        position: 'relative',
        borderRadius: 3,
        p: 3,
        mb: 2,
        backgroundColor: 'white',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        border: '1px solid #e8eaf6'
      }}>
        <Typography variant="subtitle1" fontWeight="600" sx={{
          mb: 3,
          ml: 1,
          color: '#1a237e',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          Workflow Stages (2x4 Grid)
             <Tooltip title="Create new task">
            <IconButton
              sx={{
                bgcolor: '#17b93a',
                color: 'white',
                '&:hover': {
                  bgcolor: '#088b25',
                },
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(26, 35, 126, 0.3)',
                marginLeft: 1,
                fontSize : 15
              }}
              onClick={() => onTaskCreate && onTaskCreate()}
            >
              Create Ticket
            </IconButton>
          </Tooltip>
          <Chip
            label={`${tasks.length} Total Tasks`}
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 600, marginLeft: 1, fontSize: '0.75rem' }}
          />
        </Typography>
          
       
        
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
            lg: 'repeat(4, 1fr)'
          },
          gridTemplateRows: {
            xs: 'auto',
            sm: 'auto',
            md: 'repeat(2, 300px)',
            lg: 'repeat(2, 300px)'
          },
          gap: 2,
          height: 'calc(100vh - 200px)',
          minHeight: '600px',
          pb: 2,
        }}>
          {columns.map((column, index) => (
           <Paper
             key={column.id}
             elevation={0}
             sx={{
               p: 2,
               height: '100%',
               backgroundColor: 'white',
               borderLeft: `6px solid ${column.color}`,
               borderRadius: 2,
               border: '1px solid #e0e0e0',
               boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
               transition: 'all 0.3s ease',
               '&:hover': {
                 boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                 transform: 'translateY(-2px)',
                 borderColor: column.color,
               },
               display: 'flex',
               flexDirection: 'column'
             }}
             onDragOver={handleDragOver}
             onDrop={(e) => handleDrop(e, column.id)}
           >
             <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, maxWidth: '70%' }}>
                 <Box sx={{
                   width: 10,
                   height: 10,
                   borderRadius: '50%',
                   backgroundColor: column.color,
                   flexShrink: 0
                 }} />
                 <Typography variant="subtitle1" fontWeight="700" sx={{
                   color: '#1a237e',
                   fontSize: '0.9rem',
                   whiteSpace: 'nowrap',
                   overflow: 'hidden',
                   textOverflow: 'ellipsis'
                 }}>
                   {column.title}
                 </Typography>
               </Box>
               <Chip
                 label={getTasksByColumn(column.id).length}
                 size="small"
                 sx={{
                   bgcolor: column.color,
                   color: 'white',
                   fontWeight: 'bold',
                   fontSize: '0.75rem',
                   minWidth: 28,
                   height: 22
                 }}
               />
             </Box>
             
             <Box sx={{
               flexGrow: 1,
               overflowY: 'auto',
               pr: 0.5,
               // Custom scrollbar for column - WebKit browsers
               '&::-webkit-scrollbar': {
                 width: '4px',
               },
               '&::-webkit-scrollbar-track': {
                 background: 'transparent',
               },
               '&::-webkit-scrollbar-thumb': {
                 background: '#e0e0e0',
                 borderRadius: '2px',
               },
               // Standard scrollbar for Firefox
               scrollbarWidth: 'thin',
               scrollbarColor: '#e0e0e0 transparent',
             }}>
               {getTasksByColumn(column.id).map((task) => (
                 <TaskCard key={task._id} task={task} />
               ))}
               
               {getTasksByColumn(column.id).length === 0 && (
                 <Box
                   sx={{
                     p: 3,
                     textAlign: 'center',
                     border: '2px dashed #e0e0e0',
                     borderRadius: 1.5,
                     color: 'text.secondary',
                     backgroundColor: '#fafafa',
                     mt: 1,
                     height: '80px',
                     display: 'flex',
                     flexDirection: 'column',
                     justifyContent: 'center'
                   }}
                 >
                   <Typography variant="caption" sx={{ mb: 0.5 }}>
                     Empty column
                   </Typography>
                   <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                     Drop tasks here
                   </Typography>
                 </Box>
               )}
             </Box>
           </Paper>
          ))}
        </Box>
        
        <Box sx={{
          mt: 3,
          pt: 2,
          borderTop: '1px solid #e8eaf6',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="caption" color="text.secondary">
            <strong>Tip:</strong> Drag tasks between columns to update status
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Grid: 2 rows × 4 columns • Total columns: 8
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default KanbanBoard;