// ===== DAILY TASK TRACKER - PREMIUM DASHBOARD =====

// Application State
let tasks = {};
let todayDate = '';
let taskIdCounter = 1;
let currentStreak = 0;
let editingTaskId = null;

// DOM Elements
const elements = {
    // Header
    currentDate: document.getElementById('currentDate'),
    streakCount: document.getElementById('streakCount'),
    historyBtn: document.getElementById('historyBtn'),
    
    // Progress
    totalTasks: document.getElementById('totalTasks'),
    completedTasks: document.getElementById('completedTasks'),
    pendingTasks: document.getElementById('pendingTasks'),
    progressFill: document.getElementById('progressFill'),
    progressPercentage: document.getElementById('progressPercentage'),
    
    // Task Input
    taskInput: document.getElementById('taskInput'),
    addTaskBtn: document.getElementById('addTaskBtn'),
    
    // Task Lists
    activeTasks: document.getElementById('activeTasks'),
    completedTasks: document.getElementById('completedTasks'),
    
    // Modals
    historyModal: document.getElementById('historyModal'),
    taskModal: document.getElementById('taskModal'),
    closeHistoryBtn: document.getElementById('closeHistoryBtn'),
    closeTaskBtn: document.getElementById('closeTaskBtn'),
    modalTitle: document.getElementById('modalTitle'),
    modalTasks: document.getElementById('modalTasks'),
    historyDates: document.getElementById('historyDates')
};

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Daily Task Tracker initialized');
    
    // Get today's date
    todayDate = getTodayDate();
    
    // Load all data from localStorage
    loadTasks();
    loadStreak();
    
    // Setup event listeners
    setupEventListeners();
    
    // Update UI
    updateDateDisplay();
    renderTasks();
    updateProgress();
    updateStreakDisplay();
    
    // Focus on input
    elements.taskInput.focus();
    
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

// Load Streak from localStorage
function loadStreak() {
    try {
        const savedStreak = localStorage.getItem('taskStreak');
        if (savedStreak) {
            currentStreak = parseInt(savedStreak);
            console.log('Streak loaded:', currentStreak);
        } else {
            currentStreak = 0;
        }
    } catch (error) {
        console.error('Error loading streak:', error);
        currentStreak = 0;
    }
}

// Save Streak to localStorage
function saveStreak() {
    try {
        localStorage.setItem('taskStreak', currentStreak.toString());
        console.log('Streak saved:', currentStreak);
    } catch (error) {
        console.error('Error saving streak:', error);
    }
}

// Get Today's Tasks
function getTodayTasks() {
    return tasks[todayDate] || [];
}

// ===== TASK FUNCTIONS =====

// Add Task Function
function addTask() {
    const title = elements.taskInput.value.trim();
    
    // Validate input
    if (title === '') {
        shakeElement(elements.taskInput);
        return;
    }
    
    // Initialize tasks for today if not exists
    if (!tasks[todayDate]) {
        tasks[todayDate] = [];
    }
    
    // Create new task
    const newTask = {
        id: taskIdCounter++,
        title: title,
        completed: false,
        created_at: new Date().toISOString()
    };
    
    // Add to tasks for today
    tasks[todayDate].unshift(newTask);
    
    // Save to localStorage
    saveTasks();
    
    // Clear input and reset validation
    elements.taskInput.value = '';
    validateInput();
    elements.taskInput.focus();
    
    // Update UI
    renderTasks();
    updateProgress();
    
    console.log('Task added:', newTask);
}

// Toggle Task Function
function toggleTask(taskId) {
    const task = getTodayTasks().find(t => t.id === taskId);
    if (!task) return;
    
    // Toggle completion status
    task.completed = !task.completed;
    
    // Save to localStorage
    saveTasks();
    
    // Update UI
    renderTasks();
    updateProgress();
    updateStreak();
    
    console.log('Task toggled:', task);
}

