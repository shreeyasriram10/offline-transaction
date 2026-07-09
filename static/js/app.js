// ========================================
// CHECKMATES OFFLINE - Main Application Logic (Baseline Version)
// ========================================

// Global State
const appState = {
    user: null,
    isLoggedIn: false,
    currentPage: 'login',
    trustScore: 35,  // Baseline trust score for new users
    stars: 0,        // Fixed baseline stars
    transactions: [],
    trustedPeople: [],
    deviceID: 'DEV-' + Date.now().toString().slice(-6),
    deviceCreatedAt: null, // Will be set when device is first created
    isOnline: false,
    isEmergencyMode: false,
    lastSync: null
};

// LOCAL STORAGE KEYS
const STORAGE_KEYS = {
    USERS: 'offpay_users',
    TRANSACTIONS: 'offpay_transactions',
    TRUSTED: 'offpay_trusted',
    DEVICE_ID: 'offpay_device_id',
    DEVICE_CREATED_AT: 'offpay_device_created_at',
    TRUST_HISTORY: 'offpay_trust_history'
};

function initializeApp() {
    // Load device ID from storage or generate new one
    let savedDeviceID = localStorage.getItem(STORAGE_KEYS.DEVICE_ID);
    if (!savedDeviceID) {
        savedDeviceID = 'DEV-' + Date.now().toString().slice(-6);
        localStorage.setItem(STORAGE_KEYS.DEVICE_ID, savedDeviceID);
    }
    appState.deviceID = savedDeviceID;

    // Load device creation timestamp from storage or create new one
    let savedDeviceCreatedAt = localStorage.getItem(STORAGE_KEYS.DEVICE_CREATED_AT);
    if (!savedDeviceCreatedAt) {
        // First time device - set creation timestamp
        savedDeviceCreatedAt = Date.now().toString();
        localStorage.setItem(STORAGE_KEYS.DEVICE_CREATED_AT, savedDeviceCreatedAt);
    }
    appState.deviceCreatedAt = parseInt(savedDeviceCreatedAt);

    // Load transactions
    const savedTransactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (savedTransactions) {
        appState.transactions = JSON.parse(savedTransactions);
    }

    // Load trusted people
    const savedTrusted = localStorage.getItem(STORAGE_KEYS.TRUSTED);
    if (savedTrusted) {
        appState.trustedPeople = JSON.parse(savedTrusted);
    }
}

function setupEventListeners() {
    // Tab switching on login page
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', switchTab);
    });

    // Toast click to dismiss
    const toast = document.getElementById('toast');
    if (toast) {
        toast.addEventListener('click', hideToast);
    }
}

// ========================================
// AUTHENTICATION
// ========================================

function handleLogin(event) {
    event.preventDefault();

    const accountID = document.getElementById('loginAccountID').value;
    const pin = document.getElementById('loginPIN').value;

    // Validate PIN
    if (pin.length < 4 || pin.length > 6) {
        showToast('PIN must be 4-6 digits', 'error');
        return;
    }

    // Get users from storage
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '{}');

    // Check if account exists
    if (!users[accountID]) {
        showToast('Account not found', 'error');
        return;
    }

    // Verify PIN
    if (users[accountID].pin !== pin) {
        showToast('Invalid PIN', 'error');
        return;
    }

    // Login successful
    appState.user = users[accountID];
    appState.isLoggedIn = true;
    appState.user.accountID = accountID;

    // Check if user is "old" and boost trust score for established users
    const user = appState.user;
    const isOldUser = checkIfOldUser(user);

    if (isOldUser && user.trustScore < 85) {
        user.trustScore = 85 + Math.floor(Math.random() * 10); // 85-94 range
        // Update the stored user data
        users[accountID] = user;
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        showToast(`Welcome back! Trust score boosted to ${user.trustScore}`, 'success');
    }

    // Ensure user has stars property (migration for existing users)
    if (typeof user.stars === 'undefined') {
        user.stars = calculateStarsFromTransactions(user);
        users[accountID] = user;
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }

    // Ensure device creation timestamp exists (migration for existing users)
    let savedDeviceCreatedAt = localStorage.getItem(STORAGE_KEYS.DEVICE_CREATED_AT);
    if (!savedDeviceCreatedAt) {
        // Use account creation date for existing users
        savedDeviceCreatedAt = new Date(user.createdAt).getTime();
        localStorage.setItem(STORAGE_KEYS.DEVICE_CREATED_AT, savedDeviceCreatedAt);
        appState.deviceCreatedAt = parseInt(savedDeviceCreatedAt);
    }

    // Save user to sessionStorage
    sessionStorage.setItem('offpay_logged_in_user', JSON.stringify(appState.user));
    sessionStorage.setItem('offpay_is_logged_in', 'true');

    // Show success message
    showToast('CHECKMATES OFFLINE initialized • Offline Mode Active', 'success');

    // Redirect to dashboard
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 500);
}

