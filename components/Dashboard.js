// Dashboard.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Header from './Header/Header';
import HomeScreen from './Screens/HomeScreen';
import FeedsScreen from './Screens/FeedsScreen';
import RequestScreen from './Screens/RequestsScreen';
import MoreScreen from './Screens/MoreScreens';
import Icon from 'react-native-vector-icons/FontAwesome';

const Tab = createBottomTabNavigator();

const Dashboard = ({ onLogoutSuccess }) => {
  return (
    <View style={styles.container}>
      <Header onLogoutSuccess={onLogoutSuccess} />
      
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused }) => {
            let iconName;

            switch (route.name) {
              case 'Home':
                iconName = 'home';
                break;
              case 'Feeds':
                iconName = 'inbox';
                break;
              case 'Request':
                iconName = 'envelope';
                break;
              case 'More':
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
        <Tab.Screen name="Feeds" component={FeedsScreen} />
        <Tab.Screen name="Request" component={RequestScreen} />
        <Tab.Screen name="More" component={MoreScreen} />
      </Tab.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Dashboard;