// Edit Task Function
function editTask(taskId) {
    const task = getTodayTasks().find(t => t.id === taskId);
    if (!task) return;
    
    // Set input value to task title
    elements.taskInput.value = task.title;
    elements.taskInput.focus();
    
    // Mark as editing
    editingTaskId = taskId;
    elements.addTaskBtn.innerHTML = '<i class="fas fa-save"></i> Update Task';
    elements.addTaskBtn.onclick = updateTask;
    
    console.log('Editing task:', task);
}

// Update Task Function
function updateTask() {
    const title = elements.taskInput.value.trim();
    
    // Validate input
    if (title === '') {
        shakeElement(elements.taskInput);
        return;
    }
    
    const task = getTodayTasks().find(t => t.id === editingTaskId);
    if (!task) return;
    
    // Update task title
    task.title = title;
    task.updated_at = new Date().toISOString();
    
    // Save to localStorage
    saveTasks();
    
    // Reset editing state
    editingTaskId = null;
    elements.taskInput.value = '';
    elements.addTaskBtn.innerHTML = '<i class="fas fa-plus"></i> Add Task';
    elements.addTaskBtn.onclick = addTask;
    validateInput();
    elements.taskInput.focus();
    
    // Update UI
    renderTasks();
    
    console.log('Task updated:', task);
}

// Delete Task Function
function deleteTask(taskId) {
    const taskIndex = getTodayTasks().findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;
    
    const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
    
    if (taskElement) {
        // Add removing animation
        taskElement.classList.add('removing');
        
        // Remove after animation
        setTimeout(() => {
            // Remove from array
            tasks[todayDate].splice(taskIndex, 1);
            
            // Clean up empty date arrays
            if (tasks[todayDate].length === 0) {
                delete tasks[todayDate];
            }
            
            // Save to localStorage
            saveTasks();
            
            // Update UI
            renderTasks();
            updateProgress();
            updateStreak();
        }, 300);
    }
    
    console.log('Task deleted:', taskId);
}

// ===== STREAK FUNCTIONS =====

// Handle Streak Logic
function handleStreak() {
    const todayTasks = getTodayTasks();
    const hasCompletedTasks = todayTasks.some(task => task.completed);
    
    if (hasCompletedTasks) {
        // Check if yesterday had completed tasks
        const yesterday = new Date(todayDate);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        const yesterdayTasks = tasks[yesterdayStr] || [];
        const yesterdayHadCompleted = yesterdayTasks.some(task => task.completed);
        
        if (yesterdayHadCompleted) {
            // Continue streak
            currentStreak++;
        } else {
            // Start new streak
            currentStreak = 1;
        }
    } else {
        // No completed tasks today, reset streak
        currentStreak = 0;
    }
    
    saveStreak();
    updateStreakDisplay();
}

// Update Streak Display
function updateStreakDisplay() {
    elements.streakCount.textContent = currentStreak;
    
    // Add animation for streak changes
    elements.streakBadge.style.animation = 'pulse 0.5s ease-out';
    setTimeout(() => {
        elements.streakBadge.style.animation = '';
    }, 500);
}

// ===== PROGRESS FUNCTIONS =====

// Calculate Progress
function calculateProgress() {
    const todayTasks = getTodayTasks();
    const totalTasks = todayTasks.length;
    const completedTasks = todayTasks.filter(task => task.completed).length;
    const pendingTasks = totalTasks - completedTasks;
    const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    return {
        total: totalTasks,
        completed: completedTasks,
        pending: pendingTasks,
        percentage: percentage
    };
}

// Update Progress Display
function updateProgress() {
    const progress = calculateProgress();
    
    // Update stat cards
    elements.totalTasks.textContent = progress.total;
    elements.completedTasks.textContent = progress.completed;
    elements.pendingTasks.textContent = progress.pending;
    
    // Update progress bar
    elements.progressFill.style.width = progress.percentage + '%';
    elements.progressPercentage.textContent = progress.percentage + '%';
}

// ===== RENDER FUNCTIONS =====

