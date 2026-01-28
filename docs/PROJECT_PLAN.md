# To-Do App Project Plan

## 1. Feature Ideas (Beyond the Basics)

This list extends the core concept of a to-do list while ignoring feature bloat ("kitchen sink" features).

### Core Structure & Organization
1.  **Context-Aware Lists (Smart Lists)**
    *   **Value:** Automatically aggregates tasks based on criteria (e.g., "Due Today", "High Priority", "Quick Wins (<5 min)").
    *   **UI/UX:** Sidebar filters that are read-only views of the main data.
    *   **Data Model:** Dynamic queries on the main task array. No separate storage needed.
2.  **Nested Sub-tasks (Infinite or N-Level)**
    *   **Value:** Breaks down complex projects (e.g., "Plan Wedding" -> "Venue" -> "Call Places").
    *   **UI/UX:** Indented items with collapsible arrows. Drag-and-drop to nest/unnest.
    *   **Data Model:** Tasks have a `parentId` field (adjacency list) or `children` array (tree structure).
3.  **Project "Topic" Cards**
    *   **Value:** Visual separation for distinct areas of life (Work, Personal, Hobby).
    *   **UI/UX:** Grid view of "Cards" on the home screen instead of just a sidebar list.
    *   **Data Model:** `List` object containing metadata (color, icon) and an ID referenced by tasks.

### Productivity & Workflow
4.  **"Next Action" Focus Mode**
    *   **Value:** Reduces overwhelm by showing only the single top-priority item from each list.
    *   **UI/UX:** A dedicated "Zen" modal or view showing one big item at a time.
    *   **Data Model:** Filter logic: `task.order === 0` && `!task.completed`.
5.  **Periodic Recurring Tasks**
    *   **Value:** Automates habits and chores ("Pay Rent" every 1st of month).
    *   **UI/UX:** "Repeat" dropdown in task details.
    *   **Data Model:** `recurrenceRule` field (e.g., cron syntax or simple object `{ frequency: 'daily', interval: 1 }`). Logic required to generate *next* instance upon completion.
6.  **Quick-Add Smart Parsing (NLP)**
    *   **Value:** Speed. Type "Call Mom tomorrow at 5pm #personal" -> parses date, tag, and time.
    *   **UI/UX:** Single input bar that highlights recognized keywords as pills.
    *   **Data Model:** Regex or library parsing to extract metadata before saving.
7.  **Morning "Daily Standup" Review**
    *   **Value:** Intentional planning. Prompts user to select 3 distinct tasks for "Today" before letting them into the list.
    *   **UI/UX:** A modal wizard on first open each day: "What will you achieve today?"
    *   **Data Model:** `plannedDate` field.

### Rich Content
8.  **Markdown Notes per Task**
    *   **Value:** Storing details, links, or sub-thoughts without cluttering the task title.
    *   **UI/UX:** Expand icon on task hover opens a text area.
    *   **Data Model:** `notes` string field (Markdown storage).
9.  **Attachments / Link Previews**
    *   **Value:** Reference material right where the work happens.
    *   **UI/UX:** Paste a URL, get a nice og:image card.
    *   **Data Model:** `attachments` array of objects `{ type: 'link', url: '...' }`.

### Visuals & Feedback
10. **Progress Rings/Bars per List**
    *   **Value:** Dopamine hit and quick status overview.
    *   **UI/UX:** Circular progress ring around the list icon.
    *   **Data Model:** Calculated property: `(completedCount / totalCount) * 100`.
11. **"Don't Break the Chain" Habit View**
    *   **Value:** Visual consistency tracking for recurring tasks.
    *   **UI/UX:** Calendar heatmap (GitHub style) for specific habit tasks.
    *   **Data Model:** `completionHistory` array of timestamps for recurring items.
12. **Theme/Skin Engine**
    *   **Value:** Personalization makes users stick.
    *   **UI/UX:** "Dark/Light" toggle + checkmark color accents.
    *   **Data Model:** User preferences object `{ theme: 'dark', accent: 'blue' }` stored in localStorage.

### Advanced
13. **Time Boxing / Pomodoro Integration**
    *   **Value:** Execution aid.
    *   **UI/UX:** "Start Timer" button on a task.
    *   **Data Model:** `timeSpent` integer (seconds) accumulating on the task.

---

## 2. Prioritized Roadmap

### Phase 1: MVP (The "Must-Haves")
*Focus: Creating a usable list that persists.*
*   **Lists:** Create, Rename, Delete lists.
*   **Tasks:** Add, Edit, Delete, Check/Uncheck.
*   **Data:** LocalStorage persistence (no login required).
*   **UI:** Clean, responsive mobile-friendly layout.
*   **State:** Basic drag-and-drop reordering.

### Phase 2: "Pro" Feel (Nice-to-Haves)
*Focus: Increasing utility and stickiness.*
*   **Smart Lists:** "Today" and "Trash" views.
*   **Notes:** Add details to tasks.
*   **Tags:** Simple `#tag` system.
*   **Dark Mode:** System-respecting toggle.
*   **Keyboard Shortcuts:** `N` for new task, `Esc` to close details.

### Phase 3: Advanced
*Focus: Ecosystem and power features.*
*   **Cloud Sync:** Supabase/Firebase Auth & Store.
*   **NLP:** Smart date parsing.
*   **Progress Visualization:** Charts/Graphs.
*   **PWA:** Installable capabilities.

---

## 3. Validation Prompts (User Research)

How to validate these checks without writing code:

1.  **The "Paper Test" for Nested Tasks:**
    *   *Prompt:* "Write down your plan for a weekend trip on this paper. Show me how you group the items."
    *   *Insight:* Do they use indentation? Bullets? Separate pages? (Validates UX for nesting vs. lists).

2.  **Card Sorting for Navigation:**
    *   *Prompt:* "Here are 20 sticky notes with common tasks. Organize them into piles that make sense to you."
    *   *Insight:* Reveals user mental models for "Tags" vs "Lists".

3.  **The "Morning Routine" Question:**
    *   *Prompt:* "Walk me through the first 3 minutes of your workday. What do you look at?"
    *   *Insight:* Validates the need for "Focus Mode" or "Daily Review".

4.  **Wireframe Feedback:**
    *   *Task:* Show a sketch of the 'Quick Add' bar.
    *   *Ask:* "If you typed 'Buy Milk tomorrow', what would you expect to happen?"

---

## 4. GitHub & Delivery Plan

### Repository Setup
*   **Name Suggestions:** `flow-state`, `minima-do`, `clarity-list`, `task-architect`.
*   **Branching Strategy:**
    *   `main`: Production-ready code.
    *   `dev`: Integration branch.
    *   `feature/feature-name`: Specific new capabilities (e.g., `feature/dark-mode`).

### Directory Structure (Scaffolding)
```text
/
├── .github/              # Issue templates, workflows
├── src/
│   ├── components/       # Atom/Molecule components (Button, Input)
│   ├── features/         # Feature-specific logic (TaskList, Sidebar)
│   ├── hooks/            # Custom React hooks (useLocalStorage)
│   ├── lib/              # Helpers / Utilities (date formatting)
│   ├── types/            # TypeScript interfaces
│   ├── App.tsx
│   └── main.tsx
├── public/               # Static assets
├── docs/                 # Documentation & Plans
│   └── PROJECT_PLAN.md   # This file
├── README.md             # Project overview
└── package.json
```

### Immediate Next Steps (Today)
1.  Initialize Git repository.
2.  Create the folder structure above.
3.  Add the `PROJECT_PLAN.md` to `docs/`.
4.  Create a `README.md` containing the vision and setup steps.
