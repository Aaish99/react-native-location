import React, {useCallback, useEffect, useState} from 'react';
import {Text, View} from 'react-native';
import {
  CONFIGURE_OPTIONS,
  ConfigureOptions,
  Location,
  OnChangeEvent,
  OnErrorEvent,
  RNLocation,
} from '@hyoper/rn-location';
import notifee, {AndroidImportance} from 'react-native-notify-kit';
import {Screen} from '../../commons/Screen';
import {Button} from '../../commons/Button';
import {CardLocation} from '../../commons/CardLocation';
import {openAlert, openSettings} from '../../utils';
import {PageStyle} from '../styles';
import {PageProps} from '../types';

const OPTIONS: ConfigureOptions = {
  ...CONFIGURE_OPTIONS,
  allowsBackgroundLocationUpdates: true,
  distanceFilter: 0,
  notificationMandatory: true, // ← Changed to true (required for reliable background)
  notification: {
    icon: 'ic_launcher',
    title: 'Location Service Running',
    content: 'Location is being used by the app.',
  },
  android: {
    priority: 'highAccuracy',
    provider: 'auto',
    interval: 2000,
    minWaitTime: 1000,
    maxWaitTime: 2000,
  },
  ios: {
    desiredAccuracy: 'best',
    activityType: 'other',
    headingFilter: 0,
    headingOrientation: 'portrait',
    pausesLocationUpdatesAutomatically: false,
    showsBackgroundLocationIndicator: true, // ← Show indicator on iOS
  },
};

// Notification channel ID
const CHANNEL_ID = 'background-location';
const NOTIFICATION_ID = 'background-location-status';

export const BackgroundPage = ({back}: PageProps) => {
  const [location, setLocation] = useState<Location | null>(null);
  const [locationAllow, setLocationAllow] = useState(false);
  const [locationTracking, setLocationTracking] = useState(false);

  // Create notification channel on mount (Android only)
  useEffect(() => {
    const createChannel = async () => {
      await notifee.createChannel({
        id: CHANNEL_ID,
        name: 'Background Location',
        importance: AndroidImportance.LOW,
      });
    };
    createChannel();
  }, []);

  const displayNotification = async (loc?: Location) => {
    await notifee.displayNotification({
      id: NOTIFICATION_ID,
      title: '📍 Background Location Active',
      body: loc
        ? `Lat: ${loc.latitude.toFixed(6)} | Lng: ${loc.longitude.toFixed(6)}`
        : 'Tracking your location...',
      android: {
        channelId: CHANNEL_ID,
        importance: AndroidImportance.LOW,
        smallIcon: 'ic_stat_notification', // Use your app's notification icon
        ongoing: true,        // ← Cannot be swiped away
        autoCancel: false,    // ← Stays until explicitly cancelled
        pressAction: {
          id: 'open-app',
        },
      },
    });
  };

  const updateNotification = async (loc: Location) => {
    await notifee.displayNotification({
      id: NOTIFICATION_ID, // Same ID = updates existing
      title: '📍 Background Location Active',
      body: `Lat: ${loc.latitude.toFixed(6)} | Lng: ${loc.longitude.toFixed(6)}`,
      android: {
        channelId: CHANNEL_ID,
        importance: AndroidImportance.LOW,
        smallIcon: 'ic_stat_notification',
        ongoing: true,
        autoCancel: false,
      },
    });
  };

  const clearNotification = async () => {
    await notifee.cancelNotification(NOTIFICATION_ID);
  };

  const onChange = useCallback<OnChangeEvent>(locations => {
    if (locations.length > 0) {
      const item = locations[0];
      setLocation(item);
      console.log(item);
      // Update notification with live coordinates
      updateNotification(item);
    }
  }, []);

  const onError = useCallback<OnErrorEvent>(error => {
    console.log(error);
    switch (error.code) {
      case 'ERROR_SETUP':
        break;
      case 'ERROR_PROVIDER':
        break;
      case 'ERROR_PERMISSION':
        break;
      case 'ERROR_PERMISSION_ALWAYS':
        break;
      case 'ERROR_PERMISSION_NOTIFICATION':
        break;
      case 'ERROR_UNKNOWN':
      default:
        break;
    }
  }, []);

  useEffect(() => {
    RNLocation.configure(OPTIONS);
    RNLocation.permission
      .checkLocationAlways()
      .then(status => {
        console.log('check status', status);
        setLocationAllow(status === 'granted');
      })
      .catch(error => {
        console.log('check', error);
        setLocationAllow(false);
      });
  }, []);

  useEffect(() => {
    if (!locationTracking) return;

    // Show initial notification when tracking starts
    displayNotification();

    const subscription = RNLocation.subscribe();
    subscription.onChange(onChange).onError(onError);

    return () => {
      subscription && subscription.unsubscribe();
      clearNotification(); // Clean up notification when tracking stops
    };
  }, [locationTracking, onChange, onError]);

  const start = () => {
    setLocationTracking(true);
  };

  const stop = () => {
    setLocationTracking(false);
  };

  const request = async () => {
    try {
      const status = await RNLocation.permission.requestLocation();
      console.log('request status', status);

      if (status === 'blocked') openAlert('Location Permission');
      if (status !== 'granted') {
        setLocationAllow(false);
        return;
      }

      const statusAlways = await RNLocation.permission.requestLocationAlways();
      console.log('request status always', statusAlways);

      if (statusAlways === 'blocked') openAlert('Location Permission');
      if (statusAlways !== 'granted') {
        setLocationAllow(false);
        return;
      }

      setLocationAllow(true);
    } catch (err) {
      console.log('request', err);
    }
  };

  return (
    <Screen>
      <Screen.Header
        left={'Back'}
        leftProps={{onPress: back}}
        right={'Config'}
        rightProps={{onPress: openSettings}}>
        <Screen.Title>Background Location</Screen.Title>
        <Screen.Subtitle>Tracking</Screen.Subtitle>
      </Screen.Header>

      <Screen.Content style={PageStyle.root}>
        <View style={PageStyle.body}>
          <Text style={PageStyle.description}>
            To track the user's location when the app is in the background, the
            "ALWAYS" permission is required.
          </Text>

          <Button
            title={'Request Permission'}
            onPress={request}
            style={PageStyle.button}
          />

          {!locationTracking ? (
            <Button
              disabled={!locationAllow}
              title={'Start'}
              onPress={start}
              style={PageStyle.button}
            />
          ) : (
            <Button
              disabled={!locationAllow}
              title={'Stop'}
              onPress={stop}
              style={PageStyle.button}
            />
          )}

          {locationTracking && location && (
            <CardLocation location={location} style={{marginTop: 8}} />
          )}
        </View>
      </Screen.Content>
    </Screen>
  );
};