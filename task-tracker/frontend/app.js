// ===== DAILY TASK TRACKER - PREMIUM DASHBOARD =====

// Application State
let tasks = {};
let currentView = 'dashboard';
let todayDate = '';
let taskIdCounter = 1;

// DOM Elements
const elements = {
    // Navigation
    navItems: document.querySelectorAll('.nav-item'),
    views: document.querySelectorAll('.view'),
    
    // Dashboard
    currentDate: document.getElementById('currentDate'),
    greeting: document.getElementById('greeting'),
    dashboardTodayCount: document.getElementById('dashboardTodayCount'),
    dashboardCompletedCount: document.getElementById('dashboardCompletedCount'),
    dashboardProgress: document.getElementById('dashboardProgress'),
    progressFill: document.getElementById('progressFill'),
    progressText: document.getElementById('progressText'),
    recentTasksList: document.getElementById('recentTasksList'),
    
    // Quick Add
    quickTaskInput: document.getElementById('quickTaskInput'),
    quickAddBtn: document.getElementById('quickAddBtn'),
    
    // Tasks View
    tasksDateInfo: document.getElementById('tasksDateInfo'),
    taskInput: document.getElementById('taskInput'),
    addTaskBtn: document.getElementById('addTaskBtn'),
    activeTasks: document.getElementById('activeTasks'),
    completedTasks: document.getElementById('completedTasks'),
    
    // History
    historyDates: document.getElementById('historyDates'),
    
    // Sidebar Stats
    todayTotal: document.getElementById('todayTotal'),
    todayCompleted: document.getElementById('todayCompleted'),
    
    // Modal
    taskModal: document.getElementById('taskModal'),
    modalTitle: document.getElementById('modalTitle'),
    modalTasks: document.getElementById('modalTasks')
};

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Daily Task Tracker initialized');
    
    // Get today's date
    todayDate = getTodayDate();
    
    // Load all tasks from localStorage
    loadTasks();
    
    // Setup event listeners
    setupEventListeners();
    
    // Update UI
    updateDateDisplay();
    updateGreeting();
    renderCurrentView();
    
    // Focus on appropriate input
    if (currentView === 'dashboard') {
        elements.quickTaskInput.focus();
    } else if (currentView === 'tasks') {
        elements.taskInput.focus();
    }
    
    console.log('Application initialized successfully');
});

// ===== CORE FUNCTIONS =====

// Get Today's Date
function getTodayDate() {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD format
}

// Load Tasks from localStorage
function loadTasks() {
    try {
        const savedTasks = localStorage.getItem('dailyTasks');
        if (savedTasks) {
            tasks = JSON.parse(savedTasks);
            console.log('Tasks loaded from localStorage');
        } else {
            tasks = {};
            console.log('No saved tasks found');
        }
        
        // Update task ID counter for today
        if (tasks[todayDate] && tasks[todayDate].length > 0) {
            const maxId = Math.max(...tasks[todayDate].map(t => t.id));
            taskIdCounter = maxId + 1;
        }
    } catch (error) {
        console.error('Error loading tasks:', error);
        tasks = {};
        taskIdCounter = 1;
    }
}

// Save Tasks to localStorage
function saveTasks() {
    try {
        localStorage.setItem('dailyTasks', JSON.stringify(tasks));
        console.log('Tasks saved to localStorage');
    } catch (error) {
        console.error('Error saving tasks:', error);
    }
}

// Get Today's Tasks
function getTodayTasks() {
    return tasks[todayDate] || [];
}

// ===== TASK FUNCTIONS =====

// Add Task Function
function addTask(title, date = todayDate) {
    // Validate input
    if (!title || title.trim() === '') {
        shakeElement(date === todayDate ? elements.quickTaskInput : elements.taskInput);
        return;
    }
    
    // Initialize tasks for date if not exists
    if (!tasks[date]) {
        tasks[date] = [];
    }
    
    // Create new task
    const newTask = {
        id: date === todayDate ? taskIdCounter++ : Date.now(),
        title: title.trim(),
        completed: false,
        created_at: new Date().toISOString()
    };
    
    // Add to tasks for that date
    tasks[date].unshift(newTask);
    
    // Save to localStorage
    saveTasks();
    
    // Clear input and reset validation
    if (date === todayDate) {
        elements.quickTaskInput.value = '';
        elements.taskInput.value = '';
        validateQuickInput();
        validateTaskInput();
        elements.quickTaskInput.focus();
    }
    
    // Update UI
    renderCurrentView();
    updateStats();
    
    console.log('Task added:', newTask);
}

// Toggle Task Function
function toggleTask(taskId, date = todayDate) {
    if (!tasks[date]) return;
    
    const task = tasks[date].find(t => t.id === taskId);
    if (!task) return;
    
    // Toggle completion status
    task.completed = !task.completed;
    
    // Save to localStorage
    saveTasks();
    
    // Update UI
    renderCurrentView();
    updateStats();
    
    console.log('Task toggled:', task);
}

