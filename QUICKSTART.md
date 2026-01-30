# ⚡ CHECKMATES OFFLINE - Quick Start Guide

## 🚀 In 30 Seconds

1. **Open** the folder in VS Code
2. **Right-click** on `index.html` → "Open with Live Server"
3. **Create account** or use demo credentials
4. **Start making offline payments**!

---

## 📝 Demo Account Ready to Use

```
Account ID: ACC001
PIN: 1234
```

---

## 🎯 Main Features at a Glance

### Login Page (`index.html`)
- Create new account
- Login with Account ID + PIN
- PIN strength indicator
- Elegant, professional design

### Dashboard (`dashboard.html`)
- **Trust Score**: Visual circle meter (0-100)
- **Zone Indicator**: Green/Yellow/Red risk levels
- **AI Monitor**: Real-time system status
- **Quick Actions**: Payment, Emergency, History, Sync
- **Device Profile**: Your device information
- **Recent Transactions**: Last 3 payments

### Payment Page (`payment.html`)
- **Payment Details**: Sender, Receiver, Amount
- **Payment Modes**:
  - Normal: Standard security
  - 🚨 Emergency: Higher limits
  - 💳 Lend: P2P lending
- **AI Analysis Panel**: Decision explanation
- **Promise Token**: Generated after payment
- **Trusted People**: Quick receiver list
- **Split Payment**: Divide amounts with friends

### History Page (`history.html`)
- **View All Transactions**: Filter & search
- **Sync with Bank**: Verify offline promises
- **Digital Receipts**: Print or download
- **Statistics**: Visual transaction analytics
- **Alerts**: Suspicious pattern warnings

---

## 🤖 How AI Works

### AI Makes Real Decisions

Each payment is analyzed by 8 factors:

1. ✓/⚠️ **Trust Score** - Your history (70+ = Green)
2. 💰 **Amount** - Within daily limits?
3. 📊 **Frequency** - Too many today?
4. 📱 **Device** - Known or new?
5. 📈 **Patterns** - Unusual activity?
6. 🚨 **Fraud** - Suspicious signs?
7. 👤 **Receiver** - Trusted person?
8. 🆔 **PIN** - Verified?

### AI Confidence

- **90-100%**: Strong approval
- **75-89%**: Moderate approval
- **50-74%**: Confirmation needed
- **<50%**: Manual review needed

---

## 📊 Trust Score Guide

### Starting Score: 75/100

| Action | Points |
|--------|--------|
| Successful sync | +5 |
| Clean history | +3 |
| Too many retries | -5 |
| New device | -10 |
| Unusual amount | -8 |

### Zone Limits

| Zone | Score | Daily Limit | Transactions |
|------|-------|-------------|--------------|
| 🟢 Green | 70-100 | ₹50,000 | 10 |
| 🟡 Yellow | 40-69 | ₹10,000 | 3 |
| 🔴 Red | 0-39 | ₹2,000 | 1 |

---

## 💡 Step-by-Step: First Payment

### 1. Login
```
Go to dashboard
Account ID: ACC001
PIN: 1234
```

### 2. Make Payment
```
Click "Make Payment" button
Fill in:
  - Your Name
  - Receiver Name
  - Amount (₹)
  - Your PIN
```

### 3. Review AI Decision
```
Read AI Analysis panel
Check if payment is ALLOWED
Look at reason and confidence
```

### 4. Process Payment
```
Click "Process Payment"
Promise Token is generated
See unique ID and details
```

### 5. Share & Confirm
```
Share Promise ID with receiver
They accept offline
Receiver has proof
```

### 6. Sync Later
```
Go online
Click "Sync Now" on dashboard
Bank verifies transaction
Trust score updates
```

---

## 🎯 Common Scenarios

### Scenario 1: Normal Payment ✓
- **Amount**: ₹5,000
- **AI Decision**: ALLOW
- **Why**: Amount within limit, trusted zone
- **Time to Process**: Instant
- **Next Step**: Sync when online

### Scenario 2: Large Payment ⚠️
- **Amount**: ₹35,000
- **AI Decision**: CONFIRMATION REQUIRED
- **Why**: Large for green zone
- **Time to Process**: User confirms with PIN
- **Next Step**: Emergency mode available

### Scenario 3: Emergency Payment 🚨
- **Amount**: ₹100,000
- **Mode**: Emergency (Higher limits)
- **AI Decision**: ALLOW (with override)
- **Reason**: Emergency mode active
- **Time to Process**: Instant
- **Next Step**: Post-sync verification

### Scenario 4: Blocked Payment ❌
- **Amount**: ₹80,000 (in red zone)
- **AI Decision**: BLOCK
- **Reason**: Exceeds red zone limit
- **Solution**: Try emergency mode or smaller amount
- **Next Step**: Use emergency mode if urgent

---

## 🔐 Understanding Promise Tokens

### What is it?
Proof that you promised to pay offline

### What's included?
```
✓ Unique ID (for tracking)
✓ Sender & Receiver names
✓ Amount (₹)
✓ Timestamp (when created)
✓ Device Signature (your device)
✓ AI decision (ALLOW/BLOCK)
✓ Expiry date (30 days)
```

### How to use?
1. Generate in payment page
2. Share ID with receiver
3. Receiver accepts offline
4. You both have proof
5. Sync later for settlement

