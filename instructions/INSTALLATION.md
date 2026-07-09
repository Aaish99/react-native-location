# ⚒️ Installation
This package requires some configuration on native Android & IOS to function correctly. The steps below will guide you through enabling both foreground and background location features.

## 🤖 Android Setup
Android requires permission declarations and services in AndroidManifest.xml.

### Android Foreground Setup
**Required**<br/>
The instructions in this section are mandatory.<br/>
To use location services on Android, **ACCESS_COARSE_LOCATION** and **ACCESS_FINE_LOCATION** permissions must be added to the AndroidManifest.xml. **[See Lines](https://github.com/HyopeR/react-nat[...])**
```xml
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
```

### Android Background Setup
**Optional**<br/>
The instructions in this section are optional.<br/>
To use location services in the background on Android, **ACCESS_BACKGROUND_LOCATION**, **FOREGROUND_SERVICE**, and **FOREGROUND_SERVICE_LOCATION** permissions must be added to the AndroidManifest.[...]
```xml
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_LOCATION" />
```

On Android, the foreground service includes a notification. This notification prevents the system from forcibly stopping the started foreground service. You can control this behavior with "notificationMandatory" and the `notification` configuration (icon/title/content/ongoing). For Android 13+ the POST_NOTIFICATIONS permission may be required to show notifications.
```xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

### Android: Notification & POST_NOTIFICATIONS

When using background tracking with a foreground service, Android will show a notification. The library accepts the `notification` object in `RNLocation.configure(...)` with these keys: `icon`, `title`, `content`, and `ongoing`.

- Required Android permissions (example):
```xml
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_LOCATION" />
<!-- Required if using notification features on Android 13+ -->
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

- Service declaration (must be in AndroidManifest):
```xml
<service
    android:name="com.hyoper.location.RNLocationForeground"
    android:exported="false"
    android:foregroundServiceType="location" />
```

- Control notification persistence:
  - `notification.ongoing: true` (default) — notification is explicitly non-dismissible while the service runs.
  - `notification.ongoing: false` — notification may be dismissible (behavior can vary by device/OEM).

- After changing `notification` fields at runtime, call `RNLocation.configureWithRestart(...)` or restart subscriptions so native picks up the new values.

On Android, location services are run through the ForegroundService while the app is in the background. This service must be defined in AndroidManifest.xml. **[See Lines](https://github.com/HyopeR[...])**
```xml
<service 
    android:name="com.hyoper.location.RNLocationForeground"
    android:exported="false"
    android:foregroundServiceType="location" />
```

## 🍏 Ios Setup
IOS requires permission declarations and modes in Info.plist.

### Ios Foreground Setup
**Required**<br/>
The instructions in this section are mandatory.<br/>
To use location services on IOS, **NSLocationWhenInUseUsageDescription** permission must be added to the Info.plist. **[See Lines](https://github.com/HyopeR/react-native-location/blob/master/examp[...])**
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>Location access when the app is in the foreground.</string>
```

### Ios Background Setup
**Optional**<br/>
The instructions in this section are optional.<br/>
To use location services in the background on IOS, **NSLocationAlwaysAndWhenInUseUsageDescription** permission must be added to the Info.plist. **[See Lines](https://github.com/HyopeR/react-native[...])**
```xml
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>Location access when the app is in the foreground and background.</string>
```

On IOS, you can set the notification behavior with "notificationMandatory" when using location in the background, but no setup is required.<br/>

On IOS, if location services are to be used while the app is running in the background, this behavior must be defined as background modes in Info.plist. **[See Lines](https://github.com/HyopeR/rea[...])**
```xml
<key>UIBackgroundModes</key>
<array>
    <string>location</string>
</array>
```

## 🔼 Expo Setup
There is a built-in plugin for **Expo** installations.<br/>
Simply update the **app.json** **plugins** section in the Expo project.<br/>
```json5
{
  // ...others configs
  "plugins": [
    // ...other plugins
    [
      "@hyoper/rn-location",
      {
        // (Optional) Set to true if you only use location in the background.
        // This setting adds additional permissions for Android and iOS.
        "background": true,
        // (Optional) Updates the "Location Always" permission message for iOS.
        "backgroundDescription": "Required to use location information while the app is open in the background.",
        // (Optional) Updates the "Location When-In-Use" permission message for iOS.
        "foregroundDescription": "Required to use location information while the app is in use."
      }
    ]
  ]
}
```
