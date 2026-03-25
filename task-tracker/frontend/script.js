console.log("APP LOADED SUCCESSFULLY");

// Global variables
let tasks = []; // Removed comment
let currentUser = null; // Removed comment
let currentPage = 'dashboard'; // Removed comment

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
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const today = new Date();
    const weekData = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayName = days[date.getDay() === 0 ? 6 : date.getDay() - 1];
        
        const dayTasks = userTasks.filter(task => task.date === dateStr);
        const completedTasks = dayTasks.filter(task => task.status === 'completed').length;
        const percentage = dayTasks.length > 0 ? Math.round((completedTasks / dayTasks.length) * 100) : 0;
        
        weekData.push({
            dayName,
            date: dateStr,
            tasks: dayTasks,
            completedTasks,
            percentage
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
    console.log("✅ Showing App - Auth hidden, App visible");
}

function showAuth() {
    document.getElementById("authContainer").style.display = "flex";
    document.getElementById("appContainer").style.display = "none";
    console.log("✅ Showing Auth - App hidden, Auth visible");
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
