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
import React, { useState, useRef, useEffect, createContext, useContext } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { createBottomTabNavigator, useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useNavigationState } from '@react-navigation/native';
import Header from './Header/Header';
import HomeScreen from './Screens/HomeScreen';
import FeedsScreen from './Screens/FeedsScreen';
import RequestScreen from './Screens/RequestsScreen';
import MoreScreen from './Screens/MoreScreens';
import TripScreen from './Screens/TripScreen';
import UserDetailsScreen from './UserDetailsScreen/UserDetailsScreen';
import Icon from 'react-native-vector-icons/FontAwesome';
import { TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MyPayslip from './PaySlip/MyPayslip';

const Tab = createBottomTabNavigator();

// Create Navigation Context
export const TabNavigationContext = createContext(null);

// Helper component that captures the proper TabNavigator navigation
const HomeScreenWrapper = ({ setTabNavigation }) => {
  const navigation = useNavigation();
  
  useEffect(() => {
    console.log('🟢 HomeScreenWrapper - capturing TabNavigator navigation');
    setTabNavigation(navigation);
  }, []);
  
  return <HomeScreen />;
};

const Dashboard = ({ onLogoutSuccess }) => {
  const [closeDropdownFlag, setCloseDropdownFlag] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [tabNavigation, setTabNavigation] = useState(null);
  
  const navigation = useNavigation();
  const currentTabIndex = useNavigationState(state => state.index);
  
  const handleOutsidePress = () => {
    setCloseDropdownFlag(true);
  };

  // Reset dropdown when tab changes
  useEffect(() => {
    setDropdownVisible(false);
    setCloseDropdownFlag(false);
  }, [currentTabIndex]);

  const handleNavigateToSalary = () => {
    console.log('🟡 handleNavigateToSalary called');
    console.log('🟡 tabNavigation exists:', !!tabNavigation);
    if (tabNavigation) {
      console.log('🟡 Calling navigate to Salary');
      tabNavigation.navigate('Salary');
    } else {
      console.log('🟡 ERROR: tabNavigation is null/undefined');
    }
  };
  const handleNavigateToProfile = () => {
    console.log('🟡 handleNavigateToProfile called');
    console.log('🟡 tabNavigation exists:', !!tabNavigation);
    if (tabNavigation) {
      console.log('🟡 Calling navigate to Profile');
      setDropdownVisible(false); // Close dropdown before navigating
      tabNavigation.navigate('UserProfile');
    } else {
      console.log('🟡 ERROR: tabNavigation is null/undefined');
    }
  };

  const insets = useSafeAreaInsets();

  return (
     <View style={{ flex: 1 }}>
       {dropdownVisible && (
         <TouchableWithoutFeedback onPress={handleOutsidePress}>
           <View style={styles.globalOverlay} />
         </TouchableWithoutFeedback>
       )}
       <TabNavigationContext.Provider value={{ navigation: tabNavigation, setNavigation: setTabNavigation }}>
         <View style={styles.container}>
          <View style={styles.headerWrapper}>
            <Header
              onLogoutSuccess={onLogoutSuccess}
              closeDropdown={flag => setCloseDropdownFlag(flag)}
              closeDropdownFlag={closeDropdownFlag}
              onNavigateToSalary={handleNavigateToSalary}
              onNavigateToProfile={handleNavigateToProfile}
              onDropdownVisibleChange={setDropdownVisible}
            />
          </View>
         
          <View style={styles.tabsWrapper}>
            <Tab.Navigator
              screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused }) => {
                  let iconName;

                  switch (route.name) {
                    case 'Home':
                      iconName = 'home';
                      break;
                    case 'Request':
                      iconName = 'envelope';
                      break;
                    case 'Trips':
                      iconName = 'location-arrow';
                      break;
                    case 'UserProfile':
                      iconName = 'user';
                      break;
                  
                  }

                  const color = focused ? '#6a9689' : 'darkgray';
                  return <Icon name={iconName} color={color} size={30} />;
                },
                tabBarActiveTintColor: '#6a9689',
                tabBarInactiveTintColor: 'darkgray',
                tabBarStyle: [
                  {
                    height: 55 + insets.bottom,
                    paddingBottom: 10 + insets.bottom,
                    paddingTop: 5,
                  },
                ],
              })}
            >
              <Tab.Screen name="Home">
                {props => <HomeScreenWrapper {...props} setTabNavigation={setTabNavigation} />}
              </Tab.Screen>
              <Tab.Screen
                name="Request"
                component={RequestScreen}
                initialParams={{
                  selectedRequestId: null,
                  defaultTab: 'My Requests',
                }}
              />
              <Tab.Screen
                name="Trips"
                component={TripScreen}
              />
              <Tab.Screen
                name="UserProfile"
                component={UserDetailsScreen}
              />
              {/* Salary screen kept but hidden from tab bar */}
              <Tab.Screen
  name="Salary"
  component={MyPayslip}
  options={{
    headerShown: false,
    tabBarItemStyle: { display: "none" }, // ✅ IMPORTANT
  }}
/>
              
            </Tab.Navigator>
          </View>
          
        </View>
        
        {/* Hidden Salary Screen */}
      </TabNavigationContext.Provider>
  </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
   headerWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,

    zIndex: 9999,
    elevation: 20,
  },
  globalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    zIndex: 5000,
  },

  tabsWrapper: {
    flex: 1,
    marginTop: 80, // header height
  },
});

export default Dashboard;
