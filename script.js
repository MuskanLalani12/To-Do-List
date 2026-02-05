/**
 * Flow State To-Do App
 * Vanilla JS Implementation
 */

// --- Constants & Config ---
const STORAGE_KEY = 'flow_todo_data';
const THEME_KEY = 'flow_theme';

// --- State Management ---
let state = {
    tasks: [],
    lists: ['Personal', 'Work', 'Groceries'],
    activeList: 'Personal', // Specific list name or null (for global views)
    filter: 'all' // 'all', 'active', 'completed'
};

// --- DOM Elements ---
const elements = {
    input: document.getElementById('new-task-input'),
    addBtn: document.getElementById('btn-add-task'),
    taskList: document.getElementById('task-list'),
    emptyState: document.getElementById('empty-state'),
    filterBtns: document.querySelectorAll('.nav-item'),
    listContainer: document.getElementById('lists-container'),
    addListBtn: document.getElementById('btn-add-list'),
    themeBtn: document.getElementById('btn-theme'),
    listTitle: document.getElementById('current-list-title'),
    dateDisplay: document.getElementById('date-display'),
    dateInput: document.getElementById('new-task-date')
};

// --- Initialization ---
function init() {
    loadState();
    loadTheme();
    setupEventListeners();
    render();
    updateDate();
    requestNotificationPermission();
    checkReminders();
    // Check reminders every hour
    setInterval(checkReminders, 60 * 60 * 1000);
    initCursor();
}

// --- Logic: Data & Storage ---

function loadState() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
            const parsed = JSON.parse(data);
            state.tasks = (parsed.tasks || []).map(t => {
                if (t.text && !t.title) {
                    t.title = t.text;
                    delete t.text;
                }
                return t;
            });
            state.lists = parsed.lists || ['Personal', 'Work'];
            state.activeList = parsed.activeList || 'Personal';
            state.filter = parsed.filter || 'all';
        }
    } catch (e) {
        console.error("Failed to load state", e);
    }
}

function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    render();
}

// --- Logic: Tasks ---

function addTask(text) {
    if (!text.trim()) return;

    const dueDate = elements.dateInput.value;

    // If in a global view (activeList === null), default to first list or 'Inbox'
    const targetList = state.activeList || state.lists[0] || 'Inbox';

    const newTask = {
        id: Date.now(),
        title: title.trim(),
        completed: false,
        list: targetList,
        dueDate: dueDate || null,
        createdAt: new Date().toISOString(),
        subtasks: [], // Initialize subtasks array
        reminded: false
    };

    state.tasks.unshift(newTask);
    saveState();
    elements.input.value = '';
    elements.dateInput.value = '';
}

function addSubtask(parentId, text) {
    if (!text || !text.trim()) return;

    const parent = findTaskById(state.tasks, parentId);
    if (parent) {
        if (!parent.subtasks) parent.subtasks = [];

        parent.subtasks.push({
            id: Date.now(),
            title: title.trim(),
            completed: false
        });
        saveState();
    }
}

function toggleTask(id) {
    const task = findTaskById(state.tasks, id);
    if (task) {
        task.completed = !task.completed;
        saveState();
    }
}

function deleteTask(id) {
    // Try to delete from main list first
    const initialLength = state.tasks.length;
    state.tasks = state.tasks.filter(t => t.id !== id);

    // If nothing changed, it might be a subtask
    if (state.tasks.length === initialLength) {
        deleteSubtaskRecursive(state.tasks, id);
    }

    saveState();
}

// Recursive helper to remove subtask from any nested level
function deleteSubtaskRecursive(tasks, id) {
    for (let task of tasks) {
        if (task.subtasks) {
            const initialLen = task.subtasks.length;
            task.subtasks = task.subtasks.filter(t => t.id !== id);
            if (task.subtasks.length < initialLen) return; // Found and deleted

            deleteSubtaskRecursive(task.subtasks, id);
        }
    }
}

// Recursive helper to find any task
function findTaskById(tasks, id) {
    for (let task of tasks) {
        if (task.id === id) return task;
        if (task.subtasks) {
            const found = findTaskById(task.subtasks, id);
            if (found) return found;
        }
    }
    return null;
}

// --- Logic: Lists ---

function createList() {
    const name = prompt("Enter new list name:");
    if (name && name.trim()) {
        const cleanName = name.trim();
        if (!state.lists.includes(cleanName)) {
            state.lists.push(cleanName);
            state.activeList = cleanName; // Switch to new list
            state.filter = 'all';
            saveState();
        } else {
            alert("List already exists!");
        }
    }
}

function deleteList(listName, e) {
    e.stopPropagation();
    if (confirm(`Delete list "${listName}" and all its tasks?`)) {
        state.lists = state.lists.filter(l => l !== listName);
        state.tasks = state.tasks.filter(t => t.list !== listName);

        if (state.activeList === listName) {
            state.activeList = null;
            state.filter = 'all';
        }
        saveState();
    }
}

function switchList(listName) {
    state.activeList = listName;
    state.filter = 'all';
    saveState();
}

