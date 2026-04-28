# Structured Prompts Guide: Building VibeFlow Kanban Board

## Introduction
This document demonstrates how structured, detailed prompts were used to guide AI development of the VibeFlow Kanban Board project from Thursday 23-04-2026 to completion. The prompts follow a systematic approach that ensures clear requirements, measurable outcomes, and efficient development.

## Prompt Structure Philosophy

### Key Principles
1. **Clarity Over Brevity:** Detailed specifications prevent ambiguity
2. **Measurable Outcomes:** Binary KPIs for clear completion criteria
3. **Iterative Refinement:** Build in phases with feedback loops
4. **Technical Precision:** Specify technologies, patterns, and constraints

## Phase 1: Project Initiation Prompts

### Prompt 1: Project Setup & Authentication
```
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
```

**Key Elements:**
- Clear acceptance criteria (JIRA-like Kanban board)
- Binary KPIs with verification methods
- Phased approach (start with authentication)
- Technical constraints specified (MERN stack, JavaScript only)

## Phase 2: Core Feature Prompts

### Prompt 2: Task Management & Kanban Board
```
Now implement the Kanban board with the following KPIs:

### 📋 Task Management

| # | KPI | Verification Method |
| 7 | User can create a new task | Click "Create Ticket"; modal opens and saves |
| 8 | Task appears in Backlog column after creation | New task visible in Backlog column |
| 9 | Task title is required (validation) | Attempt empty title; shows error |
| 10 | Task title max length 255 characters enforced | Attempt longer title; shows error |
| 11 | Task can be edited (title, description, assignee, due date) | Open task modal, edit fields, save changes |
| 12 | Task can be deleted with confirmation | Delete button shows confirmation dialog |

### 🎯 Kanban Board & Workflow

| # | KPI | Verification Method |
| 13 | Board displays 8 columns matching JIRA template | Visual verification of all 8 columns |
| 14 | Tasks can be dragged between columns | Drag task card to another column |
| 15 | Task position updates when dropped in new column | Check task.column field after move |
| 16 | Column highlights when dragging over (visual feedback) | Column border/color changes on drag over |
| 17 | Tasks can be reordered within the same column | Drag task up/down within column |
| 18 | Task order persists after reordering | Refresh page; order maintained |
```

**Key Elements:**
- Continuation from previous phase
- Grouped KPIs by functional area
- Specific UI/UX requirements (8 columns, drag-and-drop)
- Persistence requirements

## Phase 3: Advanced Feature Prompts

### Prompt 3: Assignment History & Time Tracking
```
Implement assignment history tracking and time logging:

### 👤 Assignment Management & History

| # | KPI | Verification Method |
| 19 | Task modal contains a dropdown of all registered users for assignee | Open modal; dropdown lists all users. |
| 20 | Assignee can be changed and saved | Select new assignee, save; task card updates. |
| 21 | Assignee can be set to "Unassigned" (null) | Select empty option, save; assignee removed. |
| 22 | Assignment history is recorded when assignee changes | Change assignee; check AssignmentHistory table for new record. |
| 23 | Assignment history displays in task modal | Open modal; see list of changes with old/new values, who changed, and timestamp. |
| 24 | Assignment history shows correct chronological order (most recent first) | Make multiple changes; verify order in UI. |

### ⏱️ Time Logging & Reporting

| # | KPI | Verification Method |
| 25 | User can log work hours against a task | Open time log modal, enter hours, save |
| 26 | Hours must be positive number (validation) | Attempt negative/zero hours; shows error |
| 27 | Worklog displays who logged time and when | Check worklog entry shows user and timestamp |
| 28 | Time report shows aggregated hours per task | Navigate to Time Report view |
| 29 | Time report calculates grand total of all hours | Verify total sum matches individual sums |
| 30 | Time report can be exported to CSV | Click export button; CSV file downloads |
```

**Key Elements:**
- Audit trail requirements (assignment history)
- Data validation rules (positive hours)
- Reporting functionality (aggregation, CSV export)
- User experience details (dropdowns, modal displays)

## Phase 4: Polish & Optimization Prompts

