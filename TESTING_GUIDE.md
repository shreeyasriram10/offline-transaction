# 🧪 CHECKMATES OFFLINE - Testing Guide

## Quick Test Checklist

### ✅ Step 1: Launch Application
1. Open http://localhost:8000 in your browser
2. You should see the **CHECKMATES OFFLINE** login page
3. Login with:
   - **Email**: test@example.com
   - **Password**: test123
   - **Name**: Test User

### ✅ Step 2: Verify Branding
After login, you should see:
- ✓ Page title: "Dashboard - CHECKMATES OFFLINE"
- ✓ Header: "CHECKMATES OFFLINE" (top left)
- ✓ Status badges working

### ✅ Step 3: Test Sliding Monitor Panel

#### Method 1: Click Toggle Button
1. Look at the **right side** of the dashboard
2. You'll see a **📊** button
3. Click it → Panel should slide out smoothly
4. Click it again → Panel slides back in

#### Method 2: Keyboard Shortcut
1. Press `M` key on keyboard
2. Monitor panel should toggle open/closed
3. Toast notification appears: "Monitor opened • Press 1-4 or click buttons"

### ✅ Step 4: Test Monitor Buttons

#### 1️⃣ Fingerprint Authentication
- **Click**: Button labeled "👆 Fingerprint"
- **Or Press**: Key `1`
- **Expected**: 
  - Button shows "Verifying..." (yellow border, pulsing)
  - After ~1.5 seconds: Shows "Verified ✓" (green border)
  - Toast: "🔐 Fingerprint authenticated successfully"

#### 2️⃣ Keyboard Authentication
- **Click**: Button labeled "⌨️ Keyboard Auth"
- **Or Press**: Key `2`
- **Expected**:
  - Toast: "⌨️ Press any key to authenticate (5 keys required)"
  - Button shows "Listen..." state
  - **Then**: Press any 5 keys
  - Result: "Verified ✓" (green) or "Failed ✗" (red)

#### 3️⃣ PIN Verification
- **Click**: Button labeled "🔐 PIN Verify"
- **Or Press**: Key `3`
- **Expected**:
  - Button shows "Verifying..." (yellow border, pulsing)
  - After ~1.5 seconds: Random success/fail
  - Success: "Verified ✓" (green) + Toast
  - Failure: "Failed ✗" (red) + Toast

#### 4️⃣ Location Check
- **Click**: Button labeled "📍 Location"
- **Or Press**: Key `4`
- **Expected**:
  - Button shows "Scanning..." (yellow border, pulsing)
  - After ~1.2 seconds: Shows "Safe ✓" (green border)
  - Toast: "📍 Location verified - Safe zone confirmed"

### ✅ Step 5: Test Emergency Mode

1. Look for **🚨 Emergency** button on dashboard
2. Click it → Modal popup appears with:
   - Title: "🚨 Emergency Payment Mode"
   - Description: "Higher transaction limits during crisis..."
   - Two buttons: "Activate Emergency Mode" and "Cancel"
3. Click "Activate Emergency Mode":
   - Modal closes
   - Toast: "🚨 Emergency Mode Active • Higher limits enabled"
   - Redirects to payment page
4. Click "Cancel":
   - Modal closes
   - Returns to dashboard

### ✅ Step 6: Keyboard Shortcut Summary

Test these keyboard shortcuts:

| Key | Result |
|-----|--------|
| `M` | Toggle monitor panel open/closed |
| `1` | Open Fingerprint auth (when monitor is open) |
| `2` | Open Keyboard auth (when monitor is open) |
| `3` | Open PIN verification (when monitor is open) |
| `4` | Open Location check (when monitor is open) |

### ✅ Step 7: Visual Feedback Testing

Verify button states change correctly:

1. **Normal State**: Border color matches theme, "Ready" status
2. **Processing**: Yellow border, pulsing animation, "Verifying..."
3. **Success**: Green border ✓, "Verified ✓" status
4. **Failure**: Red border ✗, "Failed ✗" status

### ✅ Step 8: Toast Notifications

Verify toast messages appear at:
- Monitor open/close
- Each button activation
- Authentication success/failure
- Emergency mode activation

## 🔍 Expected UI Elements

### Dashboard Header
```
CHECKMATES OFFLINE  |  Welcome, Test User  |  ✓ Device Trusted  |  📡 Offline Mode  |  🚪
```

### Trust Score Section
- Circular progress indicator showing trust %
- Zone indicator (Green/Yellow/Red)
- Trust statistics

### Action Buttons Grid
```
[💳 Quick Payment] [🚨 Emergency]
[📋 View History] [🔄 Sync Now]
```

### Sliding Monitor Panel (Right Side)
```
[📊] → Click to open
     └─→ 👆 Fingerprint    Ready
         ⌨️ Keyboard Auth   Ready
         🔐 PIN Verify      Ready
         📍 Location        Ready
```

## ⚠️ Common Issues & Solutions

### Issue: Monitor panel doesn't slide out
**Solution**: 
- Make sure browser window is wide enough (desktop view)
- Try pressing `M` key instead
- Check browser console for JavaScript errors

### Issue: Keyboard shortcuts not working
**Solution**:
- Click on the page first to ensure it has focus
- Check if another element has focus
- Try pressing keys while monitor is open

### Issue: No toast notifications appearing
**Solution**:
- Look at bottom-left corner of screen
- Check console for JavaScript errors
- Verify `showToast()` function is loaded

### Issue: Emergency mode not redirecting
**Solution**:
- Check browser console for errors
- Verify payment.html exists
- Check payment.html loads successfully

## 📱 Mobile Testing

On mobile devices (or using DevTools):
1. Monitor button should still be accessible
2. Sliding panel should adapt to screen width
3. All buttons should be touch-friendly
4. Keyboard shortcuts work the same way

## 🎯 Full Test Flow (5 Minutes)

1. **Login** (30 seconds)
   - Visit page, enter credentials, click login
   
2. **Open Monitor** (10 seconds)
   - Click 📊 or press M
   - Verify smooth animation

3. **Test Each Button** (2 minutes)
   - Click/Press 1: Fingerprint (30 sec)
   - Click/Press 2: Keyboard (40 sec)
   - Click/Press 3: PIN (30 sec)
   - Click/Press 4: Location (20 sec)

4. **Test Emergency Mode** (30 seconds)
   - Click 🚨 button
   - Click "Activate"
   - Verify redirect

5. **Final Checks** (60 seconds)
   - Verify all toasts appeared
   - Check console for errors
   - Test keyboard shortcuts

## ✅ Success Criteria

- [ ] CHECKMATES OFFLINE branding appears throughout
- [ ] Monitor panel slides smoothly from right side
- [ ] All 4 authentication buttons work and provide feedback
- [ ] Keyboard shortcuts (M, 1-4) function correctly
- [ ] Toast notifications appear for all actions
- [ ] Emergency mode modal works and redirects
- [ ] No console errors or warnings
- [ ] Responsive design works on different screen sizes

---

**Total Expected Test Time**: 5-10 minutes
**Success Rate Target**: 100% of features working