function handleSignup(event) {
    event.preventDefault();

    const name = document.getElementById('signupName').value;
    const accountID = document.getElementById('signupAccountID').value;
    const pin = document.getElementById('signupPIN').value;
    const confirmPin = document.getElementById('confirmPIN').value;

    // Validation
    if (pin.length < 4 || pin.length > 6) {
        showToast('PIN must be 4-6 digits', 'error');
        return;
    }

    if (pin !== confirmPin) {
        showToast('PINs do not match', 'error');
        return;
    }

    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '{}');

    if (users[accountID]) {
        showToast('Account ID already exists', 'error');
        return;
    }

    // Create new user
    const newUser = {
        name,
        accountID,
        pin,
        createdAt: new Date().toISOString(),
        trustScore: 35, // New users start below 50
        stars: 0, // New users start with 0 stars
        totalTransactions: 0,
        fraudCount: 0,
        lastLoginTime: new Date().toISOString(),
        deviceHistory: [appState.deviceID]
    };

    users[accountID] = newUser;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    showToast('✓ Account created successfully! Please sign in.', 'success');

    // Switch to login tab
    setTimeout(() => {
        switchTabProgrammatically('login');
        document.getElementById('loginAccountID').value = accountID;
        document.getElementById('loginAccountID').focus();
    }, 500);
}

function checkIfLoggedIn() {
    // Check sessionStorage first
    const sessionUser = sessionStorage.getItem('offpay_logged_in_user');
    if (sessionUser) {
        try {
            appState.user = JSON.parse(sessionUser);
            appState.isLoggedIn = true;
            return;
        } catch(e) {
            console.error('Error parsing session user:', e);
        }
    }

    // Fallback: Check if marked as logged in
    const isLoggedIn = sessionStorage.getItem('offpay_is_logged_in');
    if (isLoggedIn === 'true') {
        appState.isLoggedIn = true;
    }
}

function handleLogout() {
    // Clear session
    sessionStorage.removeItem('offpay_logged_in_user');
    sessionStorage.removeItem('offpay_is_logged_in');
    appState.isLoggedIn = false;
    appState.user = null;
    window.location.href = 'index.html';
}

// ========================================
// TAB SWITCHING
// ========================================

function switchTab(event) {
    const tabName = event.target.dataset.tab;
    switchTabProgrammatically(tabName);
}

function switchTabProgrammatically(tabName) {
    // Hide all tabs
    const allTabs = document.querySelectorAll('.tab-content');
    allTabs.forEach(tab => tab.classList.remove('active'));

    // Remove active class from all buttons
    const allBtns = document.querySelectorAll('.tab-btn');
    allBtns.forEach(btn => btn.classList.remove('active'));

    // Show selected tab
    const selectedTab = document.getElementById(tabName);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }

    // Add active class to clicked button
    const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
}

// ========================================
// PIN STRENGTH INDICATOR
// ========================================

function checkPINStrength(pin) {
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');

    let strength = 0;
    let strengthLabel = 'Weak';

    if (pin.length >= 4) strength = 33;
    if (pin.length >= 5) strength = 66;
    if (pin.length === 6) strength = 100;

    strength = Math.min(100, strength);

    strengthBar.style.width = strength + '%';
    strengthBar.style.background = strength < 40 ? '#EF4444' : strength < 70 ? '#FACC15' : '#22C55E';

    if (strength < 40) strengthLabel = 'Weak';
    else if (strength < 70) strengthLabel = 'Fair';
    else strengthLabel = 'Strong';

    strengthText.textContent = strengthLabel;
}

// ========================================
// TOAST NOTIFICATIONS
// ========================================

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(hideToast, 4000);
}

function hideToast() {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.classList.remove('show');
    }
}

// ========================================
// NAVIGATION
// ========================================

function goToDashboard() {
    if (!appState.isLoggedIn) {
        window.location.href = 'index.html';
        return;
    }
    // Clear emergency mode when returning to dashboard
    sessionStorage.removeItem('offpay_emergency_mode');
    appState.isEmergencyMode = false;
    window.location.href = 'dashboard.html';
}

function goToPayment() {
    if (!appState.isLoggedIn) {
        window.location.href = 'index.html';
        return;
    }
    window.location.href = 'payment.html';
}

