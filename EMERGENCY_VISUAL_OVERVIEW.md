# 🚨 Emergency Mode API - Visual Overview

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     BROWSER / FRONTEND                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┐         ┌──────────────┐                   │
│  │ Dashboard   │         │ Payment Page │                   │
│  │             │         │              │                   │
│  │ 🚨 Emergency│────────▶│ Emergency    │                   │
│  │ Mode Button │         │ Pre-Selected │                   │
│  └─────────────┘         └──────────────┘                   │
│                                │                             │
│                    submitPayment() with                      │
│                    emergency: true flag                      │
│                                │                             │
│                                ▼                             │
│  ┌─────────────────────────────────────┐                    │
│  │ sendEmergencyTransactionToAPI()      │ ◀── NEW          │
│  │ - Create request payload             │                   │
│  │ - fetch() POST to API                │                   │
│  │ - Handle response                    │                   │
│  │ - Offline fallback                   │                   │
│  └─────────────────────────────────────┘                    │
│                    │                                         │
└────────────────────┼─────────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │ POST /api/transactions│
         │ /emergency            │
         │                       │
         ▼                       ▼
    ┌─────────────────────────────────┐
    │    SERVER / BACKEND (Node.js)    │
    ├─────────────────────────────────┤
    │                                  │
    │ ┌───────────────────────────────┐│
    │ │ Express App (port 3000)       ││
    │ └───────────────────────────────┘│
    │            │                     │
    │            ▼                     │
    │ ┌───────────────────────────────┐│
    │ │ POST /api/transactions/       ││ ◀── NEW
    │ │ emergency                     ││
    │ │                               ││
    │ │ 1. Validate request           ││
    │ │ 2. Check user exists          ││
    │ │ 3. Validate amount ≤ ₹100k    ││
    │ │ 4. Create transaction         ││
    │ │ 5. Set status: pending_       ││
    │ │    verification               ││
    │ │ 6. Calculate bonus points     ││
    │ │ 7. Save to database           ││
    │ │ 8. Return response            ││
    │ └───────────────────────────────┘│
    │            │                     │
    │            ▼                     │
    │ ┌───────────────────────────────┐│
    │ │ mockDatabase                  ││
    │ │ .transactions                 ││
    │ │                               ││
    │ │ [Emergency Transaction Record]││
    │ └───────────────────────────────┘│
    │                                  │
    └─────────────────────────────────┘
         │
         │ Response: {
         │   success: true,
         │   emergencyStatus: {
         │     activated: true,
         │     bonusPoints: 10000
         │   }
         │ }
         │
         ▼
    ┌─────────────────────────────────┐
    │         BROWSER / FRONTEND        │
    │                                   │
    │ ┌─────────────────────────────┐  │
    │ │ Success Page                │  │
    │ │                             │  │
    │ │ 🎉 Congratulations!        │  │
    │ │                             │  │
    │ │ Amount: ₹50,000            │  │
    │ │ 🚨 Emergency Mode          │  │
    │ │ ⭐ +10,000 Points (2x)     │  │
    │ │                             │  │
    │ │ Promise ID: [Generated]    │  │
    │ │ Status: Waiting Sync       │  │
    │ └─────────────────────────────┘  │
    │                                   │
    └─────────────────────────────────┘
```

---

## Data Flow Sequence

```
STEP 1: User Activation
┌──────────────────────────┐
│ User clicks 🚨 Emergency  │
│ Mode button              │
└─────────────┬────────────┘
              │
              ▼
        ┌──────────────┐
        │ Modal shows  │
        │ explanation  │
        └─────┬────────┘
              │
              ▼
       ┌─────────────────┐
       │ User confirms   │
       │ activation      │
       └────────┬────────┘
                │
                ▼
         ┌────────────────────────┐
         │ appState.isEmergency   │
         │ Mode = true            │
         └────────┬───────────────┘
                  │
                  ▼
           ┌─────────────────┐
           │ Redirect to     │
           │ payment.html    │
           └─────────────────┘


STEP 2: Payment Page Initialization
┌──────────────────────────┐
│ Payment page loads       │
└─────────────┬────────────┘
              │
              ▼
    ┌─────────────────────────┐
    │ Check appState.         │
    │ isEmergencyMode         │
    └────────┬────────────────┘
             │
             ▼
      ┌──────────────────────┐
      │ Pre-select           │
      │ Emergency Mode in    │
      │ dropdown             │
      └────────┬─────────────┘
               │
               ▼
        ┌─────────────────────────┐
        │ Update mode info:       │
        │ "⭐ 2x BONUS POINTS!"  │
        └────────┬────────────────┘
                 │
                 ▼
           ┌──────────────┐
           │ Show toast:  │
           │ "Emergency   │
           │ Mode Pre-    │
           │ Selected"    │
           └──────────────┘


