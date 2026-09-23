/**
 * @format
 */

import React, { useEffect, useState, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getAccountType,
  clearGuestAccount,
  clearEmployeeAccount,
} from './src/utils/storage';
import Dashboard from './components/Dashboard';
import LoginScreen from './components/Login/LoginScreen';
import FirstTimeLogin from './components/Login/FirstTimeLogin';
import GuestLoginScreen from './components/Login/GuestLoginScreen';
import Popup from './components/Popup/Popup';
import PublicNavigator from './components/PublicNavigator';

// 👇 TEMPORARILY DISABLED FIREBASE IMPORTS 👇
import {
  requestUserPermission,
  getFCMToken,
} from './components/FCMService/FCMService';
import { initFCMListeners } from './src/utils/NotificationService';
import { navigationRef } from './src/utils/NavigationService';

const Stack = createNativeStackNavigator();

// Auto-logout settings
const LOGOUT_HOURS = 36;
const LOGOUT_MILLISECONDS = LOGOUT_HOURS * 60 * 60 * 1000;

const AppMain = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [accountType, setAccountType] = useState(null);

  const [popupVisible, setPopupVisible] = useState(false);
  const [popupTitle, setPopupTitle] = useState('');
  const [popupMessage, setPopupMessage] = useState('');

  const [fcmToken, setFcmToken] = useState('');

  // Show popup helper
  const showPopup = useCallback((title, message) => {
    setPopupTitle(title);
    setPopupMessage(message);
    setPopupVisible(true);
  }, []);

  // ======= Authentication check =======
  // useEffect(() => {
  //   const checkAuth = async () => {
  //     try {
  //       const token = await AsyncStorage.getItem('userToken');
  //       const loginTime = await AsyncStorage.getItem('loginTime');

  //       if (token && loginTime) {
  //         const now = Date.now();
  //         const diff = now - parseInt(loginTime, 10);

  //         if (diff > LOGOUT_MILLISECONDS) {
  //           await handleLogout();
  //           showPopup(
  //             'Session expired',
  //             'You have been logged out due to inactivity.',
  //           );
  //         } else {
  //           setIsAuthenticated(true);
  //         }
  //       }
  //     } catch (error) {
  //       console.error('Error checking auth status:', error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   checkAuth();
  // }, [showPopup]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedAccountType = await getAccountType();

        const employeeToken = await AsyncStorage.getItem('userToken');
        const employeeLoginTime = await AsyncStorage.getItem('loginTime');

        const guestToken = await AsyncStorage.getItem('guestToken');
        const guestLoginTime = await AsyncStorage.getItem('guestLoginTime');

        // =================================================
        // EMPLOYEE SESSION
        // =================================================

        if (
          (storedAccountType === 'employee' || !storedAccountType) &&
          employeeToken &&
          employeeLoginTime
        ) {
          const now = Date.now();
          const diff = now - parseInt(employeeLoginTime, 10);

          if (diff > LOGOUT_MILLISECONDS) {

            await clearEmployeeAccount();

            setAccountType(null);
            setIsAuthenticated(false);

            showPopup(
              'Session expired',
              'You have been logged out due to inactivity.',
            );
          } else {

            setAccountType('employee');
            setIsAuthenticated(true);
          }

          return;
        }

        // =================================================
        // GUEST SESSION
        // =================================================

        if (storedAccountType === 'guest' && guestToken && guestLoginTime) {

          setAccountType('guest');
          setIsAuthenticated(true);

          return;
        }

        // =================================================
        // BACKWARD COMPATIBILITY
        //
        // Existing users may have userToken but no
        // accountType because they were logged in before
        // this new architecture was introduced.
        // =================================================

        if (employeeToken && employeeLoginTime) {

          setAccountType('employee');
          setIsAuthenticated(true);

          return;
        }

        // =================================================
        // NO SESSION
        // =================================================

        setAccountType(null);
        setIsAuthenticated(false);
      } catch (error) {
        console.error('Error checking auth status:', error);

        setAccountType(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [showPopup]);

  // 👇 TEMPORARILY DISABLED FIREBASE FCM SETUP 👇
  // useEffect(() => {

  //   const setupFCMToken = async () => {
  //     const enabled = await requestUserPermission();
  //     if (enabled) {
  //       try {
  //         const token = await messaging().getToken();
  //         setFcmToken(token);
  //         console.log('FCM Token:', token);
  //       } catch (error) {
  //         console.error('Error getting FCM token:', error);
  //       }
  //     } else {
  //       console.log('FCM Permission denied');
  //     }
  //   };

  //   setupFCMToken();
  //   const unsubscribe = initFCMListeners(); // handles foreground + background + quit
  //   return () => unsubscribe && unsubscribe();

  //   console.log("Firebase is temporarily disabled. Skipping FCM setup.");
  // }, []);

  useEffect(() => {
    let unsubscribe;

    const setupFCM = async () => {
      try {

        const permissionGranted = await requestUserPermission();

        if (!permissionGranted) {
          console.log('❌ FCM permission denied');
          return;
        }

        const token = await getFCMToken();

        if (token) {
          setFcmToken(token);
        }

        unsubscribe = initFCMListeners();

      } catch (error) {
        console.error('❌ FCM setup failed:', error);
      }
    };

    setupFCM();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // ======= Auto logout =======
  useEffect(() => {
    let timeout;

    const setupAutoLogout = async () => {
      const loginTime = await AsyncStorage.getItem('loginTime');
      if (!loginTime) return;

      const now = Date.now();
      const remaining = parseInt(loginTime, 10) + LOGOUT_MILLISECONDS - now;

      if (remaining <= 0) {
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
        }, remaining);
      }
    };

    // if (isAuthenticated) setupAutoLogout();
    if (isAuthenticated && accountType === 'employee') {
      setupAutoLogout();
    }
    return () => timeout && clearTimeout(timeout);
  }, [isAuthenticated, showPopup, accountType]);

  // ======= Login & Logout handlers =======
  // const handleLoginSuccess = async token => {
  //   setLoginLoading(true);

  //   try {
  //     const now = Date.now();

  //     await AsyncStorage.setItem('userToken', token);
  //     await AsyncStorage.setItem('loginTime', now.toString());

  //     setIsAuthenticated(true);

  //     navigationRef.current?.reset({
  //       index: 0,
  //       routes: [{ name: 'Dashboard' }],
  //     });
  //   } catch (error) {
  //     console.error('Error saving token:', error);
  //   } finally {
  //     setLoginLoading(false);
  //   }
  // };
  const handleLoginSuccess = async token => {
    setLoginLoading(true);

    try {
      const now = Date.now();

      // ============================================
      // Clear any previous Guest session
      // ============================================

      await clearGuestAccount();

      // ============================================
      // Existing Employee session
      // ============================================

      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('loginTime', now.toString());

      // ============================================
      // Mark active account as Employee
      // ============================================

      await AsyncStorage.setItem('accountType', 'employee');

      setAccountType('employee');
      setIsAuthenticated(true);

      navigationRef.current?.reset({
        index: 0,
        routes: [{ name: 'Dashboard' }],
      });
    } catch (error) {
      console.error('Error saving Employee session:', error);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {

      // await AsyncStorage.multiRemove([
      //   'userToken',
      //   'employee_id',
      //   'employee_name',
      //   'company_Code',
      //   'loginTime',
      // ]);
      await clearEmployeeAccount();
      setAccountType(null);

      setIsAuthenticated(false);


      if (navigationRef.current?.isReady()) {
        navigationRef.current.reset({
          index: 0,
          routes: [{ name: 'PublicNavigator' }],
        });

      } else {
        console.log('Navigation is not ready');
      }

    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // ======= Render Loading =======
  const renderLoading = (color = '#0000ff') => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={color} />
    </View>
  );

  if (loading) return renderLoading();
  if (loginLoading) return renderLoading('#00503D');

  return (
    <>
      <NavigationContainer ref={navigationRef}>
        {/* <Stack.Navigator
          screenOptions={{ headerShown: false }}
          initialRouteName={isAuthenticated ? 'Dashboard' : 'PublicNavigator'}
        > */}
        <Stack.Navigator
          screenOptions={{ headerShown: false }}
          initialRouteName={
            isAuthenticated && accountType === 'employee'
              ? 'Dashboard'
              : 'PublicNavigator'
          }
        >
          <Stack.Screen name="PublicNavigator" component={PublicNavigator} />

          <Stack.Screen name="Login">
            {props => (
              <LoginScreen
                {...props}
                fcmToken={fcmToken}
                onLoginSuccess={handleLoginSuccess}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="GuestLogin" component={GuestLoginScreen} />

          <Stack.Screen name="FirstTimeLogin" component={FirstTimeLogin} />

          <Stack.Screen name="Dashboard">
            {props => <Dashboard {...props} onLogoutSuccess={handleLogout} />}
          </Stack.Screen>
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

// 💡 EXPORT APPMAIN DIRECTLY AS THE DEFAULT EXPORT SO INDEX.JS CAN WEAVE IT IN CLEANLY
export default AppMain;
