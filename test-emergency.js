// ========================================
// EMERGENCY API TEST SCRIPT
// ========================================

// Test data for emergency transaction
const emergencyTestData = {
    promiseID: 'PRO-TEST123-ABC456',
    senderName: 'Demo User',
    receiverName: 'Emergency Recipient',
    amount: 50000,
    accountID: 'ACC001',
    trustScore: 85,
    aiDecision: 'ALLOW'
};

// Function to make POST request using fetch
async function testEmergencyAPI() {
    try {
        console.log('\n🚀 Testing Emergency API Endpoint...\n');
        console.log('Sending POST request to: http://localhost:3000/api/transactions/emergency\n');

        const response = await fetch('http://localhost:3000/api/transactions/emergency', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(emergencyTestData)
        });

        const responseData = await response.json();

        console.log('\n✅ EMERGENCY API TEST RESULTS');
        console.log('================================\n');
        console.log('Status Code:', response.status);
        console.log('\nRequest Data:');
        console.log(JSON.stringify(emergencyTestData, null, 2));
        console.log('\nAPI Response:');
        console.log(JSON.stringify(responseData, null, 2));
        console.log('\n✓ Emergency API is working correctly!\n');
        process.exit(0);
    } catch (error) {
        console.error('❌ ERROR:', error.message);
        console.error('\nMake sure the server is running on http://localhost:3000');
        process.exit(1);
    }
}

// Run test
testEmergencyAPI();
