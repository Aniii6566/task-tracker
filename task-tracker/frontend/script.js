// Global variables
let currentUser = null;
let tasks = [];
let currentPage = 'dashboard';

// API Configuration
const API_BASE = 'https://task-tracker-vr1u.onrender.com/api';

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    // Check screen size on load and resize
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
});

// Screen size check and adjustment
function checkScreenSize() {
    const isMobile = window.innerWidth <= 768;
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    
    if (isMobile) {
        // Mobile: Hide sidebar by default
        sidebar.classList.remove('active');
        mainContent.style.marginLeft = '0';
        document.body.style.overflow = '';
    } else {
        // Desktop: Ensure sidebar is visible
        sidebar.classList.remove('active');
        mainContent.style.marginLeft = '0';
    }
}

// Sidebar toggle functions
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    const mainContent = document.getElementById('mainContent');
    
    sidebar.classList.toggle('active');
    overlay.classList.toggle('show');
    
    // Adjust main content margin and body scroll
    if (sidebar.classList.contains('active')) {
        mainContent.style.marginLeft = '0';
        document.body.style.overflow = 'hidden';
    } else {
        mainContent.style.marginLeft = '0';
        document.body.style.overflow = '';
    }
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    const mainContent = document.getElementById('mainContent');
    
    sidebar.classList.remove('active');
    overlay.classList.remove('show');
    mainContent.style.marginLeft = '0';
    document.body.style.overflow = '';
}

// Authentication
function checkAuth() {
    const user = localStorage.getItem('user');
    if (user) {
        currentUser = JSON.parse(user);
        showDashboard();
    } else {
        showLogin();
    }
}

function showLogin() {
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('dashboardScreen').classList.add('hidden');
}

function showDashboard() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('dashboardScreen').classList.remove('hidden');
    currentPage = 'dashboard';
    closeSidebar(); // Close sidebar when switching screens
    loadDashboard();
}

function logout() {
    localStorage.removeItem('user');
    currentUser = null;
    showLogin();
}

// Login form handler
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    const btn = document.getElementById('loginBtn');
    const btnText = btn.querySelector('.btn-text');
    const loading = btn.querySelector('.loading');
    
    btnText.classList.add('hidden');
    loading.classList.remove('hidden');
    
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });
        
        const data = await response.json();
        
        if (response.ok && data.user) {
            currentUser = data.user;
            localStorage.setItem('user', JSON.stringify(currentUser));
            showNotification('Login successful!', 'success');
            showDashboard();
        } else {
            showNotification('Login failed: ' + (data.error || 'Unknown error'), 'error');
        }
    } catch (error) {
        showNotification('Connection error. Please check your backend.', 'error');
    } finally {
        btnText.classList.remove('hidden');
        loading.classList.add('hidden');
    }
});

// Navigation functions
function showTasks() {
    currentPage = 'tasks';
    hideAllContent();
    document.getElementById('tasksContent').classList.remove('hidden');
    closeSidebar();
    loadTasks();
}

function showAnalytics() {
    currentPage = 'analytics';
    hideAllContent();
    document.getElementById('analyticsContent').classList.remove('hidden');
    closeSidebar();
    loadAnalytics();
}

function showSettings() {
    currentPage = 'settings';
    hideAllContent();
    document.getElementById('settingsContent').classList.remove('hidden');
    closeSidebar();
    loadSettings();
}

function hideAllContent() {
    document.getElementById('dashboardContent').classList.add('hidden');
    document.getElementById('tasksContent').classList.add('hidden');
    document.getElementById('analyticsContent').classList.add('hidden');
    document.getElementById('settingsContent').classList.add('hidden');
}

// Load functions
async function loadDashboard() {
    try {
        const response = await fetch(`${API_BASE}/tasks?user_id=${currentUser.id}`);
        const data = await response.json();
        tasks = data;
        
        updateStats();
        renderRecentTasks();
    } catch (error) {
        showNotification('Failed to load dashboard', 'error');
    }
}

async function loadTasks() {
    try {
        const response = await fetch(`${API_BASE}/tasks?user_id=${currentUser.id}`);
        const data = await response.json();
        tasks = data;
        renderTasks();
    } catch (error) {
        showNotification('Failed to load tasks', 'error');
    }
}

