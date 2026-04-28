const express = require("express");
const Task = require("../models/Task");
const User = require("../models/User");
const AssignmentHistory = require("../models/AssignmentHistory");
const Worklog = require("../models/Worklog");
const Notification = require("../models/Notification");
const auth = require("../middleware/auth");
const { logActivity } = require("./activities");

const router = express.Router();

// Get all tasks (shared board) with optional filtering
router.get("/", auth, async (req, res) => {
  try {
    const { search, ticketNumber, assignee, priority, dueDate, status } = req.query;

    // Build filter object
    const filter = {};

    // Search filter (title or description contains search term)
    if (search && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");
      filter.$or = [
        { title: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
      ];
    }

    // Ticket number filter (partial match)
    if (ticketNumber && ticketNumber.trim() !== "") {
      const ticketNum = parseInt(ticketNumber.trim());
      if (!isNaN(ticketNum)) {
        filter.ticketNumber = ticketNum;
      } else {
        // If not a valid number, try regex match on string representation
        const ticketRegex = new RegExp(ticketNumber.trim(), "i");
        filter.ticketNumber = { $regex: ticketRegex };
      }
    }

    // Assignee filter (exact match)
    if (assignee && assignee.trim() !== "") {
      filter.assignee = assignee.trim();
    }
    if (status && status.trim() !== "") {
      filter.status = status.trim();
    }

    // Priority filter (exact match)
    if (priority && priority.trim() !== "") {
      filter.priority = priority.trim();
    }

    // Due date filter (tasks due on or before selected date)
    if (dueDate && dueDate.trim() !== "") {
      const filterDate = new Date(dueDate.trim());
      if (!isNaN(filterDate.getTime())) {
        // Set to end of day for inclusive filtering
        const endOfDay = new Date(filterDate);
        endOfDay.setHours(23, 59, 59, 999);
        filter.dueDate = { $lte: endOfDay };
      }
    }

    const tasks = await Task.find(filter)
      .populate("createdBy", "email")
      .sort({ column: 1, position: 1 });
    res.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/getTaskById/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json(task);
  } catch (error) {
    console.error("Error fetching task:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Create new task
router.post("/", auth, async (req, res) => {
  try {
    const { title, description, assignee, dueDate } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({ error: "Title is required" });
    }

    if (title.length > 255) {
      return res
        .status(400)
        .json({ error: "Title cannot exceed 255 characters" });
    }

    // Get max position in Backlog column
    const maxPositionTask = await Task.findOne({ column: "Backlog" }).sort({
      position: -1,
    });
    const position = maxPositionTask ? maxPositionTask.position + 1 : 0;

    const task = await Task.create({
      title: title.trim(),
      description: description || "",
      column: "Backlog",
      assignee: assignee || "",
      dueDate: dueDate || null,
      createdBy: req.user._id,
      createdByEmail: req.user.email,
      position,
    });

    const populatedTask = await Task.findById(task._id).populate(
      "createdBy",
      "email",
    );
    res.status(201).json(populatedTask);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get all users for assignee dropdown
router.get("/users", auth, async (req, res) => {
  try {
    const users = await User.find({}, "email _id").sort({ email: 1 });
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Update task (move between columns, edit details)
router.put("/:id", auth, async (req, res) => {
  try {
    const {
      title,
      description,
      column,
      assignee,
      dueDate,
      position,
      priority,
    } = req.body;

    // Get current task to check if assignee is changing
    const currentTask = await Task.findById(req.params.id);
    if (!currentTask) {
      return res.status(404).json({ error: "Task not found" });
    }

    const updateData = {};
    if (title !== undefined) {
      if (title.length > 255) {
        return res
          .status(400)
          .json({ error: "Title cannot exceed 255 characters" });
      }
      updateData.title = title.trim();
    }
    if (description !== undefined) updateData.description = description;
    if (column !== undefined) updateData.column = column;
    if (assignee !== undefined) updateData.assignee = assignee;
    if (dueDate !== undefined) updateData.dueDate = dueDate;
    if (position !== undefined) updateData.position = position;
    if (priority !== undefined) updateData.priority = priority;

    const task = await Task.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    }).populate("createdBy", "email");

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Record assignment history if assignee changed
    if (assignee !== undefined && currentTask.assignee !== assignee) {
      await AssignmentHistory.create({
        task: task._id,
        oldAssignee: currentTask.assignee || null,
        newAssignee: assignee || null,
        changedBy: req.user._id,
        changedByEmail: req.user.email,
      });
    }

    // Log activities for all changed fields
    if (title !== undefined && currentTask.title !== title) {
      await logActivity(
        task._id,
        "title",
        currentTask.title,
        title,
        req.user._id,
        req.user.email
      );
    }
    if (description !== undefined && currentTask.description !== description) {
      await logActivity(
        task._id,
        "description",
        currentTask.description,
        description,
        req.user._id,
        req.user.email
      );
    }
    if (column !== undefined && currentTask.column !== column) {
      await logActivity(
        task._id,
        "status",
        currentTask.column,
        column,
        req.user._id,
        req.user.email
      );
    }
    if (assignee !== undefined && currentTask.assignee !== assignee) {
      await logActivity(
        task._id,
        "assignee",
        currentTask.assignee,
        assignee,
        req.user._id,
        req.user.email
      );
    }
    if (dueDate !== undefined && currentTask.dueDate?.toString() !== dueDate?.toString()) {
      await logActivity(
        task._id,
        "dueDate",
        currentTask.dueDate,
        dueDate,
        req.user._id,
        req.user.email
      );
    }
    if (priority !== undefined && currentTask.priority !== priority) {
      await logActivity(
        task._id,
        "priority",
        currentTask.priority,
        priority,
        req.user._id,
        req.user.email
      );
    }

    res.json(task);
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get assignment history for a task
router.get("/:id/history", auth, async (req, res) => {
  try {
    const history = await AssignmentHistory.find({ task: req.params.id })
      .populate("changedBy", "email")
      .sort({ changedAt: -1 }); // Most recent first (KPI 24)

    res.json(history);
  } catch (error) {
    console.error("Error fetching assignment history:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete task
router.delete("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Reorder tasks within a column
router.post("/reorder", auth, async (req, res) => {
  try {
    const { column, taskOrder } = req.body;

    const updates = taskOrder.map((taskId, index) => ({
      updateOne: {
        filter: { _id: taskId },
        update: { position: index },
      },
    }));

    await Task.bulkWrite(updates);
    res.json({ message: "Tasks reordered successfully" });
  } catch (error) {
    console.error("Error reordering tasks:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Log work time for a task
router.post("/:id/worklogs", auth, async (req, res) => {
  try {
    const { hours, description } = req.body;
    const taskId = req.params.id;

    // Validate hours
    if (!hours || isNaN(hours) || hours <= 0) {
      return res
        .status(400)
        .json({ error: "Valid hours (positive number) is required" });
    }

    // Check if task exists
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    const worklog = await Worklog.create({
      task: taskId,
      user: req.user._id,
      userEmail: req.user.email,
      hours: parseFloat(hours),
      description: description || "",
    });

    res.status(201).json(worklog);
  } catch (error) {
    console.error("Error logging work:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get worklogs for a task
router.get("/:id/worklogs", auth, async (req, res) => {
  try {
    const taskId = req.params.id;

    const worklogs = await Worklog.find({ task: taskId })
      .sort({ loggedAt: -1 })
      .populate("user", "email");

    res.json(worklogs);
  } catch (error) {
    console.error("Error fetching worklogs:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get time report (summary of worklogs across all tasks)
router.get("/time", auth, async (req, res) => {
  try {
    // Aggregate worklogs by task with total hours
    const report = await Worklog.aggregate([
      {
        $lookup: {
          from: "tasks",
          localField: "task",
          foreignField: "_id",
          as: "taskInfo",
        },
      },
      { $unwind: "$taskInfo" },
      {
        $group: {
          _id: "$task",
          title: { $first: "$taskInfo.title" },
          ticketNumber: { $first: "$taskInfo.ticketNumber" },
          status: { $first: "$taskInfo.column" },
          assignee: { $first: "$taskInfo.assignee" },
          loggedAt: { $first: "$loggedAt" },
          totalHours: { $sum: "$hours" },
          userEmail: { $first: "$userEmail" },
        },
      },
      { $sort: { title: 1 } },
    ]);

    // Calculate grand total
    const grandTotal = report.reduce((sum, task) => sum + task.totalHours, 0);

    res.json({
      tasks: report,
      grandTotal: parseFloat(grandTotal.toFixed(2)),
    });
  } catch (error) {
    console.error("Error generating time report:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get user notifications
router.get("/notifications", auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .populate("task", "title ticketNumber")
      .populate("relatedUser", "email")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Mark notification as read
router.put("/notifications/:id/read", auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { read: true },
      { new: true },
    );

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json(notification);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Mark all notifications as read
router.put("/notifications/read-all", auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, read: false },
      { read: true },
    );

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete notification
router.delete("/notifications/:id", auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
