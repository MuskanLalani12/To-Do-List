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
    filter: 'all', // all, active, completed
    lists: ['Personal', 'Work'], // MVP: Simple strings
    activeList: 'Personal'
};

// --- DOM Elements ---
const elements = {
    input: document.getElementById('new-task-input'),
    addBtn: document.getElementById('btn-add-task'),
    taskList: document.getElementById('task-list'),
    emptyState: document.getElementById('empty-state'),
    filterBtns: document.querySelectorAll('.nav-item'),
    themeBtn: document.getElementById('btn-theme'),
    listTitle: document.getElementById('current-list-title'),
    dateDisplay: document.getElementById('date-display')
};

// --- Initialization ---
function init() {
    loadState();
    loadTheme();
    setupEventListeners();
    render();
    updateDate();
}

// --- Logic: Data & Storage ---

function loadState() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
        const parsed = JSON.parse(data);
        state.tasks = parsed.tasks || [];
        state.lists = parsed.lists || ['Personal', 'Work'];
    }
}

function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
        tasks: state.tasks,
        lists: state.lists
    }));
    render();
}

function addTask(text) {
    if (!text.trim()) return;
    
    const newTask = {
        id: Date.now(),
        text: text.trim(),
        completed: false,
        list: state.activeList,
        createdAt: new Date().toISOString()
    };

    state.tasks.unshift(newTask); // Add to top
    saveState();
    elements.input.value = '';
}

function toggleTask(id) {
    // Determine the index of the task with the given ID
    const taskIndex = state.tasks.findIndex(t => t.id === id);
    if (taskIndex > -1) {
        state.tasks[taskIndex].completed = !state.tasks[taskIndex].completed;
        saveState();
    }
}

function deleteTask(id) {
    state.tasks = state.tasks.filter(t => t.id !== id);
    saveState();
}

function setFilter(filterType) {
    state.filter = filterType;
    render();
}

// --- Logic: UI ---

function loadTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
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

// --- Event Listeners ---

function setupEventListeners() {
    // Add Task
    elements.addBtn.addEventListener('click', () => addTask(elements.input.value));
    
    elements.input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask(elements.input.value);
    });

    // Filters
    elements.filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            setFilter(btn.dataset.filter);
        });
    });

    // Theme
    elements.themeBtn.addEventListener('click', toggleTheme);

    // List Delegation (Delete & Toggle)
    elements.taskList.addEventListener('click', (e) => {
        const target = e.target;
        const li = target.closest('.task-item');
        if (!li) return;
        
        const id = parseInt(li.dataset.id);

        // Delete Button
        if (target.classList.contains('btn-delete') || target.closest('.btn-delete')) {
            deleteTask(id);
            return;
        }

        // Checkbox / Toggle
        if (target.closest('.custom-checkbox') || target.classList.contains('task-text')) {
             // In CSS, clicking label triggers input change, but we manage state manually?
             // Actually, let's catch the click on the container to prevent double toggle
        }
    });

    // Handle Input Change for Checkbox specifically to be robust
    elements.taskList.addEventListener('change', (e) => {
        if (e.target.type === 'checkbox') {
            const li = e.target.closest('.task-item');
            if (li) toggleTask(parseInt(li.dataset.id));
        }
    });
}

// --- Rendering ---

function render() {
    elements.listTitle.textContent = state.filter === 'all' ? 'All Tasks' : 
                                     state.filter === 'active' ? 'Active Tasks' : 'Completed';

    let filteredTasks = state.tasks;
    
    if (state.filter === 'active') {
        filteredTasks = state.tasks.filter(t => !t.completed);
    } else if (state.filter === 'completed') {
        filteredTasks = state.tasks.filter(t => t.completed);
    }

    elements.taskList.innerHTML = '';

    if (filteredTasks.length === 0) {
        elements.emptyState.classList.remove('hidden');
    } else {
        elements.emptyState.classList.add('hidden');
        
        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            li.dataset.id = task.id;
            
            li.innerHTML = `
                <label class="custom-checkbox">
                    <input type="checkbox" ${task.completed ? 'checked' : ''}>
                    <span class="checkmark"></span>
                </label>
                <div class="task-content">
                    <span class="task-text">${escapeHtml(task.text)}</span>
                </div>
                <button class="btn-delete" aria-label="Delete task">×</button>
            `;
            
            elements.taskList.appendChild(li);
        });
    }
}

// Utility to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Start
init();