function setGlobalFilter(filterType) {
    state.activeList = null;
    state.filter = filterType;
    saveState();
}

// --- Logic: UI ---

function loadTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        updateThemeIcon('dark');
    }
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const newTheme = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    elements.themeBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function updateDate() {
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    elements.dateDisplay.textContent = new Date().toLocaleDateString('en-US', options);
}

// --- Logic: Reminders ---

function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

function checkReminders() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let hasChanges = false;

    state.tasks.forEach(task => {
        if (task.completed || !task.dueDate) return;

        // Reset reminded flag if it's a new day (or if it hasn't been set)
        // We'll store the 'lastRemindedDate' to check if we should remind again
        const taskDate = new Date(task.dueDate);
        taskDate.setHours(0, 0, 0, 0);

        let status = '';
        if (taskDate.getTime() === today.getTime()) {
            status = 'due today';
        } else if (taskDate.getTime() < today.getTime()) {
            status = 'overdue';
        }

        if (status && !task.reminded) {
            triggerNotification(task, status);
            task.reminded = true;
            hasChanges = true;
        }
    });

    if (hasChanges) {
        saveState();
    }
}

function triggerNotification(task, status) {
    const title = `Task ${status.toUpperCase()}!`;
    const options = {
        body: task.title,
        icon: '/favicon.ico' // Or a generic icon
    };

    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, options);
    } else {
        // Fallback: In-app alert or banner
        showInAppReminder(task, status);
    }
}

function showInAppReminder(task, status) {
    const banner = document.createElement('div');
    banner.className = `reminder-banner ${status.replace(' ', '-')}`;
    banner.innerHTML = `
        <span class="icon">${status === 'due today' ? '🟡' : '🔴'}</span>
        <div class="reminder-content">
            <strong>${status.toUpperCase()}:</strong> ${escapeHtml(task.title)}
        </div>
        <button class="btn-close-banner">×</button>
    `;

    document.body.appendChild(banner);

    banner.querySelector('.btn-close-banner').addEventListener('click', () => {
        banner.remove();
    });

    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (banner.parentElement) banner.remove();
    }, 10000);
}

// --- Event Listeners ---

function setupEventListeners() {
    // Add Main Task
    elements.addBtn.addEventListener('click', () => addTask(elements.input.value));
    elements.input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask(elements.input.value);
    });

    // Top Navigation
    elements.filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            setGlobalFilter(btn.dataset.filter);
        });
    });

    // Lists
    elements.addListBtn.addEventListener('click', createList);
    elements.listContainer.addEventListener('click', (e) => {
        const target = e.target;
        const listItem = target.closest('.list-item');
        if (!listItem) return;

        if (target.classList.contains('btn-delete-list')) {
            const name = listItem.dataset.name;
            deleteList(name, e);
        } else {
            const name = listItem.dataset.name;
            switchList(name);
        }
    });

    // Theme
    elements.themeBtn.addEventListener('click', toggleTheme);

    // Task List Delegation (Delete, Toggle, Add Subtask)
    elements.taskList.addEventListener('click', (e) => {
        const target = e.target;

        // Handle Add Subtask Button
        if (target.classList.contains('btn-add-subtask') || target.closest('.btn-add-subtask')) {
            const li = target.closest('.task-item');
            const id = parseInt(li.dataset.id);
            const text = prompt("Enter subtask:");
            if (text) addSubtask(id, text);
            return;
        }

        // Handle Delete Button
        if (target.classList.contains('btn-delete') || target.closest('.btn-delete')) {
            const li = target.closest('.task-item'); // Could be main or sub
            const id = parseInt(li.dataset.id);
            deleteTask(id);
            return;
        }

        // Handle Toggle (Checkbox/Text) inside change event for reliability
        // but if clicked on text, toggle it too? User preference. 
        // Let's keep it strictly to checkbox for now to avoid accidental toggles while selecting text.
    });

    elements.taskList.addEventListener('change', (e) => {
        if (e.target.type === 'checkbox') {
            const li = e.target.closest('.task-item');
            if (li) toggleTask(parseInt(li.dataset.id));
        }
    });
}

// --- Rendering ---

function render() {
    renderNavigation();
    renderTasks();
}

