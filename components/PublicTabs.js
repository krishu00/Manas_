import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import PublicBottomTab from './common/PublicBottomTab';

import PublicHomeScreen from './Screens/Public/PublicHomeScreen';
import WeatherScreen from './Screens/Public/WeatherScreen';
import StepsScreen from './Screens/Public/StepsScreen';
import BlogFeedScreen from './Screens/Blog/BlogFeedScreen';

const Tab = createBottomTabNavigator();

const PublicTabs = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBar={props => <PublicBottomTab {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={PublicHomeScreen} />

      <Tab.Screen name="Weather" component={WeatherScreen} />

      <Tab.Screen name="Steps" component={StepsScreen} />

      <Tab.Screen name="Blog" component={BlogFeedScreen} />
    </Tab.Navigator>
  );
};

export default PublicTabs;
