import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import PublicTabs from './PublicTabs';

import BlogDetailScreen from './Screens/Blog/BlogDetailScreen';
import CreateBlogScreen from './Screens/Blog/CreateBlogScreen';

const Stack = createNativeStackNavigator();

const PublicNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="PublicTabs"
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Main public application */}
      <Stack.Screen name="PublicTabs" component={PublicTabs} />

      {/* Public blog detail */}
      <Stack.Screen name="BlogDetail" component={BlogDetailScreen} />

      {/* Authentication required for this action */}
      <Stack.Screen name="CreateBlog" component={CreateBlogScreen} />
    </Stack.Navigator>
  );
};

export default PublicNavigator;
