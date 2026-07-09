# React Native Location

<img src="./preview.gif" alt="Preview" width="100%" />

## 📍 About - @hyoper/rn-location 

A **high-performance** React Native location library built with **New Architecture** and **TurboModules**. Provides reliable **foreground & background tracking**, simple **permission & GPS management**, and a JS-friendly API that delegates heavy work to native code for Android and iOS.

## ✨ Features
- Supports **Android** and **IOS** platforms.
- **Location tracking** in foreground or background.
- **Get current location** in foreground or background.
- Help class for **managing location permissions**.
- Help class for **managing GPS status**.
- Configurations for **platform-based customization**.
- Understandable and organized **error handling**.
- Configurable foreground service notification on Android (persistence / dismissible).

---

## 🛠️️ Installation
1- Install the package in your React Native project. [🔗 NPM](https://www.npmjs.com/package/@hyoper/rn-location)

```bash
npm install @hyoper/rn-location
```
```bash
yarn add @hyoper/rn-location
```

2- Follow the [INSTALLATION](https://github.com/HyopeR/react-native-location/tree/master/instructions/INSTALLATION.md) instructions.

3- Please review to learn more details about the package; [GUIDELINES](https://github.com/HyopeR/react-native-location/tree/master/instructions/GUIDELINES.md) and [HELPERS](https://github.com/HyopeR/react-native-location/tree/master/instructions/HELPERS.md).

## ⚙️ Requirements
This package works **only** with **React Native 0.75+** and **requires New Architecture** to be enabled. Make sure your project meets the following requirements:

```json
{
  "react": "*",
  "react-native": ">=0.75.0"
}
```

## Notification persistence (Android)

When running location tracking in the background, Android uses a foreground service and shows a notification to keep the process alive. This library exposes `notification` options in `RNLocation.configure(...)` and you can control whether the notification is explicitly persistent (non-dismissible) using the `notification.ongoing` option.

- Platform: Android only. iOS posts a local notification to simulate foreground behavior and does not support an Android-style `ongoing` flag.
- Default: `notification.ongoing` defaults to `true` in the library configuration (so notifications are persistent by default).

Example:

```ts
RNLocation.configure({
  allowsBackgroundLocationUpdates: true,
  notificationMandatory: true,
  notification: {
    ongoing: true, // make notification persistent / non-dismissible while service runs
    title: 'Tracking',
    content: 'Location active',
  }
});

RNLocation.subscribe();
```

If you change `notification` fields at runtime, call `RNLocation.configureWithRestart(...)` to restart the native service and apply the new notification values immediately.

---

## 🧩 Example - Location Tracking
This example demonstrates how to **configure RNLocation**, **subscribe to location updates**, handle **location changes**, manage **errors**, and **unsubscribe** when done. See examples for Foreground and Background location-tracking;
- [📂 Foreground Example](https://github.com/HyopeR/react-native-location/tree/master/example/src/pages/ForegroundPage/index.tsx)
- [📂 Background Example](https://github.com/HyopeR/react-native-location/tree/master/example/src/pages/BackgroundPage/index.tsx)

```typescript jsx
import React, {useEffect} from 'react';
import {RNLocation} from '@hyoper/rn-location';

const Example = () => {
  useEffect(() => {
    // You can configure the subscription. This stage doesn't require permissions directly, 
    // but the configurations made at this stage determine which permissions the onChange callback should use.

    // 1- Foreground mode → requires location "when-in-use" permission.
    RNLocation.configure({allowsBackgroundLocationUpdates: false});
    // 2- Background mode → requires location "always" permission.
    // RNLocation.configure({allowsBackgroundLocationUpdates: true});
    // 3- Background safe mode → requires location "always" + notification permission.
    // RNLocation.configure({allowsBackgroundLocationUpdates: true, notificationMandatory: true});

    // You can create a subscription without obtaining location permissions.
    // However, to receive a location, location permissions must be granted and GPS must be enabled.
    const subscription = RNLocation.subscribe();

    // onChange Location will be triggered when it arrives.
    // The "when-in-use" or "always" Location permission must be granted.
    subscription.onChange(locations => {
      if (locations.length > 0) {
        // Use location information.
        const location = locations[0];
      }
    });

    // onError will be triggered if there is a problem in the Location retrieval process.
    subscription.onError(error => {
      switch (error.code) {
        case 'ERROR_SETUP':
          // There is something missing in AndroidManifest.xml or Info.plist.
          break;
        case 'ERROR_PROVIDER':
          // GPS is off or unavailable.
          break;
        case 'ERROR_PERMISSION':
          // Location "when-in-use" permission is not granted.
          break;
        case 'ERROR_PERMISSION_ALWAYS':
          // Location "always" permission is not granted.
          break;
        case 'ERROR_PERMISSION_NOTIFICATION':
          // Notification permission is not granted.
          break;
        case 'ERROR_UNKNOWN':
        default:
          // Other possible runtime errors. These are mostly non-critical.
          break;
      }
    });

    return () => {
      // Don't forget to cancel subscriptions.
      subscription.unsubscribe();
    };
  }, []);

  return <></>;
};
```