STEP 3: Payment Submission
┌──────────────────────────┐
│ User fills form:         │
│ - Sender Name            │
│ - Receiver Name          │
│ - Amount: ₹50,000       │
│ - PIN                    │
└─────────────┬────────────┘
              │
              ▼
       ┌─────────────────┐
       │ User clicks     │
       │ "Send Payment"  │
       └────────┬────────┘
                │
                ▼
    ┌──────────────────────────┐
    │ processPayment()          │
    │ validates form            │
    └────────┬─────────────────┘
             │
             ▼
    ┌──────────────────────────┐
    │ createPromiseToken()      │
    │ generates transaction     │
    │ sets emergency: true      │
    └────────┬─────────────────┘
             │
             ▼
    ┌──────────────────────────────┐
    │ Check: isEmergency?          │
    │ YES! Call API                │
    └────────┬─────────────────────┘
             │
             ▼
    ┌──────────────────────────────┐
    │ sendEmergencyTransactionToAPI│
    │ (transaction)                │
    └────────┬─────────────────────┘
             │
             ▼
    ┌──────────────────────────────┐
    │ fetch('http://localhost:     │
    │ 3000/api/transactions/       │
    │ emergency', {                │
    │   method: 'POST',            │
    │   body: JSON.stringify({     │
    │     promiseID,               │
    │     senderName,              │
    │     receiverName,            │
    │     amount: 50000,           │
    │     accountID: 'ACC001'      │
    │   })                         │
    │ })                           │
    └────────┬─────────────────────┘
             │
             ▼
        ┌─────────────────┐
        │  API ENDPOINT   │
        │ Processes...    │
        └─────────────────┘


STEP 4: API Processing
┌──────────────────────────────┐
│ /api/transactions/emergency  │
│ endpoint receives POST       │
└─────────────┬────────────────┘
              │
              ▼
    ┌─────────────────────────┐
    │ Validate:               │
    │ ✓ promiseID exists      │
    │ ✓ Amount ≤ ₹100k       │
    │ ✓ User exists (ACC001)  │
    └────────┬────────────────┘
             │
             ▼
   ┌──────────────────────────┐
   │ Create transaction:      │
   │ - mode: "emergency"      │
   │ - status:                │
   │   pending_verification   │
   │ - emergency: true        │
   │ - timestamp: now         │
   └────────┬─────────────────┘
            │
            ▼
   ┌──────────────────────────┐
   │ Save to database:        │
   │ mockDatabase.            │
   │ transactions.push()      │
   └────────┬─────────────────┘
            │
            ▼
   ┌──────────────────────────┐
   │ Calculate bonus:         │
   │ Points = 50000/10 * 2    │
   │ = 10,000 points          │
   └────────┬─────────────────┘
            │
            ▼
   ┌──────────────────────────┐
   │ Return response:         │
   │ {                        │
   │   success: true,         │
   │   emergencyStatus: {     │
   │     activated: true,     │
   │     bonusPoints: 10000   │
   │   }                      │
   │ }                        │
   └────────┬─────────────────┘
            │
            ▼


STEP 5: Frontend Response Handling
┌───────────────────────────┐
│ Receive API response:     │
│ success: true             │
│ bonusPoints: 10,000      │
└─────────────┬─────────────┘
              │
              ▼
    ┌─────────────────────────┐
    │ Update transaction:      │
    │ status: "api_confirmed"  │
    └────────┬────────────────┘
             │
             ▼
    ┌─────────────────────────┐
    │ Save to localStorage:   │
    │ appState.transactions   │
    │ .push(transaction)      │
    └────────┬────────────────┘
             │
             ▼
    ┌─────────────────────────┐
    │ Calculate points:       │
    │ 50000 / 10 * 2 =        │
    │ 10,000 points           │
    └────────┬────────────────┘
             │
             ▼
    ┌─────────────────────────┐
    │ Add to game points:     │
    │ addGamePoints(10000)    │
    └────────┬────────────────┘
             │
             ▼
    ┌─────────────────────────┐
    │ Show success page:      │
    │ openModal('success')    │
    └────────┬────────────────┘
             │
             ▼


