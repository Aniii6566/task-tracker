// Global variables
let currentUser = null; // Will store username string
let tasks = {}; // Will store tasks per user: { username1: [...], username2: [...] }
let currentPage = 'dashboard';

// API Configuration (fallback to localStorage if backend not available)
const API_BASE = 'https://task-tracker-vr1u.onrender.com/api';

// ===== CRITICAL: FIX EVENT RE-BINDING ISSUE =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('App initializing...');
    initializeAuthSystem();
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    // Initialize all event listeners - CRITICAL: Do NOT re-render HTML that removes listeners
    initializeEventListeners();
});

// Load history for specific date
function loadHistoryForDate() {
    const dateInput = document.getElementById('historyDatePicker');
    const selectedDate = dateInput.value;
    
    if (!selectedDate) {
        showNotification('Please select a date', 'error');
        return;
    }
    
    const userTasks = getCurrentUserTasks();
    const tasksForDate = userTasks.filter(t => t.date === selectedDate);
    
    const container = document.getElementById('historyList');
    
    if (tasksForDate.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📅</div>
                <div class="empty-state-text">No tasks found for ${selectedDate}</div>
                <div class="empty-state-subtext">Try selecting a different date</div>
            </div>
        `;
        return;
    }
    
    const completed = tasksForDate.filter(t => t.status === 'completed');
    const missed = tasksForDate.filter(t => t.status === 'missed');
    const pending = tasksForDate.filter(t => t.status === 'pending');
    
    container.innerHTML = `
        <div class="history-summary">
            <h3>Tasks for ${selectedDate}</h3>
            <div class="summary-stats">
                <span class="badge status-completed">✔ ${completed.length} Completed</span>
                <span class="badge status-missed">✖ ${missed.length} Missed</span>
                <span class="badge status-pending">⏳ ${pending.length} Pending</span>
            </div>
        </div>
        <div class="tasks-list">
            ${tasksForDate.map(task => {
                const statusInfo = getTaskStatusInfo(task.status);
                return `
                    <div class="task-item">
                        <div class="task-content">
                            <div class="task-title">${task.title}</div>
                        </div>
                        <div class="task-actions">
                            <span class="badge ${statusInfo.class}" style="color: ${statusInfo.color}">
                                ${statusInfo.icon} ${task.status}
                            </span>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// ===== PROGRESS TRACKER SYSTEM =====

// Get today's date string
function getTodayString() {
    return new Date().toISOString().split('T')[0];
}

// Calculate streak for a task
function calculateTaskStreak(taskTitle) {
    const userTasks = getCurrentUserTasks();
    const dates = [...new Set(userTasks.map(t => t.date))].sort().reverse();
    
    let streak = 0;
    let currentDate = new Date();
    
    for (let i = 0; i < dates.length; i++) {
        const dateStr = dates[i];
        const tasksForDate = userTasks.filter(t => t.date === dateStr);
        const taskForDate = tasksForDate.find(t => t.title === taskTitle);
        
        if (taskForDate && taskForDate.status === 'completed') {
            const taskDate = new Date(dateStr);
            const daysDiff = Math.floor((currentDate - taskDate) / (1000 * 60 * 60 * 24));
            
            if (daysDiff === streak) {
                streak++;
            } else {
                break;
            }
        } else {
            break;
        }
        
        currentDate = new Date(currentDate);
        currentDate.setDate(currentDate.getDate() - 1);
    }
    
    return streak;
}

// Calculate daily progress percentage
function calculateDailyProgress(date = getTodayString()) {
    const userTasks = getCurrentUserTasks();
    const tasksForDate = userTasks.filter(t => t.date === date);
    
    if (tasksForDate.length === 0) return 0;
    
    const completedTasks = tasksForDate.filter(t => t.status === 'completed').length;
    return Math.round((completedTasks / tasksForDate.length) * 100);
}

// Get weekly analytics
function getWeeklyAnalytics() {
    const userTasks = getCurrentUserTasks();
    const today = new Date();
    const weekData = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const tasksForDate = userTasks.filter(t => t.date === dateStr);
        const completed = tasksForDate.filter(t => t.status === 'completed').length;
        const total = tasksForDate.length;
        
        weekData.push({
            date: dateStr,
            dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
            completed,
            total,
            percentage: total > 0 ? Math.round((completed / total) * 100) : 0
        });
    }
    
    return weekData;
}

// Get task status icon and color
function getTaskStatusInfo(status) {
    switch (status) {
        case 'completed':
            return { icon: '✔', color: '#10b981', class: 'status-completed' };
        case 'missed':
            return { icon: '✖', color: '#ef4444', class: 'status-missed' };
        default:
            return { icon: '⏳', color: '#6b7280', class: 'status-pending' };
    }
}

// Check and update missed tasks
function updateMissedTasks() {
    const userTasks = getCurrentUserTasks();
    const today = getTodayString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    let updated = false;
    
    userTasks.forEach(task => {
        if (task.date === yesterdayStr && task.status === 'pending') {
            task.status = 'missed';
            updated = true;
        }
    });
    
    if (updated) {
        saveCurrentUserTasks(userTasks);
        tasks = userTasks;
        console.log('Updated missed tasks for yesterday');
    }
}

// ===== LAYOUT CONTROLLER FUNCTIONS =====

function showApp() {
    document.getElementById("authContainer").style.display = "none";
    document.getElementById("appContainer").style.display = "flex";
    console.log("🏠 Showing App - Auth hidden, App visible");
}

function showAuth() {
    document.getElementById("authContainer").style.display = "flex";
    document.getElementById("appContainer").style.display = "none";
    console.log("🔐 Showing Auth - App hidden, Auth visible");
}

// ===== AUTHENTICATION SYSTEM =====

// Initialize authentication system
function initializeAuthSystem() {
    console.log('🔍 Initializing auth system...');
    
    // Check if user is already logged in
    const savedUser = localStorage.getItem('currentUser');
    console.log('👤 User check result:', savedUser ? 'User logged in' : 'No user found');
    
    if (savedUser) {
        currentUser = savedUser; // Store username string directly
        console.log('✅ User already logged in:', currentUser);
        
        // Initialize tasks structure for this user if needed
        initializeUserTasks(currentUser);
        
        // CRITICAL: Show app container first
        showApp();
        
        // Then load dashboard content
        showSection('dashboardSection');
        loadDashboard();
    } else {
        console.log('🚪 No user logged in, showing login');
        
        // CRITICAL: Show auth container first
        showAuth();
        
        // Then show login section
        showSection('loginSection');
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
    
    // Initialize tasks structure if not exists
    if (!localStorage.getItem('tasks')) {
        localStorage.setItem('tasks', JSON.stringify({}));
        console.log('Tasks structure initialized');
    }
}

// Initialize user tasks array if it doesn't exist
function initializeUserTasks(username) {
    const allTasks = JSON.parse(localStorage.getItem('tasks') || '{}');
    if (!allTasks[username]) {
        allTasks[username] = [];
        localStorage.setItem('tasks', JSON.stringify(allTasks));
        console.log('Initialized tasks array for user:', username);
    }
}

// Get current user's tasks
function getCurrentUserTasks() {
    if (!currentUser) return [];
    const allTasks = JSON.parse(localStorage.getItem('tasks') || '{}');
    return allTasks[currentUser] || [];
}

// Save current user's tasks
function saveCurrentUserTasks(userTasks) {
    if (!currentUser) return;
    const allTasks = JSON.parse(localStorage.getItem('tasks') || '{}');
    allTasks[currentUser] = userTasks;
    localStorage.setItem('tasks', JSON.stringify(allTasks));
}

// ===== CRITICAL: CENTRAL NAVIGATION SYSTEM (MOST IMPORTANT) =====
function showSection(id) {
    console.log('Showing section:', id);
    
    // Hide all sections
    document.querySelectorAll(".section").forEach(sec => {
        sec.style.display = "none";
    });

    // Show the active section
    const active = document.getElementById(id);
    if (active) {
        active.style.display = "block";
        console.log('Section found and displayed:', id);
    } else {
        console.error('Section not found:', id);
    }

    // CRITICAL: Scroll to top
    window.scrollTo(0, 0);
    
    // Update active nav button
    updateActiveNav(id);
}

// Update active navigation button
function updateActiveNav(sectionId) {
    // Remove active class from all nav buttons
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to corresponding button
    const pageName = sectionId.replace('Section', '');
    const activeBtn = document.querySelector(`[data-page="${pageName}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
}

// Auth screen navigation
function showLogin() {
    console.log('🔑 Showing login screen');
    showAuth(); // CRITICAL: Show auth container
    showSection('loginSection');
    clearAuthForms();
}

function showSignup() {
    console.log('👤 Showing signup screen');
    showAuth(); // CRITICAL: Show auth container
    showSection('signupSection');
    clearAuthForms();
}

function showForgotPassword() {
    console.log('🔒 Showing forgot password screen');
    showAuth(); // CRITICAL: Show auth container
    showSection('forgotSection');
    clearAuthForms();
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

// ===== LOGIN HANDLER =====
function handleLogin() {
    console.log('Login button clicked');
    
    // Get inputs by correct IDs
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    console.log('Login attempt:', { username, password: '***' });
    
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
                currentUser = user.username; // Store username string directly
                localStorage.setItem('currentUser', currentUser);
                
                // Initialize tasks structure for this user
                initializeUserTasks(currentUser);
                
                console.log('Login successful for:', user.username);
                showAuthError('loginError', '', true); // Clear error
                showNotification('Login successful! Welcome back, ' + user.username, 'success');
                
                // Transition to dashboard
                setTimeout(() => {
                    console.log('🚀 Login successful, transitioning to dashboard...');
                    showApp(); // CRITICAL: Show app container
                    showSection('dashboardSection');
                    loadDashboard();
                }, 1000);
                
            } else {
                // Login failed
                console.log('Login failed: invalid credentials');
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

// ===== SIGNUP HANDLER =====
function handleSignup() {
    console.log('Signup button clicked');
    
    // Get inputs by correct IDs
    const username = document.getElementById('signupUsername').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    
    console.log('Signup attempt:', { username, password: '***', confirmPassword: '***' });
    
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
    const btn = document.getElementById('createAccountBtn');
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
                console.log('Signup failed: username already exists');
                showAuthError('signupError', 'Username already exists');
                showNotification('Username already taken. Please choose another.', 'error');
            } else {
                // Create new user
                const newUser = { username, password };
                users.push(newUser);
                localStorage.setItem('users', JSON.stringify(users));
                
                console.log('Signup successful for:', username);
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

// ===== FORGOT PASSWORD HANDLER =====
function handleForgotPassword() {
    console.log('Forgot password button clicked');
    
    // Get inputs by correct IDs
    const username = document.getElementById('forgotUsername').value.trim();
    const newPassword = document.getElementById('forgotNewPassword').value;
    const confirmPassword = document.getElementById('forgotConfirmPassword').value;
    
    console.log('Password reset attempt:', { username, newPassword: '***', confirmPassword: '***' });
    
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
    const btn = document.getElementById('resetPasswordBtn');
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
                console.log('Password reset failed: username not found');
                showAuthError('forgotError', 'Username not found');
                showNotification('Username not found in our system.', 'error');
            } else {
                // Update user password
                users[userIndex].password = newPassword;
                localStorage.setItem('users', JSON.stringify(users));
                
                console.log('Password reset successful for:', username);
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
    
    console.log('Showing auth error:', { errorId, message, clear });
    
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
    console.log('🏠 Showing dashboard');
    showApp(); // CRITICAL: Show app container
    showSection('dashboardSection');
    currentPage = 'dashboard';
    closeSidebar();
    updateSidebarUsername();
    loadDashboard();
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        console.log('🚪 User requested logout...');
        localStorage.removeItem('currentUser'); // Remove currentUser ONLY
        currentUser = null; // Keep all users + tasks
        
        showNotification('Logged out successfully!', 'info');
        
        // Show login screen
        console.log('🔄 Logging out, showing auth screen...');
        showAuth(); // CRITICAL: Show auth container
        showLogin();
    }
}

// Update sidebar username
function updateSidebarUsername() {
    const sidebarUsername = document.getElementById('sidebarUsername');
    if (sidebarUsername && currentUser) {
        sidebarUsername.textContent = 'Welcome, ' + currentUser + '!'; // currentUser is now just a string
    }
}

// ===== NAVIGATION FUNCTIONS =====

// Dashboard navigation
function navigateToDashboard() {
    console.log('Dashboard navigation clicked');
    showDashboard();
}

// Tasks navigation
function navigateToTasks() {
    console.log('Tasks navigation clicked');
    showSection('tasksSection');
    loadTasks();
}

// Completed navigation
function navigateToCompleted() {
    console.log('Completed navigation clicked');
    showSection('completedSection');
    loadCompletedTasks();
}

// History navigation
function navigateToHistory() {
    console.log('History navigation clicked');
    showSection('historySection');
    loadHistory();
}

// Analytics navigation
function navigateToAnalytics() {
    console.log('Analytics navigation clicked');
    showSection('analyticsSection');
    loadAnalytics();
}

// Settings navigation
function navigateToSettings() {
    console.log('Settings navigation clicked');
    showSection('settingsSection');
    loadSettings();
}

// ===== LOAD FUNCTIONS =====

// Load dashboard data
async function loadDashboard() {
    try {
        console.log('Loading dashboard data for user:', currentUser);
        
        // Update missed tasks first
        updateMissedTasks();
        
        // Load ONLY currentUser tasks from localStorage
        tasks = getCurrentUserTasks();
        
        // Update all dashboard components
        updateStats();
        renderRecentTasks();
        renderProgressCard();
        renderWeeklyAnalytics();
    } catch (error) {
        console.error('Dashboard load error:', error);
        showNotification('Failed to load dashboard', 'error');
    }
}

// Load all tasks
async function loadTasks() {
    try {
        console.log('Loading tasks for user:', currentUser);
        
        // Load ONLY currentUser tasks
        tasks = getCurrentUserTasks();
        renderTasks();
    } catch (error) {
        console.error('Tasks load error:', error);
        showNotification('Failed to load tasks', 'error');
    }
}

// Load completed tasks
async function loadCompletedTasks() {
    try {
        console.log('Loading completed tasks for user:', currentUser);
        
        // Load ONLY currentUser tasks
        const allTasks = getCurrentUserTasks();
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
        console.log('Loading task history for user:', currentUser);
        
        // Load ONLY currentUser tasks
        const allTasks = getCurrentUserTasks();
        renderHistory(allTasks);
    } catch (error) {
        console.error('History load error:', error);
        showNotification('Failed to load history', 'error');
    }
}

// Load analytics
async function loadAnalytics() {
    try {
        console.log('Loading analytics for user:', currentUser);
        
        // Load ONLY currentUser tasks
        const allTasks = getCurrentUserTasks();
        
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
    console.log('Loading settings for user:', currentUser);
    if (currentUser) {
        document.getElementById('currentUsername').value = currentUser || '';
        document.getElementById('newUsername').value = '';
        document.getElementById('oldPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
    }
}

// ===== RENDER FUNCTIONS =====

// Update dashboard stats
function updateStats() {
    const today = getTodayString();
    const todayTasks = tasks.filter(t => t.date === today);
    
    const totalTasks = todayTasks.length;
    const completedTasks = todayTasks.filter(task => task.status === 'completed').length;
    const pendingTasks = todayTasks.filter(task => task.status === 'pending').length;
    
    document.getElementById('totalTasks').textContent = totalTasks;
    document.getElementById('completedTasks').textContent = completedTasks;
    document.getElementById('pendingTasks').textContent = pendingTasks;
    
    console.log('Stats updated:', { totalTasks, completedTasks, pendingTasks });
}

// Render progress card
function renderProgressCard() {
    const progress = calculateDailyProgress();
    const progressContainer = document.getElementById('progressCard');
    
    if (progressContainer) {
        progressContainer.innerHTML = `
            <div class="metric-card">
                <div class="metric-header">
                    <div class="metric-icon bg-warning">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <div>
                        <p class="metric-label">Today's Progress</p>
                        <p class="metric-value">${progress}%</p>
                    </div>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
            </div>
        `;
    }
}

// Render weekly analytics
function renderWeeklyAnalytics() {
    const weekData = getWeeklyAnalytics();
    const analyticsContainer = document.getElementById('weeklyAnalytics');
    
    if (analyticsContainer) {
        const completedDays = weekData.filter(d => d.percentage === 100).length;
        
        analyticsContainer.innerHTML = `
            <div class="metric-card">
                <div class="metric-header">
                    <div class="metric-icon bg-accent">
                        <i class="fas fa-calendar-week"></i>
                    </div>
                    <div>
                        <p class="metric-label">Weekly Performance</p>
                        <p class="metric-value">${completedDays}/7 days</p>
                    </div>
                </div>
                <div class="week-summary">
                    ${weekData.map(day => `
                        <div class="day-item">
                            <span class="day-name">${day.dayName}</span>
                            <span class="day-percentage" style="color: ${day.percentage === 100 ? '#10b981' : '#6b7280'}">
                                ${day.percentage}%
                            </span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
}

// Render recent tasks
function renderRecentTasks() {
    const container = document.getElementById('recentTasks');
    const today = getTodayString();
    const todayTasks = tasks.filter(t => t.date === today).slice(0, 5);
    
    if (todayTasks.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center">Start your day by adding tasks 🚀</p>';
        return;
    }
    
    container.innerHTML = todayTasks.map(task => {
        const statusInfo = getTaskStatusInfo(task.status);
        const streak = calculateTaskStreak(task.title);
        const streakDisplay = streak > 0 ? `🔥 ${streak} days` : '';
        
        return `
            <div class="task-item">
                <div class="task-content">
                    <div class="task-title">${task.title}</div>
                    ${streakDisplay ? `<div class="task-streak">${streakDisplay}</div>` : ''}
                </div>
                <div class="task-actions">
                    <span class="badge ${statusInfo.class}" style="color: ${statusInfo.color}">
                        ${statusInfo.icon} ${task.status}
                    </span>
                </div>
            </div>
        `;
    }).join('');
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
    console.log('Quick add task submitted for user:', currentUser);
    
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
            status: 'pending',
            date: getTodayString(),
            user: currentUser,
            created_at: new Date().toISOString()
        };
        
        // Get current user's tasks and add new task
        const userTasks = getCurrentUserTasks();
        userTasks.push(newTask);
        
        // Save to currentUser's task array
        saveCurrentUserTasks(userTasks);
        
        // Update local tasks variable
        tasks = userTasks;
        
        console.log('Task created for user', currentUser, ':', newTask);
        
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
        console.log('Updating task', taskId, 'to', status, 'for user:', currentUser);
        
        // Get current user's tasks
        const userTasks = getCurrentUserTasks();
        
        // Find task in array
        const taskIndex = userTasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            userTasks[taskIndex].status = status;
            
            // Save to currentUser's task array
            saveCurrentUserTasks(userTasks);
            
            // Update local tasks variable
            tasks = userTasks;
            
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
            console.error('Task not found:', taskId);
            showNotification('Task not found', 'error');
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
        console.log('Deleting task', taskId, 'for user:', currentUser);
        
        // Get current user's tasks
        const userTasks = getCurrentUserTasks();
        
        // Find task in array
        const taskIndex = userTasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            userTasks.splice(taskIndex, 1);
            
            // Save to currentUser's task array
            saveCurrentUserTasks(userTasks);
            
            // Update local tasks variable
            tasks = userTasks;
            
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
            console.error('Task not found:', taskId);
            showNotification('Task not found', 'error');
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
    console.log('Profile update submitted');
    
    const currentUsername = document.getElementById('currentUsername').value;
    const newUsername = document.getElementById('newUsername').value.trim();
    
    console.log('Username change attempt:', { currentUsername, newUsername });
    
    if (!newUsername) {
        showNotification('Please enter a new username', 'error');
        return;
    }
    
    if (newUsername.length < 3) {
        showNotification('Username must be at least 3 characters', 'error');
        return;
    }
    
    if (newUsername === currentUsername) {
        showNotification('New username is same as current username', 'error');
        return;
    }
    
    try {
        // Update current user
        currentUser = newUsername;
        localStorage.setItem('currentUser', currentUser);
        
        // Update users database
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.username === currentUsername);
        if (userIndex !== -1) {
            users[userIndex].username = newUsername;
            localStorage.setItem('users', JSON.stringify(users));
        }
        
        // CRITICAL: Transfer tasks from old username to new username
        const allTasks = JSON.parse(localStorage.getItem('tasks') || '{}');
        if (allTasks[currentUsername]) {
            allTasks[newUsername] = allTasks[currentUsername];
            delete allTasks[currentUsername]; // Remove old username entry
            localStorage.setItem('tasks', JSON.stringify(allTasks));
            console.log('Transferred tasks from', currentUsername, 'to', newUsername);
        }
        
        // Update UI
        updateSidebarUsername();
        document.getElementById('currentUsername').value = newUsername;
        document.getElementById('newUsername').value = '';
        
        // Reload dashboard with new username
        loadDashboard();
        
        console.log('Username updated successfully for:', newUsername);
        showNotification('Username updated successfully!', 'success');
    } catch (error) {
        console.error('Profile update error:', error);
        showNotification('Failed to update username', 'error');
    }
}

// Handle password update
async function handlePasswordUpdate(e) {
    e.preventDefault();
    console.log('Password update submitted');
    
    const oldPassword = document.getElementById('oldPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    console.log('Password change attempt:', { 
        oldPassword: oldPassword ? '***' : 'empty', 
        newPassword: newPassword ? '***' : 'empty', 
        confirmPassword: confirmPassword ? '***' : 'empty' 
    });
    
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
        const user = users.find(u => u.username === currentUser);
        
        if (!user || user.password !== oldPassword) {
            console.log('Password update failed: old password incorrect');
            showNotification('Old password is incorrect', 'error');
            return;
        }
        
        // Update password
        const userIndex = users.findIndex(u => u.username === currentUser);
        if (userIndex !== -1) {
            users[userIndex].password = newPassword;
            localStorage.setItem('users', JSON.stringify(users));
        }
        
        // Clear form
        document.getElementById('oldPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
        
        console.log('Password updated successfully for:', currentUser);
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

// ===== CRITICAL: FIX ALL NAV BUTTONS =====
function initializeEventListeners() {
    console.log('Initializing event listeners...');
    
    // Auth buttons
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
        console.log('Login button listener attached');
    } else {
        console.error('Login button not found');
    }
    
    // Create Account button
    const signupBtn = document.getElementById('signupBtn');
    if (signupBtn) {
        signupBtn.addEventListener('click', function() {
            console.log('Create Account button clicked');
            showSignup();
        });
        console.log('Create Account button listener attached');
    } else {
        console.error('Create Account button not found');
    }
    
    // Forgot Password button
    const forgotBtn = document.getElementById('forgotBtn');
    if (forgotBtn) {
        forgotBtn.addEventListener('click', function() {
            console.log('Forgot Password button clicked');
            showForgotPassword();
        });
        console.log('Forgot Password button listener attached');
    } else {
        console.error('Forgot Password button not found');
    }
    
    // Create account form
    const createAccountBtn = document.getElementById('createAccountBtn');
    if (createAccountBtn) {
        createAccountBtn.addEventListener('click', handleSignup);
        console.log('Create Account form listener attached');
    } else {
        console.error('Create Account form button not found');
    }
    
    // Reset password form
    const resetPasswordBtn = document.getElementById('resetPasswordBtn');
    if (resetPasswordBtn) {
        resetPasswordBtn.addEventListener('click', handleForgotPassword);
        console.log('Reset Password form listener attached');
    } else {
        console.error('Reset Password form button not found');
    }
    
    // Back to login buttons
    const backToLoginBtn = document.getElementById('backToLoginBtn');
    if (backToLoginBtn) {
        backToLoginBtn.addEventListener('click', function() {
            console.log('Back to Login button clicked');
            showLogin();
        });
        console.log('Back to Login button listener attached');
    }
    
    const backToLoginBtn2 = document.getElementById('backToLoginBtn2');
    if (backToLoginBtn2) {
        backToLoginBtn2.addEventListener('click', function() {
            console.log('Back to Login button 2 clicked');
            showLogin();
        });
        console.log('Back to Login button 2 listener attached');
    }
    
    // CRITICAL: FIX ALL NAV BUTTONS WITH PROPER SECTION MAPPING
    const dashboardBtn = document.getElementById('dashboardBtn');
    if (dashboardBtn) {
        dashboardBtn.addEventListener('click', function() {
            console.log('Dashboard button clicked');
            navigateToDashboard();
        });
        console.log('Dashboard button listener attached');
    } else {
        console.error('Dashboard button not found');
    }
    
    const tasksBtn = document.getElementById('tasksBtn');
    if (tasksBtn) {
        tasksBtn.addEventListener('click', function() {
            console.log('Tasks button clicked');
            navigateToTasks();
        });
        console.log('Tasks button listener attached');
    } else {
        console.error('Tasks button not found');
    }
    
    const completedBtn = document.getElementById('completedBtn');
    if (completedBtn) {
        completedBtn.addEventListener('click', function() {
            console.log('Completed button clicked');
            navigateToCompleted();
        });
        console.log('Completed button listener attached');
    } else {
        console.error('Completed button not found');
    }
    
    const historyBtn = document.getElementById('historyBtn');
    if (historyBtn) {
        historyBtn.addEventListener('click', function() {
            console.log('History button clicked');
            navigateToHistory();
        });
        console.log('History button listener attached');
    } else {
        console.error('History button not found');
    }
    
    const analyticsBtn = document.getElementById('analyticsBtn');
    if (analyticsBtn) {
        analyticsBtn.addEventListener('click', function() {
            console.log('Analytics button clicked');
            navigateToAnalytics();
        });
        console.log('Analytics button listener attached');
    } else {
        console.error('Analytics button not found');
    }
    
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', function() {
            console.log('Settings button clicked');
            navigateToSettings();
        });
        console.log('Settings button listener attached');
    } else {
        console.error('Settings button not found');
    }
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
        console.log('Logout button listener attached');
    } else {
        console.error('Logout button not found');
    }
    
    // App forms
    const quickAddForm = document.getElementById('quickAddForm');
    if (quickAddForm) {
        quickAddForm.addEventListener('submit', handleQuickAddTask);
        console.log('Quick add form listener attached');
    } else {
        console.error('Quick add form not found');
    }
    
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
        console.log('Profile form listener attached');
    } else {
        console.error('Profile form not found');
    }
    
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', handlePasswordUpdate);
        console.log('Password form listener attached');
    } else {
        console.error('Password form not found');
    }
    
    console.log('All event listeners initialized successfully');
}

// Debug function
window.debugTaskTracker = function() {
    console.log('=== TASK TRACKER DEBUG ===');
    console.log('Current user:', currentUser);
    console.log('Current user tasks:', getCurrentUserTasks());
    console.log('Current page:', currentPage);
    
    // Check localStorage
    console.log('Users in localStorage:', JSON.parse(localStorage.getItem('users') || '[]'));
    console.log('All tasks in localStorage:', JSON.parse(localStorage.getItem('tasks') || '{}'));
    console.log('Current user in localStorage:', localStorage.getItem('currentUser') || 'null');
    
    // Check DOM elements
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const forgotBtn = document.getElementById('forgotBtn');
    const dashboardBtn = document.getElementById('dashboardBtn');
    const tasksBtn = document.getElementById('tasksBtn');
    const completedBtn = document.getElementById('completedBtn');
    const analyticsBtn = document.getElementById('analyticsBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    
    console.log('DOM elements check:');
    console.log('Login button:', loginBtn ? 'found' : 'NOT FOUND');
    console.log('Create Account button:', signupBtn ? 'found' : 'NOT FOUND');
    console.log('Forgot Password button:', forgotBtn ? 'found' : 'NOT FOUND');
    console.log('Dashboard button:', dashboardBtn ? 'found' : 'NOT FOUND');
    console.log('Tasks button:', tasksBtn ? 'found' : 'NOT FOUND');
    console.log('Completed button:', completedBtn ? 'found' : 'NOT FOUND');
    console.log('Analytics button:', analyticsBtn ? 'found' : 'NOT FOUND');
    console.log('Settings button:', settingsBtn ? 'found' : 'NOT FOUND');
    console.log('Username input:', usernameInput ? 'found' : 'NOT FOUND');
    console.log('Password input:', passwordInput ? 'found' : 'NOT FOUND');
    
    // Test input values and properties
    if (usernameInput) {
        console.log('Username input value:', usernameInput.value);
        console.log('Username input disabled:', usernameInput.disabled);
        console.log('Username input readonly:', usernameInput.readOnly);
    }
    
    if (passwordInput) {
        console.log('Password input value:', passwordInput.value);
        console.log('Password input disabled:', passwordInput.disabled);
        console.log('Password input readonly:', passwordInput.readOnly);
    }
    
    // Check sections
    const sections = ['loginSection', 'signupSection', 'forgotSection', 'dashboardSection', 'tasksSection', 'completedSection', 'historySection', 'analyticsSection', 'settingsSection'];
    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        console.log(`${sectionId}:`, section ? 'found' : 'NOT FOUND', section ? `display: ${section.style.display}` : '');
    });
    
    // Show user-specific data separation
    if (currentUser) {
        console.log('=== USER-SPECIFIC DATA ===');
        console.log(`${currentUser} has ${getCurrentUserTasks().length} tasks`);
        console.log('Sample tasks:', getCurrentUserTasks().slice(0, 3));
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
