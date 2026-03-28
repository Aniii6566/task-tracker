// ===== CLEAN TASK TRACKER - FULLY FUNCTIONAL =====

// State Management
let tasks = [];

// DOM Elements
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const emptyState = document.getElementById('emptyState');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log('Task Tracker initialized');
    
    // Load tasks from localStorage
    loadTasks();
    
    // Setup event listeners
    setupEventListeners();
    
    // Render initial state
    renderTasks();
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
        alert('Please enter a task');
        return;
    }
    
    // Create new task object
    const newTask = {
        id: Date.now(),
        text: taskText,
        createdAt: new Date().toISOString()
    };
    
    // Add to tasks array
    tasks.push(newTask);
    
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
        taskList.style.display = 'block';
        
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
    taskDiv.className = 'task-item';
    taskDiv.dataset.taskId = task.id;
    
    taskDiv.innerHTML = `
        <span class="task-text">${escapeHtml(task.text)}</span>
        <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
    `;
    
    return taskDiv;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Local Storage Functions
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    console.log('Tasks saved to localStorage');
}

function loadTasks() {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
        console.log('Tasks loaded from localStorage:', tasks.length);
    } else {
        tasks = [];
        console.log('No saved tasks found');
    }
}

// Global function for delete button (needed for onclick attribute)
window.deleteTask = deleteTask;