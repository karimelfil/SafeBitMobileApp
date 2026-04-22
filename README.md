This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.

# Expo Development Client and APKs

This project keeps the existing React Native CLI and Android Studio workflow, and also supports Expo Development Client for QR-based testing on a physical Android phone.

## Install dependencies

From the project root:

```sh
npm install
```

If you will build for iOS later, install pods after dependency changes:

```sh
npx pod-install
```

## Build Android dev client

This builds and installs the Expo Development Client on your Android emulator or connected Android phone:

```sh
npm run expo:android
```

You can still use the original React Native CLI flow:

```sh
npm run android
```

You can also open the `android/` project in Android Studio and run it there.

## Start Expo Go and scan QR code

Start the Expo Go server in tunnel mode:

```sh
npm run expo:go
```

Then:

1. Install `Expo Go` from the Play Store on the phone.
2. Keep this laptop running while testing.
3. Scan the QR code from Expo Go or the phone camera.
4. The project will open directly in Expo Go.

If you want to use the custom native development build instead, you can still run:

```sh
npm run expo:android
npm run expo:tunnel
```

## Generate APK files

Debug APK:

```sh
npm run apk:debug
```

Created at:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

Release APK:

```sh
npm run apk:release
```

Created at:

```text
android/app/build/outputs/apk/release/app-release.apk
```

Note: the current Android `release` build type is configured to sign with the debug keystore. Replace that with your own release keystore before distributing a real production build.
