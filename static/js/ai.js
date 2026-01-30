// ========================================
// CHECKMATES OFFLINE - AI Panel (Baseline Version)
// ========================================

// ========================================
// CHECKMATES OFFLINE - AI Panel (Enhanced Version)
// ========================================

// Dynamic messages for AI panel based on user data
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