### Prompt 4: UI Enhancement & Filtering
```
TimeReport component UI is not upto the mark, please make UI more standard and user friendly, please only make UI change do not make anything else change
```

**Key Elements:**
- Specific component focus
- Clear scope limitation (UI only, no functionality changes)
- Quality improvement request

### Prompt 5: Performance Optimization
```
the filters present in kanban board i.e in kanbanboard.js file for filtering the tasks are client side filters , i need server side filters
```

**Key Elements:**
- Performance optimization request
- Specific file reference
- Architecture change (client-side to server-side)
- Clear technical requirement

## Effective Prompt Patterns

### Pattern 1: KPI-Based Requirements
```
[Feature Area]
| # | KPI | Verification Method |
| 1 | [Specific measurable outcome] | [Concrete verification step] |
```

**Benefits:**
- Unambiguous completion criteria
- Built-in testing methodology
- Easy progress tracking

### Pattern 2: Technical Specification
```
Technical Details
1. [Technology constraint]
2. [Architecture decision]
3. [Implementation detail]
```

**Benefits:**
- Prevents technology drift
- Ensures consistency
- Sets implementation boundaries

### Pattern 3: Iterative Refinement
```
For now just create [limited scope], will work on [broader feature] afterwards
```

**Benefits:**
- Manages complexity
- Allows for feedback loops
- Reduces cognitive load

### Pattern 4: Quality Improvement
```
[Component] UI is [problem], please make UI more [desired quality], please only make UI change with more good UI do not make anything else change
```

**Benefits:**
- Focused improvement requests
- Clear scope boundaries
- Quality-driven development

## Prompt Evolution Throughout Project

### Day 1: Foundation
- Broad project vision (JIRA-like Kanban board)
- Authentication foundation
- Technical stack specification

### Day 2-3: Core Features
- Detailed feature KPIs
- UI/UX specifications
- Database design requirements

### Day 4: Advanced Features
- Audit trails and reporting
- Notifications system
- Comprehensive filtering

### Day 5: Polish & Optimization
- UI improvements
- Performance optimizations
- Deployment preparation

## Lessons Learned for Effective AI Collaboration

### What Worked Well
1. **Binary KPIs:** Clear pass/fail criteria eliminated ambiguity
2. **Phased Approach:** Building in manageable chunks prevented overwhelm
3. **Technical Constraints:** Specifying stack and patterns ensured consistency
4. **Verification Methods:** Built-in testing criteria reduced back-and-forth

### Recommended Prompt Structure
```
1. CONTEXT: Brief project overview and current status
2. REQUIREMENTS: Specific features or changes needed
3. CONSTRAINTS: Technical limitations or decisions
4. ACCEPTANCE CRITERIA: Measurable outcomes with verification methods
5. SCOPE BOUNDARIES: What's in/out of scope for this prompt
```

### Anti-Patterns to Avoid
- Vague requirements ("make it better")
- Open-ended questions without constraints
- Multiple major changes in single prompt
- Lack of verification methodology

## Template for Future Projects

### Project Initiation Prompt Template
```
Project: [Project Name]
Goal: [Clear project objective]
Technology: [Stack specification]
Timeline: [Expected duration]

Phase 1: [First phase focus]
KPIs:
1. [KPI 1] - [Verification method]
2. [KPI 2] - [Verification method]

Constraints:
- [Technical constraint 1]
- [Technical constraint 2]

Scope: [What's included in this phase]
```

### Feature Implementation Prompt Template
```
Feature: [Feature name]
Context: [How it fits in current project]
Requirements:
1. [Requirement 1 with details]
2. [Requirement 2 with details]

Acceptance Criteria:
- [Criterion 1 with verification]
- [Criterion 2 with verification]

Technical Details:
- [Implementation notes]
- [Database considerations]
- [UI/UX requirements]
```

## Conclusion

The structured prompt approach demonstrated in the VibeFlow Kanban Board project shows that:

1. **Detailed specifications** lead to more accurate implementations
2. **Measurable KPIs** provide clear completion criteria
3. **Phased development** manages complexity effectively
4. **Technical constraints** ensure consistency and quality

By following these prompt patterns, AI-assisted development can produce complete, production-ready applications with minimal rework and maximum efficiency.

---