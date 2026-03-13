# 🔧 Mobile App Troubleshooting Guide

## Issue: START_MOBILE.bat Not Showing QR Code

### Solution 1: Use Command Prompt Directly

1. Press `Win + R`
2. Type `cmd` and press Enter
3. Navigate to your project:
   ```
   cd C:\Users\FACULTY122\CascadeProjects\SmartRoad
   ```
4. Run:
   ```
   cd mobile
   npm start
   ```

### Solution 2: Use PowerShell Script

1. Right-click on `START_MOBILE.ps1`
2. Select "Run with PowerShell"

If you get an error about execution policy:
1. Open PowerShell as Administrator
2. Run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
3. Try again

### Solution 3: Check Node.js Installation

Open Command Prompt and check:
```
node --version
npm --version
```

If these commands don't work:
- Node.js might not be in your PATH
- Restart your computer after Node.js installation
- Or reinstall Node.js from https://nodejs.org/


### Solution 4: Manual Step-by-Step

1. Open Command Prompt (CMD)
2. Type these commands one by one:

```cmd
cd C:\Users\FACULTY122\CascadeProjects\SmartRoad\mobile
set PATH=%PATH%;C:\Program Files\nodejs\
npm start
```

Wait for the Expo server to start. You should see:
- Metro bundler starting
- QR code appearing
- Options to press 'w', 'a', or 'i'

## Common Errors and Solutions

### Error: "npm is not recognized"

**Cause**: Node.js is not in your system PATH

**Solution**:
1. Find where Node.js is installed (usually `C:\Program Files\nodejs\`)
2. Add it to PATH temporarily:
   ```cmd
   set PATH=%PATH%;C:\Program Files\nodejs\
   ```
3. Or add permanently:
   - Right-click "This PC" → Properties
   - Advanced system settings → Environment Variables
   - Edit PATH variable
   - Add `C:\Program Files\nodejs\`
   - Restart Command Prompt

### Error: "expo command not found"

**Cause**: Expo CLI not installed

**Solution**: It will install automatically when you run `npm start`

### Error: Port already in use

**Cause**: Another process is using port 19000 or 19001

**Solution**:
```cmd
npm start -- --port 19002
```


## Quick Test: Can You Access the Web Version?

Try this simple test:

1. Open Command Prompt
2. Run:
   ```cmd
   cd C:\Users\FACULTY122\CascadeProjects\SmartRoad\mobile
   npm start
   ```
3. Wait for it to start
4. Press `w` to open in web browser
5. Your default browser should open to http://localhost:19006

If the web version works, you can use it to test the app!

## Alternative: Use Web Browser

If you can't get the mobile app working on your phone, you can test it in your web browser:

1. Start the app with `npm start`
2. Press `w` when prompted
3. Browser opens at http://localhost:19006
4. You can test most features in the browser

## Need More Help?

### Check if services are running:
- Backend: http://localhost:5000
- AI Services: http://localhost:8000

### View logs:
The terminal will show any errors when starting the mobile app.

### Common issues:
- Firewall blocking connections
- Antivirus blocking Node.js
- Wrong directory
- Node.js not installed correctly

---

**Still having issues?** Try the web version by pressing 'w' after running `npm start`!
