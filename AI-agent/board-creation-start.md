as you have completed login module now we need to create a kanban board on dashboard page with JIRA Kanban board similar to this - https://www.atlassian.com/software/jira/templates/kanban , use material UI for UI part use material UI for styling and css for UI component creation, it should create a task with below given form creation instruction and it should show us the records from db all activity should work with db connection , create apis in backend for the same requirement , it will be have 

### 📋 Shared Board Visibility
 
| # | KPI | Verification Method |
| :-- | :-- | :-- |
| 7 | All authenticated users see the same board and tasks | Log in as User A, create a task. Log in as User B; verify task is visible. |
| 8 | Board displays all 8 columns in correct order | Visual inspection of UI. |
| 9 | Task card displays: Title, Assignee (if any), Due Date (if any), Created By | Create task with all fields; verify all information appears on card. |
 
---
 
### ✏️ Task Creation & Validation
 
| # | KPI | Verification Method |
| :-- | :-- | :-- |
| 10 | New task creation requires only Title | Submit form with only Title; task created successfully. |
| 11 | Title exceeding 255 characters is rejected | Attempt to create task with 300-character title; receive error. |
| 12 | New task defaults to `Backlog` column | Create task; verify it appears in the Backlog column. |
| 13 | New task has no assignee by default | Create task; verify Assignee field is empty/blank. |
| 14 | New task records the creating user as `created_by` | Create task; verify "Created By" shows the logged-in user's email/name. |
| 15 | New task appears at the bottom of the Backlog column | Create multiple tasks; verify newest is last in list. |