# AI English Chat Assistant

A mobile app for practicing English conversation with AI-powered voice and text chat.

## Features

- 🗣️ Voice chat with speech recognition
- 💬 Text chat interface
- 🎯 AI-powered English conversation practice
- 📱 Native mobile experience
- 💾 Persistent chat history
- ⚙️ Customizable settings

## Building APK

### Prerequisites

1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   ```

2. Create an Expo account at [expo.dev](https://expo.dev)

3. Login to EAS:
   ```bash
   eas login
   ```

### Build Steps

1. **Configure the build** (first time only):
   ```bash
   eas build:configure
   ```

2. **Build APK for testing**:
   ```bash
   eas build --platform android --profile preview
   ```

3. **Build production APK**:
   ```bash
   eas build --platform android --profile production
   ```

### Download APK

After the build completes:
1. Check your build status: `eas build:list`
2. Download the APK from the provided URL
3. Install on your Android device (enable "Install from unknown sources")

## Development

```bash
npm install
npm run dev
```

## Project Structure

- `/app` - Main application screens and navigation
- `/services` - Business logic and API services
- `/components` - Reusable UI components
- `/hooks` - Custom React hooks

## Permissions

The app requires the following Android permissions:
- `RECORD_AUDIO` - For voice recording functionality
- `MODIFY_AUDIO_SETTINGS` - For audio playback optimization