// Delete Task Function
function deleteTask(taskId, date = todayDate) {
    if (!tasks[date]) return;
    
    const taskIndex = tasks[date].findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;
    
    const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
    
    if (taskElement) {
        // Add removing animation
        taskElement.classList.add('removing');
        
        // Remove after animation
        setTimeout(() => {
            // Remove from array
            tasks[date].splice(taskIndex, 1);
            
            // Clean up empty date arrays
            if (tasks[date].length === 0) {
                delete tasks[date];
            }
            
            // Save to localStorage
            saveTasks();
            
            // Update UI
            renderCurrentView();
            updateStats();
        }, 300);
    }
    
    console.log('Task deleted:', taskId);
}

// ===== RENDER FUNCTIONS =====

// Render Current View
function renderCurrentView() {
    switch (currentView) {
        case 'dashboard':
            renderDashboard();
            break;
        case 'tasks':
            renderTasksView();
            break;
        case 'history':
            renderHistoryView();
            break;
    }
}

// Render Dashboard
function renderDashboard() {
    const todayTasks = getTodayTasks();
    const activeTasks = todayTasks.filter(task => !task.completed);
    const completedTasks = todayTasks.filter(task => task.completed);
    
    // Update stats
    elements.dashboardTodayCount.textContent = todayTasks.length;
    elements.dashboardCompletedCount.textContent = completedTasks.length;
    const progress = todayTasks.length > 0 ? Math.round((completedTasks.length / todayTasks.length) * 100) : 0;
    elements.dashboardProgress.textContent = progress + '%';
    
    // Update progress bar
    elements.progressFill.style.width = progress + '%';
    elements.progressText.textContent = `${completedTasks.length} of ${todayTasks.length} tasks completed`;
    
    // Render recent tasks
    if (activeTasks.length === 0) {
        elements.recentTasksList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-rocket"></i>
                <p>No tasks for today 🚀</p>
            </div>
        `;
    } else {
        elements.recentTasksList.innerHTML = activeTasks.slice(0, 5).map(task => createTaskCard(task, todayDate)).join('');
    }
}

// Render Tasks View
function renderTasksView() {
    const todayTasks = getTodayTasks();
    const activeTasks = todayTasks.filter(task => !task.completed);
    const completedTasks = todayTasks.filter(task => task.completed);
    
    // Update date info
    const formattedDate = formatDate(todayDate);
    elements.tasksDateInfo.textContent = formattedDate;
    
    // Render active tasks
    if (activeTasks.length === 0) {
        elements.activeTasks.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <p>No active tasks</p>
            </div>
        `;
    } else {
        elements.activeTasks.innerHTML = activeTasks.map(task => createTaskCard(task, todayDate)).join('');
    }
    
    // Render completed tasks
    if (completedTasks.length === 0) {
        elements.completedTasks.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-check"></i>
                <p>No completed tasks yet</p>
            </div>
        `;
    } else {
        elements.completedTasks.innerHTML = completedTasks.map(task => createTaskCard(task, todayDate)).join('');
    }
}

// Render History View
function renderHistoryView() {
    const dates = Object.keys(tasks).sort().reverse(); // Most recent first
    
    if (dates.length === 0) {
        elements.historyDates.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-history"></i>
                <p>No previous days found</p>
            </div>
        `;
        return;
    }
    
    const historyHTML = dates.map(date => {
        const dateTasks = tasks[date];
        const completedCount = dateTasks.filter(task => task.completed).length;
        const totalCount = dateTasks.length;
        
        // Skip today in history (it's shown in dashboard)
        if (date === todayDate) return '';
        
        return `
            <div class="history-date-card" onclick="showDateTasks('${date}')">
                <div class="history-date-title">${formatDate(date)}</div>
                <div class="history-date-stats">
                    ${completedCount} of ${totalCount} completed
                </div>
            </div>
        `;
    }).filter(html => html !== '').join('');
    
    if (historyHTML === '') {
        elements.historyDates.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-history"></i>
                <p>No previous days found</p>
            </div>
        `;
    } else {
        elements.historyDates.innerHTML = historyHTML;
    }
}

// Create Task Card
function createTaskCard(task, date) {
    return `
        <div class="task-card ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
            <div class="task-content">
                <div class="task-checkbox ${task.completed ? 'checked' : ''}" 
                     onclick="toggleTask(${task.id}, '${date}')"></div>
                <div class="task-title">${escapeHtml(task.title)}</div>
            </div>
            <div class="task-actions">
                <button class="task-btn complete-btn" onclick="toggleTask(${task.id}, '${date}')" 
                        title="${task.completed ? 'Mark incomplete' : 'Mark complete'}">
                    <i class="fas fa-${task.completed ? 'undo' : 'check'}"></i>
                </button>
                <button class="task-btn delete-btn" onclick="deleteTask(${task.id}, '${date}')" 
                        title="Delete task">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
}

// ===== UI FUNCTIONS =====

// Update Date Display
function updateDateDisplay() {
    const date = new Date(todayDate);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = date.toLocaleDateString('en-US', options);
    elements.currentDate.textContent = dateStr;
}

// Update Greeting
function updateGreeting() {
    const hour = new Date().getHours();
    let greeting;
    
    if (hour < 12) {
        greeting = 'Good morning! Let\'s make today productive.';
    } else if (hour < 17) {
        greeting = 'Good afternoon! Keep up the great work.';
    } else {
        greeting = 'Good evening! Time to wrap up today\'s tasks.';
    }
    
    elements.greeting.textContent = greeting;
}

// Update Stats
function updateStats() {
    const todayTasks = getTodayTasks();
    const completedTasks = todayTasks.filter(task => task.completed);
    
    elements.todayTotal.textContent = todayTasks.length;
    elements.todayCompleted.textContent = completedTasks.length;
}

// Show View
function showView(viewName) {
    // Update navigation
    elements.navItems.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.view === viewName) {
            item.classList.add('active');
        }
    });
    
    // Update views
    elements.views.forEach(view => {
        view.classList.add('hidden');
    });
    document.getElementById(viewName + 'View').classList.remove('hidden');
    
    // Update current view
    currentView = viewName;
    
    // Render the new view
    renderCurrentView();
    
    // Focus appropriate input
    if (viewName === 'dashboard') {
        elements.quickTaskInput.focus();
    } else if (viewName === 'tasks') {
        elements.taskInput.focus();
    }
}

