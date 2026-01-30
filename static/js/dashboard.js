// ========================================
// DASHBOARD PAGE - JavaScript (Baseline Version)
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in from sessionStorage
    const sessionUser = sessionStorage.getItem('offpay_logged_in_user');
    const isLoggedInFlag = sessionStorage.getItem('offpay_is_logged_in');

    if (!sessionUser && !isLoggedInFlag && !appState.isLoggedIn) {
        console.warn('User not logged in, redirecting to index.html');
        window.location.href = 'index.html';
        return;
    }

    // Load user data from sessionStorage or appState
    if (sessionUser) {
        try {
            appState.user = JSON.parse(sessionUser);
            appState.isLoggedIn = true;
        } catch(e) {
            console.error('Error loading user from session:', e);
            window.location.href = 'index.html';
            return;
        }
    }

    // If still no user, redirect
    if (!appState.user) {
        console.warn('No user data available, redirecting to index.html');
        window.location.href = 'index.html';
        return;
    }

    initializeDashboard();
});

function initializeDashboard() {
    // Reload transactions from localStorage to ensure sync
    const savedTransactions = localStorage.getItem('offpay_transactions');
    if (savedTransactions) {
        try {
            appState.transactions = JSON.parse(savedTransactions);
        } catch(e) {
            console.error('Error loading transactions from localStorage:', e);
        }
    }

    // Update greeting
    const greeting = document.getElementById('userGreeting');
    if (greeting && appState.user) {
        greeting.textContent = `Welcome, ${appState.user.name}`;
    }

    // Update trust score display
    updateTrustDisplay();

    // Update device info
    updateDeviceInfo();

    // Update AI status
    updateAIStatus();

    // Setup modal handlers
    setupModalHandlers();

    // Initialize sliding monitor
    initializeMonitor();

    // Setup button event listeners
    setupButtonListeners();

    // Save user session
    sessionStorage.setItem('offpay_logged_in_user', JSON.stringify(appState.user));
}

// ========================================
// VISIBILITY CHANGE HANDLER (for tab switching)
// ========================================

document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        // Reload transactions when user returns to tab
        const savedTransactions = localStorage.getItem('offpay_transactions');
        if (savedTransactions) {
            try {
                appState.transactions = JSON.parse(savedTransactions);
                // Transaction history removed - no need to refresh
            } catch(e) {
                console.error('Error reloading transactions on visibility change:', e);
            }
        }
    }
});

// ========================================
// BUTTON EVENT LISTENERS
// ========================================

function setupButtonListeners() {
    // Payment button
    const paymentBtn = document.getElementById('paymentBtn');
    if (paymentBtn) {
        paymentBtn.addEventListener('click', function(e) {
            e.preventDefault();
            goToPayment();
        });
    }

    // Emergency button
    const emergencyBtn = document.getElementById('emergencyBtn');
    if (emergencyBtn) {
        emergencyBtn.addEventListener('click', function(e) {
            e.preventDefault();

            // Show confirmation dialog
            const confirmed = confirm('🚨 Are you sure you want to enter Emergency Mode?\n\nThis will activate higher transaction limits for crisis situations. Post-sync security verification will be required.');

            if (confirmed) {
                // User clicked "Yes" - proceed with emergency mode
                appState.isEmergencyMode = true;
                sessionStorage.setItem('offpay_emergency_mode', 'true');
                goToPayment();
            }
            // If user clicked "No" or cancelled, do nothing - stay on same page
        });
    }

    // History button
    const historyBtn = document.getElementById('historyBtn');
    if (historyBtn) {
        historyBtn.addEventListener('click', function(e) {
            e.preventDefault();
            goToHistory();
        });
    }

    // Sync button
    const syncBtn = document.getElementById('syncBtn');
    if (syncBtn) {
        syncBtn.addEventListener('click', function(e) {
            e.preventDefault();
            performSync();
        });
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Show confirmation dialog
            if (confirm('Are you sure you want to logout?')) {
                handleLogout();
            }
        });
    }
}

// ========================================
// TRUST DISPLAY
// ========================================

