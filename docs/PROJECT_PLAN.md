# To-Do App Project Plan (Vanilla JS Edition)

## 1. Feature Ideas (Beyond the Basics)

### Core Structure & Organization
1.  **Context-Aware Lists (Smart Lists)**: Auto-aggregated "Due Today", "High Priority".
2.  **Nested Sub-tasks**: Indented items with collapsible arrows.
3.  **Project "Topic" Cards**: Visual separation for distinct areas (Work, Personal).

### Productivity & Workflow
4.  **"Next Action" Focus Mode**: Modal showing only the top-priority item.
5.  **Periodic Recurring Tasks**: "Pay Rent" every 1st of month.
6.  **Quick-Add Smart Parsing**: Type "Call Mom tomorrow" -> parses date.
7.  **Daily Review**: Morning wizard to select today's tasks.

### Rich Content
8.  **Markdown Notes**: Text area per task.
9.  **Link Previews**: Visual bookmarks.

### Visuals
10. **Progress Rings**: Visual completion status.
11. **Habit Streak view**: Calendar heatmap.
12. **Theme Engine**: CSS Variable-based Dark/Light mode.

---

## 2. Prioritized Roadmap

### Phase 1: MVP (The "Must-Haves")
*   **Lists:** Create, Rename, Delete lists.
*   **Tasks:** Add, Edit, Delete, Check/Uncheck.
*   **Data:** LocalStorage persistence.
*   **UI:** Responsive Glassmorphism design.

### Phase 2: "Pro" Feel
*   **Smart Lists:** "Today" and "Trash".
*   **Notes:** Expandable task details.
*   **Dark Mode Toggle.**

### Phase 3: Advanced
*   **Cloud Sync.**
*   **NLP Date Parsing.**

---

## 3. Technical Stack
*   **HTML5:** Semantic structure.
*   **CSS3:** Flexbox, Grid, CSS Variables, Backdrop Filter (Glassmorphism).
*   **JavaScript (ES6+):** Modules, LocalStorage, DOM Manipulation.

## 4. Directory Structure
```text
/
├── docs/                 # Documentation
│   └── PROJECT_PLAN.md
├── index.html            # Main Entry
├── style.css             # Stylesheets
├── script.js             # Application Logic
└── README.md             # Overview
```