function renderNavigation() {
    elements.filterBtns.forEach(btn => {
        const filter = btn.dataset.filter;
        if (state.activeList === null && state.filter === filter) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    elements.listContainer.innerHTML = '';
    state.lists.forEach(list => {
        const li = document.createElement('li');
        li.className = `list-item ${state.activeList === list ? 'active' : ''}`;
        li.dataset.name = list;
        li.innerHTML = `
            <span>${escapeHtml(list)}</span>
            <span class="btn-delete-list" title="Delete List">×</span>
        `;
        elements.listContainer.appendChild(li);
    });
}

function renderTasks() {
    // Header Logic
    if (state.activeList) {
        elements.listTitle.textContent = state.activeList;
        elements.input.placeholder = `Add task to ${state.activeList}...`;
    } else {
        if (state.filter === 'all') elements.listTitle.textContent = "All Tasks";
        else if (state.filter === 'active') elements.listTitle.textContent = "Active Tasks";
        else if (state.filter === 'completed') elements.listTitle.textContent = "Completed Tasks";
        elements.input.placeholder = "Add a task...";
    }

    // Filter Logic
    let filtered = state.tasks;
    if (state.activeList) {
        filtered = filtered.filter(t => t.list === state.activeList);
    }

    // Global filter application
    if (state.filter === 'active') {
        filtered = filtered.filter(t => !t.completed);
    } else if (state.filter === 'completed') {
        filtered = filtered.filter(t => t.completed);
    }

    elements.taskList.innerHTML = '';

    if (filtered.length === 0) {
        elements.emptyState.classList.remove('hidden');
        if (state.activeList && state.tasks.filter(t => t.list === state.activeList).length === 0) {
            elements.emptyState.querySelector('p').textContent = `No tasks in ${state.activeList}. Add one above!`;
        } else {
            elements.emptyState.querySelector('p').textContent = "✨ All caught up! Enjoy your day.";
        }
    } else {
        elements.emptyState.classList.add('hidden');
        filtered.forEach(task => {
            elements.taskList.appendChild(createTaskElement(task));
        });
    }
}

// Recursive Task Rendering
function createTaskElement(task, isSubtask = false) {
    const li = document.createElement('li');

    let statusClass = '';
    let dueDateLabel = '';

    if (task.dueDate && !task.completed) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const taskDate = new Date(task.dueDate);
        taskDate.setHours(0, 0, 0, 0);

        if (taskDate.getTime() === today.getTime()) {
            statusClass = 'due-today';
            dueDateLabel = `<span class="due-date-badge today">Due: Today</span>`;
        } else if (taskDate.getTime() < today.getTime()) {
            statusClass = 'overdue';
            dueDateLabel = `<span class="due-date-badge overdue">Overdue: ${formatDate(task.dueDate)}</span>`;
        } else {
            dueDateLabel = `<span class="due-date-badge">Due: ${formatDate(task.dueDate)}</span>`;
        }
    } else if (task.dueDate && task.completed) {
        dueDateLabel = `<span class="due-date-badge completed">Due: ${formatDate(task.dueDate)}</span>`;
    }

    li.className = `task-item ${task.completed ? 'completed' : ''} ${isSubtask ? 'subtask-item' : ''} ${statusClass}`;
    li.dataset.id = task.id;

    const listBadge = (!isSubtask && !state.activeList) ? `<span class="task-tag">${escapeHtml(task.list)}</span>` : '';

    // Add Subtask Button (only for parent tasks for now to prevent infinite nesting UI chaos in MVP)
    const addSubBtn = !isSubtask ?
        `<button class="btn-add-subtask" title="Add Subtask">
            <span class="icon-plus">+</span>
         </button>` : '';

    li.innerHTML = `
        <div class="task-main-row">
            <label class="custom-checkbox">
                <input type="checkbox" ${task.completed ? 'checked' : ''}>
                <span class="checkmark"></span>
            </label>
            <div class="task-content">
                <div class="task-text-row">
                    <span class="task-text">${escapeHtml(task.title)}</span>
                    ${listBadge}
                </div>
                ${dueDateLabel}
            </div>
            <div class="task-actions">
                ${addSubBtn}
                <button class="btn-delete" aria-label="Delete task">×</button>
            </div>
        </div>
    `;

    // Render Subtasks Container
    if (!isSubtask && task.subtasks && task.subtasks.length > 0) {
        const subList = document.createElement('ul');
        subList.className = 'subtask-list';

        task.subtasks.forEach(sub => {
            subList.appendChild(createTaskElement(sub, true));
        });
        li.appendChild(subList);
    }

    return li;
}

function formatDate(dateStr) {
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
}

// --- Logic: Cursor Animation (Sparkle Trail) ---
function initCursor() {
    let lastTime = 0;
    const interval = 20; // Throttle to generate sparkles every 20ms

    window.addEventListener('mousemove', function (e) {
        const now = Date.now();
        if (now - lastTime < interval) return;
        lastTime = now;

        createSparkle(e.clientX, e.clientY);
    });
}

function createSparkle(x, y) {
    const sparkle = document.createElement('div');
    sparkle.classList.add('sparkle');

    // Position
    sparkle.style.left = `${x}px`;
    sparkle.style.top = `${y}px`;

    // Randomize movement via custom props for the CSS animation
    // Move between -30px and 30px on both axes
    const tx = (Math.random() - 0.5) * 60;
    const ty = (Math.random() - 0.5) * 60 + 20; // Slight gravity (downward bias)

    sparkle.style.setProperty('--tx', `${tx}px`);
    sparkle.style.setProperty('--ty', `${ty}px`);

    // Randomize Size
    const size = Math.random() * 6 + 2; // 2px to 8px
    sparkle.style.width = `${size}px`;
    sparkle.style.height = `${size}px`;

    document.body.appendChild(sparkle);

    // Cleanup after animation (0.8s = 800ms)
    setTimeout(() => {
        sparkle.remove();
    }, 800);
}

// Start
init();
