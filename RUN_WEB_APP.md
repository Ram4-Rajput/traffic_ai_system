# 🌐 Run SmartRoad in Web Browser

## The "Cannot connect to Metro" Warning

This warning appears when trying to run on a physical device. Since you're using the web browser, you can safely ignore it or dismiss it.

## ✅ Best Way to Run: Direct Web Mode

### Option 1: Run Web Directly (Recommended)

Open Command Prompt and run:

```cmd
cd C:\Users\FACULTY122\CascadeProjects\SmartRoad\mobile
npm run web
```

This will:
- Start the web server directly
- Skip the Metro bundler menu
- Open browser automatically
- No device connection needed

### Option 2: Use the Batch File

Double-click: **`mobile/START_WEB.bat`**

This does the same as Option 1.

### Option 3: From Expo Menu

If you're already in the Expo menu:
1. Press `w` for web
2. Dismiss the Metro warning (it's just a warning, not an error)
3. Browser will open

## 🎯 What You'll See

After running, your browser will open to:
```
http://localhost:19006
```

You'll see the SmartRoad app interface!

## 🧪 Test the App

### 1. Registration:
- Click "Register" or "Create Account"
- Fill in:
  - Name: John Doe
  - Phone: 1234567890
  - Emergency Contact: 9876543210
  - Vehicle: Car
- Click "Send OTP"
- Enter: 1234 (or any 4+ digits)
- Click "Verify & Register"

### 2. Login:
- Enter phone: 1234567890
- Click "Send OTP"
- Enter: 1234
- Click "Verify"

### 3. Explore Features:
- View Dashboard
- Check Traffic Map
- Report Issues
- View Rewards
- Test Emergency Button

## 🐛 Troubleshooting

### Issue: Browser doesn't open
**Solution**: Manually open browser and go to http://localhost:19006

### Issue: "Cannot connect to Metro" keeps showing
**Solution**: 
1. Click "Dismiss" or "Minimize"
2. The app will still work in browser
3. Or use `npm run web` to skip this entirely

### Issue: Port already in use
**Solution**:
```cmd
# Kill the process on port 19006
netstat -ano | findstr :19006
taskkill /PID <process_id> /F

# Then start again
npm run web
```

### Issue: App not loading
**Solution**:
```cmd
# Clear cache and restart
cd mobile
npm start -- --clear
# Then press 'w'
```

## 💡 Why Web Mode is Best for Testing

✅ No device needed
✅ No USB debugging
✅ No emulator setup
✅ Fast reload
✅ Easy debugging (F12 console)
✅ Works on any computer
✅ No Metro connection issues

## 🔍 Browser Console

Press `F12` in browser to see:
- Console logs
- Network requests
- Errors and warnings
- App state

This helps debug any issues!

## ✨ What Works in Web Mode

✅ All UI components
✅ Navigation
✅ Forms and inputs
✅ Authentication
✅ API calls to backend
✅ State management
✅ Most React Native features

❌ Camera (web has different API)
❌ Some native modules
❌ Push notifications (different on web)

But all core features work perfectly!

## 🚀 Quick Start Commands

```cmd
# Option 1: Direct web (best)
cd mobile
npm run web

# Option 2: Standard start, then press 'w'
cd mobile
npm start
# Press 'w' when menu appears

# Option 3: Clear cache first
cd mobile
npm start -- --clear
# Press 'w' when menu appears
```

## 📱 Backend Connection

Make sure backend is running:
- Backend: http://localhost:5000 ✅
- AI Services: http://localhost:8000 ✅

Check: http://localhost:5000/api/health

## 🎮 Full Test Flow

1. **Start backend** (already running ✅)
2. **Start web app**: `npm run web`
3. **Browser opens** automatically
4. **Register** new account
5. **Test features**:
   - View traffic
   - Report issue
   - Check rewards
   - Emergency alert
6. **Check console** (F12) for logs

---

**Use `npm run web` for the best experience!** 🌐

No Metro warnings, no device issues, just pure web testing!
