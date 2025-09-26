// import React, { useState, useEffect } from 'react';
// import { View, StyleSheet, Alert } from 'react-native';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import Header from './Header/Header';
// import HomeScreen from './Screens/HomeScreen';
// import RequestScreen from './Screens/RequestsScreen';
// import UserDetailsScreen from './UserDetailsScreen/UserDetailsScreen';
// import Icon from 'react-native-vector-icons/FontAwesome';
// import { TouchableWithoutFeedback } from 'react-native';
// import {
//   initSocket,
//   getSocket,
// } from '../components/socketService/socketService';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const Tab = createBottomTabNavigator();

// const Dashboard = ({ onLogoutSuccess }) => {
//   const [closeDropdownFlag, setCloseDropdownFlag] = useState(false);

//   const handleOutsidePress = () => setCloseDropdownFlag(true);
//   useEffect(() => {
//     const setupSocket = async () => {
//       const employeeId = await AsyncStorage.getItem('employeeId');
//       if (!employeeId) {
//         console.warn('⚠️ employeeId not found in AsyncStorage');
//         return;
//       }

//       const socket = initSocket(employeeId);

//       // Example: test emit
//       socket?.emit('test_event', { message: 'Hello from client' });
//     };

//     setupSocket();

//     return () => {
//       const socket = getSocket();
//       if (socket) {
//         console.log('🛑 Disconnecting socket on cleanup');
//         socket.disconnect();
//       }
//     };
//   }, []);

//   return (
//     <TouchableWithoutFeedback onPress={handleOutsidePress}>
//       <View style={styles.container}>
//         <Header
//           onLogoutSuccess={onLogoutSuccess}
//           closeDropdown={flag => setCloseDropdownFlag(flag)}
//           closeDropdownFlag={closeDropdownFlag}
//         />
//         <Tab.Navigator
//           screenOptions={({ route }) => ({
//             headerShown: false,
//             tabBarIcon: ({ focused }) => {
//               let iconName;
//               switch (route.name) {
//                 case 'Home':
//                   iconName = 'home';
//                   break;
//                 case 'Request':
//                   iconName = 'envelope';
//                   break;
//                 case 'UserProfile':
//                   iconName = 'list';
//                   break;
//                 default:
//                   iconName = 'home';
//               }
//               const color = focused ? '#6a9689' : 'darkgray';
//               return <Icon name={iconName} color={color} size={30} />;
//             },
//             tabBarActiveTintColor: '#6a9689',
//             tabBarInactiveTintColor: 'darkgray',
//             tabBarStyle: { height: 70, paddingBottom: 2, paddingTop: 5 },
//           })}
//         >
//           <Tab.Screen name="Home" component={HomeScreen} />
//           <Tab.Screen name="Request" component={RequestScreen} />
//           <Tab.Screen name="UserProfile" component={UserDetailsScreen} />
//         </Tab.Navigator>
//       </View>
//     </TouchableWithoutFeedback>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1 },
// });

// export default Dashboard;

// Dashboard.js
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Header from './Header/Header';
import HomeScreen from './Screens/HomeScreen';
import FeedsScreen from './Screens/FeedsScreen';
import RequestScreen from './Screens/RequestsScreen';
import MoreScreen from './Screens/MoreScreens';
import UserDetailsScreen from './UserDetailsScreen/UserDetailsScreen';
import Icon from 'react-native-vector-icons/FontAwesome';
import { TouchableWithoutFeedback, Keyboard } from 'react-native';

const Tab = createBottomTabNavigator();

const Dashboard = ({ onLogoutSuccess }) => {
  const [closeDropdownFlag, setCloseDropdownFlag] = useState(false);

  const handleOutsidePress = () => {
    setCloseDropdownFlag(true); // triggers header to close dropdown
  };

  return (
    <TouchableWithoutFeedback onPress={handleOutsidePress}>
      <View style={styles.container}>
        <Header
          onLogoutSuccess={onLogoutSuccess}
          closeDropdown={flag => setCloseDropdownFlag(flag)}
          closeDropdownFlag={closeDropdownFlag} // send flag to header
        />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarIcon: ({ focused }) => {
              let iconName;

              switch (route.name) {
                case 'Home':
                  iconName = 'home';
                  break;
                // case 'Feeds':
                //   iconName = 'inbox';
                //   break;
                case 'Request':
                  iconName = 'envelope';
                  break;
                // case 'More':
                //   iconName = 'list';
                //   break;
                case 'UserProfile':
                  iconName = 'list';
                  break;
                default:
                  iconName = 'home';
              }

              const color = focused ? '#6a9689' : 'darkgray';
              return <Icon name={iconName} color={color} size={30} />;
            },
            tabBarActiveTintColor: '#6a9689',
            tabBarInactiveTintColor: 'darkgray',
            tabBarStyle: { height: 70, paddingBottom: 2, paddingTop: 5 },
          })}
        >
          <Tab.Screen name="Home" component={HomeScreen} />
          {/* <Tab.Screen name="Feeds" component={FeedsScreen} /> */}
          <Tab.Screen name="Request" component={RequestScreen} />
          {/* <Tab.Screen name="More" component={MoreScreen} /> */}
          <Tab.Screen name="UserProfile" component={UserDetailsScreen} />
        </Tab.Navigator>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Dashboard;
