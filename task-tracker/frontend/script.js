// Global variables
let currentUser = null;
let tasks = [];
let currentPage = 'dashboard';

// API Configuration (fallback to localStorage if backend not available)
const API_BASE = 'https://task-tracker-vr1u.onrender.com/api';

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    console.log('App initializing...');
    initializeAuthSystem();
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    // Initialize event listeners
    initializeEventListeners();
});

// ===== AUTHENTICATION SYSTEM =====

// Initialize authentication system
function initializeAuthSystem() {
    console.log('Initializing auth system...');
    
    // Check if user is already logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        console.log('User already logged in:', currentUser.username);
        showDashboard();
    } else {
        console.log('No user logged in, showing login');
        showLogin();
    }
    
    // Initialize users database if not exists
    if (!localStorage.getItem('users')) {
        const defaultUsers = [
            { username: 'admin', password: 'admin123' },
            { username: 'demo', password: 'demo123' }
        ];
        localStorage.setItem('users', JSON.stringify(defaultUsers));
        console.log('Default users created');
    }
}

// Auth screen navigation
function showLogin() {
    hideAllAuthScreens();
    document.getElementById('loginScreen').classList.add('active');
    clearAuthForms();
}

function showSignup() {
    hideAllAuthScreens();
    document.getElementById('signupScreen').classList.add('active');
    clearAuthForms();
}

function showForgotPassword() {
    hideAllAuthScreens();
    document.getElementById('forgotPasswordScreen').classList.add('active');
    clearAuthForms();
}

function hideAllAuthScreens() {
    const screens = document.querySelectorAll('.auth-screen');
    screens.forEach(screen => {
        screen.classList.remove('active');
    });
}

function clearAuthForms() {
    // Clear all form inputs
    const forms = ['loginForm', 'signupForm', 'forgotPasswordForm'];
    forms.forEach(formId => {
        const form = document.getElementById(formId);
        if (form) {
            form.reset();
        }
    });
    
    // Hide all error messages
    hideAllErrors();
}

function hideAllErrors() {
    const errors = ['loginError', 'signupError', 'forgotError'];
    errors.forEach(errorId => {
        const errorElement = document.getElementById(errorId);
        if (errorElement) {
            errorElement.classList.add('hidden');
        }
    });
}

// Login handler
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    // Validation
    if (!username || !password) {
        showAuthError('loginError', 'Please enter both username and password');
        return;
    }
    
    // Show loading state
    const btn = document.getElementById('loginBtn');
    const btnText = btn.querySelector('.btn-text');
    const loading = btn.querySelector('.loading');
    
    btnText.classList.add('hidden');
    loading.classList.remove('hidden');
    btn.disabled = true;
    
    // Simulate API call delay
    setTimeout(() => {
        try {
            // Get users from localStorage
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => u.username === username && u.password === password);
            
            if (user) {
                // Login successful
                currentUser = { username: user.username, id: Date.now() };
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                
                showAuthError('loginError', '', true); // Clear error
                showNotification('Login successful! Welcome back, ' + user.username, 'success');
                
                // Transition to dashboard
                setTimeout(() => {
                    showDashboard();
                }, 1000);
                
            } else {
                // Login failed
                showAuthError('loginError', 'Invalid username or password');
                showNotification('Login failed. Please check your credentials.', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            showAuthError('loginError', 'An error occurred during login');
            showNotification('Login error. Please try again.', 'error');
        } finally {
            // Reset button state
            btnText.classList.remove('hidden');
            loading.classList.add('hidden');
            btn.disabled = false;
        }
    }, 1000);
}

// Signup handler
async function handleSignup(e) {
    e.preventDefault();
    
    const username = document.getElementById('signupUsername').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    
    // Validation
    if (!username || !password || !confirmPassword) {
        showAuthError('signupError', 'Please fill in all fields');
        return;
    }
    
    if (username.length < 3) {
        showAuthError('signupError', 'Username must be at least 3 characters');
        return;
    }
    
    if (password.length < 6) {
        showAuthError('signupError', 'Password must be at least 6 characters');
        return;
    }
    
    if (password !== confirmPassword) {
        showAuthError('signupError', 'Passwords do not match');
        return;
    }
    
    // Show loading state
    const btn = document.getElementById('signupBtn');
    const btnText = btn.querySelector('.btn-text');
    const loading = btn.querySelector('.loading');
    
    btnText.classList.add('hidden');
    loading.classList.remove('hidden');
    btn.disabled = true;
    
    // Simulate API call delay
    setTimeout(() => {
        try {
            // Get users from localStorage
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            
            // Check if username already exists
            if (users.find(u => u.username === username)) {
                showAuthError('signupError', 'Username already exists');
                showNotification('Username already taken. Please choose another.', 'error');
            } else {
                // Create new user
                const newUser = { username, password };
                users.push(newUser);
                localStorage.setItem('users', JSON.stringify(users));
                
                showAuthError('signupError', '', true); // Clear error
                showNotification('Account created successfully! Please login.', 'success');
                
                // Switch to login screen
                setTimeout(() => {
                    showLogin();
                }, 1500);
            }
        } catch (error) {
            console.error('Signup error:', error);
            showAuthError('signupError', 'An error occurred during signup');
            showNotification('Signup error. Please try again.', 'error');
        } finally {
            // Reset button state
            btnText.classList.remove('hidden');
            loading.classList.add('hidden');
            btn.disabled = false;
        }
    }, 1000);
}