STEP 6: Success Display
┌──────────────────────────┐
│ SUCCESS PAGE SHOWN:      │
├──────────────────────────┤
│ 🎉 Congratulations!      │
│ Amount Transferred       │
│ Successfully             │
│                          │
│ Sender: Demo User        │
│ Receiver: Jane Doe       │
│ Amount: ₹50,000         │
│ Mode: EMERGENCY 🚨      │
│                          │
│ ⭐ +10,000 Points!      │
│    (2x Bonus)            │
│                          │
│ Promise ID: [Generated]  │
│ Status: Waiting Sync     │
│                          │
│ [New Payment] [Dashboard]│
└──────────────────────────┘
```

---

## Component Interaction Map

```
┌─────────────────────────────────────────────────────────────┐
│                    COMPONENTS & FLOW                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Dashboard.html                                              │
│  ├─ Emergency Button (🚨)                                   │
│  ├─ activateEmergencyMode()                                 │
│  └─ proceedEmergency()                                      │
│      └─ Sets: appState.isEmergencyMode = true               │
│          └─ Redirects: window.location = 'payment.html'     │
│                                                               │
│  Payment.html                                                │
│  ├─ Payment Form                                             │
│  │  ├─ Sender Name input                                     │
│  │  ├─ Receiver Name input                                   │
│  │  ├─ Amount input                                          │
│  │  ├─ Payment Mode selector ◀── PRE-SELECTED (emergency)   │
│  │  └─ PIN input                                             │
│  │                                                            │
│  ├─ initializePaymentPage() ◀── ENHANCED                    │
│  │  └─ Checks appState.isEmergencyMode                      │
│  │      └─ Pre-selects emergency mode                       │
│  │      └─ Shows warning toast                              │
│  │                                                            │
│  ├─ onPaymentFormChange()                                   │
│  │  └─ Updates AI decision panel                            │
│  │      └─ Shows: "2x BONUS POINTS"                        │
│  │                                                            │
│  ├─ processPayment() ◀── ENHANCED                           │
│  │  └─ Validates form                                       │
│  │  └─ Creates promise token                                │
│  │  └─ If emergency:                                        │
│  │     └─ Calls: sendEmergencyTransactionToAPI()  ◀── NEW   │
│  │         └─ fetch POST to API                             │
│  │         └─ Handles response                              │
│  │         └─ Updates transaction status                    │
│  │     └─ Saves to localStorage                             │
│  │     └─ Shows success page                                │
│  │                                                            │
│  ├─ showPaymentSuccess()                                    │
│  │  └─ Calculates points (2x for emergency)                │
│  │  └─ Shows 🎉 + ⭐ + 2x Points                           │
│  │  └─ Shows 🚨 Emergency badge                            │
│  │                                                            │
│  └─ sendEmergencyTransactionToAPI() ◀── NEW                │
│     └─ Creates request payload                              │
│     └─ fetch('{API}/transactions/emergency', { ... })      │
│     └─ On success:                                          │
│     │  └─ Returns: { success: true, data: {...} }          │
│     │  └─ Updates: transaction.status = 'api_confirmed'    │
│     │                                                        │
│     └─ On error:                                            │
│     │  └─ Returns: { success: false, error: '...' }        │
│     │  └─ Updates: transaction.status = 'offline_pending'  │
│     │                                                        │
│     └─ On network failure:                                  │
│        └─ Returns: { success: false, offline: true }       │
│        └─ Continues with local processing                  │
│                                                               │
│  app.js                                                      │
│  ├─ appState object                                         │
│  │  ├─ isEmergencyMode (flag)                              │
│  │  ├─ user (current user)                                 │
│  │  ├─ transactions (array)                                │
│  │  └─ trustScore                                          │
│  │                                                            │
│  └─ STORAGE_KEYS                                            │
│     ├─ localStorage (persistent)                            │
│     └─ sessionStorage (current session)                     │
│                                                               │
│  server.js (Backend)                                         │
│  ├─ Express app (port 3000)                                 │
│  │                                                            │
│  ├─ POST /api/transactions/emergency ◀── NEW               │
│  │  ├─ Validates request payload                           │
│  │  ├─ Checks user exists                                  │
│  │  ├─ Validates amount ≤ ₹100k                           │
│  │  ├─ Creates transaction object with:                    │
│  │  │  ├─ emergency: true                                  │
│  │  │  ├─ status: 'pending_verification'                  │
│  │  │  └─ emergencyActivatedAt: timestamp                 │
│  │  ├─ Saves to mockDatabase.transactions                 │
│  │  ├─ Calculates bonus points: amount/10 * 2            │
│  │  └─ Returns: { success, transaction, emergencyStatus } │
│  │                                                            │
│  └─ mockDatabase                                            │
│     ├─ users: { ACC001: {...} }                            │
│     └─ transactions: [...]                                 │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## State Transitions

