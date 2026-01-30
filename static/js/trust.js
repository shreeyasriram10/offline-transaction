// ========================================
// CHECKMATES OFFLINE - Trust Score System (Baseline Version)
// ========================================

// Fixed baseline trust score
function calculateTrustScore() {
    return 40;
}

// Fixed baseline stars
function getStars() {
    return 0;
}

// Export for use in other scripts
window.calculateTrustScore = calculateTrustScore;
window.getStars = getStars;