function goToHistory() {
    if (!appState.isLoggedIn) {
        window.location.href = 'index.html';
        return;
    }
    window.location.href = 'history.html';
}

// ========================================
// REAL-TIME ONLINE STATUS DETECTION
// ========================================

function initializeOnlineStatus() {
    // Set initial status based on navigator.onLine
    appState.isOnline = navigator.onLine;
    updateOnlineStatus();

    // Listen for online/offline events
    window.addEventListener('online', () => {
        appState.isOnline = true;
        updateOnlineStatus();
        showToast('Internet connection restored', 'success');
    });

    window.addEventListener('offline', () => {
        appState.isOnline = false;
        updateOnlineStatus();
        showToast('Internet connection lost - Offline Mode', 'warning');
    });
}

function updateOnlineStatus() {
    const statusElement = document.getElementById('onlineStatus');
    if (statusElement) {
        if (appState.isOnline) {
            statusElement.textContent = '📡 Online • Sync Ready';
            statusElement.className = 'online-status online-badge';
        } else {
            statusElement.textContent = '📡 Offline Mode';
            statusElement.className = 'online-status offline-badge';
        }
    }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

function generatePromiseID() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `PRO-${timestamp}-${random}`;
}

function generateDeviceSignature() {
    const signature = btoa(appState.deviceID + Date.now()).substring(0, 16).toUpperCase();
    return signature;
}

function formatCurrency(amount) {
    return '₹' + parseFloat(amount).toFixed(2);
}

function formatDate(date) {
    if (typeof date === 'string') {
        date = new Date(date);
    }
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

function calculateStarsFromTransactions(user) {
    // Load transactions from localStorage if not in appState
    const transactions = appState.transactions.length > 0 ? appState.transactions :
        JSON.parse(localStorage.getItem('offpay_transactions') || '[]');

    const userTransactions = transactions.filter(txn => txn.accountID === user.accountID);
    const successfulTransactions = userTransactions.filter(txn => txn.status === 'completed').length;
    const totalAmount = userTransactions.filter(txn => txn.status === 'completed')
        .reduce((sum, txn) => sum + parseFloat(txn.amount || 0), 0);

    // Base stars from successful transactions (1 star per 5 transactions)
    let stars = Math.floor(successfulTransactions / 5);

    // Bonus stars from transaction volume (1 star per ₹1000 spent)
    stars += Math.floor(totalAmount / 1000);

    // Bonus stars from trust score (1 star per 20 trust points above 50)
    if (user.trustScore > 50) {
        stars += Math.floor((user.trustScore - 50) / 20);
    }

    // Cap at 5 stars for now
    return Math.min(stars, 5);
}

// Make function globally available
if (typeof window !== 'undefined') {
    window.calculateStarsFromTransactions = calculateStarsFromTransactions;
}

function checkIfOldUser(user) {
    // Check multiple criteria to determine if user is "old"
    const now = new Date();
    const createdAt = new Date(user.createdAt);
    const accountAgeDays = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));

    // Criteria for "old user":
    // 1. Has more than 5 transactions, OR
    // 2. Account is older than 7 days, OR
    // 3. Has used multiple devices
    const hasManyTransactions = user.totalTransactions > 5;
    const isAccountOld = accountAgeDays > 7;
    const hasMultipleDevices = user.deviceHistory && user.deviceHistory.length > 1;

    return hasManyTransactions || isAccountOld || hasMultipleDevices;
}

function calculateTrustScore() {
    // Fixed baseline trust score
    return 40;
}

// ========================================
// MODAL HELPERS
// ========================================

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('show');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        modal.classList.add('hidden');
    }
}

// Override the non-prefixed version for HTML onclick handlers
function closeAlert() {
    closeModal('alertModal');
}

function closeReceipt() {
    closeModal('receiptModal');
}

// Export for use in other files
if (typeof window !== 'undefined') {
    window.appState = appState;
    window.STORAGE_KEYS = STORAGE_KEYS;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeApp,
        setupEventListeners,
        checkIfLoggedIn,
        initializeOnlineStatus
    };
}

if (typeof window !== 'undefined') {
    window.handleLogin = handleLogin;
    window.handleSignup = handleSignup;
    window.checkPINStrength = checkPINStrength;
    window.switchTabProgrammatically = switchTabProgrammatically;
    window.showToast = showToast;
    window.hideToast = hideToast;

    document.addEventListener('DOMContentLoaded', function () {
        initializeApp();
        setupEventListeners();
        checkIfLoggedIn();
        initializeOnlineStatus();
    });
}