### Anti-Double-Spending
- Each token is unique
- Can't use same token twice
- Device signature prevents fraud
- Immutable record

---

## 🔄 How Sync Works

### When Online

```
1. Go to History page
2. Click "Start Sync Now"
3. Watch 3-step process:
   ✓ Validating promises
   ✓ Checking for fraud
   ✓ Updating trust score
4. All pending → synced
5. Trust score +5 bonus
```

### What Happens?

```
Local Promise Tokens
        ↓
Connect to Bank
        ↓
Verify Each Token
        ↓
Check for Fraud
        ↓
Update Trust Score
        ↓
Final Settlement
        ↓
Get Digital Receipt
```

---

## 🎨 UI Color Guide

### Status Colors
- 🟢 **Green**: Safe zone, full limits
- 🟡 **Yellow**: Caution, moderate limits
- 🔴 **Red**: High risk, restricted limits
- 🟣 **Purple**: AI/System related

### Button Colors
- 🔵 **Blue**: Primary action
- ⚪ **Gray**: Secondary action
- 🔴 **Red**: Dangerous action
- 🟢 **Green**: Success/Safe

---

## ⚡ Tips & Tricks

### Maximize Trust Score
✓ Make small transactions first
✓ Sync frequently to verify
✓ Keep fraud history clean
✓ Use from same device
✓ Regular payment patterns

### Avoid Low Trust
✗ Don't retry too many times
✗ Don't use multiple devices
✗ Don't make huge irregular jumps
✗ Don't have fraud incidents

### Emergency Mode Tips
- Use only when necessary
- Requires post-sync verification
- Higher limits available
- Calming UI for stress
- Clear recovery process

### Payment Best Practices
- Make small test payment first
- Trusted receivers = easier approval
- Payment to known person gets bonus
- Record all Promise IDs
- Sync regularly to build trust

---

## 🆘 Troubleshooting

### Q: Can't login?
**A:** 
- Check Account ID spelling
- PIN must be 4-6 digits
- Use demo: ACC001 / 1234

### Q: Payment blocked?
**A:**
- Check AI explanation
- Amount too high? Use emergency mode
- Try smaller amount
- Insufficient trust score

### Q: How to increase trust?
**A:**
- Make & sync successful payments
- Don't retry failed transactions
- Use same device
- Keep fraud history clean

### Q: Lost data?
**A:**
- All stored in browser storage
- Clear browser cookies = reset account
- Backup Promise IDs manually

### Q: Works offline?
**A:**
- Yes! All features work offline
- Sync optional, not required
- Promise tokens created instantly
- No internet needed to pay

---

## 📱 Device Compatibility

| Device | Browser | Status |
|--------|---------|--------|
| Desktop | Chrome | ✓ Perfect |
| Desktop | Firefox | ✓ Perfect |
| Desktop | Safari | ✓ Good |
| Desktop | Edge | ✓ Perfect |
| Tablet | Chrome | ✓ Perfect |
| Tablet | Safari | ✓ Good |
| Mobile | Chrome | ✓ Perfect |
| Mobile | Safari | ✓ Good |

---

## 🚀 Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Enter` | Submit form |
| `Tab` | Navigate fields |
| `Esc` | Close modal |
| `Ctrl+R` | Refresh page |

---

## 📊 Sample Transactions

### Transaction 1: ₹500 to Friend
- **Status**: Synced ✓
- **Date**: 2 days ago
- **Trust Score**: 85
- **Zone**: Green
- **AI Decision**: Approved

### Transaction 2: ₹1,200 to Friend
- **Status**: Pending ⏳
- **Date**: 12 hours ago
- **Trust Score**: 80
- **Zone**: Green
- **AI Decision**: Approved

---

## 💬 Key Messages

### On Login Success
"CHECKMATES OFFLINE initialized • Offline Mode Active"

### On Payment Success
"Payment Promise Created!"

### On Sync Complete
"Sync complete • Trust score updated • All promises verified"

### Zone Status
- Green: "Low Risk • Full Limits Available"
- Yellow: "Medium Risk • Moderate Limits"
- Red: "High Risk • Restricted Limits"

---

## 🎓 Educational Resources

### For New Users
1. Read "How CHECKMATES OFFLINE Works" on dashboard
2. Watch AI decision panel during payment
3. Review promises in history
4. Sync to see final settlement

### For Advanced Users
1. Check device signature in receipts
2. Monitor trust score changes
3. Analyze transaction patterns
4. Optimize sync timing

### For Developers
1. See code comments in JS files
2. Check CSS for styling patterns
3. Review HTML structure
4. Extend backend.js for real API

---

## 🌟 Remember

✨ **CHECKMATES OFFLINE is:**
- ✓ Completely offline capable
- ✓ AI-powered decision making
- ✓ Transparent & ethical
- ✓ Built for emergencies
- ✓ For common people
- ✓ Free and open-source
- ✓ Always available

💡 **Use when:**
- No internet available
- In rural areas
- During disasters
- Emergency situations
- Offline zones
- Trusted peer transactions

🔒 **Stay safe:**
- Never share your PIN
- Keep your Account ID private
- Use strong devices
- Verify receivers
- Sync regularly
- Report fraud immediately

---

**Questions?** Check the full README.md for detailed documentation!

**Ready to go?** Open `index.html` and start your first transaction! 🚀
