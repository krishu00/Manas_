import messaging from '@react-native-firebase/messaging';
import { navigate } from './NavigationService';

export function initFCMListeners() {
  // Foreground
  const unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
    console.log('📩 Foreground Notification:', remoteMessage);
    handleNavigation(remoteMessage.data);
  });

  // Background (when tapped)
  const unsubscribeOnOpened = messaging().onNotificationOpenedApp(
    remoteMessage => {
      console.log('📩 Opened from background:', remoteMessage);
      handleNavigation(remoteMessage.data);
    },
  );

  // Quit (when tapped after app closed)
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        console.log('📩 Opened from quit state:', remoteMessage);
        handleNavigation(remoteMessage.data);
      }
    });

  return () => {
    unsubscribeOnMessage();
    unsubscribeOnOpened();
  };
}

// function handleNavigation(data) {
//   if (!data) return;
//     const defaultTab = data.approverId ? 'Approvals' : 'My Requests';

//   if (data.targetScreen === 'RequestScreen') {
//     navigate('Dashboard', {
//       screen: 'Request',
//       params: {
//         requestId: data.requestId,
//         defaultTab, 
//       },
//     });
//   }
// }
function handleNavigation(data) {
  if (!data) return;
console.log("data???????", data);

  // const defaultTab = data.approverId ? 'Approvals' : 'My Requests';

  if (data.targetScreen === 'RequestScreen') {
   navigate('Dashboard', {
  screen: 'Request',
  params: {
    selectedRequestId: data.requestId,
    defaultTab: data.approverId ? 'Approvals' : 'My Requests',
  },
});

  }
}

