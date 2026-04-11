// ===== PREMIUM TASK TRACKER - DATABASE MODULE =====

const fs = require('fs').promises;
const path = require('path');

// Database file path
const DB_FILE = path.join(__dirname, 'tasks.json');

// Initialize database file if it doesn't exist
async function initializeDatabase() {
    try {
        await fs.access(DB_FILE);
        console.log('Database file exists');
    } catch (error) {
        // File doesn't exist, create it with empty array
        console.log('Creating new database file...');
        await fs.writeFile(DB_FILE, JSON.stringify([], null, 2));
        console.log('Database file created successfully');
    }
}

// Read all tasks from database
async function readTasks() {
    try {
        const data = await fs.readFile(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading database:', error);
        throw new Error('Failed to read tasks from database');
    }
}

// Write tasks to database
async function writeTasks(tasks) {
    try {
        await fs.writeFile(DB_FILE, JSON.stringify(tasks, null, 2));
        console.log(`Database updated with ${tasks.length} tasks`);
    } catch (error) {
        console.error('Error writing to database:', error);
        throw new Error('Failed to write tasks to database');
    }
}

// Generate unique ID for new tasks
function generateId() {
    return Date.now() + Math.floor(Math.random() * 1000);
}

// ===== DATABASE OPERATIONS =====

// Get all tasks
async function getAllTasks() {
    await initializeDatabase();
    return await readTasks();
}

// Get task by ID
async function getTaskById(id) {
    const tasks = await getAllTasks();
    return tasks.find(task => task.id === id) || null;
}

// Create new task
async function createTask(taskData) {
    await initializeDatabase();
    
    const tasks = await readTasks();
    
    const newTask = {
        id: generateId(),
        ...taskData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
    
    tasks.push(newTask);
    await writeTasks(tasks);
    
    return newTask;
}

// Update task
async function updateTask(id, updates) {
    await initializeDatabase();
    
    const tasks = await readTasks();
    const taskIndex = tasks.findIndex(task => task.id === id);
    
    if (taskIndex === -1) {
        throw new Error('Task not found');
    }
    
    // Update task with new data
    tasks[taskIndex] = {
        ...tasks[taskIndex],
        ...updates,
        updated_at: new Date().toISOString()
    };
    
    await writeTasks(tasks);
    
    return tasks[taskIndex];
}

// Delete task
async function deleteTask(id) {
    await initializeDatabase();
    
    const tasks = await readTasks();
    const taskIndex = tasks.findIndex(task => task.id === id);
    
    if (taskIndex === -1) {
        throw new Error('Task not found');
    }
    
    const deletedTask = tasks[taskIndex];
    tasks.splice(taskIndex, 1);
    
    await writeTasks(tasks);
    
    return deletedTask;
}

// Get tasks by date
async function getTasksByDate(date) {
    const tasks = await getAllTasks();
    return tasks.filter(task => task.date === date);
}

// Get completed tasks
async function getCompletedTasks() {
    const tasks = await getAllTasks();
    return tasks.filter(task => task.completed);
}

// Get pending tasks
async function getPendingTasks() {
    const tasks = await getAllTasks();
    return tasks.filter(task => !task.completed);
}

// Get tasks by completion status and date range
async function getTasksByStatusAndDateRange(completed, startDate, endDate) {
    const tasks = await getAllTasks();
    return tasks.filter(task => {
        const taskDate = new Date(task.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        return task.completed === completed && 
               taskDate >= start && 
               taskDate <= end;
    });
}

// Initialize database on module load
initializeDatabase().catch(console.error);

module.exports = {
    getAllTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    getTasksByDate,
    getCompletedTasks,
    getPendingTasks,
    getTasksByStatusAndDateRange
};
