# 🌐 Install Web Support

## You Need Web Dependencies

The app needs a few packages to run in the browser.

## ✅ Easy Installation

### Option 1: Use the Batch File (Easiest)

1. Go to the `mobile` folder
2. Double-click: **`install-web-deps.bat`**
3. Wait for installation (2-3 minutes)
4. Done!

### Option 2: Command Prompt

Open Command Prompt (not PowerShell) and run:

```cmd
cd C:\Users\FACULTY122\CascadeProjects\SmartRoad\mobile
npx expo install react-native-web@~0.19.6 react-dom@18.2.0 @expo/webpack-config@^19.0.0
```

### Option 3: Use npm directly

```cmd
cd C:\Users\FACULTY122\CascadeProjects\SmartRoad\mobile
npm install react-native-web@~0.19.6 react-dom@18.2.0 @expo/webpack-config@^19.0.0
```

## 🚀 After Installation

Once installed, run:

```cmd
npm run web
```

Your browser will open with the app!

## 📱 Alternative: Use Expo Go on Your Phone

If you don't want to install web dependencies, you can use your phone:

1. Install "Expo Go" app from Play Store/App Store
2. Run: `npm start` (without --web)
3. Scan the QR code with Expo Go
4. App runs on your phone!

## 🎯 What Gets Installed

- **react-native-web**: Makes React Native work in browsers
- **react-dom**: React for web
- **@expo/webpack-config**: Bundles the app for web

Total size: ~50MB
Time: 2-3 minutes

## ⚡ Quick Decision

### Want to test in browser?
→ Install web dependencies (Option 1 or 2 above)

### Have a phone handy?
→ Skip web install, use Expo Go app instead

### Want both?
→ Install web deps, then you have both options!

## 🐛 Troubleshooting

### Issue: npx not found
**Solution**: Use Option 3 (npm install directly)

### Issue: Installation fails
**Solution**: 
```cmd
cd mobile
npm cache clean --force
npm install
```
Then try again.

### Issue: Takes too long
**Solution**: Be patient, it's downloading packages. Usually takes 2-3 minutes.

## ✅ After Installation Works

You'll be able to:
- Run `npm run web`
- Test in browser
- Use Chrome DevTools
- Fast reload
- Easy debugging

---

**Choose your option and install!** 🚀

Recommended: Use the batch file (easiest!)