// Show Date Tasks (Modal)
function showDateTasks(date) {
    const dateTasks = tasks[date] || [];
    const formattedDate = formatDate(date);
    
    // Update modal title
    elements.modalTitle.textContent = `Tasks for ${formattedDate}`;
    
    // Render tasks in modal
    if (dateTasks.length === 0) {
        elements.modalTasks.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard"></i>
                <p>No tasks for this day</p>
            </div>
        `;
    } else {
        elements.modalTasks.innerHTML = dateTasks.map(task => createTaskCard(task, date)).join('');
    }
    
    // Show modal
    elements.taskModal.classList.add('active');
}

// Close Modal
function closeModal() {
    elements.taskModal.classList.remove('active');
}

// ===== EVENT LISTENERS =====

function setupEventListeners() {
    // Navigation
    elements.navItems.forEach(item => {
        item.addEventListener('click', () => {
            showView(item.dataset.view);
        });
    });
    
    // Quick Add
    elements.quickAddBtn.addEventListener('click', () => {
        addTask(elements.quickTaskInput.value);
    });
    
    elements.quickTaskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask(elements.quickTaskInput.value);
        }
    });
    
    elements.quickTaskInput.addEventListener('input', validateQuickInput);
    
    // Task Add
    elements.addTaskBtn.addEventListener('click', () => {
        addTask(elements.taskInput.value);
    });
    
    elements.taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask(elements.taskInput.value);
        }
    });
    
    elements.taskInput.addEventListener('input', validateTaskInput);
    
    // Modal close on background click
    elements.taskModal.addEventListener('click', (e) => {
        if (e.target === elements.taskModal) {
            closeModal();
        }
    });
    
    // Check for date change (midnight reset)
    setInterval(checkDateChange, 60000); // Check every minute
    
    console.log('Event listeners setup complete');
}

// Input Validation
function validateQuickInput() {
    const hasValue = elements.quickTaskInput.value.trim().length > 0;
    elements.quickAddBtn.disabled = !hasValue;
}

function validateTaskInput() {
    const hasValue = elements.taskInput.value.trim().length > 0;
    elements.addTaskBtn.disabled = !hasValue;
}

// Check for Date Change
function checkDateChange() {
    const newTodayDate = getTodayDate();
    if (newTodayDate !== todayDate) {
        todayDate = newTodayDate;
        taskIdCounter = 1;
        
        // Update UI for new day
        updateDateDisplay();
        updateGreeting();
        renderCurrentView();
        updateStats();
        
        console.log('Date changed, new day:', todayDate);
    }
}

// ===== UTILITY FUNCTIONS =====

// Format Date
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (dateStr === todayDate) {
        return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    } else {
        return date.toLocaleDateString('en-US', { 
            weekday: 'short',
            month: 'short', 
            day: 'numeric',
            year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
        });
    }
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Shake Element
function shakeElement(element) {
    element.style.animation = 'shake 0.3s ease-in-out';
    setTimeout(() => {
        element.style.animation = '';
    }, 300);
}

// Add shake animation
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;
document.head.appendChild(shakeStyle);

// Make functions globally available
window.showView = showView;
window.toggleTask = toggleTask;
window.deleteTask = deleteTask;
window.showDateTasks = showDateTasks;
window.closeModal = closeModal;