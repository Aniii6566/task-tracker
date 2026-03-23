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
        console.log('Profile form listener attached');
    }
    
    // Password form
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', handlePasswordUpdate);
        console.log('Password form listener attached');
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
    setActiveNav('dashboard');
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

// ===== NAVIGATION FUNCTIONS =====

// Set active navigation button
function setActiveNav(pageName) {
    console.log('Setting active nav:', pageName);
    
    // Remove active class from all nav buttons
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to current page button
    const activeBtn = document.querySelector(`[data-page="${pageName}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
}

// Show/hide content sections
function showSection(sectionId) {
    console.log('Showing section:', sectionId);
    
    // Hide all content sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.add('hidden');
    });
    
    // Show the requested section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.remove('hidden');
    } else {
        console.error('Section not found:', sectionId);
    }
}

// Navigation functions
function showDashboard() {
    currentPage = 'dashboard';
    showSection('dashboardContent');
    setActiveNav('dashboard');
    closeSidebar();
    loadDashboard();
}

function showTasks() {
    currentPage = 'tasks';
    showSection('tasksContent');
    setActiveNav('tasks');
    closeSidebar();
    loadTasks();
}

function showCompletedTasks() {
    currentPage = 'completed';
    showSection('completedContent');
    setActiveNav('completed');
    closeSidebar();
    loadCompletedTasks();
}

function showHistory() {
    currentPage = 'history';
    showSection('historyContent');
    setActiveNav('history');
    closeSidebar();
    loadHistory();
}

function showAnalytics() {
    currentPage = 'analytics';
    showSection('analyticsContent');
    setActiveNav('analytics');
    closeSidebar();
    loadAnalytics();
}

function showSettings() {
    currentPage = 'settings';
    showSection('settingsContent');
    setActiveNav('settings');
    closeSidebar();
    loadSettings();
}

// ===== LOAD FUNCTIONS =====

// Load dashboard data
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

// Load all tasks
async function loadTasks() {
    try {
        console.log('Loading tasks...');
        const response = await fetch(`${API_BASE}/tasks?user_id=${currentUser.id}`);
        const data = await response.json();
        tasks = data;
        renderTasks();
    } catch (error) {
        console.error('Tasks load error:', error);
        showNotification('Failed to load tasks', 'error');
    }
}

// Load completed tasks
async function loadCompletedTasks() {
    try {
        console.log('Loading completed tasks...');
        const response = await fetch(`${API_BASE}/tasks?user_id=${currentUser.id}`);
        const data = await response.json();
        const completedTasks = data.filter(task => task.status === 'Completed');
        renderCompletedTasks(completedTasks);
    } catch (error) {
        console.error('Completed tasks load error:', error);
        showNotification('Failed to load completed tasks', 'error');
    }
}

// Load task history
async function loadHistory() {
    try {
        console.log('Loading task history...');
        const response = await fetch(`${API_BASE}/tasks?user_id=${currentUser.id}`);
        const data = await response.json();
        renderHistory(data);
    } catch (error) {
        console.error('History load error:', error);
        showNotification('Failed to load history', 'error');
    }
}

// Load analytics
async function loadAnalytics() {
    try {
        console.log('Loading analytics...');
        const response = await fetch(`${API_BASE}/tasks?user_id=${currentUser.id}`);
        const data = await response.json();
        
        // Create charts
        createStatusChart(data);
        createWeeklyChart(data);
    } catch (error) {
        console.error('Analytics load error:', error);
        showNotification('Failed to load analytics', 'error');
    }
}

// Load settings
function loadSettings() {
    console.log('Loading settings...');
    if (currentUser) {
        document.getElementById('userName').value = currentUser.name || '';
        document.getElementById('userEmail').value = currentUser.email || '';
    }
}

// ===== RENDER FUNCTIONS =====

// Update dashboard stats
function updateStats() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'Completed').length;
    const pendingTasks = tasks.filter(task => task.status === 'Pending').length;
    
    document.getElementById('totalTasks').textContent = totalTasks;
    document.getElementById('completedTasks').textContent = completedTasks;
    document.getElementById('pendingTasks').textContent = pendingTasks;
    
    console.log('Stats updated:', { totalTasks, completedTasks, pendingTasks });
}

// Render recent tasks
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

// Render all tasks
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

// Render completed tasks
function renderCompletedTasks(completedTasks) {
    const container = document.getElementById('completedList');
    
    if (completedTasks.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center">No completed tasks found.</p>';
        return;
    }
    
    container.innerHTML = completedTasks.map(task => `
        <div class="task-item">
            <div class="task-title">${task.title}</div>
            <div class="task-actions">
                <span class="badge status-completed">Completed</span>
                <button onclick="deleteTask(${task.id})" class="btn btn-danger btn-sm">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Render history
function renderHistory(allTasks) {
    const container = document.getElementById('historyList');
    
    if (allTasks.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center">No task history found.</p>';
        return;
    }
    
    // Sort by creation date (newest first)
    const sortedTasks = allTasks.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    container.innerHTML = sortedTasks.map(task => `
        <div class="task-item">
            <div class="task-title">${task.title}</div>
            <div class="task-actions">
                <span class="badge status-${task.status.toLowerCase().replace(' ', '-')}">${task.status}</span>
                <small class="text-gray-400">${new Date(task.created_at).toLocaleDateString()}</small>
            </div>
        </div>
    `).join('');
}

// ===== TASK OPERATIONS =====

// Handle quick add task
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

// Update task status
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
            // Refresh current view
            if (currentPage === 'dashboard') {
                loadDashboard();
            } else if (currentPage === 'tasks') {
                loadTasks();
            } else if (currentPage === 'completed') {
                loadCompletedTasks();
            }
        } else {
            const data = await response.json();
            showNotification('Failed to update task: ' + (data.error || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Task update error:', error);
        showNotification('Connection error', 'error');
    }
}

// Delete task
async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
            method: 'DELETE',
        });
        
        if (response.ok) {
            showNotification('Task deleted successfully!', 'success');
            // Refresh current view
            if (currentPage === 'dashboard') {
                loadDashboard();
            } else if (currentPage === 'tasks') {
                loadTasks();
            } else if (currentPage === 'completed') {
                loadCompletedTasks();
            } else if (currentPage === 'history') {
                loadHistory();
            }
        } else {
            const data = await response.json();
            showNotification('Failed to delete task: ' + (data.error || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('Task delete error:', error);
        showNotification('Connection error', 'error');
    }
}

// ===== CHART FUNCTIONS =====

// Create status chart (pie chart)
function createStatusChart(data) {
    const ctx = document.getElementById('statusChart');
    if (!ctx) {
        console.error('Status chart canvas not found');
        return;
    }
    
    // Clear existing chart
    const existingChart = Chart.getChart(ctx);
    if (existingChart) {
        existingChart.destroy();
    }
    
    // Calculate status counts
    const completed = data.filter(task => task.status === 'Completed').length;
    const pending = data.filter(task => task.status === 'Pending').length;
    const inProgress = data.filter(task => task.status === 'In Progress').length;
    
    console.log('Chart data:', { completed, pending, inProgress });
    
    new Chart(ctx.getContext('2d'), {
        type: 'doughnut', // Pie chart
        data: {
            labels: ['Completed', 'Pending', 'In Progress'],
            datasets: [{
                data: [completed, pending, inProgress],
                backgroundColor: [
                    '#10b981', // success green
                    '#6b7280', // gray for pending
                    '#374151'  // accent for in progress
                ],
                borderWidth: 2,
                borderColor: '#1e293b'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#e5e7eb',
                        padding: 20,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: '#1e293b',
                    titleColor: '#e5e7eb',
                    bodyColor: '#e5e7eb',
                    borderColor: '#374151',
                    borderWidth: 1
                }
            }
        }
    });
}

// Create weekly chart
function createWeeklyChart(data) {
    const ctx = document.getElementById('weeklyChart');
    if (!ctx) {
        console.error('Weekly chart canvas not found');
        return;
    }
    
    // Clear existing chart
    const existingChart = Chart.getChart(ctx);
    if (existingChart) {
        existingChart.destroy();
    }
    
    // Generate weekly data (mock data if no real data)
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weeklyData = [3, 5, 2, 8, 4, 6, 1]; // Mock data
    
    new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: weekDays,
            datasets: [{
                label: 'Tasks Created',
                data: weeklyData,
                borderColor: '#374151',
                backgroundColor: 'rgba(55, 65, 81, 0.1)',
                tension: 0.4,
                borderWidth: 2,
                pointBackgroundColor: '#374151',
                pointBorderColor: '#1e293b',
                pointBorderWidth: 2,
                pointRadius: 4
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
                        color: '#374151',
                        drawBorder: false
                    }
                },
                y: {
                    ticks: {
                        color: '#9ca3af'
                    },
                    grid: {
                        color: '#374151',
                        drawBorder: false
                    },
                    beginAtZero: true
                }
            }
        }
    });
}

