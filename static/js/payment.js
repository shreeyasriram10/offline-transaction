// ========================================
// PAYMENT PAGE - JavaScript
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

    initializePaymentPage();
});

function initializePaymentPage() {
    // Default to normal mode for regular payments
    const modeSelect = document.getElementById('paymentMode');
    if (modeSelect) {
        modeSelect.value = 'normal';
        updateModeInfo();
    }

    // Check if emergency mode was activated from dashboard
    const emergencyModeFlag = sessionStorage.getItem('offpay_emergency_mode');
    const isEmergencyActive = emergencyModeFlag === 'true' || appState.isEmergencyMode;

    if (isEmergencyActive) {
        // Emergency mode is active - switch payment mode to emergency
        if (modeSelect) {
            modeSelect.value = 'emergency';
            updateModeInfo();
            showToast('🚨 Emergency Mode Active • Higher limits enabled', 'warning');
        }
    } else {
        // Regular payment - ensure normal mode
        if (modeSelect && modeSelect.value !== 'normal') {
            modeSelect.value = 'normal';
            updateModeInfo();
        }
    }

    // Setup form listeners
    const form = document.getElementById('paymentForm');
    if (form) {
        form.addEventListener('input', onPaymentFormChange);
    }

    // Load trusted people
    loadTrustedPeople();

    // Save user session
    sessionStorage.setItem('offpay_logged_in_user', JSON.stringify(appState.user));
}

// ========================================
// FORM CHANGE HANDLER
// ========================================

function onPaymentFormChange() {
    const senderName = document.getElementById('senderName').value;
    const receiverName = document.getElementById('receiverName').value;
    const amount = parseFloat(document.getElementById('amount').value) || 0;

    if (!senderName || !receiverName || amount <= 0) {
        renderAIDecisionPanel({
            decision: aiEngine.ALLOW,
            trustScore: calculateTrustScore(),
            zone: 'neutral',
            riskFactors: [],
            positiveFactors: [],
            recommendation: 'Enter payment details to analyze',
            confidence: 0,
            requiresConfirmation: false
        });
        return;
    }

    // Create temp payment data for analysis
    const paymentData = {
        senderName,
        receiverName,
        amount,
        isEmergency: document.getElementById('paymentMode').value === 'emergency',
        pin: document.getElementById('senderPIN').value || '0000'
    };

    // Analyze and display AI decision
    const decision = makeAIDecision(paymentData);
    renderAIDecisionPanel(decision);
}

// ========================================
// PAYMENT MODE INFO
// ========================================

function updateModeInfo() {
    const mode = document.getElementById('paymentMode').value;
    const modeInfo = document.getElementById('modeInfo');
    const emergencyPINGroup = document.getElementById('emergencyPINGroup');

    let infoText = '';

    switch(mode) {
        case 'normal':
            infoText = '<strong>Normal Mode:</strong> Full security checks, standard limits, instant offline processing. 1x points earned';
            if (emergencyPINGroup) emergencyPINGroup.classList.add('hidden');
            break;
        case 'emergency':
            infoText = '<strong>🚨 Emergency Mode:</strong> Higher limits (up to ₹100k), requires post-sync bank verification, use during disasters or critical situations only. ⭐ 2x BONUS POINTS!';
            if (emergencyPINGroup) emergencyPINGroup.classList.remove('hidden');
            break;
        case 'lend':
            infoText = '<strong>💳 Lend Mode:</strong> Peer-to-peer lending with automatic repayment tracking, both parties get proof of transaction. 1.5x points earned';
            if (emergencyPINGroup) emergencyPINGroup.classList.add('hidden');
            break;
    }

    if (modeInfo) {
        modeInfo.innerHTML = infoText;
    }

    // Re-analyze payment when mode changes
    onPaymentFormChange();
}

// ========================================
// PROCESS PAYMENT
// ========================================

function processPayment(event) {
    event.preventDefault();

    const senderName = document.getElementById('senderName').value;
    const receiverName = document.getElementById('receiverName').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const mode = document.getElementById('paymentMode').value;
    const pin = document.getElementById('senderPIN').value;

    // Validation
    if (!senderName || !receiverName || !amount || !pin) {
        showToast('Please fill all required fields', 'error');
        return;
    }

    if (amount <= 0) {
        showToast('Amount must be greater than 0', 'error');
        return;
    }

    if (pin.length < 4 || pin.length > 6) {
        showToast('PIN must be 4-6 digits', 'error');
        return;
    }

    // Prepare payment data
    const paymentData = {
        senderName,
        receiverName,
        amount,
        mode,
        pin,
        isEmergency: mode === 'emergency' || appState.isEmergencyMode
    };

    // Show confirmation panel
    showPaymentConfirmation(paymentData);
}

