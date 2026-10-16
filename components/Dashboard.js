import React, {
  useState,
  useEffect,
  createContext,
  useContext,
} from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import Header from './Header/Header';
import HomeScreen from './Screens/HomeScreen';
import RequestScreen from './Screens/RequestsScreen';
import UserDetailsScreen from './UserDetailsScreen/UserDetailsScreen';
import Icon from 'react-native-vector-icons/FontAwesome';
import { TouchableWithoutFeedback } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MyPayslip from './PaySlip/MyPayslip';
import BlogFeedScreen from './Screens/Blog/BlogFeedScreen';
import CreateBlogScreen from './Screens/Blog/CreateBlogScreen';

const Tab = createBottomTabNavigator();

const createTabIconRenderer = name => ({ focused }) => (
  <Icon
    name={name}
    color={focused ? '#6a9689' : 'darkgray'}
    size={30}
  />
);

const tabIconRenderers = {
  Home: createTabIconRenderer('home'),
  Request: createTabIconRenderer('envelope'),
  Blog: createTabIconRenderer('newspaper-o'),
  UserProfile: createTabIconRenderer('user'),
};

const createTabScreenOptions = insets => ({ route }) => ({
  headerShown: false,
  tabBarIcon: tabIconRenderers[route.name],
  tabBarActiveTintColor: '#6a9689',
  tabBarInactiveTintColor: 'darkgray',
  tabBarStyle: [
    {
      height: 55 + insets.bottom,
      paddingBottom: 10 + insets.bottom,
      paddingTop: 5,
    },
  ],
});

// Create Navigation Context
export const TabNavigationContext = createContext(null);

// Helper component that captures the proper TabNavigator navigation
const HomeScreenWrapper = () => {
  const {
    setNavigation,
    setDropdownVisible,
    setCloseDropdownFlag,
  } = useContext(TabNavigationContext);
  const navigation = useNavigation();
  const currentTabIndex = useNavigationState(state => state.index);

  useEffect(() => {
    console.log('🟢 HomeScreenWrapper - capturing TabNavigator navigation');
    setNavigation(navigation);
  }, [navigation, setNavigation]);

  useEffect(() => {
    setDropdownVisible(false);
    setCloseDropdownFlag(false);
  }, [currentTabIndex, setCloseDropdownFlag, setDropdownVisible]);

  return <HomeScreen />;
};

const BlogScreenWrapper = props => (
  <BlogFeedScreen {...props} embedded />
);

const Dashboard = ({ onLogoutSuccess }) => {
  const [closeDropdownFlag, setCloseDropdownFlag] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [tabNavigation, setTabNavigation] = useState(null);

  const handleOutsidePress = () => {
    setCloseDropdownFlag(true);
  };

  const handleNavigateToSalary = () => {
    if (tabNavigation) {
      tabNavigation.navigate('Salary');
    } else {
      console.log('🟡 ERROR: tabNavigation is null/undefined');
    }
  };
  const handleNavigateToProfile = () => {
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
    <View style={styles.root}>
      {dropdownVisible && (
        <TouchableWithoutFeedback onPress={handleOutsidePress}>
          <View style={styles.globalOverlay} />
        </TouchableWithoutFeedback>
      )}
      <TabNavigationContext.Provider
        value={{
          navigation: tabNavigation,
          setNavigation: setTabNavigation,
          setDropdownVisible,
          setCloseDropdownFlag,
        }}
      >
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
              screenOptions={createTabScreenOptions(insets)}
            >
              <Tab.Screen
                name="Home"
                component={HomeScreenWrapper}
              />
              <Tab.Screen
                name="Request"
                component={RequestScreen}
                initialParams={{
                  selectedRequestId: null,
                  defaultTab: 'My Requests',
                }}
              />
              {/* <Tab.Screen
                name="Trips"
                component={TripScreen}
              /> */}
              <Tab.Screen
                name="Blog"
                component={BlogScreenWrapper}
              />
              <Tab.Screen
                name="CreateBlog"
                component={CreateBlogScreen}
                options={{
                  tabBarItemStyle: { display: 'none' },
                }}
              />
              <Tab.Screen name="UserProfile" component={UserDetailsScreen} />
              {/* Salary screen kept but hidden from tab bar */}
              <Tab.Screen
                name="Salary"
                component={MyPayslip}
                options={{
                  headerShown: false,
                  tabBarItemStyle: { display: 'none' }, // ✅ IMPORTANT
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
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  headerWrapper: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 30 : 0,
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
    marginTop: Platform.OS === 'ios' ? 110 : 80, // header height
  },
});

export default Dashboard;
