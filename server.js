// ========================================
// OFFPAY AI - Backend Server (Node.js + Express)
// ========================================

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ========================================
// MIDDLEWARE
// ========================================

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname)));

// ========================================
// IN-MEMORY DATA STORAGE (for demo)
// ========================================

const mockDatabase = {
    users: {
        'ACC001': {
            name: 'Demo User',
            accountID: 'ACC001',
            pin: '1234',
            createdAt: new Date().toISOString(),
            trustScore: 85,
            totalTransactions: 5,
            fraudCount: 0,
            deviceHistory: ['DEV-001']
        }
    },
    transactions: [
        {
            promiseID: 'PRO-1S2K3J-ABC123',
            senderName: 'Demo User',
            receiverName: 'Friend 1',
            amount: 500,
            status: 'synced',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            trustScore: 85,
            zone: 'green'
        },
        {
            promiseID: 'PRO-2S3K4J-ABC456',
            senderName: 'Demo User',
            receiverName: 'Friend 2',
            amount: 1200,
            status: 'pending',
            timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            trustScore: 80,
            zone: 'green'
        }
    ],
    trustedPeople: {}
};

// ========================================
// ROUTES - AUTHENTICATION
// ========================================

app.post('/api/auth/register', (req, res) => {
    const { name, accountID, pin } = req.body;

    // Validation
    if (!name || !accountID || !pin) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    if (mockDatabase.users[accountID]) {
        return res.status(400).json({ error: 'Account ID already exists' });
    }

    // Create user
    mockDatabase.users[accountID] = {
        name,
        accountID,
        pin,
        createdAt: new Date().toISOString(),
        trustScore: 75,
        totalTransactions: 0,
        fraudCount: 0,
        deviceHistory: []
    };

    res.json({
        success: true,
        message: 'Account created successfully',
        user: {
            name,
            accountID,
            trustScore: 75
        }
    });
});

app.post('/api/auth/login', (req, res) => {
    const { accountID, pin } = req.body;

    // Validation
    if (!accountID || !pin) {
        return res.status(400).json({ error: 'Missing credentials' });
    }

    const user = mockDatabase.users[accountID];
    if (!user) {
        return res.status(401).json({ error: 'Account not found' });
    }

    if (user.pin !== pin) {
        return res.status(401).json({ error: 'Invalid PIN' });
    }

    res.json({
        success: true,
        message: 'Login successful',
        user: {
            name: user.name,
            accountID: user.accountID,
            trustScore: user.trustScore,
            totalTransactions: user.totalTransactions
        }
    });
});

// ========================================
// ROUTES - TRANSACTIONS
// ========================================

app.get('/api/transactions/:accountID', (req, res) => {
    const { accountID } = req.params;

    // Get user's transactions
    const userTransactions = mockDatabase.transactions.filter(
        t => t.senderName === mockDatabase.users[accountID]?.name
    );

    res.json({
        success: true,
        transactions: userTransactions
    });
});

app.post('/api/transactions/create', (req, res) => {
    const { promiseID, senderName, receiverName, amount, mode, trustScore, aiDecision } = req.body;

    // Validation
    if (!promiseID || !senderName || !receiverName || !amount) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const transaction = {
        promiseID,
        senderName,
        receiverName,
        amount: parseFloat(amount),
        mode,
        status: 'pending',
        timestamp: new Date().toISOString(),
        trustScore: parseInt(trustScore) || 75,
        zone: trustScore >= 70 ? 'green' : trustScore >= 40 ? 'yellow' : 'red',
        aiDecision: aiDecision || 'ALLOW'
    };

    mockDatabase.transactions.push(transaction);

    res.json({
        success: true,
        message: 'Transaction created',
        transaction
    });
});

app.post('/api/transactions/emergency', (req, res) => {
    const { promiseID, senderName, receiverName, amount, accountID, trustScore, aiDecision } = req.body;

    // Validation
    if (!promiseID || !senderName || !receiverName || !amount || !accountID) {
        return res.status(400).json({ error: 'Missing required fields for emergency transaction' });
    }

    const user = mockDatabase.users[accountID];
    if (!user) {
        return res.status(404).json({ error: 'User account not found' });
    }

    // Emergency transactions have higher limits - validate against emergency limits
    const emergencyLimit = 100000; // 100k for emergency
    if (amount > emergencyLimit) {
        return res.status(400).json({ 
            error: 'Emergency transaction exceeds limit',
            limit: emergencyLimit,
            requested: amount
        });
    }

    // Create emergency transaction
    const transaction = {
        promiseID,
        senderName,
        receiverName,
        amount: parseFloat(amount),
        mode: 'emergency',
        status: 'pending_verification',
        timestamp: new Date().toISOString(),
        trustScore: parseInt(trustScore) || 75,
        zone: trustScore >= 70 ? 'green' : trustScore >= 40 ? 'yellow' : 'red',
        aiDecision: aiDecision || 'ALLOW',
        emergency: true,
        emergencyActivatedAt: new Date().toISOString(),
        requiresPostSyncVerification: true,
        retryCount: 0
    };

    mockDatabase.transactions.push(transaction);

    // Update user's emergency transaction count
    if (!user.emergencyTransactions) {
        user.emergencyTransactions = 0;
    }
    user.emergencyTransactions += 1;

    // Send emergency alert response
    res.json({
        success: true,
        message: 'Emergency transaction initiated - Waiting for post-sync bank verification',
        transaction,
        emergencyStatus: {
            activated: true,
            requiresVerification: true,
            bankVerificationNeeded: true,
            doublePointsAwarded: true,
            bonusPoints: Math.floor(amount / 10) * 2
        }
    });
});

