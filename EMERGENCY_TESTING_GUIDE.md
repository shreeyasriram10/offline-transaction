# 🚀 Emergency Mode - Quick Testing Guide

## ⚡ Start the Server
```bash
cd "c:\Users\Shreeya S\OneDrive\Desktop\offline transaction checkmates 2"
npm install  # (if not already installed)
npm start    # or: node server.js
```

Server will run at: **http://localhost:3000**

---

## 📱 Test Flow - Step by Step

### Step 1: Login
- URL: http://localhost:3000
- Account ID: `ACC001`
- PIN: `1234`
- Click "Sign In"

### Step 2: Activate Emergency Mode (Dashboard)
- Click **🚨 Emergency Mode** button
- Modal pops up with explanation
- Click **"Activate Emergency Mode"** button
- See toast: "🚨 Emergency Mode Active • Higher limits enabled"
- Gets redirected to payment.html

### Step 3: Payment Page (Emergency Pre-Selected)
- You'll see **Emergency Mode** already selected
- Toast shows: "🚨 Emergency Mode Pre-Selected • Higher limits active"
- Payment Mode shows: "🚨 Emergency Mode: Higher limits (up to ₹100k), ⭐ 2x BONUS POINTS!"

### Step 4: Fill Payment Form
```
Sender Name:      Demo User
Receiver Name:    Emergency Recipient
Amount:           ₹50,000
Sender PIN:       1234
Payment Mode:     Emergency (pre-selected)
```

### Step 5: Submit Payment
- Click **"Send Payment"** button
- Wait for AI analysis (1.5 seconds)
- Success page appears with:
  - 🎉 "Amount Transferred Successfully"
  - Transaction details
  - ⭐ **+10,000 Points Earned!** (2x bonus for emergency)
  - Status: "✓ Transaction Complete • Waiting Sync"

---

## 🔍 What Happens Behind the Scenes

### Browser Console (F12 → Console):
```
✓ Emergency transaction sent to API: {
    success: true,
    message: "Emergency transaction initiated...",
    transaction: { ... },
    emergencyStatus: { ... }
}
```

### Server Console:
```
POST /api/transactions/emergency
- Emergency transaction for: Emergency Recipient
- Amount: ₹50,000
- Status: pending_verification
- Emergency: true
✓ Processed successfully
```

---

## ✅ Success Indicators

### Frontend (Payment Page):
✅ Emergency mode pre-selected in dropdown  
✅ Emergency warning toast appears  
✅ "2x BONUS POINTS" mentioned in mode info  
✅ Success page shows 🚨 EMERGENCY MODE indicator  
✅ Points doubled: ₹50,000 / 10 = ₹5,000 base × 2 = **₹10,000 points**  

### Backend (Server):
✅ API endpoint `/api/transactions/emergency` receives POST  
✅ Transaction created with `status: pending_verification`  
✅ `emergency: true` flag set  
✅ User emergency transaction count incremented  
✅ Response includes `emergencyStatus` with bonus points  

### Data:
✅ Transaction saved with mode: "emergency"  
✅ `emergencyActivatedAt` timestamp recorded  
✅ `requiresPostSyncVerification: true` flag set  

---

## 🧪 Advanced Testing

### Test 1: Amount Validation
**Try**: Enter amount ₹150,000 (exceeds ₹100k limit)
**Expected**: Error message "Emergency transaction exceeds limit"

### Test 2: Offline Mode
**Steps**:
1. Start payment in emergency mode
2. Disconnect internet/stop server
3. Submit payment
4. Expected: Continues offline, transaction marked "offline_pending"

### Test 3: Multiple Transactions
**Try**: Submit 3 emergency transactions in a row
**Expected**:
- Each gets unique Promise ID
- Each gets bonus points
- Total points increase: +10,000 each

### Test 4: Normal vs Emergency Points
**Compare**:
- Normal ₹1,000 transfer = +100 points
- Emergency ₹1,000 transfer = +200 points (2x)

---

## 🔧 Testing with API Directly

### Using PowerShell:
```powershell
$body = @{
    promiseID = 'PRO-TEST-' + (Get-Random)
    senderName = 'Demo User'
    receiverName = 'Test User'
    amount = 50000
    accountID = 'ACC001'
    trustScore = 85
    aiDecision = 'ALLOW'
} | ConvertTo-Json

Invoke-WebRequest -Uri 'http://localhost:3000/api/transactions/emergency' `
    -Method POST `
    -ContentType 'application/json' `
    -Body $body | ConvertTo-Json
```

### Expected Response:
```json
{
    "success": true,
    "message": "Emergency transaction initiated...",
    "emergencyStatus": {
        "activated": true,
        "doublePointsAwarded": true,
        "bonusPoints": 10000
    }
}
```

---

## 🐛 Troubleshooting

### Issue: "Unable to connect to the remote server"
**Fix**: Ensure server is running: `npm start`

### Issue: Emergency mode not pre-selected
**Fix**: Make sure you activated it from dashboard first

### Issue: Console shows "isEmergencyMode is undefined"
**Fix**: Restart browser, clear session storage

### Issue: Points not doubled
**Fix**: Check that `emergency: true` is in transaction object

### Issue: API returns "User account not found"
**Fix**: Ensure you're testing with existing account (ACC001)

---

## 📊 Test Results Checklist

- [ ] Server starts without errors
- [ ] Login works with ACC001/1234
- [ ] Emergency button appears on dashboard
- [ ] Emergency modal pops up with explanation
- [ ] Can activate emergency mode
- [ ] Redirects to payment page
- [ ] Emergency mode pre-selected
- [ ] Can fill all form fields
- [ ] Payment submits successfully
- [ ] Success page shows 🎉 congratulations
- [ ] Points are doubled (2x)
- [ ] Promise ID generated
- [ ] Transaction marked with emergency status
- [ ] API logs show the request
- [ ] Server response includes emergencyStatus
- [ ] Can navigate back to dashboard
- [ ] Can submit multiple emergency transactions

---

## 📞 Support

**API Endpoint**: `/api/transactions/emergency`  
**Method**: POST  
**Port**: 3000  
**Status**: ✅ ACTIVE  

For more details, see: **EMERGENCY_API_IMPLEMENTATION.md**

