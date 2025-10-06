import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useFocusEffect } from '@react-navigation/native';

import MyRequests from '../RequestScreensComp/MyRequests';
import Approvals from '../RequestScreensComp/Approvals';
import FilterOptions from '../RequestScreensComp/FilterOptions';

const Tab = createMaterialTopTabNavigator();

const RequestScreen = ({ route }) => {
  const [requestType, setRequestType] = useState('All Requests');
  const [requestStatus, setRequestStatus] = useState('All status');
  const [myRequestsRefresh, setMyRequestsRefresh] = useState(false);
  const [approvalsRefresh, setApprovalsRefresh] = useState(false);
  // const [activeTab, setActiveTab] = useState('My Requests');
  const [showDropdown, setShowDropdown] = useState(false);

  const triggerMyRequestsRefresh = () => setMyRequestsRefresh(prev => !prev);
  const triggerApprovalsRefresh = () => setApprovalsRefresh(prev => !prev);

 const { defaultTab = 'My Requests', selectedRequestId = null } = route.params || {};
const [openRequestId, setOpenRequestId] = useState(selectedRequestId); // <- use param
const [activeTab, setActiveTab] = useState(defaultTab);               // <- use param

useFocusEffect(
  React.useCallback(() => {
    if (route.params?.selectedRequestId) {
      setOpenRequestId(route.params.selectedRequestId);
    }
    if (route.params?.defaultTab) {
      setActiveTab(route.params.defaultTab);
    }
  }, [route.params])
);


  console.log('route.params:', route.params);
  console.log('selectedRequestId:', selectedRequestId);
  console.log('openRequestId:', openRequestId);

  const handleOutsidePress = () => {
    if (showDropdown) {
      setShowDropdown(false);
      Keyboard.dismiss(); // optional
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <TouchableWithoutFeedback onPress={handleOutsidePress}>
          <View style={styles.container}>
            <Tab.Navigator
              initialRouteName={activeTab} // ✅ set the default tab here
              screenOptions={{
                tabBarLabelStyle: { fontSize: 16, fontWeight: 'bold' },
                tabBarStyle: { backgroundColor: '#f5f5f5' },
                tabBarIndicatorStyle: { backgroundColor: '#6a9689' },
              }}
            >
              <Tab.Screen
                name="My Requests"
                listeners={{ focus: () => setActiveTab('My Requests') }}
              >
                {() => (
                  <MyRequests
                    requestType={requestType}
                    requestStatus={requestStatus}
                    refreshFlag={myRequestsRefresh}
                  />
                )}
              </Tab.Screen>

              <Tab.Screen
                name="Approvals"
                listeners={{ focus: () => setActiveTab('Approvals') }}
              >
                {() => (
                  <Approvals
                    requestType={requestType}
                    requestStatus={requestStatus}
                    refreshFlag={approvalsRefresh}
                    selectedRequestId={openRequestId} // <-- pass this
                  />
                )}
              </Tab.Screen>
            </Tab.Navigator>

            {/* FilterOptions visible only on My Requests tab */}
            {activeTab === 'My Requests' && (
              <View style={styles.filterOverlay} pointerEvents="box-none">
                <FilterOptions
                  onRefresh={triggerMyRequestsRefresh}
                  showDropdown={showDropdown}
                  setShowDropdown={setShowDropdown}
                />
              </View>
            )}
          </View>
        </TouchableWithoutFeedback>
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
