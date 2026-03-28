// ===== CLEAN TASK TRACKER - FULLY FUNCTIONAL =====

// State Management
let tasks = [];

// DOM Elements
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const emptyState = document.getElementById('emptyState');

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Task Tracker initialized');
    
    // Load tasks from localStorage
    loadTasks();
    
    // Setup event listeners
    setupEventListeners();
    
    // Render initial state
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
    
    console.log('Event listeners setup complete');
}

// Add Task Function
function addTask() {
    const taskText = taskInput.value.trim();
    
    // Validate input
    if (taskText === '') {
        shakeInput();
        return;
    }
    
    // Create new task object
    const newTask = {
        id: Date.now(),
        text: taskText,
        createdAt: new Date().toISOString()
    };
    
    // Add to tasks array
    tasks.unshift(newTask); // Add to beginning for newest first
    
    // Save to localStorage
    saveTasks();
    
    // Clear input
    taskInput.value = '';
    taskInput.focus();
    
    // Render tasks
    renderTasks();
    
    console.log('Task added:', newTask);
}

// Delete Task Function
function deleteTask(taskId) {
    // Remove task from array
    tasks = tasks.filter(task => task.id !== taskId);
    
    // Save to localStorage
    saveTasks();
    
    // Render tasks
    renderTasks();
    
    console.log('Task deleted:', taskId);
}

// Render Tasks Function
function renderTasks() {
    // Clear current content
    taskList.innerHTML = '';
    
    // Show/hide empty state
    if (tasks.length === 0) {
        emptyState.style.display = 'block';
        taskList.style.display = 'none';
    } else {
        emptyState.style.display = 'none';
        taskList.style.display = 'flex';
        
        // Render each task
        tasks.forEach(task => {
            const taskElement = createTaskElement(task);
            taskList.appendChild(taskElement);
        });
    }
    
    console.log('Tasks rendered:', tasks.length);
}

// Create Task Element
function createTaskElement(task) {
    const taskDiv = document.createElement('div');
    taskDiv.className = 'task-card';
    taskDiv.dataset.taskId = task.id;
    
    taskDiv.innerHTML = `
        <span class="task-text">${escapeHtml(task.text)}</span>
        <button class="delete-btn" onclick="deleteTask(${task.id})" aria-label="Delete task">
            Delete
        </button>
    `;
    
    return taskDiv;
}

// Shake Input Animation (for empty input)
function shakeInput() {
    taskInput.style.animation = 'shake 0.3s ease-in-out';
    setTimeout(() => {
        taskInput.style.animation = '';
    }, 300);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Local Storage Functions
function saveTasks() {
    try {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        console.log('Tasks saved to localStorage');
    } catch (error) {
        console.error('Error saving tasks:', error);
    }
}

function loadTasks() {
    try {
        const savedTasks = localStorage.getItem('tasks');
        if (savedTasks) {
            tasks = JSON.parse(savedTasks);
            console.log('Tasks loaded from localStorage:', tasks.length);
        } else {
            tasks = [];
            console.log('No saved tasks found');
        }
    } catch (error) {
        console.error('Error loading tasks:', error);
        tasks = [];
    }
}

// Global function for delete button (needed for onclick attribute)
window.deleteTask = deleteTask;

// Add shake animation to CSS
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;
document.head.appendChild(shakeStyle);