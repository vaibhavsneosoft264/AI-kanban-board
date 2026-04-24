const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Attachment = require('../models/Attachment');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept common file types
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain', 'text/csv',
      'application/zip', 'application/x-rar-compressed'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, documents, and archives are allowed.'));
    }
  }
});

// Get all attachments for a task
router.get('/task/:taskId', auth, async (req, res) => {
  try {
    const attachments = await Attachment.find({ task: req.params.taskId })
      .populate('user', 'email')
      .sort({ uploadedAt: -1 });
    
    res.json(attachments);
  } catch (error) {
    console.error('Error fetching attachments:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Upload a new attachment
router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    const { taskId, description } = req.body;
    
    if (!taskId || !req.file) {
      return res.status(400).json({ error: 'Task ID and file are required' });
    }

    // Check if task exists
    const task = await Task.findById(taskId);
    if (!task) {
      // Clean up uploaded file if task doesn't exist
      if (req.file.path) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ error: 'Task not found' });
    }

    const attachment = await Attachment.create({
      task: taskId,
      user: req.user._id,
      userEmail: req.user.email,
      filename: req.file.filename,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      filePath: req.file.path,
      description: description || ''
    });

    // Populate user info for response
    const populatedAttachment = await Attachment.findById(attachment._id)
      .populate('user', 'email');

    // Create notification for task assignee (if different from uploader)
    if (task.assignee && task.assignee !== req.user.email) {
      await Notification.create({
        user: req.user._id, // This should be the assignee's user ID
        type: 'attachment_added',
        title: 'New attachment on your task',
        message: `${req.user.email} added an attachment to task: ${task.title}`,
        task: taskId,
        relatedUser: req.user._id
      });
    }

    res.status(201).json(populatedAttachment);
  } catch (error) {
    console.error('Error uploading attachment:', error);
    // Clean up uploaded file on error
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// Download an attachment
router.get('/:id/download', auth, async (req, res) => {
  try {
    const attachment = await Attachment.findById(req.params.id);
    
    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    // Check if file exists
    if (!fs.existsSync(attachment.filePath)) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    // Set headers for download
    res.download(attachment.filePath, attachment.originalName);
  } catch (error) {
    console.error('Error downloading attachment:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete an attachment
router.delete('/:id', auth, async (req, res) => {
  try {
    const attachment = await Attachment.findById(req.params.id);
    
    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    // Check if user owns the attachment or is task creator
    const task = await Task.findById(attachment.task);
    if (attachment.user.toString() !== req.user._id.toString() && 
        task.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this attachment' });
    }

    // Delete file from filesystem
    if (fs.existsSync(attachment.filePath)) {
      fs.unlinkSync(attachment.filePath);
    }

    await attachment.deleteOne();
    
    res.json({ message: 'Attachment deleted successfully' });
  } catch (error) {
    console.error('Error deleting attachment:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;