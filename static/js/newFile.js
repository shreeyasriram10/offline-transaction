const { initializeApp, setupEventListeners, checkIfLoggedIn, initializeOnlineStatus } = require("./app");

// ========================================
// INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', function () {
    initializeApp();
    setupEventListeners();
    checkIfLoggedIn();
    initializeOnlineStatus();
});