// ========================================
// CREATE PROMISE TOKEN
// ========================================

function createPromiseToken(paymentData, decision) {
    const transaction = {
        promiseID: generatePromiseID(),
        senderName: paymentData.senderName,
        receiverName: paymentData.receiverName,
        amount: paymentData.amount,
        mode: paymentData.mode,
        timestamp: new Date().toISOString(),
        deviceSignature: generateDeviceSignature(),
        trustScore: decision.trustScore,
        zone: decision.zone,
        aiDecision: decision.decision,
        aiConfidence: decision.confidence,
        status: 'pending',
        expiryTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        retryCount: 0,
        emergency: paymentData.isEmergency
    };

    return transaction;
}

// ========================================
// EMERGENCY TRANSACTION API CALL
// ========================================

async function sendEmergencyTransactionToAPI(transaction) {
    try {
        const apiUrl = 'http://localhost:3000/api/transactions/emergency';
        
        const payload = {
            promiseID: transaction.promiseID,
            senderName: transaction.senderName,
            receiverName: transaction.receiverName,
            amount: transaction.amount,
            accountID: appState.user.accountID,
            trustScore: transaction.trustScore,
            aiDecision: transaction.aiDecision
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok && data.success) {
            console.log('✓ Emergency transaction sent to API:', data);
            return {
                success: true,
                data: data
            };
        } else {
            console.error('Emergency API Error:', data);
            return {
                success: false,
                error: data.error || 'Failed to process emergency transaction'
            };
        }
    } catch (error) {
        console.error('Emergency transaction API error:', error);
        // Continue offline processing if API fails
        return {
            success: false,
            error: error.message,
            offline: true
        };
    }
}

// ========================================
// SHOW PAYMENT SUCCESS
// ========================================

function showPaymentSuccess(transaction) {
    // Update promise section
    document.getElementById('promiseID').textContent = transaction.promiseID;
    document.getElementById('promiseTime').textContent = formatDate(transaction.timestamp);
    document.getElementById('deviceSig').textContent = transaction.deviceSignature;

    const expiryDate = new Date(transaction.expiryTime);
    document.getElementById('promiseExpiry').textContent = expiryDate.toLocaleDateString();

    let decisionText = transaction.emergency ? '🚨 EMERGENCY MODE' : transaction.aiDecision === aiEngine.ALLOW ? '✓ APPROVED' : '⚠️ PENDING';
    document.getElementById('promiseDecision').textContent = decisionText;

    // Show promise section
    document.getElementById('promiseSection').classList.remove('hidden');

    // Calculate reward points (gradual system for new users)
    let points = 5; // Base points for successful transaction
    if (transaction.emergency || transaction.mode === 'emergency') {
        points = 8; // Slightly more for emergency (responsible usage)
    }
    addGamePoints(points);
    const totalPoints = getGamePoints();

    // Update success details with congratulations
    const successDetails = document.getElementById('successDetails');
    successDetails.innerHTML = `
        <div class="success-congratulations">
            <div class="congrats-icon">🎉</div>
            <h2>Congratulations!</h2>
            <p class="congrats-message">Amount Transferred Successfully</p>
        </div>
        <div class="transaction-summary">
            <p>
                <strong>Sender:</strong>
                <span>${transaction.senderName}</span>
            </p>
            <p>
                <strong>Receiver:</strong>
                <span>${transaction.receiverName}</span>
            </p>
            <p>
                <strong>Amount:</strong>
                <span class="amount-highlight">₹${transaction.amount.toFixed(2)}</span>
            </p>
            <p>
                <strong>Promise ID:</strong>
                <span style="font-family: monospace; font-size: 11px;">${transaction.promiseID}</span>
            </p>
            <p>
                <strong>Mode:</strong>
                <span>${transaction.mode.toUpperCase()}${transaction.emergency ? ' 🚨 (EMERGENCY)' : ''}</span>
            </p>
            <p>
                <strong>Status:</strong>
                <span class="status-success">✓ Transaction Complete • Waiting Sync</span>
            </p>
        </div>
        <div class="rewards-earned">
            <div class="points-badge">
                <span class="points-icon">⭐</span>
                <div class="points-info">
                    <p class="points-earned">+${points} Points Earned!</p>
                    <p class="total-points">Total: ${totalPoints} Points</p>
                </div>
            </div>
        </div>
    `;

    // Show success modal with animation
    openModal('successModal');
    showToast(`✓ Amount ₹${transaction.amount.toFixed(2)} transferred to ${transaction.receiverName}! +${points} points!`, 'success');

    // Clear emergency mode after successful payment
    sessionStorage.removeItem('offpay_emergency_mode');
    appState.isEmergencyMode = false;

    // Perform sync after payment completion
    setTimeout(() => {
        performPaymentSync(transaction);
    }, 2000);

    // Reset form
    setTimeout(() => {
        document.getElementById('paymentForm').reset();
        onPaymentFormChange();
    }, 500);
}

