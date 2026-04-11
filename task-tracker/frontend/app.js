// ===== DAILY TASK TRACKER - ADVANCED STRICT STREAK SYSTEM =====

// Application State
let tasks = {};
let todayDate = '';
let taskIdCounter = 1;
let currentView = 'tasks';
let currentPeriod = 'daily';
let editingTaskId = null;

// Advanced Streak System
let streak = {
    days: 0,
    lastCheckedDate: null
};

// DOM Elements
const elements = {
    // Header
    currentDate: document.getElementById('currentDate'),
    streakDisplay: document.getElementById('streakDisplay'),
    streakCount: document.getElementById('streakCount'),
    
    // Message System
    messageContainer: null,
    
    // Navigation
    tabBtns: document.querySelectorAll('.tab-btn'),
    views: document.querySelectorAll('.view'),
    
    // Task Input
    taskInput: document.getElementById('taskInput'),
    addTaskBtn: document.getElementById('addTaskBtn'),
    
    // Task Lists
    activeTasks: document.getElementById('activeTasks'),
    completedTasks: document.getElementById('completedTasks'),
    
    // Analytics
    filterBtns: document.querySelectorAll('.filter-btn'),
    totalCompleted: document.getElementById('totalCompleted'),
    avgPerDay: document.getElementById('avgPerDay'),
    productiveDays: document.getElementById('productiveDays'),
    chartCanvas: document.getElementById('chartCanvas')
};

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Daily Task Tracker initialized');
    
    // Get today's date
    todayDate = getTodayDate();
    
    // Create message container
    createMessageContainer();
    
    // Load data from localStorage
    loadTasks();
    loadStreak();
    
    // Setup event listeners
    setupEventListeners();
    
    // Update UI
    updateDateDisplay();
    updateStreakDisplay();
    renderTasks();
    
    // Check and update streak for previous day
    checkAndUpdateStreak();
    
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

