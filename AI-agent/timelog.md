### ⏱️ Time Logging
 
| # | KPI | Verification Method |
| :-- | :-- | :-- |
| 25 | "Log Work" button exists in task modal | Open any task modal; button is visible. |
| 26 | Time can be logged as decimal hours (e.g., 2.5) | Enter 2.5, add description, save; worklog created. |
| 27 | Worklog is associated with the logged-in user | Log time as User A; check worklog record has correct user_id. |
| 28 | Worklog is immutable (cannot edit or delete via UI) | No edit/delete buttons present for existing worklogs. |
| 29 | Multiple worklogs can be added to the same task | Log time twice; both appear in database. |
 
---
 
### 📊 Time Report View
 
| # | KPI | Verification Method |
| :-- | :-- | :-- |
| 30 | Dedicated report page exists and is navigable | Click nav link; page loads at `/reports/time`. |
| 31 | Report shows each task with Title, Status, Assignee, and Total Hours | Verify all fields present for each task. |
| 32 | Task total hours correctly sums all worklogs for that task | Manually sum worklogs; compare with displayed total. |
| 33 | Project grand total correctly sums all worklogs across all tasks | Manually sum all worklogs; compare with grand total. |
| 34 | Report is accessible to any logged-in user | Log in as any user; report page loads. |