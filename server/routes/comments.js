const express = require('express');
const Comment = require('../models/Comment');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all comments for a task
router.get('/task/:taskId', auth, async (req, res) => {
  try {
    const comments = await Comment.find({ task: req.params.taskId })
      .populate('user', 'email')
      .sort({ createdAt: -1 });
    
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new comment
router.post('/', auth, async (req, res) => {
  try {
    const { taskId, content } = req.body;
    
    if (!taskId || !content || content.trim() === '') {
      return res.status(400).json({ error: 'Task ID and content are required' });
    }

    // Check if task exists
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const comment = await Comment.create({
      task: taskId,
      user: req.user._id,
      userEmail: req.user.email,
      content: content.trim()
    });

    // Populate user info for response
    const populatedComment = await Comment.findById(comment._id)
      .populate('user', 'email');

    // Create notification for task assignee (if different from commenter)
    if (task.assignee && task.assignee !== req.user.email) {
      await Notification.create({
        user: req.user._id, // This should be the assignee's user ID, but we need to find it
        // For now, we'll skip this until we have user lookup by email
        type: 'comment_added',
        title: 'New comment on your task',
        message: `${req.user.email} commented on task: ${task.title}`,
        task: taskId,
        relatedUser: req.user._id
      });
    }

    res.status(201).json(populatedComment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a comment
router.put('/:id', auth, async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Content is required' });
    }

    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if user owns the comment
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this comment' });
    }

    comment.content = content.trim();
    comment.updatedAt = Date.now();
    await comment.save();

    const populatedComment = await Comment.findById(comment._id)
      .populate('user', 'email');

    res.json(populatedComment);
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a comment
router.delete('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if user owns the comment or is admin (for simplicity, just owner for now)
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    await comment.deleteOne();
    
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;