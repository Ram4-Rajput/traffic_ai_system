# 📱 Reload App on Your Phone - Step by Step

## The Problem
Your phone is still running the OLD version of the app with the bugs. We need to force it to reload the NEW fixed version.

## ✅ Solution: Force Complete Reload

### Step 1: Stop the Current App

On your computer, in the terminal where the app is running:
1. Press `Ctrl + C` to stop it
2. Wait for it to fully stop

### Step 2: Clear Everything and Restart

Run these commands in Command Prompt:

```cmd
cd C:\Users\FACULTY122\CascadeProjects\SmartRoad\mobile
npm start -- --clear
```

Or double-click: `mobile/RELOAD_APP.bat`

### Step 3: On Your Phone

When the QR code appears:

**Option A: Scan Fresh QR Code**
1. Close the SmartRoad app on your phone completely (swipe it away)
2. Open Expo Go app
3. Scan the NEW QR code from terminal
4. App will download fresh version

**Option B: Shake to Reload**
1. Open the app on your phone
2. Shake your phone
3. Menu appears
4. Tap "Reload"
5. If error persists, tap "Go Home"
6. Scan QR code again

### Step 4: Verify It's Working

After reload, check the console in terminal. You should see:
- "User connected: [socket-id]"
- When you register, you'll see: "Registering user with data: {...}"

## 🐛 If Error Still Appears

### The "_AuthContext.useAuth is not a function" Error

This means the phone didn't reload the new code. Try this:

1. **On Phone**: 
   - Shake phone
   - Tap "Go Home" in Expo Go
   - Close Expo Go app completely
   - Reopen Expo Go
   - Scan QR code again

2. **On Computer**:
   ```cmd
   # Stop the server (Ctrl+C)
   
   # Delete cache folders
   cd mobile
   rmdir /s /q .expo
   rmdir /s /q node_modules\.cache
   
   # Start fresh
   npm start -- --clear
   ```

3. **On Phone**:
   - Scan the new QR code
   - Wait for app to fully load

## 🔍 How to Know It's Fixed

After reload, the app should:
1. Show onboarding screens
2. Show registration form
3. When you click "Verify & Register" with OTP:
   - Loading indicator appears
   - Automatically goes to Dashboard
   - Shows bottom navigation (Navigate, Explore, Rewards, Profile)

## 💡 Alternative: Use Development Build

If the error keeps happening, try this:

### In Terminal:
```cmd
cd mobile
npm start
```

### On Phone:
1. Shake phone in the app
2. Tap "Switch to Development Mode"
3. Reload

This forces a fresh build.

## 🎯 Complete Reset (Last Resort)

If nothing works:

### On Computer:
```cmd
cd mobile

REM Stop any running processes
taskkill /F /IM node.exe /T

REM Clear all caches
rmdir /s /q .expo
rmdir /s /q node_modules\.cache
del package-lock.json

REM Reinstall
npm install

REM Start fresh
npm start -- --clear
```

### On Phone:
1. Uninstall Expo Go app
2. Reinstall Expo Go from store
3. Open Expo Go
4. Scan QR code

## ✅ Expected Behavior After Fix

### Registration Flow:
1. Fill form → Click "Send OTP"
2. Enter OTP (any 4+ digits like 1234)
3. Click "Verify & Register"
4. ✅ Automatically shows Dashboard
5. ✅ Bottom navigation appears
6. ✅ You're logged in!

### No More Errors:
- ❌ No "_AuthContext.useAuth is not a function"
- ❌ No "Cannot connect to Metro"
- ✅ Smooth registration
- ✅ Automatic navigation

## 📊 Check Terminal Logs

When you register, terminal should show:
```
Registering user with data: {name: "...", phone: "..."}
User registered successfully: {user_id: "USR-000001", ...}
Registration successful! User should be logged in now.
```

If you see these logs, the fix is working!

## 🚀 Quick Steps Summary

1. **Stop app**: Ctrl+C in terminal
2. **Clear cache**: `npm start -- --clear`
3. **On phone**: Close app, reopen Expo Go, scan QR
4. **Test**: Register with OTP 1234
5. **Success**: Should see Dashboard!

---

**Try the complete reload now!** 🎉

The key is making sure your phone downloads the NEW version with all the fixes!