// Get Yesterday's Date
function getYesterdayDate() {
    const yesterday = new Date(todayDate);
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
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

// ===== ADVANCED STREAK SYSTEM =====

// Load Streak from localStorage
function loadStreak() {
    try {
        const savedStreak = localStorage.getItem('taskStreak');
        if (savedStreak) {
            streak = JSON.parse(savedStreak);
            console.log('Streak loaded:', streak);
        } else {
            streak = { days: 0, lastCheckedDate: null };
            console.log('No saved streak found');
        }
    } catch (error) {
        console.error('Error loading streak:', error);
        streak = { days: 0, lastCheckedDate: null };
    }
}

// Save Streak to localStorage
function saveStreak() {
    try {
        localStorage.setItem('taskStreak', JSON.stringify(streak));
        console.log('Streak saved:', streak);
    } catch (error) {
        console.error('Error saving streak:', error);
    }
}

// Calculate Completion Percentage
function calculateCompletion(dayTasks) {
    if (!dayTasks || dayTasks.length === 0) {
        return { completed: 0, total: 0, percentage: 0, isComplete: false };
    }
    
    const total = dayTasks.length;
    const completed = dayTasks.filter(task => task.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    const isComplete = percentage === 100;
    
    return {
        completed,
        total,
        percentage,
        isComplete
    };
}

// Check and Update Streak - CORE LOGIC
function checkAndUpdateStreak() {
    const yesterday = getYesterdayDate();
    
    // Only evaluate if yesterday hasn't been checked yet
    if (streak.lastCheckedDate === yesterday) {
        console.log('Yesterday already evaluated, skipping');
        return;
    }
    
    const yesterdayTasks = tasks[yesterday] || [];
    const completion = calculateCompletion(yesterdayTasks);
    
    console.log('Evaluating yesterday:', yesterday, completion);
    
    // Only evaluate if there were tasks yesterday
    if (completion.total > 0) {
        let message = '';
        let messageType = 'info';
        let oldStreak = streak.days;
        
        if (completion.isComplete) {
            // 100% completion - increase streak
            streak.days++;
            message = `🔥 Great job! You completed all tasks yesterday. Streak +1`;
            messageType = 'success';
        } else {
            // Not 100% completion - decrease streak
            streak.days = Math.max(0, streak.days - 2);
            message = `⚠️ You missed some tasks yesterday. Streak -2`;
            messageType = 'warning';
        }
        
        // Update last checked date
        streak.lastCheckedDate = yesterday;
        
        // Save streak
        saveStreak();
        
        // Update UI
        updateStreakDisplay(oldStreak, streak.days, messageType);
        
        // Show message
        showMessage(message, messageType);
        
        console.log('Streak updated:', { old: oldStreak, new: streak.days, reason: completion.isComplete ? '100% complete' : 'incomplete' });
    } else {
        console.log('No tasks yesterday, streak unchanged');
    }
}

// Update Streak Display with Animation
function updateStreakDisplay(oldStreak = null, newStreak = null, changeType = null) {
    elements.streakCount.textContent = streak.days;
    
    // Add color animation based on change
    if (changeType === 'success') {
        elements.streakDisplay.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
        elements.streakDisplay.style.animation = 'pulse 0.5s ease-out';
    } else if (changeType === 'warning') {
        elements.streakDisplay.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
        elements.streakDisplay.style.animation = 'shake 0.5s ease-out';
    }
    
    // Reset animation and color after delay
    setTimeout(() => {
        elements.streakDisplay.style.animation = '';
        elements.streakDisplay.style.background = 'linear-gradient(135deg, var(--accent-warning), #f97316)';
    }, 500);
}

// Create Message Container
function createMessageContainer() {
    elements.messageContainer = document.createElement('div');
    elements.messageContainer.id = 'messageContainer';
    elements.messageContainer.className = 'message-container';
    document.body.appendChild(elements.messageContainer);
}

// Show Message
function showMessage(text, type = 'info') {
    const message = document.createElement('div');
    message.className = `message message-${type}`;
    message.innerHTML = `
        <div class="message-content">
            <span class="message-text">${text}</span>
            <button class="message-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    elements.messageContainer.appendChild(message);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (message.parentElement) {
            message.remove();
        }
    }, 5000);
    
    // Add slide-in animation
    setTimeout(() => {
        message.classList.add('show');
    }, 10);
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
    
    console.log('Task added:', newTask);
}

// Toggle Task Function
function toggleTask(taskId) {
    const task = getTodayTasks().find(t => t.id === taskId);
    if (!task) return;
    
    // Toggle completion status
    task.completed = !task.completed;
    task.updated_at = new Date().toISOString();
    
    // Save to localStorage
    saveTasks();
    
    // Update UI
    renderTasks();
    
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
        }, 300);
    }
    
    console.log('Task deleted:', taskId);
}

// ===== RENDER FUNCTIONS =====

// Render Tasks
function renderTasks() {
    const todayTasks = getTodayTasks();
    
    // Separate active and completed tasks
    const activeTasks = todayTasks.filter(task => !task.completed);
    const completedTasks = todayTasks.filter(task => task.completed);
    
    console.log('Rendering tasks:', { 
        total: todayTasks.length, 
        active: activeTasks.length, 
        completed: completedTasks.length 
    });
    
    // Clear both sections first
    elements.activeTasks.innerHTML = '';
    elements.completedTasks.innerHTML = '';
    
    // Render active tasks with interactive checkboxes
    if (activeTasks.length === 0) {
        elements.activeTasks.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-rocket"></i>
                <p>No tasks today 🚀</p>
            </div>
        `;
    } else {
        elements.activeTasks.innerHTML = activeTasks.map(task => createActiveTaskCard(task)).join('');
    }
    
    // Render completed tasks with static check icons
    if (completedTasks.length === 0) {
        elements.completedTasks.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-check"></i>
                <p>No completed tasks yet</p>
            </div>
        `;
    } else {
        elements.completedTasks.innerHTML = completedTasks.map(task => createCompletedTaskCard(task)).join('');
    }
}

// Create Active Task Card
function createActiveTaskCard(task) {
    return `
        <div class="task-card" data-task-id="${task.id}">
            <div class="task-content">
                <div class="task-checkbox" 
                     onclick="toggleTask(${task.id})"></div>
                <div class="task-title">${escapeHtml(task.title)}</div>
            </div>
            <div class="task-actions">
                <button class="task-btn edit-btn" onclick="editTask(${task.id})" 
                        title="Edit task">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="task-btn complete-btn" onclick="toggleTask(${task.id})" 
                        title="Mark complete">
                    <i class="fas fa-check"></i>
                </button>
                <button class="task-btn delete-btn" onclick="deleteTask(${task.id})" 
                        title="Delete task">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
}

// Create Completed Task Card
function createCompletedTaskCard(task) {
    return `
        <div class="task-card completed" data-task-id="${task.id}">
            <div class="task-content">
                <div class="task-completed-icon">
                    <i class="fas fa-check"></i>
                </div>
                <div class="task-title">${escapeHtml(task.title)}</div>
            </div>
            <div class="task-actions">
                <button class="task-btn edit-btn" onclick="editTask(${task.id})" 
                        title="Edit task">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="task-btn complete-btn" onclick="toggleTask(${task.id})" 
                        title="Mark incomplete">
                    <i class="fas fa-undo"></i>
                </button>
                <button class="task-btn delete-btn" onclick="deleteTask(${task.id})" 
                        title="Delete task">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
}

// ===== ANALYTICS FUNCTIONS =====

// Calculate Analytics
function calculateAnalytics(period) {
    const dates = Object.keys(tasks).sort();
    const today = new Date();
    let startDate = new Date();
    
    // Set start date based on period
    switch (period) {
        case 'daily':
            startDate.setDate(today.getDate() - 1);
            break;
        case 'weekly':
            startDate.setDate(today.getDate() - 7);
            break;
        case 'monthly':
            startDate.setDate(today.getDate() - 30);
            break;
    }
    
    // Filter dates within period
    const filteredDates = dates.filter(date => {
        const taskDate = new Date(date);
        return taskDate >= startDate && taskDate <= today;
    });
    
    // Calculate analytics
    let totalCompleted = 0;
    let productiveDays = 0;
    const dailyData = [];
    
    filteredDates.forEach(date => {
        const dayTasks = tasks[date] || [];
        const completedCount = dayTasks.filter(task => task.completed).length;
        
        totalCompleted += completedCount;
        if (completedCount > 0) productiveDays++;
        
        dailyData.push({
            date: date,
            completed: completedCount,
            label: formatDate(date)
        });
    });
    
    const avgPerDay = filteredDates.length > 0 ? Math.round(totalCompleted / filteredDates.length) : 0;
    
    return {
        totalCompleted,
        avgPerDay,
        productiveDays,
        dailyData
    };
}

// Render Analytics
function renderAnalytics() {
    const analytics = calculateAnalytics(currentPeriod);
    
    // Update stats
    elements.totalCompleted.textContent = analytics.totalCompleted;
    elements.avgPerDay.textContent = analytics.avgPerDay;
    elements.productiveDays.textContent = analytics.productiveDays;
    
    // Render chart
    renderChart(analytics.dailyData);
}

// Render Chart
function renderChart(data) {
    const canvas = elements.chartCanvas;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (data.length === 0) {
        // Draw empty state
        ctx.fillStyle = '#94a3b8';
        ctx.font = '16px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('No data available', canvas.width / 2, canvas.height / 2);
        return;
    }
    
    // Calculate dimensions
    const padding = 40;
    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;
    const barWidth = chartWidth / data.length * 0.8;
    const barSpacing = chartWidth / data.length * 0.2;
    const maxValue = Math.max(...data.map(d => d.completed));
    
    // Draw axes
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();
    
    // Draw bars
    data.forEach((item, index) => {
        const barHeight = (item.completed / maxValue) * chartHeight;
        const x = padding + (index * (barWidth + barSpacing)) + barSpacing / 2;
        const y = canvas.height - padding - barHeight;
        
        // Draw bar
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Draw value on top
        ctx.fillStyle = '#f1f5f9';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(item.completed, x + barWidth / 2, y - 5);
        
        // Draw label
        ctx.save();
        ctx.translate(x + barWidth / 2, canvas.height - padding + 15);
        ctx.rotate(-Math.PI / 4);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px Inter';
        ctx.textAlign = 'right';
        ctx.fillText(item.label, 0, 0);
        ctx.restore();
    });
}

// ===== UI FUNCTIONS =====

// Update Date Display
function updateDateDisplay() {
    const date = new Date(todayDate);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = date.toLocaleDateString('en-US', options);
    elements.currentDate.textContent = dateStr;
}

// Show View
function showView(viewName) {
    // Update navigation
    elements.tabBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.view === viewName) {
            btn.classList.add('active');
        }
    });
    
    // Update views
    elements.views.forEach(view => {
        view.classList.add('hidden');
    });
    document.getElementById(viewName + 'View').classList.remove('hidden');
    
    // Update current view
    currentView = viewName;
    
    // Render analytics if switching to analytics view
    if (viewName === 'analytics') {
        renderAnalytics();
    }
    
    // Focus appropriate input
    if (viewName === 'tasks') {
        elements.taskInput.focus();
    }
}

// Set Period
function setPeriod(period) {
    currentPeriod = period;
    
    // Update filter buttons
    elements.filterBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.period === period) {
            btn.classList.add('active');
        }
    });
    
    // Re-render analytics
    if (currentView === 'analytics') {
        renderAnalytics();
    }
}

// ===== EVENT LISTENERS =====

function setupEventListeners() {
    // Navigation tabs
    elements.tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            showView(btn.dataset.view);
        });
    });
    
    // Filter buttons
    elements.filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            setPeriod(btn.dataset.period);
        });
    });
    
    // Add task button
    elements.addTaskBtn.addEventListener('click', () => {
        if (editingTaskId) {
            updateTask();
        } else {
            addTask();
        }
    });
    
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
    
    // Check for date change (midnight reset)
    setInterval(checkDateChange, 60000); // Check every minute
    
    // Handle window resize for chart
    window.addEventListener('resize', () => {
        if (currentView === 'analytics') {
            renderAnalytics();
        }
    });
    
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
        
        // Check streak for previous day
        checkAndUpdateStreak();
        
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
            month: 'short', 
            day: 'numeric'
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

// Add animations and styles
const animationsStyle = document.createElement('style');
animationsStyle.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    .message-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
        max-width: 400px;
    }
    
    .message {
        background: var(--bg-card);
        border: 1px solid var(--border-primary);
        border-radius: var(--radius-md);
        margin-bottom: var(--spacing-sm);
        box-shadow: var(--shadow-lg);
        transform: translateX(100%);
        opacity: 0;
        transition: all var(--transition-normal);
    }
    
    .message.show {
        transform: translateX(0);
        opacity: 1;
    }
    
    .message-success {
        border-left: 4px solid var(--accent-primary);
    }
    
    .message-warning {
        border-left: 4px solid var(--accent-danger);
    }
    
    .message-info {
        border-left: 4px solid var(--accent-secondary);
    }
    
    .message-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--spacing-md);
    }
    
    .message-text {
        flex: 1;
        color: var(--text-primary);
        font-weight: 500;
    }
    
    .message-close {
        background: none;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        padding: var(--spacing-xs);
        border-radius: var(--radius-sm);
        transition: all var(--transition-fast);
    }
    
    .message-close:hover {
        background-color: var(--bg-hover);
        color: var(--text-primary);
    }
`;
document.head.appendChild(animationsStyle);

// Make functions globally available
window.toggleTask = toggleTask;
window.editTask = editTask;
window.deleteTask = deleteTask;
