const express = require("express");
const Activity = require("../models/Activity");
const Task = require("../models/Task");
const auth = require("../middleware/auth");

const router = express.Router();

// Get all activities for a specific task
router.get("/task/:taskId", auth, async (req, res) => {
  try {
    const { taskId } = req.params;
    
    // Verify task exists
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Get activities for this task, sorted by most recent first
    const activities = await Activity.find({ task: taskId })
      .sort({ changedAt: -1 })
      .populate("changedBy", "name email")
      .lean();

    // Format activities for frontend
    const formattedActivities = activities.map(activity => {
      let message = "";
      const changedByName = activity.changedBy?.name || activity.changedByEmail;
      
      switch (activity.field) {
        case "assignee":
          const oldAssignee = activity.oldValue || "Unassigned";
          const newAssignee = activity.newValue || "Unassigned";
          message = `${changedByName} changed assignee from "${oldAssignee}" to "${newAssignee}"`;
          break;
        case "status":
          const oldStatus = activity.oldValue || "Unknown";
          const newStatus = activity.newValue || "Unknown";
          message = `${changedByName} moved task from "${oldStatus}" to "${newStatus}"`;
          break;
        case "dueDate":
          const oldDate = activity.oldValue ? new Date(activity.oldValue).toLocaleDateString() : "No due date";
          const newDate = activity.newValue ? new Date(activity.newValue).toLocaleDateString() : "No due date";
          message = `${changedByName} changed due date from "${oldDate}" to "${newDate}"`;
          break;
        case "priority":
          const oldPriority = activity.oldValue || "Medium";
          const newPriority = activity.newValue || "Medium";
          message = `${changedByName} changed priority from "${oldPriority}" to "${newPriority}"`;
          break;
        case "title":
          const oldTitle = activity.oldValue || "Untitled";
          const newTitle = activity.newValue || "Untitled";
          message = `${changedByName} changed title from "${oldTitle}" to "${newTitle}"`;
          break;
        case "description":
          message = `${changedByName} updated the description`;
          break;
        default:
          message = `${changedByName} made changes to the task`;
      }

      return {
        ...activity,
        message,
        formattedDate: new Date(activity.changedAt).toLocaleString(),
        icon: getActivityIcon(activity.field)
      };
    });

    res.json({ activities: formattedActivities });
  } catch (error) {
    console.error("Error fetching activities:", error);
    res.status(500).json({ error: "Server error while fetching activities" });
  }
});

// Helper function to get icon for activity type
function getActivityIcon(field) {
  switch (field) {
    case "assignee":
      return "person";
    case "status":
      return "swap_horiz";
    case "dueDate":
      return "calendar_today";
    case "priority":
      return "flag";
    case "title":
      return "title";
    case "description":
      return "description";
    default:
      return "edit";
  }
}

// Log activity (internal use, called from other routes)
const logActivity = async (taskId, field, oldValue, newValue, userId, userEmail) => {
  try {
    // Don't log if values are the same
    if (oldValue === newValue) {
      return;
    }

    const activity = new Activity({
      task: taskId,
      field,
      oldValue,
      newValue,
      changedBy: userId,
      changedByEmail: userEmail
    });

    await activity.save();
    console.log(`Activity logged: ${field} changed for task ${taskId}`);
  } catch (error) {
    console.error("Error logging activity:", error);
  }
};

module.exports = { router, logActivity };