function updateTrustDisplay() {
    // Use the user's actual trust score instead of the fixed calculateTrustScore function
    const score = appState.user ? appState.user.trustScore : 35;

    // Update score number
    const scoreElement = document.getElementById('trustScore');
    if (scoreElement) {
        scoreElement.textContent = score;
    }

    // Update zone badge
    const zoneBadge = document.getElementById('zoneDisplay');
    if (zoneBadge && appState.user) {
        const trustZone = getTrustZone(appState.user.trustScore);
        zoneBadge.className = `zone-badge zone-${trustZone.color.toLowerCase()}`;
        zoneBadge.innerHTML = `<span class="zone-icon">${trustZone.icon}</span> ${trustZone.zone}`;
    }

    // Update zone description
    const zoneDesc = document.getElementById('zoneDescription');
    if (zoneDesc && appState.user) {
        const trustZone = getTrustZone(appState.user.trustScore);
        zoneDesc.textContent = trustZone.description;
    }

    // Update stars in trust circle
    const starsElement = document.getElementById('trustStars');
    if (starsElement && appState.user) {
        const stars = appState.user.stars || 0;
        starsElement.innerHTML = '⭐'.repeat(stars) + '☆'.repeat(Math.max(0, 5 - stars));
    }

    // Update stars display in header
    const headerStarsElement = document.querySelector('[data-points-display]');
    if (headerStarsElement && appState.user) {
        const stars = appState.user.stars || 0;
        // Show stars as visual icons
        const starIcons = '⭐'.repeat(stars) + '☆'.repeat(Math.max(0, 5 - stars));
        headerStarsElement.innerHTML = starIcons;
    }
}

// ========================================
// DEVICE INFO
// ========================================

function updateDeviceInfo() {
    // Update device ID
    const deviceIDElement = document.getElementById('deviceID');
    if (deviceIDElement) {
        deviceIDElement.textContent = appState.deviceID;
    }

    // Update device age
    const deviceAgeElement = document.getElementById('deviceAge');
    if (deviceAgeElement) {
        deviceAgeElement.textContent = getDeviceAge();
    }

    // Update transaction count
    const txnCountElement = document.getElementById('txnCount');
    if (txnCountElement) {
        txnCountElement.textContent = appState.transactions.length;
    }
}

// ========================================
// TRANSACTION HISTORY
// ========================================
// DEVICE DETAILS MODAL
// ========================================

function viewDeviceDetails() {
    // Create device details modal content
    const user = appState.user;
    if (!user) {
        showToast('User data not available', 'error');
        return;
    }

    const deviceDetailsHTML = `
        <div class="device-profile-modal">
            <div class="profile-nav-bar">
                <button class="nav-home-btn" onclick="goToHomepage()" title="Go to Homepage">
                    🏠 Home
                </button>
                <div class="nav-title">Device Trust Profile</div>
            </div>

            <h3>👤 User Profile & Device Details</h3>

            <div class="profile-section">
                <div class="section-header">
                    <button class="section-back-btn" onclick="closeDeviceDetailsModal()" title="Go Back">
                        ← Back
                    </button>
                    <h4>Personal Information</h4>
                </div>
                <div class="profile-item">
                    <span class="profile-label">Name:</span>
                    <span class="profile-value">${user.name}</span>
                </div>
                <div class="profile-item">
                    <span class="profile-label">Account ID:</span>
                    <span class="profile-value">${user.accountID}</span>
                </div>
                <div class="profile-item">
                    <span class="profile-label">Trust Score:</span>
                    <span class="profile-value trust-score">${user.trustScore}/100</span>
                </div>
                <div class="profile-item">
                    <span class="profile-label">Stars:</span>
                    <span class="profile-value">${'⭐'.repeat(user.stars || 0)}${'☆'.repeat(Math.max(0, 5 - (user.stars || 0)))}</span>
                </div>
                <div class="profile-item">
                    <span class="profile-label">Account Created:</span>
                    <span class="profile-value">${new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
                <div class="profile-item">
                    <span class="profile-label">Last Login:</span>
                    <span class="profile-value">${new Date(user.lastLoginTime).toLocaleString()}</span>
                </div>
            </div>

            <div class="profile-section">
                <h4>Device Information</h4>
                <div class="profile-item">
                    <span class="profile-label">Device ID:</span>
                    <span class="profile-value">${appState.deviceID}</span>
                </div>
                <div class="profile-item">
                    <span class="profile-label">Device Age:</span>
                    <span class="profile-value">${getDeviceAge()}</span>
                </div>
                <div class="profile-item">
                    <span class="profile-label">Total Transactions:</span>
                    <span class="profile-value">${appState.transactions.length}</span>
                </div>
                <div class="profile-item">
                    <span class="profile-label">Fraud Count:</span>
                    <span class="profile-value">${user.fraudCount || 0}</span>
                </div>
            </div>

            <div class="profile-section">
                <h4>Trust Zone Status</h4>
                <div class="trust-zone-display">
                    ${getTrustZoneDisplay(user.trustScore)}
                </div>
            </div>
        </div>
    `;

    // Create and show modal
    const modalHTML = `
        <div id="deviceDetailsModal" class="modal-overlay">
            <div class="modal-content modal-device-details">
                <div class="modal-header">
                    <button class="modal-back" onclick="goToHomepage()" title="Back to Homepage">← Home</button>
                    <button class="modal-close" onclick="closeDeviceDetailsModal()">&times;</button>
                </div>
                ${deviceDetailsHTML}
                <div class="modal-actions">
                    <button class="btn-secondary" onclick="closeDeviceDetailsModal()">Close</button>
                </div>
            </div>
        </div>
    `;

    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Show modal
    setTimeout(() => {
        document.getElementById('deviceDetailsModal').classList.add('show');
    }, 10);
}

