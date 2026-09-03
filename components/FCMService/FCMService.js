// import messaging from '@react-native-firebase/messaging';

// export const requestUserPermission = async () => {
//   const authStatus = await messaging().requestPermission();
//   const enabled =
//     authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
//     authStatus === messaging.AuthorizationStatus.PROVISIONAL;
//   return enabled;
// };

import messaging from '@react-native-firebase/messaging';

export const requestUserPermission = async () => {
  try {
    const authStatus = await messaging().requestPermission();

    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    console.log('🔔 Notification permission:', authStatus);
    console.log('🔔 Notification enabled:', enabled);

    return enabled;
  } catch (error) {
    console.error('❌ Notification permission error:', error);
    return false;
  }
};

export const getFCMToken = async () => {
  try {
    // IMPORTANT for iOS
    await messaging().registerDeviceForRemoteMessages();

    console.log('✅ Device registered for remote messages');

    const token = await messaging().getToken();

    console.log('🔥 FCM TOKEN:', token);

    return token;
  } catch (error) {
    console.error('❌ FCM token error:', error);
    return null;
  }
};