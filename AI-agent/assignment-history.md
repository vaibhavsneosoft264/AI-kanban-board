### 👤 Assignment Management & History
 
| # | KPI | Verification Method |
| :-- | :-- | :-- |
| 19 | Task modal contains a dropdown of all registered users for assignee | Open modal; dropdown lists all users. |
| 20 | Assignee can be changed and saved | Select new assignee, save; task card updates. |
| 21 | Assignee can be set to "Unassigned" (null) | Select empty option, save; assignee removed. |
| 22 | Assignment history is recorded when assignee changes | Change assignee; check AssignmentHistory table for new record. |
| 23 | Assignment history displays in task modal | Open modal; see list of changes with old/new values, who changed, and timestamp. |
| 24 | Assignment history shows correct chronological order (most recent first) | Make multiple changes; verify order in UI. |