function closeDeviceDetailsModal() {
    const modal = document.getElementById('deviceDetailsModal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

function goToHomepage() {
    window.location.href = 'index.html';
}

function getDeviceAge() {
    const deviceCreatedAt = appState.deviceCreatedAt;
    if (deviceCreatedAt) {
        const deviceDate = new Date(deviceCreatedAt);
        const now = new Date();
        const days = Math.floor((now - deviceDate) / (1000 * 60 * 60 * 24));

        // User-friendly device age categories
        if (days === 0) return '🌟 New Today';
        if (days <= 3) return '✨ Very Recent';
        if (days <= 7) return '🔥 This Week';
        if (days <= 30) return '📅 This Month';
        if (days <= 90) return '🏆 Regular User';
        if (days <= 365) return '💎 Established';
        return '👑 Veteran User';
    }
    return '🎯 First Time';
}

function getTrustZone(trustScore) {
    if (trustScore >= 85) {
        return {
            zone: 'Green Zone',
            color: 'green',
            icon: '✓',
            description: 'High Trust • Full Access'
        };
    } else if (trustScore >= 50) {
        return {
            zone: 'Yellow Zone',
            color: 'yellow',
            icon: '⚠️',
            description: 'Medium Trust • Standard Limits'
        };
    } else {
        return {
            zone: 'Red Zone',
            color: 'red',
            icon: '🔒',
            description: 'Low Trust • Restricted Access'
        };
    }
}

function getTrustZoneDisplay(trustScore) {
    let zone, color, description;

    if (trustScore >= 85) {
        zone = 'Green Zone';
        color = '#4CAF50';
        description = 'High Trust • Full Access';
    } else if (trustScore >= 50) {
        zone = 'Yellow Zone';
        color = '#FF9800';
        description = 'Medium Trust • Standard Limits';
    } else {
        zone = 'Red Zone';
        color = '#F44336';
        description = 'Low Trust • Restricted Access';
    }

    return `
        <div class="trust-zone-badge" style="background: ${color}; color: white; padding: 10px; border-radius: 5px; text-align: center;">
            <div style="font-size: 18px; font-weight: bold;">${zone}</div>
            <div style="font-size: 14px; margin-top: 5px;">${description}</div>
            <div style="font-size: 12px; margin-top: 5px; opacity: 0.9;">Score: ${trustScore}/100</div>
        </div>
    `;
}

// ========================================
// EMERGENCY MODE
// ========================================

function activateEmergencyMode() {
    openModal('emergencyOverlay');
}

function proceedEmergency() {
    closeModal('emergencyOverlay');
    showToast('Emergency mode activated', 'warning');
}

function closeEmergency() {
    closeModal('emergencyOverlay');
}

// ========================================
// SYNC NOW
// ========================================

function performSync() {
    openModal('syncModal');
    
    // Reset sync steps
    const steps = ['syncStep1', 'syncStep2', 'syncStep3', 'syncStep4'];
    steps.forEach(step => {
        const el = document.getElementById(step);
        if (el) el.textContent = el.textContent.replace('✅', '⏳').replace('❌', '⏳');
    });
    
    document.getElementById('syncResult').classList.add('hidden');
    
    let step = 0;
    const syncInterval = setInterval(() => {
        step++;
        const stepEl = document.getElementById('syncStep' + step);
        if (stepEl) {
            stepEl.textContent = stepEl.textContent.replace('⏳', '✅') + ' Done';
        }
        
        if (step === 4) {
            clearInterval(syncInterval);
            completeSync();
        }
    }, 1000);
}

function completeSync() {
    // Update last sync time
    appState.lastSync = new Date().toISOString();
    
    // Show success result
    document.getElementById('syncResult').classList.remove('hidden');
    
    // Update trust display after sync
    setTimeout(() => {
        updateTrustDisplay();
        showToast('Sync complete! Trust score updated.', 'success');
    }, 500);
}

function closeSyncModal() {
    closeModal('syncModal');
}

// ========================================
// MODAL HANDLERS
// ========================================

function setupModalHandlers() {
    const overlay = document.getElementById('emergencyOverlay');
    if (overlay) {
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                closeEmergency();
            }
        });
    }
}

