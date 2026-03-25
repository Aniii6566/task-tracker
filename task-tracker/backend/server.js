const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Mock database (in production, use real database)
let tasks = [];

// Routes
app.get('/api/tasks', (req, res) => {
    console.log('📊 GET /api/tasks - Fetching all tasks');
    res.json({ success: true, tasks: tasks });
});

app.post('/api/tasks', (req, res) => {
    console.log('➕ POST /api/tasks - Adding new task');
    console.log('📤 Request body:', req.body);
    
    const { title, status, date, completed, user, created_at } = req.body;
    
    // Validation
    if (!title || !user) {
        console.log('❌ Validation failed - missing title or user');
        return res.status(400).json({ 
            success: false, 
            error: 'Title and user are required' 
        });
    }
    
    const newTask = {
        id: Date.now(),
        title: title || 'Untitled Task',
        status: status || 'pending',
        date: date || new Date().toISOString().split('T')[0],
        completed: completed || false,
        user: user || 'anonymous',
        created_at: created_at || new Date().toISOString()
    };
    
    tasks.push(newTask);
    
    console.log('✅ Task created successfully:', newTask);
    console.log('📊 Total tasks now:', tasks.length);
    
    res.json({ 
        success: true, 
        task: newTask,
        message: 'Task created successfully' 
    });
});

app.put('/api/tasks/:id', (req, res) => {
    console.log(`🔄 PUT /api/tasks/${req.params.id} - Updating task`);
    console.log('📤 Request body:', req.body);
    
    const taskId = parseInt(req.params.id);
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
        console.log('❌ Task not found:', taskId);
        return res.status(404).json({ 
            success: false, 
            error: 'Task not found' 
        });
    }
    
    const updatedTask = { ...tasks[taskIndex], ...req.body };
    tasks[taskIndex] = updatedTask;
    
    console.log('✅ Task updated successfully:', updatedTask);
    
    res.json({ 
        success: true, 
        task: updatedTask,
        message: 'Task updated successfully' 
    });
});

app.delete('/api/tasks/:id', (req, res) => {
    console.log(`🗑️ DELETE /api/tasks/${req.params.id} - Deleting task`);
    
    const taskId = parseInt(req.params.id);
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
        console.log('❌ Task not found:', taskId);
        return res.status(404).json({ 
            success: false, 
            error: 'Task not found' 
        });
    }
    
    const deletedTask = tasks.splice(taskIndex, 1)[0];
    
    console.log('✅ Task deleted successfully:', deletedTask);
    console.log('📊 Total tasks now:', tasks.length);
    
    res.json({ 
        success: true, 
        task: deletedTask,
        message: 'Task deleted successfully' 
    });
});

// Health check
app.get('/api/health', (req, res) => {
    console.log('🏥 Health check requested');
    res.json({ 
        success: true, 
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Server error:', err);
    res.status(500).json({ 
        success: false, 
        error: 'Internal server error' 
    });
});

// 404 handler
app.use((req, res) => {
    console.log('❌ Route not found:', req.method, req.url);
    res.status(404).json({ 
        success: false, 
        error: 'Route not found' 
    });
});

// Start server
app.listen(port, () => {
    console.log(`🚀 Task Tracker API Server running on port ${port}`);
    console.log(`📡 API endpoints available at http://localhost:${port}/api`);
    console.log('🏥 Health check: http://localhost:3000/api/health');
});
