Acceptance Criteria- 
  Build the JIRA Kanban board similar to this - https://www.atlassian.com/software/jira/templates/kanban
 
Here are the **Key Performance Indicators (KPIs)** to evaluate whether the VibeFlow Kanban Board is "Done" and meets the scope requirements.
## Completion KPIs: VibeFlow Kanban Board
 
These KPIs are grouped by functional area and are designed to be **binary** (Pass/Fail). All must be **Pass** for the assignment to be considered complete.

 For now just create a login module , will work on kanban board after words , 1st just stick on completing standard login module based on below given instructions
### 🔐 User Management & Authentication
 
| # | KPI | Verification Method |
| 1 | User can register with email and password | Create a new account via UI; confirm success redirect/message. |
| 2 | Registered user can log in successfully | Log in with created credentials; session established. |
| 3 | Invalid login credentials are rejected with appropriate error | Attempt login with wrong password; see error message. |
| 4 | Session persists after browser restart | Close and reopen browser; user remains logged in. |
| 5 | User can log out and session is terminated | Click logout; attempt to access protected page; redirected to login. |
| 6 | Password is stored hashed (not plaintext) | Inspect database; password column contains bcrypt hash or similar. |

Technical Details
1. Develop using react js and node js, use mongodb database
2. my react js project is already initialized - ai-kanban-board
3. only use javascript not typescript

