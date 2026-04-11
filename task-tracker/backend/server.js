// ===== PREMIUM TASK TRACKER - BACKEND SERVER =====

const express = require('express');
const cors = require('cors');
const path = require('path');

// Import routes
const taskRoutes = require('./routes');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5500'],
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api', taskRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Task Tracker API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'API endpoint not found',
        message: `Cannot ${req.method} ${req.url}`
    });
});

// Serve frontend for all other routes (SPA support)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    
    // Don't send error details in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    res.status(err.status || 500).json({
        success: false,
        error: isDevelopment ? err.message : 'Internal Server Error',
        ...(isDevelopment && { stack: err.stack })
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`
    ========================================
    Task Tracker Server Started Successfully!
    ========================================
    Server running on: http://localhost:${PORT}
    API Base URL: http://localhost:${PORT}/api
    Frontend: http://localhost:${PORT}
    Environment: ${process.env.NODE_ENV || 'development'}
    ========================================
    `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully...');
    process.exit(0);
});

module.exports = app;