// ========================================
// SLIDING MONITOR HANDLERS
// ========================================

let monitorOpen = false;

function initializeMonitor() {
    const monitorToggle = document.getElementById('monitorToggle');
    if (monitorToggle) {
        monitorToggle.addEventListener('click', toggleMonitor);
    }

    // Add event listeners for monitor buttons
    const monitorBtn1 = document.getElementById('monitorBtn1'); // Fingerprint
    const monitorBtn2 = document.getElementById('monitorBtn2'); // PIN Verify
    const monitorBtn3 = document.getElementById('monitorBtn3'); // Location

    if (monitorBtn1) {
        monitorBtn1.addEventListener('click', handleFingerprintScan);
    }
    if (monitorBtn2) {
        monitorBtn2.addEventListener('click', handlePINVerify);
    }
    if (monitorBtn3) {
        monitorBtn3.addEventListener('click', handleLocationCheck);
    }

    // Add keyboard shortcuts
    document.addEventListener('keydown', function(event) {
        if (event.key === 'm' || event.key === 'M') {
            toggleMonitor();
        } else if (monitorOpen) {
            // Only handle number keys when monitor is open
            switch(event.key) {
                case '1':
                    event.preventDefault();
                    handleFingerprintScan();
                    break;
                case '2':
                    event.preventDefault();
                    handlePINVerify();
                    break;
                case '3':
                    event.preventDefault();
                    handleLocationCheck();
                    break;
            }
        }
    });
}

function toggleMonitor() {
    const monitor = document.getElementById('slidingMonitor');
    if (monitor) {
        monitorOpen = !monitorOpen;
        if (monitorOpen) {
            monitor.classList.add('open');
            showToast('Monitor opened');
        } else {
            monitor.classList.remove('open');
            showToast('Monitor closed');
        }
    }
}

function closeMonitor() {
    const monitor = document.getElementById('slidingMonitor');
    if (monitor) {
        monitorOpen = false;
        monitor.classList.remove('open');
        showToast('Monitor closed');
    }
}

function handleFingerprintScan() {
    const fingerprintBtn = document.getElementById('monitorBtn1');
    const statusSpan = fingerprintBtn.querySelector('.monitor-status');

    // Update button status to scanning
    statusSpan.textContent = 'Scanning...';
    statusSpan.style.color = '#ffa500';
    fingerprintBtn.style.backgroundColor = 'rgba(255, 165, 0, 0.1)';

    showToast('🔍 Scanning fingerprint... Place your finger on the sensor', 'info');

    // Simulate fingerprint scanning process
    setTimeout(() => {
        // Simulate successful scan (90% success rate for demo)
        const scanSuccess = Math.random() > 0.1;

        if (scanSuccess) {
            statusSpan.textContent = 'Verified ✓';
            statusSpan.style.color = '#4CAF50';
            fingerprintBtn.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';

            // Increase trust score slightly
            if (appState.user) {
                appState.user.trustScore = Math.min(100, appState.user.trustScore + 5);
                appState.user.stars = calculateStarsFromTransactions(appState.user);
                updateTrustDisplay();
                sessionStorage.setItem('offpay_logged_in_user', JSON.stringify(appState.user));
                // Update localStorage
                const users = JSON.parse(localStorage.getItem('offpay_users') || '{}');
                if (users[appState.user.accountID]) {
                    users[appState.user.accountID] = appState.user;
                    localStorage.setItem('offpay_users', JSON.stringify(users));
                }
            }

            showToast('✅ Fingerprint verified! Trust score increased', 'success');
        } else {
            statusSpan.textContent = 'Failed ✗';
            statusSpan.style.color = '#f44336';
            fingerprintBtn.style.backgroundColor = 'rgba(244, 67, 54, 0.1)';

            showToast('❌ Fingerprint scan failed. Please try again', 'error');

            // Reset after 3 seconds
            setTimeout(() => {
                statusSpan.textContent = 'Ready';
                statusSpan.style.color = '';
                fingerprintBtn.style.backgroundColor = '';
            }, 3000);
        }
    }, 2000); // 2 second scan simulation
}

