// ========================================
// HISTORY PAGE - JavaScript
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

    initializeHistoryPage();
});

function initializeHistoryPage() {
    // Reload transactions from localStorage to ensure sync
    const savedTransactions = localStorage.getItem('offpay_transactions');
    if (savedTransactions) {
        try {
            appState.transactions = JSON.parse(savedTransactions);
        } catch(e) {
            console.error('Error loading transactions from localStorage:', e);
        }
    }

    loadTransactions();
    updateStats();
    checkForAlerts();

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
                loadTransactions(); // Refresh the full transaction history
                updateStats(); // Update statistics as well
            } catch(e) {
                console.error('Error reloading transactions on visibility change:', e);
            }
        }
    }
});

// ========================================
// LOAD AND DISPLAY TRANSACTIONS
// ========================================

function loadTransactions() {
    const container = document.getElementById('transactionsList');
    if (!container) return;

    if (appState.transactions.length === 0) {
        container.innerHTML = `
            <div class="empty-message">
                <p>📭 No transactions yet</p>
                <button class="btn-secondary btn-small" onclick="goToPayment()">Make First Payment</button>
            </div>
        `;
        return;
    }

    const filtered = filterTransactions(appState.transactions);
    renderTransactionsList(container, filtered);
}

function renderTransactionsList(container, transactions) {
    let html = '';

    transactions.forEach(txn => {
        const zone = getTrustZone(txn.trustScore);
        const statusColor = txn.status === 'synced' ? 'synced' : txn.status === 'expired' ? 'expired' : 'pending';

        html += `
            <div class="transaction-item ${zone.color}" onclick="viewReceipt('${txn.promiseID}')">
                <div class="transaction-main">
                    <div class="transaction-promise-id">${txn.promiseID}</div>
                    <div class="transaction-people">
                        ${txn.senderName} → ${txn.receiverName}
                    </div>
                </div>
                <span class="transaction-status-badge status-${statusColor}">
                    ${txn.status.toUpperCase()}
                </span>
                <div class="transaction-amount">₹${txn.amount.toFixed(2)}</div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// ========================================
// FILTER TRANSACTIONS
// ========================================

function applyFilters() {
    loadTransactions();
}

function filterTransactions(transactions) {
    const status = document.getElementById('filterStatus').value;
    const zone = document.getElementById('filterZone').value;
    const search = document.getElementById('searchTransaction').value.toLowerCase();

    return transactions.filter(txn => {
        let match = true;

        if (status && txn.status !== status) {
            match = false;
        }

        if (zone) {
            const txnZone = getTrustZone(txn.trustScore).color;
            if (txnZone !== zone) {
                match = false;
            }
        }

        if (search) {
            const searchMatch = 
                txn.promiseID.toLowerCase().includes(search) ||
                txn.senderName.toLowerCase().includes(search) ||
                txn.receiverName.toLowerCase().includes(search);
            if (!searchMatch) {
                match = false;
            }
        }

        return match;
    });
}

// ========================================
// VIEW RECEIPT
// ========================================

function viewReceipt(promiseID) {
    const txn = appState.transactions.find(t => t.promiseID === promiseID);
    if (!txn) return;

    const receiptContent = document.getElementById('receiptContent');
    if (!receiptContent) return;

    const zone = getTrustZone(txn.trustScore);

    const receiptHTML = `
        <div class="receipt-line">
            <span class="receipt-label">Promise ID</span>
            <span class="receipt-value" style="font-family: monospace; font-size: 11px;">${txn.promiseID}</span>
        </div>
        <div class="receipt-line">
            <span class="receipt-label">Date & Time</span>
            <span class="receipt-value">${formatDate(txn.timestamp)}</span>
        </div>
        <div class="receipt-line">
            <span class="receipt-label">Sender</span>
            <span class="receipt-value">${txn.senderName}</span>
        </div>
        <div class="receipt-line">
            <span class="receipt-label">Receiver</span>
            <span class="receipt-value">${txn.receiverName}</span>
        </div>
        <div class="receipt-line">
            <span class="receipt-label">Amount</span>
            <span class="receipt-value">₹${txn.amount.toFixed(2)}</span>
        </div>
        <div class="receipt-line">
            <span class="receipt-label">Mode</span>
            <span class="receipt-value">${txn.mode.toUpperCase()}${txn.emergency ? ' (EMERGENCY)' : ''}</span>
        </div>
        <div class="receipt-line">
            <span class="receipt-label">Status</span>
            <span class="receipt-value" style="color: ${txn.status === 'synced' ? '#22C55E' : '#FACC15'};">
                ${txn.status.toUpperCase()}
            </span>
        </div>
        <div class="receipt-line">
            <span class="receipt-label">Zone</span>
            <span class="receipt-value" style="color: ${zone.color === 'green' ? '#22C55E' : zone.color === 'yellow' ? '#FACC15' : '#EF4444'};">
                ${zone.label}
            </span>
        </div>
        <div class="receipt-line">
            <span class="receipt-label">Trust Score</span>
            <span class="receipt-value">${txn.trustScore}/100</span>
        </div>
        <div class="receipt-line">
            <span class="receipt-label">AI Decision</span>
            <span class="receipt-value">${txn.aiDecision}</span>
        </div>
        <div class="receipt-line">
            <span class="receipt-label">AI Confidence</span>
            <span class="receipt-value">${txn.aiConfidence}%</span>
        </div>
        <div class="receipt-line">
            <span class="receipt-label">Device Signature</span>
            <span class="receipt-value" style="font-family: monospace; font-size: 10px; word-break: break-all;">${txn.deviceSignature}</span>
        </div>
        <div class="receipt-line">
            <span class="receipt-label">Expires</span>
            <span class="receipt-value">${new Date(txn.expiryTime).toLocaleDateString()}</span>
        </div>
    `;

    receiptContent.innerHTML = receiptHTML;
    openModal('receiptModal');
}

// ========================================
// PRINT & DOWNLOAD
// ========================================

function printReceipt() {
    window.print();
}

function downloadReceipt() {
    const receiptContent = document.getElementById('receiptContent').innerText;
    const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(receiptContent);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "receipt-" + Date.now() + ".txt");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Receipt downloaded', 'success');
}

// ========================================
// SYNC WITH BANK
// ========================================

function startSync() {
    const syncButton = document.getElementById('syncButton');
    const syncProgress = document.querySelector('.sync-progress');

    if (!syncButton || !syncProgress) return;

    // Set active state
    syncButton.disabled = true;
    syncButton.classList.add('sync-active');
    syncButton.classList.remove('sync-completed', 'sync-inactive');
    syncButton.innerHTML = '<span class="sync-spinner"></span> Syncing...';

    syncProgress.classList.remove('hidden');

    showToast('Connecting to bank server...', 'info');

    // Simulate sync steps
    let step = 0;
    const syncInterval = setInterval(() => {
        step++;

        if (step === 1) {
            updateSyncMessage('Validating promises…', 1);
            syncButton.innerHTML = '<span class="sync-spinner"></span> Validating...';
        } else if (step === 2) {
            updateSyncMessage('No fraud detected', 2);
            syncButton.innerHTML = '<span class="sync-spinner"></span> Checking...';
        } else if (step === 3) {
            updateSyncMessage('Trust score updated', 3);
            syncButton.innerHTML = '<span class="sync-spinner"></span> Updating...';
        } else if (step === 4) {
            clearInterval(syncInterval);
            completeSyncProcess(syncButton, syncProgress);
        }
    }, 1200);
}

function updateSyncMessage(message, step) {
    const stepElement = document.getElementById('syncStep' + step);
    if (stepElement) {
        stepElement.textContent = message;
    }
}

function completeSyncProcess(syncButton, syncProgress) {
    // Update pending transactions to synced
    appState.transactions.forEach(txn => {
        if (txn.status === 'pending') {
            txn.status = 'synced';
            txn.syncedAt = new Date().toISOString();
        }
    });

    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(appState.transactions));

    // Update trust score
    updateTrustAfterSync();

    // Award points for successful sync
    addGamePoints(10);

    // Hide sync progress
    syncProgress.classList.add('hidden');

    // Reload transactions
    loadTransactions();
    updateStats();
    checkForAlerts();

    // Set completed state
    syncButton.classList.remove('sync-active');
    syncButton.classList.add('sync-completed');
    syncButton.innerHTML = '<span class="sync-check">✓</span> Synced!';

    // Show success
    showToast('✓ Sync complete! All promises verified and settled.', 'success');

    // Reset to inactive state after delay
    setTimeout(() => {
        syncButton.disabled = false;
        syncButton.classList.remove('sync-completed');
        syncButton.classList.add('sync-inactive');
        syncButton.textContent = 'Start Sync Now';
    }, 3000);
}

// ========================================
// STATISTICS
// ========================================

function updateStats() {
    const totalTxns = appState.transactions.length;
    const totalAmount = appState.transactions.reduce((sum, t) => sum + t.amount, 0);
    const syncedCount = appState.transactions.filter(t => t.status === 'synced').length;
    const pendingCount = appState.transactions.filter(t => t.status === 'pending').length;

    const elements = {
        totalTransactions: document.getElementById('totalTransactions'),
        totalAmount: document.getElementById('totalAmount'),
        syncedCount: document.getElementById('syncedCount'),
        pendingCount: document.getElementById('pendingCount')
    };

    if (elements.totalTransactions) elements.totalTransactions.textContent = totalTxns;
    if (elements.totalAmount) elements.totalAmount.textContent = '₹' + totalAmount.toFixed(2);
    if (elements.syncedCount) elements.syncedCount.textContent = syncedCount;
    if (elements.pendingCount) elements.pendingCount.textContent = pendingCount;
}

// ========================================
// ALERTS
// ========================================

function checkForAlerts() {
    const alerts = checkSuspiciousPatterns();
    const alertsSection = document.getElementById('alertsSection');
    const alertsList = document.getElementById('alertsList');

    if (!alertsList) return;

    if (alerts.length === 0) {
        if (alertsSection) alertsSection.classList.add('hidden');
        return;
    }

    if (alertsSection) alertsSection.classList.remove('hidden');

    let html = '';
    alerts.forEach(alert => {
        html += `
            <div class="alert-item alert-${alert.type}">
                ${alert.message}
            </div>
        `;
    });

    alertsList.innerHTML = html;
}

// ========================================
// CHECK TRANSACTION EXPIRY
// ========================================

function checkTransactionExpiry() {
    const now = new Date();

    appState.transactions.forEach(txn => {
        if (txn.status === 'pending' && new Date(txn.expiryTime) < now) {
            txn.status = 'expired';
        }
    });

    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(appState.transactions));
    loadTransactions();
}

// Run expiry check periodically
setInterval(checkTransactionExpiry, 60000); // Every minute
