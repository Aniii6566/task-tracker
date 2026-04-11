// ===== MODERN TASK TRACKER - PREMIUM APP =====

// Application State
let tasks = [];
let taskIdCounter = 1;

// DOM Elements
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const todayTasks = document.getElementById('todayTasks');
const completedTasks = document.getElementById('completedTasks');
const todayDate = document.getElementById('todayDate');

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Task Tracker initialized');
    
    // Load tasks from localStorage
    loadTasks();
    
    // Setup event listeners
    setupEventListeners();
    
    // Update today's date
    updateTodayDate();
    
    // Render tasks
    renderTasks();
    
    // Focus on input
    taskInput.focus();
});

// Setup Event Listeners
function setupEventListeners() {
    // Add task button click
    addTaskBtn.addEventListener('click', addTask);
    
    // Enter key in input field
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });
    
    // Input validation
    taskInput.addEventListener('input', validateInput);
    
    // Input container focus effect
    const inputContainer = document.querySelector('.input-container');
    taskInput.addEventListener('focus', () => {
        inputContainer.classList.add('focus-within');
    });
    
    taskInput.addEventListener('blur', () => {
        inputContainer.classList.remove('focus-within');
    });
    
    console.log('Event listeners setup complete');
}

// Validate Input
function validateInput() {
    const hasValue = taskInput.value.trim().length > 0;
    addTaskBtn.disabled = !hasValue;
    
    if (hasValue) {
        addTaskBtn.style.opacity = '1';
        addTaskBtn.style.cursor = 'pointer';
    } else {
        addTaskBtn.style.opacity = '0.5';
        addTaskBtn.style.cursor = 'not-allowed';
    }
}

// Update Today's Date
function updateTodayDate() {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = today.toLocaleDateString('en-US', options);
    todayDate.textContent = dateStr;
}

// ===== TASK FUNCTIONS =====

// Add Task Function
function addTask() {
    const title = taskInput.value.trim();
    
    // Validate input
    if (title === '') {
        shakeElement(taskInput);
        return;
    }
    
    // Create new task object
    const newTask = {
        id: taskIdCounter++,
        title: title,
        completed: false
    };
    
    // Add to tasks array
    tasks.unshift(newTask);
    
    // Save to localStorage
    saveTasks();
    
    // Clear input
    taskInput.value = '';
    taskInput.focus();
    
    // Reset validation
    validateInput();
    
    // Render tasks
    renderTasks();
    
    console.log('Task added:', newTask);
}

// Toggle Task Function
function toggleTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Toggle completion status
    task.completed = !task.completed;
    
    // Save to localStorage
    saveTasks();
    
    // Re-render tasks
    renderTasks();
    
    console.log('Task toggled:', task);
}

// Delete Task Function
function deleteTask(taskId) {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;
    
    const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
    
    if (taskElement) {
        // Add removing animation
        taskElement.classList.add('removing');
        
        // Remove after animation
        setTimeout(() => {
            // Remove from array
            tasks.splice(taskIndex, 1);
            
            // Save to localStorage
            saveTasks();
            
            // Re-render tasks
            renderTasks();
        }, 300);
    }
    
    console.log('Task deleted:', taskId);
}

// ===== RENDER FUNCTIONS =====

// Render Tasks Function
function renderTasks() {
    // Filter tasks
    const todayTasksList = tasks.filter(task => !task.completed);
    const completedTasksList = tasks.filter(task => task.completed);
    
    // Render today's tasks
    renderTaskList(todayTasks, todayTasksList, false);
    
    // Render completed tasks
    renderTaskList(completedTasks, completedTasksList, true);
}

// Render Task List Function
function renderTaskList(container, taskList, isCompleted) {
    if (taskList.length === 0) {
        const emptyMessage = isCompleted ? 'No completed tasks yet' : 'No tasks today 🚀';
        container.innerHTML = `<div class="empty-state"><p>${emptyMessage}</p></div>`;
        return;
    }
    
    container.innerHTML = taskList.map(task => createTaskCard(task, isCompleted)).join('');
}

// Create Task Card Function
function createTaskCard(task, isCompleted) {
    return `
        <div class="task-card ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
            <div class="task-content">
                <div class="task-title">${escapeHtml(task.title)}</div>
            </div>
            <div class="task-actions">
                <button class="task-btn complete-btn" onclick="toggleTask(${task.id})" title="${task.completed ? 'Mark incomplete' : 'Mark complete'}">
                    <i class="fas fa-${task.completed ? 'undo' : 'check'}"></i>
                </button>
                <button class="task-btn delete-btn" onclick="deleteTask(${task.id})" title="Delete task">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
}

// ===== STORAGE FUNCTIONS =====

// Save Tasks Function
function saveTasks() {
    try {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        console.log('Tasks saved to localStorage');
    } catch (error) {
        console.error('Error saving tasks:', error);
    }
}

// Load Tasks Function
function loadTasks() {
    try {
        const savedTasks = localStorage.getItem('tasks');
        if (savedTasks) {
            tasks = JSON.parse(savedTasks);
            // Update task ID counter
            if (tasks.length > 0) {
                taskIdCounter = Math.max(...tasks.map(t => t.id)) + 1;
            }
            console.log('Tasks loaded from localStorage:', tasks.length);
        } else {
            tasks = [];
            taskIdCounter = 1;
            console.log('No saved tasks found');
        }
    } catch (error) {
        console.error('Error loading tasks:', error);
        tasks = [];
        taskIdCounter = 1;
    }
}

// ===== UTILITY FUNCTIONS =====

// Escape HTML Function
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Shake Element Function
function shakeElement(element) {
    element.style.animation = 'shake 0.3s ease-in-out';
    setTimeout(() => {
        element.style.animation = '';
    }, 300);
}

// Add shake animation to page
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
window.toggleTask = toggleTask;
window.deleteTask = deleteTask;