function handlePINVerify() {
    const pinBtn = document.getElementById('monitorBtn2');
    const statusSpan = pinBtn.querySelector('.monitor-status');

    // Ask user to enter PIN
    const enteredPIN = prompt('🔐 Enter your PIN to verify:');

    // If user cancelled the prompt
    if (enteredPIN === null) {
        showToast('PIN verification cancelled', 'info');
        return;
    }

    statusSpan.textContent = 'Verifying...';
    statusSpan.style.color = '#ffa500';
    pinBtn.style.backgroundColor = 'rgba(255, 165, 0, 0.1)';

    showToast('🔐 Verifying PIN...', 'info');

    // Simulate verification delay
    setTimeout(() => {
        // Check if entered PIN matches user's login PIN
        const userPIN = appState.user ? appState.user.pin : null;

        if (userPIN && enteredPIN === userPIN) {
            statusSpan.textContent = 'Verified ✓';
            statusSpan.style.color = '#4CAF50';
            pinBtn.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';

            // Increase trust score slightly for successful verification
            if (appState.user) {
                appState.user.trustScore = Math.min(100, appState.user.trustScore + 3);
                appState.user.stars = calculateStarsFromTransactions(appState.user);
                updateTrustDisplay();
                sessionStorage.setItem('offpay_logged_in_user', JSON.stringify(appState.user));
                // Update localStorage
                const users = JSON.parse(localStorage.getItem('offpay_users') || '{}');
                if (users[appState.user.accountID]) {
                    users[appState.user.accountID] = appState.user;
                    localStorage.setItem('offpay_users', JSON.stringify(users));
                }
            }

            showToast('✅ PIN verified successfully! Trust score increased', 'success');
        } else {
            statusSpan.textContent = 'Failed ✗';
            statusSpan.style.color = '#f44336';
            pinBtn.style.backgroundColor = 'rgba(244, 67, 54, 0.1)';

            showToast('❌ PIN verification failed. Please try again', 'error');
        }

        // Reset after 3 seconds
        setTimeout(() => {
            statusSpan.textContent = 'Ready';
            statusSpan.style.color = '';
            pinBtn.style.backgroundColor = '';
        }, 3000);
    }, 1000);
}

function handleLocationCheck() {
    const locationBtn = document.getElementById('monitorBtn3');
    const statusSpan = locationBtn.querySelector('.monitor-status');

    statusSpan.textContent = 'Checking...';
    statusSpan.style.color = '#ffa500';
    locationBtn.style.backgroundColor = 'rgba(255, 165, 0, 0.1)';

    showToast('📍 Checking device location', 'info');

    // Simulate location check
    setTimeout(() => {
        statusSpan.textContent = 'Verified ✓';
        statusSpan.style.color = '#4CAF50';
        locationBtn.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';

        showToast('✅ Location verified - Device location confirmed', 'success');

        // Reset after 3 seconds
        setTimeout(() => {
            statusSpan.textContent = 'Ready';
            statusSpan.style.color = '';
            locationBtn.style.backgroundColor = '';
        }, 3000);
    }, 1000);
}

// ========================================
// AI STATUS (Now handled by ai.js)
// ========================================

// Removed duplicate AI status function - now handled by ai.js for dynamic content

// Start updating AI messages
document.addEventListener('DOMContentLoaded', function() {
    if (document.location.pathname.includes('dashboard')) {
        updateAIStatus();
        setInterval(updateAIStatus, 3000); // Update every 3 seconds
    }
});