// ========================================
// PAYMENT SYNC FUNCTION
// ========================================

function performPaymentSync(transaction) {
    showToast('🔄 Syncing transaction data...', 'info');

    // Simulate sync process
    setTimeout(() => {
        // Update last sync time
        appState.lastSync = new Date().toISOString();

        // Perform trust score recalculation based on transaction
        if (appState.user) {
            // Small trust score boost for successful transaction
            const trustBoost = transaction.mode === 'emergency' ? 3 : 2;
            appState.user.trustScore = Math.min(100, appState.user.trustScore + trustBoost);

            // Update stars based on transaction activity
            appState.user.stars = calculateStarsFromTransactions(appState.user);

            // Save updated user data to both session and local storage
            sessionStorage.setItem('offpay_logged_in_user', JSON.stringify(appState.user));
            const users = JSON.parse(localStorage.getItem('offpay_users') || '{}');
            if (users[appState.user.accountID]) {
                users[appState.user.accountID] = appState.user;
                localStorage.setItem('offpay_users', JSON.stringify(users));
            }
        }

        showToast('✅ Sync complete! Trust score updated.', 'success');

        // Optional: Show sync completion in success modal
        const successDetails = document.getElementById('successDetails');
        if (successDetails) {
            successDetails.innerHTML += `
                <div class="sync-completed" style="margin-top: 15px; padding: 10px; background: #e8f5e8; border-radius: 5px; border-left: 4px solid #4CAF50;">
                    <p style="margin: 0; color: #2e7d32; font-weight: bold;">🔄 Sync Completed</p>
                    <p style="margin: 5px 0 0 0; color: #388e3c; font-size: 14px;">Transaction verified and trust score updated</p>
                </div>
            `;
        }
    }, 2000);
}

// ========================================
// GAME POINTS SYSTEM
// ========================================

function addGamePoints(points) {
    let currentPoints = getGamePoints();
    currentPoints += points;
    localStorage.setItem('checkmates_game_points', currentPoints);
    updatePointsDisplay();
}

function getGamePoints() {
    const points = localStorage.getItem('checkmates_game_points');
    return parseInt(points) || 0;
}

function updatePointsDisplay() {
    const points = getGamePoints();
    // Update all point displays on page
    const displays = document.querySelectorAll('[data-points-display]');
    displays.forEach(el => {
        el.textContent = points;
    });
}

// ========================================
// TRUSTED PEOPLE MANAGEMENT
// ========================================

function loadTrustedPeople() {
    const container = document.getElementById('trustedList');
    if (!container) return;

    if (appState.trustedPeople.length === 0) {
        container.innerHTML = '<p class="empty-message">No trusted people yet. Save after successful payment.</p>';
        return;
    }

    let html = '';
    appState.trustedPeople.forEach((person, idx) => {
        html += `
            <div class="trusted-person">
                <span class="trusted-name">${person.name}</span>
                <button class="remove-trusted" onclick="removeTrustedPerson(${idx})">✕</button>
            </div>
        `;
    });

    container.innerHTML = html;
}

function addTrustedPerson(name) {
    // Check if already exists
    if (appState.trustedPeople.some(p => p.name === name)) {
        return;
    }

    appState.trustedPeople.push({
        name: name,
        addedAt: new Date().toISOString()
    });

    localStorage.setItem(STORAGE_KEYS.TRUSTED, JSON.stringify(appState.trustedPeople));
    loadTrustedPeople();
    showToast(`✓ ${name} added to trusted people`, 'success');
}

function removeTrustedPerson(index) {
    const removed = appState.trustedPeople[index];
    appState.trustedPeople.splice(index, 1);
    localStorage.setItem(STORAGE_KEYS.TRUSTED, JSON.stringify(appState.trustedPeople));
    loadTrustedPeople();
    showToast(`Removed ${removed.name} from trusted people`, 'info');
}

// ========================================
// SPLIT MODE
// ========================================

function toggleSplitMode() {
    const content = document.getElementById('splitModeContent');
    if (content) {
        content.classList.toggle('hidden');
        if (!content.classList.contains('hidden')) {
            addSplitPerson();
        }
    }
}

