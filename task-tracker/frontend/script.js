// Global variables
let currentUser = null;
let tasks = [];
let currentPage = 'dashboard';

// API Configuration
const API_BASE = 'https://task-tracker-vr1u.onrender.com/api';

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    console.log('App initializing...');
    checkAuth();
    // Check screen size on load and resize
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    // Initialize event listeners
    initializeEventListeners();
});

// Initialize all event listeners
function initializeEventListeners() {
    console.log('Initializing event listeners...');
    
    // Quick Add Task form
    const quickAddForm = document.getElementById('quickAddForm');
    if (quickAddForm) {
        quickAddForm.addEventListener('submit', handleQuickAddTask);
        console.log('Quick add form listener attached');
    } else {
        console.error('Quick add form not found');
    }
    
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
        console.log('Login form listener attached');
    }
    
    // Profile form
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }
}

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
async function handleLogin(e) {
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
        console.error('Login error:', error);
        showNotification('Connection error. Please check your backend.', 'error');
    } finally {
        btnText.classList.remove('hidden');
        loading.classList.add('hidden');
    }
}

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
        console.log('Loading dashboard data...');
        const response = await fetch(`${API_BASE}/tasks?user_id=${currentUser.id}`);
        const data = await response.json();
        tasks = data;
        
        updateStats();
        renderRecentTasks();
    } catch (error) {
        console.error('Dashboard load error:', error);
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
        console.error('Tasks load error:', error);
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
        console.error('Analytics load error:', error);
        showNotification('Failed to load analytics', 'error');
    }
}

function loadSettings() {
    if (currentUser) {
        document.getElementById('userName').value = currentUser.name || '';
        document.getElementById('userEmail').value = currentUser.email || '';
    }
}

// Profile update handler
async function handleProfileUpdate(e) {
    e.preventDefault();
    
    const name = document.getElementById('userName').value;
    
    try {
        // This would be an API call to update profile
        showNotification('Profile updated successfully!', 'success');
    } catch (error) {
        console.error('Profile update error:', error);
        showNotification('Failed to update profile', 'error');
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
async function handleQuickAddTask(e) {
    e.preventDefault();
    console.log('Quick add task submitted');
    
    const titleInput = document.getElementById('quickTaskTitle');
    const title = titleInput.value.trim();
    
    console.log('Task title:', title);
    
    // Validate input
    if (!title) {
        showNotification('Please enter a task title', 'error');
        titleInput.focus();
        return;
    }
    
    // Disable form during submission
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<div class="loading"></div> Adding...';
    
    try {
        console.log('Sending task to API:', { title, user_id: currentUser.id });
        
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
        
        console.log('API response status:', response.status);
        
        const data = await response.json();
        console.log('API response data:', data);
        
        if (response.ok) {
            showNotification('Task created successfully!', 'success');
            titleInput.value = ''; // Clear input
            titleInput.focus(); // Focus back to input
            
            // Refresh dashboard data
            await loadDashboard();
        } else {
            console.error('API error:', data);
            showNotification('Failed to create task: ' + (data.error || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Network error:', error);
        showNotification('Connection error. Please try again.', 'error');
    } finally {
        // Re-enable form
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

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
            loadDashboard(); // Also refresh dashboard
        } else {
            const data = await response.json();
            showNotification('Failed to update task: ' + (data.error || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Task update error:', error);
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
            loadDashboard(); // Also refresh dashboard
        } else {
            const data = await response.json();
            showNotification('Failed to delete task: ' + (data.error || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Task delete error:', error);
        showNotification('Connection error', 'error');
    }
}

// Chart functions
function createStatusChart(data) {
    const ctx = document.getElementById('statusChart');
    if (!ctx) return;
    
    new Chart(ctx.getContext('2d'), {
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
    const ctx = document.getElementById('weeklyChart');
    if (!ctx) return;
    
    new Chart(ctx.getContext('2d'), {
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

// Modal functions (placeholder for future use)
function showAddTaskModal() {
    // This would show a modal for adding tasks
    showNotification('Add task modal coming soon!', 'info');
}

// Notification function
function showNotification(message, type = 'info') {
    console.log('Notification:', message, type);
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Debug function
window.debugTaskTracker = function() {
    console.log('=== TASK TRACKER DEBUG ===');
    console.log('Current user:', currentUser);
    console.log('Tasks:', tasks);
    console.log('Current page:', currentPage);
    console.log('API Base:', API_BASE);
    
    // Check DOM elements
    const quickAddForm = document.getElementById('quickAddForm');
    const titleInput = document.getElementById('quickTaskTitle');
    
    console.log('Quick add form:', quickAddForm);
    console.log('Title input:', titleInput);
    console.log('Title input value:', titleInput ? titleInput.value : 'not found');
    
    // Check event listeners
    if (quickAddForm) {
        console.log('Form has event listeners:', quickAddForm.onsubmit !== null);
    }
    
    console.log('=== END DEBUG ===');
};

// Add debug shortcut
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        window.debugTaskTracker();
    }
});