app.post('/api/transactions/sync', (req, res) => {
    const { accountID } = req.body;

    // Simulate sync process
    const user = mockDatabase.users[accountID];
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    // Mark pending transactions as synced
    mockDatabase.transactions.forEach(txn => {
        if (txn.senderName === user.name && txn.status === 'pending') {
            txn.status = 'synced';
            txn.syncedAt = new Date().toISOString();
        }
    });

    // Update trust score
    user.trustScore = Math.min(100, user.trustScore + 5);
    user.totalTransactions = mockDatabase.transactions.filter(
        t => t.senderName === user.name && t.status === 'synced'
    ).length;

    res.json({
        success: true,
        message: 'Sync completed',
        trustScore: user.trustScore,
        totalSynced: user.totalTransactions
    });
});

// ========================================
// ROUTES - TRUST & AI ANALYSIS
// ========================================

app.post('/api/analysis/trust', (req, res) => {
    const { amount, accountID, frequency } = req.body;

    const user = mockDatabase.users[accountID];
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    // Calculate risk
    let risk = 'LOW';
    if (user.trustScore < 70) risk = 'MEDIUM';
    if (user.trustScore < 40) risk = 'HIGH';

    res.json({
        success: true,
        trustScore: user.trustScore,
        risk,
        recommendation: risk === 'LOW' ? 'Approved' : 'Review required'
    });
});

app.post('/api/analysis/ai-decision', (req, res) => {
    const { amount, senderName, receiverName, accountID } = req.body;

    const user = mockDatabase.users[accountID];
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    // Mock AI decision
    let decision = 'ALLOW';
    let confidence = 95;
    const riskFactors = [];

    // Simulate different decisions based on amount
    if (amount > user.trustScore * 1000) {
        decision = 'BLOCK';
        confidence = 85;
        riskFactors.push('Amount exceeds safe limit');
    } else if (amount > user.trustScore * 500) {
        decision = 'REQUIRE_CONFIRMATION';
        confidence = 75;
        riskFactors.push('Large transaction detected');
    }

    res.json({
        success: true,
        decision,
        confidence,
        trustScore: user.trustScore,
        riskFactors,
        recommendation: decision === 'ALLOW' 
            ? 'Transaction approved' 
            : 'Review transaction details'
    });
});

// ========================================
// ROUTES - STATS
// ========================================

app.get('/api/stats/:accountID', (req, res) => {
    const { accountID } = req.body;

    const user = mockDatabase.users[accountID];
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const userTransactions = mockDatabase.transactions.filter(
        t => t.senderName === user.name
    );

    res.json({
        success: true,
        totalTransactions: userTransactions.length,
        totalAmount: userTransactions.reduce((sum, t) => sum + t.amount, 0),
        syncedCount: userTransactions.filter(t => t.status === 'synced').length,
        pendingCount: userTransactions.filter(t => t.status === 'pending').length,
        trustScore: user.trustScore,
        fraudCount: user.fraudCount
    });
});

// ========================================
// SERVE HTML FILES
// ========================================

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.get('/payment', (req, res) => {
    res.sendFile(path.join(__dirname, 'payment.html'));
});

app.get('/history', (req, res) => {
    res.sendFile(path.join(__dirname, 'history.html'));
});

// ========================================
// ERROR HANDLING
// ========================================

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});

app.use((req, res) => {
    res.status(404).json({
        error: 'Not found',
        path: req.path
    });
});

// ========================================
// START SERVER
// ========================================

app.listen(PORT, () => {
    console.log(`
    ╔══════════════════════════════════════╗
    ║      CHECKMATES OFFLINE - Server Started      ║
    ╚══════════════════════════════════════╝
    
    🚀 Server running at: http://localhost:${PORT}
    
    📱 Access the app at:
       - Login: http://localhost:${PORT}
       - Dashboard: http://localhost:${PORT}/dashboard
       - Payment: http://localhost:${PORT}/payment
       - History: http://localhost:${PORT}/history
    
    Demo Credentials:
       Account ID: ACC001
       PIN: 1234
    
    ✓ Offline Mode Active
    🔐 All transactions are secured
    
    `);
});

// ========================================
// MOCK API FOR FUTURE EXPANSION
// ========================================

// This server can be expanded with:
// - Real database integration (PostgreSQL, MongoDB)
// - Bank API integration for final settlement
// - SMS/Email notifications
// - Blockchain for immutable transaction records
// - Advanced fraud detection ML models
// - Real location-based trust adjustment
// - Peer witness confirmation system
