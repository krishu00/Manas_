import React, { useState, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

import MyRequests from '../RequestScreensComp/MyRequests';
import Approvals from '../RequestScreensComp/Approvals';
import FilterOptions from '../RequestScreensComp/FilterOptions';

const Tab = createMaterialTopTabNavigator();

const RequestScreen = () => {
  const [requestType, setRequestType] = useState('All Requests');
  const [requestStatus, setRequestStatus] = useState('All status');

  const handleFilterChange = (type, status) => {
    setRequestType(type);
    setRequestStatus(status);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <View style={styles.container}>
          <Tab.Navigator
            screenOptions={{
              tabBarLabelStyle: { fontSize: 16, fontWeight: 'bold' },
              tabBarStyle: { backgroundColor: '#f5f5f5' },
              tabBarIndicatorStyle: { backgroundColor: '#6a9689' },
            }}
          >
            <Tab.Screen name="Approvals">
              {() => (
                <Approvals
                  requestType={requestType}
                  requestStatus={requestStatus}
                />
              )}
            </Tab.Screen>
            <Tab.Screen name="My Requests">
              {() => (
                <MyRequests
                  requestType={requestType}
                  requestStatus={requestStatus}
                />
              )}
            </Tab.Screen>
          </Tab.Navigator>

          <View style={styles.filterOverlay}>
            {/* <FilterOptions onFilterChange={handleFilterChange} /> */}
            <FilterOptions
              onFilterSelect={selected => {
                // You can do more complex logic if needed
                console.log('User selected:', selected);
              }}
            />
          </View>
        </View>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
});

export default RequestScreen;