function addSplitPerson() {
    const container = document.getElementById('splitParticipants');
    if (!container) return;

    const id = 'split-' + Date.now();
    const html = `
        <div class="split-person" id="${id}">
            <input type="text" placeholder="Friend's name" class="split-name">
            <input type="number" placeholder="Amount" min="0" step="0.01" class="split-amount" style="max-width: 100px;">
            <button class="remove-split" onclick="document.getElementById('${id}').remove()">✕</button>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', html);
}

// ========================================
// ALERTS
// ========================================

function showAlert(title, message, buttons = ['Okay']) {
    const modal = document.getElementById('alertModal');
    if (!modal) return;

    document.getElementById('alertTitle').textContent = title;
    document.getElementById('alertMessage').textContent = message;

    const actionsDiv = document.getElementById('alertActions');
    actionsDiv.innerHTML = '';

    buttons.forEach(btn => {
        const button = document.createElement('button');
        button.className = 'btn-secondary btn-large';
        button.textContent = btn;
        button.onclick = closeAlert;
        actionsDiv.appendChild(button);
    });

    openModal('alertModal');
}

// ========================================
// NAVIGATION
// ========================================

function makeAnotherPayment() {
    closeModal('successModal');
    document.getElementById('paymentForm').reset();
    onPaymentFormChange();
}

// ========================================
// PAYMENT CONFIRMATION PANEL
// ========================================

let pendingPaymentData = null;

function showPaymentConfirmation(paymentData) {
    pendingPaymentData = paymentData;

    const detailsDiv = document.getElementById('confirmationDetails');
    detailsDiv.innerHTML = `
        <div class="confirmation-item">
            <strong>From:</strong> ${paymentData.senderName}
        </div>
        <div class="confirmation-item">
            <strong>To:</strong> ${paymentData.receiverName}
        </div>
        <div class="confirmation-item">
            <strong>Amount:</strong> ₹${paymentData.amount.toFixed(2)}
        </div>
        <div class="confirmation-item">
            <strong>Mode:</strong> ${paymentData.isEmergency ? '🚨 Emergency' : 'Standard'}
        </div>
        <div class="confirmation-notice">
            ${paymentData.isEmergency ?
                'Emergency payment will be processed immediately with higher limits.' :
                'Payment promise will be created and synced when online.'}
        </div>
    `;

    const panel = document.getElementById('paymentConfirmationPanel');
    panel.classList.remove('hidden');
    setTimeout(() => panel.classList.add('show'), 10);
}

function hidePaymentConfirmation() {
    const panel = document.getElementById('paymentConfirmationPanel');
    panel.classList.remove('show');
    setTimeout(() => panel.classList.add('hidden'), 300);
    pendingPaymentData = null;
}

function confirmPaymentAction() {
    if (!pendingPaymentData) return;

    hidePaymentConfirmation();

    // Now process the payment with the stored data
    processPaymentWithData(pendingPaymentData);
    pendingPaymentData = null;
}

function cancelPaymentAction() {
    hidePaymentConfirmation();
    showToast('Payment cancelled', 'info');
}

function processPaymentWithData(paymentData) {
    // Get AI decision
    const decision = makeAIDecision(paymentData);

    // Check decision
    if (decision.decision === aiEngine.BLOCK) {
        showAlert(
            'Payment Cannot Be Processed',
            decision.recommendation + '\n\n' + decision.reason.join('\n'),
            ['Okay']
        );
        return;
    }

    // Simulate AI processing
    showToast('🤖 AI analyzing transaction...', 'info');

    simulateAIProcessing(1500).then(() => {
        // Generate promise token
        const transaction = createPromiseToken(paymentData, decision);

        // If emergency mode, send to API first
        if (paymentData.isEmergency || appState.isEmergencyMode) {
            sendEmergencyTransactionToAPI(transaction).then(apiResult => {
                if (apiResult.success) {
                    console.log('✓ Emergency transaction confirmed by API');
                    // Update transaction status with API response
                    transaction.status = 'api_confirmed';
                    transaction.emergencyResponse = apiResult.data;
                } else {
                    console.warn('⚠️ Emergency API unavailable, continuing offline:', apiResult.error);
                    transaction.status = 'offline_pending';
                    transaction.offlineReason = apiResult.error;
                    if (!apiResult.offline) {
                        showToast('⚠️ ' + apiResult.error + ' • Continuing offline', 'warning');
                    }
                }

                // Save transaction
                appState.transactions.push(transaction);
                localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(appState.transactions));

                // Add to trusted if checked
                if (document.getElementById('saveTrusted').checked) {
                    addTrustedPerson(paymentData.receiverName);
                }

                // Show success
                showPaymentSuccess(transaction);
            });
        } else {
            // Normal mode - just save locally
            appState.transactions.push(transaction);
            localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(appState.transactions));

            // Add to trusted if checked
            if (document.getElementById('saveTrusted').checked) {
                addTrustedPerson(paymentData.receiverName);
            }

            // Show success
            showPaymentSuccess(transaction);
        }
    });
}
