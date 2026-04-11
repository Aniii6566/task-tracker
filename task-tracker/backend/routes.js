// ===== PREMIUM TASK TRACKER - API ROUTES =====

const express = require('express');
const router = express.Router();

// Import database functions
const { 
    getAllTasks, 
    getTaskById, 
    createTask, 
    updateTask, 
    deleteTask 
} = require('./db');

// GET /api/tasks - Get all tasks
router.get('/tasks', async (req, res) => {
    try {
        console.log('Fetching all tasks...');
        const tasks = await getAllTasks();
        
        res.json({
            success: true,
            data: tasks,
            count: tasks.length
        });
        
        console.log(`Successfully fetched ${tasks.length} tasks`);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch tasks',
            message: error.message
        });
    }
});

// GET /api/tasks/:id - Get specific task
router.get('/tasks/:id', async (req, res) => {
    try {
        const taskId = parseInt(req.params.id);
        
        if (isNaN(taskId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid task ID',
                message: 'Task ID must be a number'
            });
        }
        
        console.log(`Fetching task with ID: ${taskId}`);
        const task = await getTaskById(taskId);
        
        if (!task) {
            return res.status(404).json({
                success: false,
                error: 'Task not found',
                message: `Task with ID ${taskId} not found`
            });
        }
        
        res.json({
            success: true,
            data: task
        });
        
        console.log(`Successfully fetched task: ${task.title}`);
    } catch (error) {
        console.error('Error fetching task:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch task',
            message: error.message
        });
    }
});

// POST /api/tasks - Create new task
router.post('/tasks', async (req, res) => {
    try {
        const { title, description, date, completed } = req.body;
        
        // Validation
        if (!title || typeof title !== 'string' || title.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid task title',
                message: 'Task title is required and must be a non-empty string'
            });
        }
        
        if (!date || typeof date !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Invalid task date',
                message: 'Task date is required and must be a string'
            });
        }
        
        // Validate date format (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid date format',
                message: 'Date must be in YYYY-MM-DD format'
            });
        }
        
        const taskData = {
            title: title.trim(),
            description: description ? description.trim() : '',
            date,
            completed: Boolean(completed)
        };
        
        console.log('Creating new task:', taskData);
        const newTask = await createTask(taskData);
        
        res.status(201).json({
            success: true,
            data: newTask,
            message: 'Task created successfully'
        });
        
        console.log(`Successfully created task: ${newTask.title}`);
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create task',
            message: error.message
        });
    }
});

// PUT /api/tasks/:id - Update task
router.put('/tasks/:id', async (req, res) => {
    try {
        const taskId = parseInt(req.params.id);
        const updates = req.body;
        
        if (isNaN(taskId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid task ID',
                message: 'Task ID must be a number'
            });
        }
        
        // Check if task exists
        const existingTask = await getTaskById(taskId);
        if (!existingTask) {
            return res.status(404).json({
                success: false,
                error: 'Task not found',
                message: `Task with ID ${taskId} not found`
            });
        }
        
        // Validate updates
        const allowedFields = ['title', 'description', 'date', 'completed'];
        const invalidFields = Object.keys(updates).filter(field => !allowedFields.includes(field));
        
        if (invalidFields.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid fields',
                message: `Invalid fields: ${invalidFields.join(', ')}. Allowed fields: ${allowedFields.join(', ')}`
            });
        }
        
        // Validate title if provided
        if (updates.title !== undefined) {
            if (typeof updates.title !== 'string' || updates.title.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid task title',
                    message: 'Task title must be a non-empty string'
                });
            }
            updates.title = updates.title.trim();
        }
        
        // Validate date if provided
        if (updates.date !== undefined) {
            if (typeof updates.date !== 'string') {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid task date',
                    message: 'Task date must be a string'
                });
            }
            
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(updates.date)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid date format',
                    message: 'Date must be in YYYY-MM-DD format'
                });
            }
        }
        
        // Validate completed if provided
        if (updates.completed !== undefined) {
            updates.completed = Boolean(updates.completed);
        }
        
        // Trim description if provided
        if (updates.description !== undefined) {
            updates.description = updates.description ? updates.description.trim() : '';
        }
        
        console.log(`Updating task ${taskId} with:`, updates);
        const updatedTask = await updateTask(taskId, updates);
        
        res.json({
            success: true,
            data: updatedTask,
            message: 'Task updated successfully'
        });
        
        console.log(`Successfully updated task: ${updatedTask.title}`);
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update task',
            message: error.message
        });
    }
});

// DELETE /api/tasks/:id - Delete task
router.delete('/tasks/:id', async (req, res) => {
    try {
        const taskId = parseInt(req.params.id);
        
        if (isNaN(taskId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid task ID',
                message: 'Task ID must be a number'
            });
        }
        
        // Check if task exists
        const existingTask = await getTaskById(taskId);
        if (!existingTask) {
            return res.status(404).json({
                success: false,
                error: 'Task not found',
                message: `Task with ID ${taskId} not found`
            });
        }
        
        console.log(`Deleting task with ID: ${taskId}`);
        await deleteTask(taskId);
        
        res.json({
            success: true,
            data: existingTask,
            message: 'Task deleted successfully'
        });
        
        console.log(`Successfully deleted task: ${existingTask.title}`);
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete task',
            message: error.message
        });
    }
});

module.exports = router;