// ===== SETTINGS FUNCTIONS =====

// Handle profile update
async function handleProfileUpdate(e) {
    e.preventDefault();
    
    const userName = document.getElementById('userName').value.trim();
    
    if (!userName) {
        showNotification('Please enter a username', 'error');
        return;
    }
    
    try {
        // Simulate API call (replace with actual API endpoint)
        console.log('Updating username:', userName);
        
        // Update local user data
        if (currentUser) {
            currentUser.name = userName;
            localStorage.setItem('user', JSON.stringify(currentUser));
        }
        
        showNotification('Username updated successfully!', 'success');
    } catch (error) {
        console.error('Profile update error:', error);
        showNotification('Failed to update username', 'error');
    }
}

// Handle password update
async function handlePasswordUpdate(e) {
    e.preventDefault();
    
    const oldPassword = document.getElementById('oldPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validation
    if (!oldPassword || !newPassword || !confirmPassword) {
        showNotification('Please fill in all password fields', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showNotification('New password must be at least 6 characters', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showNotification('New passwords do not match', 'error');
        return;
    }
    
    try {
        // Simulate API call (replace with actual API endpoint)
        console.log('Updating password...');
        
        // Clear form
        document.getElementById('oldPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
        
        showNotification('Password updated successfully!', 'success');
    } catch (error) {
        console.error('Password update error:', error);
        showNotification('Failed to update password', 'error');
    }
}

// ===== UTILITY FUNCTIONS =====

// Modal functions (placeholder for future use)
function showAddTaskModal() {
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
    
    // Check navigation
    const navButtons = document.querySelectorAll('.nav-btn');
    console.log('Navigation buttons:', navButtons.length);
    
    console.log('=== END DEBUG ===');
};

// Add debug shortcut
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        window.debugTaskTracker();
    }
});