// Forgot password handler
async function handleForgotPassword(e) {
    e.preventDefault();
    
    const username = document.getElementById('forgotUsername').value.trim();
    const newPassword = document.getElementById('forgotNewPassword').value;
    const confirmPassword = document.getElementById('forgotConfirmPassword').value;
    
    // Validation
    if (!username || !newPassword || !confirmPassword) {
        showAuthError('forgotError', 'Please fill in all fields');
        return;
    }
    
    if (newPassword.length < 6) {
        showAuthError('forgotError', 'New password must be at least 6 characters');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showAuthError('forgotError', 'New passwords do not match');
        return;
    }
    
    // Show loading state
    const btn = document.getElementById('forgotBtn');
    const btnText = btn.querySelector('.btn-text');
    const loading = btn.querySelector('.loading');
    
    btnText.classList.add('hidden');
    loading.classList.remove('hidden');
    btn.disabled = true;
    
    // Simulate API call delay
    setTimeout(() => {
        try {
            // Get users from localStorage
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const userIndex = users.findIndex(u => u.username === username);
            
            if (userIndex === -1) {
                showAuthError('forgotError', 'Username not found');
                showNotification('Username not found in our system.', 'error');
            } else {
                // Update user password
                users[userIndex].password = newPassword;
                localStorage.setItem('users', JSON.stringify(users));
                
                showAuthError('forgotError', '', true); // Clear error
                showNotification('Password reset successfully! Please login with your new password.', 'success');
                
                // Switch to login screen
                setTimeout(() => {
                    showLogin();
                }, 1500);
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            showAuthError('forgotError', 'An error occurred during password reset');
            showNotification('Password reset error. Please try again.', 'error');
        } finally {
            // Reset button state
            btnText.classList.remove('hidden');
            loading.classList.add('hidden');
            btn.disabled = false;
        }
    }, 1000);
}

// Show auth error
function showAuthError(errorId, message, clear = false) {
    const errorElement = document.getElementById(errorId);
    const errorText = document.getElementById(errorId + 'Text');
    
    if (errorElement && errorText) {
        if (clear) {
            errorElement.classList.add('hidden');
        } else {
            errorText.textContent = message;
            errorElement.classList.remove('hidden');
        }
    }
}

// ===== MAIN APP FUNCTIONS =====

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

// Show dashboard
function showDashboard() {
    document.getElementById('authContainer').classList.add('hidden');
    document.getElementById('dashboardScreen').classList.remove('hidden');
    currentPage = 'dashboard';
    closeSidebar();
    setActiveNav('dashboard');
    updateSidebarUsername();
    loadDashboard();
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('currentUser');
        currentUser = null;
        
        showNotification('Logged out successfully!', 'info');
        
        // Show login screen
        document.getElementById('dashboardScreen').classList.add('hidden');
        document.getElementById('authContainer').classList.remove('hidden');
        showLogin();
    }
}

// Update sidebar username
function updateSidebarUsername() {
    const sidebarUsername = document.getElementById('sidebarUsername');
    if (sidebarUsername && currentUser) {
        sidebarUsername.textContent = 'Welcome, ' + currentUser.username + '!';
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
        
        // Load tasks from localStorage (fallback to empty array)
        const savedTasks = localStorage.getItem('tasks');
        tasks = savedTasks ? JSON.parse(savedTasks) : [];
        
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
        
        const savedTasks = localStorage.getItem('tasks');
        tasks = savedTasks ? JSON.parse(savedTasks) : [];
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
        
        const savedTasks = localStorage.getItem('tasks');
        const allTasks = savedTasks ? JSON.parse(savedTasks) : [];
        const completedTasks = allTasks.filter(task => task.status === 'Completed');
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
        
        const savedTasks = localStorage.getItem('tasks');
        const allTasks = savedTasks ? JSON.parse(savedTasks) : [];
        renderHistory(allTasks);
    } catch (error) {
        console.error('History load error:', error);
        showNotification('Failed to load history', 'error');
    }
}

// Load analytics
async function loadAnalytics() {
    try {
        console.log('Loading analytics...');
        
        const savedTasks = localStorage.getItem('tasks');
        const allTasks = savedTasks ? JSON.parse(savedTasks) : [];
        
        // Create charts
        createStatusChart(allTasks);
        createWeeklyChart(allTasks);
    } catch (error) {
        console.error('Analytics load error:', error);
        showNotification('Failed to load analytics', 'error');
    }
}