```
┌──────────────────────────────────────────────────────┐
│           EMERGENCY MODE STATE DIAGRAM               │
├──────────────────────────────────────────────────────┤
│                                                       │
│   INITIAL STATE                                      │
│   ┌─────────────────┐                               │
│   │ isEmergency     │                               │
│   │ Mode = false    │                               │
│   │ (Normal Mode)   │                               │
│   └────────┬────────┘                               │
│            │                                        │
│    User clicks 🚨 Emergency Button                 │
│            │                                        │
│            ▼                                        │
│   ┌──────────────────────┐                         │
│   │ Modal Shown:         │                         │
│   │ "Confirm emergency?" │                         │
│   └────────┬─────────────┘                         │
│            │                                        │
│    User clicks "Activate"                          │
│            │                                        │
│            ▼                                        │
│   ┌──────────────────────┐                         │
│   │ EMERGENCY MODE       │                         │
│   │ ACTIVATED            │                         │
│   │ ┌─────────────────┐  │                         │
│   │ │ isEmergency     │  │                         │
│   │ │ Mode = true     │  │                         │
│   │ │                 │  │                         │
│   │ │ Limit: ₹100k   │  │                         │
│   │ │ Points: 2x      │  │                         │
│   │ │ Status: Active  │  │                         │
│   │ └─────────────────┘  │                         │
│   └────────┬─────────────┘                         │
│            │                                        │
│    Redirect to payment.html                        │
│            │                                        │
│            ▼                                        │
│   ┌──────────────────────────┐                    │
│   │ PAYMENT PAGE INITIALIZED  │                    │
│   │ ┌───────────────────────┐ │                    │
│   │ │ Emergency mode pre-   │ │                    │
│   │ │ selected in dropdown  │ │                    │
│   │ │                       │ │                    │
│   │ │ UI shows:             │ │                    │
│   │ │ "⭐ 2x BONUS POINTS" │ │                    │
│   │ └───────────────────────┘ │                    │
│   └────────┬─────────────────┘                    │
│            │                                       │
│    User fills form and submits                   │
│            │                                       │
│            ▼                                       │
│   ┌────────────────────────────────┐             │
│   │ API CALL IN PROGRESS            │             │
│   │                                 │             │
│   │ POST /api/transactions/emergency│             │
│   │ (async, in background)          │             │
│   └────────┬──────────────────┬────┘             │
│            │                  │                   │
│      SUCCESS ◀────────────┘ ERROR              │
│            │                  │                   │
│            ▼                  ▼                   │
│   ┌──────────────────┐  ┌────────────────────┐  │
│   │ api_confirmed    │  │ offline_pending    │  │
│   │                  │  │                    │  │
│   │ Status: OK       │  │ Status: Fallback   │  │
│   │ Response: Valid  │  │ Response: Error    │  │
│   │                  │  │ or Network Down    │  │
│   └────────┬─────────┘  └────────┬───────────┘  │
│            │                     │               │
│            └─────────┬───────────┘               │
│                      │                           │
│                      ▼                           │
│            ┌──────────────────┐                  │
│            │ TRANSACTION      │                  │
│            │ SAVED & SYNCED   │                  │
│            │                  │                  │
│            │ Mode: Emergency  │                  │
│            │ Status: Complete │                  │
│            │ Points: +10,000  │                  │
│            │ Sync: Pending    │                  │
│            └──────────────────┘                  │
│                                                   │
└──────────────────────────────────────────────────┘
```

---

## Performance Metrics

```
TIMELINE OF EMERGENCY TRANSACTION

User Action              Time        Component
─────────────────────────────────────────────────────
Click Emergency Button   T+0ms       Dashboard
Modal appears            T+50ms      Dashboard
Click Activate           T+500ms     User
Redirect to payment      T+600ms     Dashboard.js
Payment page loads       T+1000ms    Browser
Form auto-populated      T+1100ms    payment.js
User fills form          T+2000ms    User Input
Click Send               T+4000ms    User
Form validation          T+4010ms    payment.js
Create token             T+4020ms    payment.js
API call initiated       T+4030ms    fetch()
Server receives          T+4050ms    server.js
Validate request         T+4060ms    server.js
Create transaction       T+4070ms    server.js
Save to DB               T+4075ms    server.js
Return response          T+4080ms    server.js
API response received    T+4100ms    browser
Update transaction       T+4105ms    payment.js
Save locally             T+4110ms    localStorage
Show success             T+4120ms    payment.js
──────────────────────────────────────────────────
Total time:              ~4120ms (4.1 seconds)
User experience:         Fast & responsive
```

---

This visual overview shows:
✅ System architecture  
✅ Complete data flow  
✅ Component interactions  
✅ State transitions  
✅ Performance timeline  

