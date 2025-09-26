/**
 * @format
 */

import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

import Dashboard from './components/Dashboard';
import LoginScreen from './components/Login/LoginScreen';
import FirstTimeLogin from './components/Login/FirstTimeLogin';
import Popup from './components/Popup/Popup';
import messaging from '@react-native-firebase/messaging';
import { requestUserPermission } from './components/FCMService/FCMService';

AppRegistry.registerComponent(appName, () => App);

const Stack = createNativeStackNavigator();

// Auto-logout settings
// 36 hours example
// const LOGOUT_HOURS = 36;
// const LOGOUT_MILLISECONDS = LOGOUT_HOURS * 60 * 60 * 1000;

// For testing, 60 minutes
const LOGOUT_MINUTES = 60;
const LOGOUT_MILLISECONDS = LOGOUT_MINUTES * 60 * 1000;

const AppMain = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);

  // Popup state
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupTitle, setPopupTitle] = useState('');
  const [popupMessage, setPopupMessage] = useState('');

  const [fcmToken, setFcmToken] = useState('');

  const showPopup = (title, message) => {
    setPopupTitle(title);
    setPopupMessage(message);
    setPopupVisible(true);
  };

  // Check authentication on app startup
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const loginTime = await AsyncStorage.getItem('loginTime');

        if (token && loginTime) {
          const now = Date.now();
          const diff = now - parseInt(loginTime, 10);

          if (diff > LOGOUT_MILLISECONDS) {
            await handleLogout();
            showPopup(
              'Session expired',
              'You have been logged out due to inactivity.',
            );
          } else {
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    setupFCM();

    // Listen to foreground messages
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('FCM Foreground message:', remoteMessage);
      showPopup(
        remoteMessage.notification?.title || 'Notification',
        remoteMessage.notification?.body || '',
      );
    });

    return unsubscribe; // cleanup
  }, []);
  useEffect(() => {
    // When app is opened from a notification
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Notification caused app to open:', remoteMessage);
    });

    // When app is opened from quit state
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log(
            'Notification caused app to open from quit:',
            remoteMessage,
          );
        }
      });
  }, []);

  // Auto-logout timeout
  useEffect(() => {
    let timeout;

    const setupAutoLogout = async () => {
      const loginTime = await AsyncStorage.getItem('loginTime');
      if (!loginTime) return;

      const now = Date.now();
      const diff = parseInt(loginTime, 10) + LOGOUT_MILLISECONDS - now;

      if (diff <= 0) {
        await handleLogout();
        showPopup(
          'Session expired',
          'You have been logged out due to inactivity.',
        );
      } else {
        timeout = setTimeout(async () => {
          await handleLogout();
          showPopup(
            'Session expired',
            'You have been logged out due to inactivity.',
          );
        }, diff);
      }
    };

    if (isAuthenticated) setupAutoLogout();
    return () => timeout && clearTimeout(timeout);
  }, [isAuthenticated]);

const setupFCM = async () => {
  const enabled = await requestUserPermission();
  if (enabled) {
    console.log('FCM Permission granted');
    const token = await messaging().getToken();
    console.log('FCM Token:', token);
    setFcmToken(token); // ✅ save to state
  } else {
    console.log('FCM Permission denied');
  }
};

  // Handle login success
  const handleLoginSuccess = async token => {
    setLoginLoading(true);
    try {
      const now = Date.now();
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('loginTime', now.toString());
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error saving token:', error);
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('loginTime');
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error removing token:', error);
    }
  };

  // Render loading screen
  const renderLoading = (color = '#0000ff') => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={color} />
    </View>
  );

  if (loading) return renderLoading();
  if (loginLoading) return renderLoading('#00503D');

  return (
    <>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isAuthenticated ? (
            <Stack.Screen name="Dashboard">
              {props => <Dashboard {...props} onLogoutSuccess={handleLogout} />}
            </Stack.Screen>
          ) : (
            <>
              <Stack.Screen name="Login">
                {props => (
                  <LoginScreen {...props}    fcmToken={fcmToken} onLoginSuccess={handleLoginSuccess} />
                )}
              </Stack.Screen>
              <Stack.Screen name="FirstTimeLogin" component={FirstTimeLogin} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>

      {popupVisible && (
        <Popup
          title={popupTitle}
          message={popupMessage}
          onClose={() => setPopupVisible(false)}
        />
      )}
    </>
  );
};

export default AppMain;