// Render Tasks
function renderTasks() {
    const todayTasks = getTodayTasks();
    const activeTasks = todayTasks.filter(task => !task.completed);
    const completedTasks = todayTasks.filter(task => task.completed);
    
    // Render active tasks
    if (activeTasks.length === 0) {
        elements.activeTasks.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-rocket"></i>
                <p>No tasks today 🚀</p>
            </div>
        `;
    } else {
        elements.activeTasks.innerHTML = activeTasks.map(task => createTaskCard(task)).join('');
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
        elements.completedTasks.innerHTML = completedTasks.map(task => createTaskCard(task)).join('');
    }
}

// Create Task Card
function createTaskCard(task) {
    return `
        <div class="task-card ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
            <div class="task-content">
                <div class="task-checkbox ${task.completed ? 'checked' : ''}" 
                     onclick="toggleTask(${task.id})"></div>
                <div class="task-title">${escapeHtml(task.title)}</div>
            </div>
            <div class="task-actions">
                <button class="task-btn edit-btn" onclick="editTask(${task.id})" 
                        title="Edit task">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="task-btn complete-btn" onclick="toggleTask(${task.id})" 
                        title="${task.completed ? 'Mark incomplete' : 'Mark complete'}">
                    <i class="fas fa-${task.completed ? 'undo' : 'check'}"></i>
                </button>
                <button class="task-btn delete-btn" onclick="deleteTask(${task.id})" 
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

// Show History Modal
function showHistory() {
    renderHistory();
    elements.historyModal.classList.add('active');
}

// Close History Modal
function closeHistory() {
    elements.historyModal.classList.remove('active');
}

// Show Task Detail Modal
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
        elements.modalTasks.innerHTML = dateTasks.map(task => createTaskCard(task)).join('');
    }
    
    // Show modal
    elements.taskModal.classList.add('active');
}

// Close Task Modal
function closeTaskModal() {
    elements.taskModal.classList.remove('active');
}

// Render History
function renderHistory() {
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
        
        // Skip today in history (it's shown in main view)
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

// ===== EVENT LISTENERS =====

function setupEventListeners() {
    // Add task button
    elements.addTaskBtn.addEventListener('click', addTask);
    
    // Task input
    elements.taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            if (editingTaskId) {
                updateTask();
            } else {
                addTask();
            }
        }
    });
    
    elements.taskInput.addEventListener('input', validateInput);
    
    // History button
    elements.historyBtn.addEventListener('click', showHistory);
    
    // Modal close buttons
    elements.closeHistoryBtn.addEventListener('click', closeHistory);
    elements.closeTaskBtn.addEventListener('click', closeTaskModal);
    
    // Modal background clicks
    elements.historyModal.addEventListener('click', (e) => {
        if (e.target === elements.historyModal) {
            closeHistory();
        }
    });
    
    elements.taskModal.addEventListener('click', (e) => {
        if (e.target === elements.taskModal) {
            closeTaskModal();
        }
    });
    
    // Check for date change (midnight reset)
    setInterval(checkDateChange, 60000); // Check every minute
    
    console.log('Event listeners setup complete');
}

// Input Validation
function validateInput() {
    const hasValue = elements.taskInput.value.trim().length > 0;
    elements.addTaskBtn.disabled = !hasValue;
    
    if (hasValue) {
        elements.addTaskBtn.style.opacity = '1';
        elements.addTaskBtn.style.cursor = 'pointer';
    } else {
        elements.addTaskBtn.style.opacity = '0.5';
        elements.addTaskBtn.style.cursor = 'not-allowed';
    }
}

// Check for Date Change
function checkDateChange() {
    const newTodayDate = getTodayDate();
    if (newTodayDate !== todayDate) {
        todayDate = newTodayDate;
        taskIdCounter = 1;
        
        // Update UI for new day
        updateDateDisplay();
        renderTasks();
        updateProgress();
        updateStreak();
        
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

// Add animations
const animationsStyle = document.createElement('style');
animationsStyle.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(animationsStyle);

// Make functions globally available
window.showDateTasks = showDateTasks;

// Auto-update streak when tasks are toggled
const originalToggleTask = toggleTask;
toggleTask = function(taskId) {
    originalToggleTask(taskId);
    handleStreak();
};