// Load settings
function loadSettings() {
    console.log('Loading settings...');
    if (currentUser) {
        document.getElementById('currentUsername').value = currentUser.username || '';
        document.getElementById('newUsername').value = '';
        document.getElementById('oldPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
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
        // Create new task
        const newTask = {
            id: Date.now(),
            title: title,
            status: 'Pending',
            user_id: currentUser ? currentUser.id : 1,
            created_at: new Date().toISOString()
        };
        
        // Add to tasks array
        tasks.push(newTask);
        
        // Save to localStorage
        localStorage.setItem('tasks', JSON.stringify(tasks));
        
        console.log('Task created:', newTask);
        
        showNotification('Task created successfully!', 'success');
        titleInput.value = ''; // Clear input
        titleInput.focus(); // Focus back to input
        
        // Refresh dashboard data
        await loadDashboard();
    } catch (error) {
        console.error('Task creation error:', error);
        showNotification('Failed to create task. Please try again.', 'error');
    } finally {
        // Re-enable form
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

// Update task status
async function updateTaskStatus(taskId, status) {
    try {
        // Find task in array
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            tasks[taskIndex].status = status;
            
            // Save to localStorage
            localStorage.setItem('tasks', JSON.stringify(tasks));
            
            showNotification('Task updated successfully!', 'success');
            
            // Refresh current view
            if (currentPage === 'dashboard') {
                loadDashboard();
            } else if (currentPage === 'tasks') {
                loadTasks();
            } else if (currentPage === 'completed') {
                loadCompletedTasks();
            }
        }
    } catch (error) {
        console.error('Task update error:', error);
        showNotification('Failed to update task', 'error');
    }
}

// Delete task
async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
        // Find task in array
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            tasks.splice(taskIndex, 1);
            
            // Save to localStorage
            localStorage.setItem('tasks', JSON.stringify(tasks));
            
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
        }
    } catch (error) {
        console.error('Task delete error:', error);
        showNotification('Failed to delete task', 'error');
    }
}

// ===== SETTINGS FUNCTIONS =====

// Handle profile update (username change)
async function handleProfileUpdate(e) {
    e.preventDefault();
    
    const currentUsername = document.getElementById('currentUsername').value;
    const newUsername = document.getElementById('newUsername').value.trim();
    
    if (!newUsername) {
        showNotification('Please enter a new username', 'error');
        return;
    }
    
    if (newUsername.length < 3) {
        showNotification('Username must be at least 3 characters', 'error');
        return;
    }
    
    if (newUsername === currentUsername) {
        showNotification('New username is the same as current username', 'error');
        return;
    }
    
    try {
        // Update current user
        currentUser.username = newUsername;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Update users database
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.username === currentUsername);
        if (userIndex !== -1) {
            users[userIndex].username = newUsername;
            localStorage.setItem('users', JSON.stringify(users));
        }
        
        // Update UI
        updateSidebarUsername();
        document.getElementById('currentUsername').value = newUsername;
        document.getElementById('newUsername').value = '';
        
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
        // Verify old password (basic security)
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.username === currentUser.username);
        
        if (!user || user.password !== oldPassword) {
            showNotification('Old password is incorrect', 'error');
            return;
        }
        
        // Update password
        const userIndex = users.findIndex(u => u.username === currentUser.username);
        if (userIndex !== -1) {
            users[userIndex].password = newPassword;
            localStorage.setItem('users', JSON.stringify(users));
        }
        
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

// Initialize event listeners
function initializeEventListeners() {
    console.log('Initializing event listeners...');
    
    // Auth forms
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
        console.log('Login form listener attached');
    }
    
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
        console.log('Signup form listener attached');
    }
    
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', handleForgotPassword);
        console.log('Forgot password form listener attached');
    }
    
    // App forms
    const quickAddForm = document.getElementById('quickAddForm');
    if (quickAddForm) {
        quickAddForm.addEventListener('submit', handleQuickAddTask);
        console.log('Quick add form listener attached');
    }
    
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
        console.log('Profile form listener attached');
    }
    
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', handlePasswordUpdate);
        console.log('Password form listener attached');
    }
}

// Debug function
window.debugTaskTracker = function() {
    console.log('=== TASK TRACKER DEBUG ===');
    console.log('Current user:', currentUser);
    console.log('Tasks:', tasks);
    console.log('Current page:', currentPage);
    
    // Check localStorage
    console.log('Users in localStorage:', JSON.parse(localStorage.getItem('users') || '[]'));
    console.log('Tasks in localStorage:', JSON.parse(localStorage.getItem('tasks') || '[]'));
    console.log('Current user in localStorage:', JSON.parse(localStorage.getItem('currentUser') || 'null'));
    
    console.log('=== END DEBUG ===');
};

// Add debug shortcut
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        window.debugTaskTracker();
    }
});