async function loadAnalytics() {
    try {
        const response = await fetch(`${API_BASE}/analytics?user_id=${currentUser.id}`);
        const data = await response.json();
        
        // Create charts
        createStatusChart(data.today);
        createWeeklyChart(data.week);
    } catch (error) {
        showNotification('Failed to load analytics', 'error');
    }
}

function loadSettings() {
    if (currentUser) {
        document.getElementById('userName').value = currentUser.name || '';
        document.getElementById('userEmail').value = currentUser.email || '';
    }
}

// Render functions
function updateStats() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'Completed').length;
    const pendingTasks = tasks.filter(task => task.status === 'Pending').length;
    
    document.getElementById('totalTasks').textContent = totalTasks;
    document.getElementById('completedTasks').textContent = completedTasks;
    document.getElementById('pendingTasks').textContent = pendingTasks;
}

function renderRecentTasks() {
    const container = document.getElementById('recentTasks');
    const recentTasks = tasks.slice(0, 5);
    
    if (recentTasks.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center">No tasks yet. Add your first task above!</p>';
        return;
    }
    
    container.innerHTML = recentTasks.map(task => `
        <div class="task-item">
            <div class="task-title">${task.title}</div>
            <div class="task-actions">
                <span class="badge status-${task.status.toLowerCase().replace(' ', '-')}">${task.status}</span>
            </div>
        </div>
    `).join('');
}

function renderTasks() {
    const container = document.getElementById('tasksList');
    
    if (tasks.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center">No tasks found.</p>';
        return;
    }
    
    container.innerHTML = tasks.map(task => `
        <div class="task-item">
            <div class="task-title">${task.title}</div>
            <div class="task-actions">
                <span class="badge status-${task.status.toLowerCase().replace(' ', '-')}">${task.status}</span>
                <button onclick="updateTaskStatus(${task.id}, 'Completed')" class="btn btn-success btn-sm">
                    <i class="fas fa-check"></i>
                </button>
                <button onclick="deleteTask(${task.id})" class="btn btn-danger btn-sm">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Task operations - PRIORITY COMPLETELY REMOVED
document.getElementById('quickAddForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const title = document.getElementById('quickTaskTitle').value;
    
    if (!title) return;
    
    try {
        const response = await fetch(`${API_BASE}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                title, 
                user_id: currentUser.id 
                // Priority completely removed - no longer sent to API
            }),
        });
        
        if (response.ok) {
            showNotification('Task created successfully!', 'success');
            document.getElementById('quickTaskTitle').value = '';
            loadDashboard();
        } else {
            showNotification('Failed to create task', 'error');
        }
    } catch (error) {
        showNotification('Connection error', 'error');
    }
});

async function updateTaskStatus(taskId, status) {
    try {
        const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status }),
        });
        
        if (response.ok) {
            showNotification('Task updated successfully!', 'success');
            loadTasks();
        } else {
            showNotification('Failed to update task', 'error');
        }
    } catch (error) {
        showNotification('Connection error', 'error');
    }
}

async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
            method: 'DELETE',
        });
        
        if (response.ok) {
            showNotification('Task deleted successfully!', 'success');
            loadTasks();
        } else {
            showNotification('Failed to delete task', 'error');
        }
    } catch (error) {
        showNotification('Connection error', 'error');
    }
}

// Chart functions
function createStatusChart(data) {
    const ctx = document.getElementById('statusChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'Pending', 'In Progress'],
            datasets: [{
                data: [
                    data.Completed || 0,
                    data.Pending || 0,
                    data['In Progress'] || 0
                ],
                backgroundColor: ['#10b981', '#6b7280', '#374151']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#e5e7eb'
                    }
                }
            }
        }
    });
}

function createWeeklyChart(data) {
    const ctx = document.getElementById('weeklyChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: Object.keys(data),
            datasets: [{
                label: 'Tasks Created',
                data: Object.values(data),
                borderColor: '#374151',
                backgroundColor: 'rgba(55, 65, 81, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#e5e7eb'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#9ca3af'
                    },
                    grid: {
                        color: '#374151'
                    }
                },
                y: {
                    ticks: {
                        color: '#9ca3af'
                    },
                    grid: {
                        color: '#374151'
                    }
                }
            }
        }
    });
}

// Notification function
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}
