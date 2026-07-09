// ========================================
// CHECKMATES OFFLINE - AI Panel (Baseline Version)
// ========================================

// ========================================
// CHECKMATES OFFLINE - AI Panel (Enhanced Version)
// ========================================

// Dynamic messages for AI panel based on user data
let currentMessageIndex = 0;

const aiEngine = {
    ALLOW: 'allow',
    WARN: 'warn',
    BLOCK: 'block'
};

function makeAIDecision(paymentData) {
    const trustScore = appState.user ? appState.user.trustScore : 35;
    const riskFactors = [];
    const positiveFactors = [];
    let decision = aiEngine.ALLOW;
    let recommendation = 'Payment looks safe to process';
    let confidence = 85;
    let zone = 'green';
    let requiresConfirmation = false;

    if (!paymentData.senderName || !paymentData.receiverName || !paymentData.amount) {
        return {
            decision: aiEngine.WARN,
            trustScore,
            zone: 'neutral',
            riskFactors: [],
            positiveFactors: [],
            recommendation: 'Enter payment details to analyze',
            confidence: 0,
            requiresConfirmation: false,
            reason: []
        };
    }

    if (paymentData.amount >= 10000) {
        riskFactors.push('Large transaction amount');
        confidence -= 15;
        zone = 'yellow';
        requiresConfirmation = true;
    }

    if (paymentData.amount >= 50000) {
        decision = aiEngine.WARN;
        riskFactors.push('Very high value transfer');
        confidence -= 20;
    }

    if (paymentData.isEmergency) {
        positiveFactors.push('Emergency mode requested');
        confidence -= 5;
        requiresConfirmation = true;
    }

    if (paymentData.pin && paymentData.pin.length >= 4 && paymentData.pin.length <= 6) {
        positiveFactors.push('PIN format valid');
        confidence += 5;
    } else if (paymentData.pin) {
        decision = aiEngine.BLOCK;
        riskFactors.push('Invalid PIN format');
        recommendation = 'PIN must be 4-6 digits';
        confidence = 20;
        zone = 'red';
    }

    if (trustScore < 50 && paymentData.amount > 5000) {
        decision = aiEngine.BLOCK;
        riskFactors.push('Low trust score for large transfer');
        recommendation = 'Trust score is too low for this amount';
        confidence = 35;
        zone = 'red';
    }

    if (trustScore >= 85) {
        positiveFactors.push('High trust user');
        confidence += 5;
    }

    confidence = Math.max(0, Math.min(99, confidence));

    return {
        decision,
        trustScore,
        zone,
        riskFactors,
        positiveFactors,
        recommendation,
        confidence,
        requiresConfirmation,
        reason: riskFactors
    };
}

function renderAIDecisionPanel(decision) {
    const aiDecisionContent = document.getElementById('aiDecisionContent');
    if (!aiDecisionContent) {
        return;
    }

    const decisionLabel = decision.decision === aiEngine.BLOCK
        ? 'Blocked'
        : decision.decision === aiEngine.WARN
            ? 'Review'
            : 'Approved';

    const decisionClass = decision.decision === aiEngine.BLOCK
        ? 'blocked'
        : decision.decision === aiEngine.WARN
            ? 'warning'
            : 'approved';

    const riskList = decision.riskFactors.length > 0
        ? `<ul class="ai-risk-list">${decision.riskFactors.map(item => `<li>${item}</li>`).join('')}</ul>`
        : '<p class="ai-positive">No major risk factors detected.</p>';

    const positiveList = decision.positiveFactors.length > 0
        ? `<ul class="ai-positive-list">${decision.positiveFactors.map(item => `<li>${item}</li>`).join('')}</ul>`
        : '';

    aiDecisionContent.innerHTML = `
        <div class="ai-decision-card ${decisionClass}">
            <div class="ai-decision-header">
                <span class="ai-decision-label">${decisionLabel}</span>
                <span class="ai-confidence">${decision.confidence}% confidence</span>
            </div>
            <p class="ai-recommendation">${decision.recommendation}</p>
            <div class="ai-decision-meta">
                <div><strong>Trust Score:</strong> ${decision.trustScore}/100</div>
                <div><strong>Zone:</strong> ${decision.zone}</div>
            </div>
            <div class="ai-factors">
                <div class="ai-factor-group">
                    <strong>Risk Factors</strong>
                    ${riskList}
                </div>
                ${positiveList ? `<div class="ai-factor-group"><strong>Positive Factors</strong>${positiveList}</div>` : ''}
            </div>
            ${decision.requiresConfirmation ? '<p class="ai-warning">Manual confirmation recommended.</p>' : ''}
        </div>
    `;
}

function simulateAIProcessing(duration = 1000) {
    return new Promise(resolve => {
        setTimeout(resolve, duration);
    });
}

function getAIMessages() {
    const user = appState.user;
    const messages = [];

    // Base system messages
    messages.push('🔍 AI Monitor Active');
    messages.push('🔒 Offline Security Mode');

    // User-specific messages
    if (user) {
        messages.push(`📊 Trust Score: ${user.trustScore}/100`);
        messages.push(`⭐ Stars Earned: ${user.stars || 0}`);
        messages.push(`💳 Transactions: ${appState.transactions.length}`);
    } else {
        messages.push('👤 User data loading...');
        messages.push('⏳ Initializing...');
    }

    // System status messages
    messages.push('🌐 Network monitoring active');
    messages.push('🛡️ Fraud detection enabled');
    messages.push('🚨 Emergency mode ready');
    messages.push('📡 Sync available when online');

    return messages;
}

// Update AI status with dynamic messages
function updateAIStatus() {
    const aiContainer = document.getElementById('aiMessagesContainer');

    if (aiContainer) {
        const messageElements = aiContainer.querySelectorAll('.ai-message');
        const messages = getAIMessages();

        messageElements.forEach((el, idx) => {
            const messageIndex = (currentMessageIndex + idx) % messages.length;
            el.textContent = messages[messageIndex];
        });

        currentMessageIndex = (currentMessageIndex + 1) % messages.length;
    }
}

// Start updating AI messages
document.addEventListener('DOMContentLoaded', function() {
    if (document.location.pathname.includes('dashboard')) {
        updateAIStatus();
        setInterval(updateAIStatus, 3000); // Update every 3 seconds
    }
});

if (typeof window !== 'undefined') {
    window.aiEngine = aiEngine;
    window.makeAIDecision = makeAIDecision;
    window.renderAIDecisionPanel = renderAIDecisionPanel;
    window.simulateAIProcessing = simulateAIProcessing;
}