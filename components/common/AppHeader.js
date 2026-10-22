import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { logout as logoutApi } from '../../src/api/authApi';
import Popup from '../Popup/Popup';

const AppHeader = () => {
  const navigation = useNavigation();

  const [accountType, setAccountType] = useState(null);
  const [userName, setUserName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [logoutPopupVisible, setLogoutPopupVisible] = useState(false);

  const [logoutType, setLogoutType] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  // =====================================================
  // CHECK CURRENT SESSION
  // =====================================================

  const checkLogin = useCallback(async () => {
    try {
      const storedAccountType = await AsyncStorage.getItem('accountType');

      // ================================================
      // GUEST
      // ================================================

      if (storedAccountType === 'guest') {
        const guestToken = await AsyncStorage.getItem('guestToken');

        const guestName = await AsyncStorage.getItem('guest_name');

        if (guestToken) {
          setAccountType('guest');
          setUserName(guestName || 'Guest');
          setEmployeeId('');
          return;
        }
      }

      // ================================================
      // EMPLOYEE
      //
      // This is mainly for backward compatibility.
      // Public Header normally won't be used by Employee.
      // ================================================

      if (storedAccountType === 'employee') {
        const employeeToken = await AsyncStorage.getItem('userToken');

        const employeeName = await AsyncStorage.getItem('employee_name');

        const storedEmployeeId = await AsyncStorage.getItem('employee_id');

        if (employeeToken) {
          setAccountType('employee');
          setUserName(employeeName || '');
          setEmployeeId(storedEmployeeId || '');
          return;
        }
      }

      // ================================================
      // BACKWARD COMPATIBILITY
      //
      // Existing Employee session may not yet have
      // accountType during an upgrade.
      // ================================================

      const employeeToken = await AsyncStorage.getItem('userToken');

      if (employeeToken) {
        const employeeName = await AsyncStorage.getItem('employee_name');

        const storedEmployeeId = await AsyncStorage.getItem('employee_id');

        setAccountType('employee');
        setUserName(employeeName || '');
        setEmployeeId(storedEmployeeId || '');
        return;
      }

      // ================================================
      // NO SESSION
      // ================================================

      setAccountType(null);
      setUserName('');
      setEmployeeId('');
    } catch (error) {
      console.error('Header auth check error:', error);

      setAccountType(null);
      setUserName('');
      setEmployeeId('');
    }
  }, []);

  // =====================================================
  // REFRESH HEADER WHEN SCREEN GETS FOCUS
  // =====================================================

  useFocusEffect(
    useCallback(() => {
      checkLogin();
    }, [checkLogin]),
  );

  // =====================================================
  // LOGIN
  // =====================================================

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = async () => {
    setLogoutType(0); // Set logoutType to 0 for  logout and 1 for Delete Account
    setDeleteModalVisible(true); // Show the delete confirmation modal
    try {
      setDeleting(true);
      try {
        console.log("logout Api called");
        await logoutApi(logoutType);
      } catch (error) {
        console.error('Logout API error:', error);
      }

      // ================================================
      // GUEST LOGOUT
      // ================================================

      if (accountType === 'guest') {
        await AsyncStorage.multiRemove([
          'guestToken',
          'guestLoginTime',
          'guest_name',
          'guest_email',
          'accountType',
        ]);
      }

      // ================================================
      // EMPLOYEE LOGOUT
      //
      // Normally Employee uses Header.js + App.js.
      // This is just a safe fallback.
      // ================================================

      if (accountType === 'employee') {
        await AsyncStorage.multiRemove([
          'userToken',
          'employee_id',
          'employee_name',
          'company_Code',
          'loginTime',
          'accountType',
        ]);
      }

      setAccountType(null);
      setUserName('');
      setEmployeeId('');

      setLogoutPopupVisible(true);

      console.log('Public Header logout completed');
    } catch (error) {
      console.error('Logout error:', error);
    }finally {
      setDeleting(false);
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.logo}>MANAS</Text>

        {/* ============================================= */}
        {/* NO LOGIN */}
        {/* ============================================= */}

        {!accountType && (
          <TouchableOpacity
            onPress={handleLogin}
            hitSlop={{
              top: 10,
              bottom: 10,
              left: 10,
              right: 10,
            }}
          >
            <Text style={styles.actionText}>Login</Text>
          </TouchableOpacity>
        )}

        {/* ============================================= */}
        {/* GUEST */}
        {/* ============================================= */}

        {accountType === 'guest' && (
          <View style={styles.userContainer}>
            <Text style={styles.userName}>Guest : {userName || 'Guest'}</Text>

            <TouchableOpacity
              onPress={handleLogout}
              hitSlop={{
                top: 10,
                bottom: 10,
                left: 10,
                right: 10,
              }}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ============================================= */}
        {/* EMPLOYEE */}
        {/* ============================================= */}

        {accountType === 'employee' && (
          <TouchableOpacity
            onPress={handleLogout}
            hitSlop={{
              top: 10,
              bottom: 10,
              left: 10,
              right: 10,
            }}
          >
            <View style={styles.userContainer}>
              <Text style={styles.userName}>{userName || 'Employee'}</Text>

              <Text style={styles.guestText}>
                {employeeId || 'Employee'} · Logout
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
      {logoutPopupVisible && (
        <Popup
          title="Logout Successful"
          message="You have been logged out successfully."
          onClose={() => {
            setLogoutPopupVisible(false);
            navigation.reset({
              index: 0,
              routes: [{ name: 'PublicNavigator' }],
            });
          }}
          autoCloseDelay={2000}
        />
      )}

            {/* DELETE ACCOUNT CONFIRMATION MODAL */}

      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!deleting) setDeleteModalVisible(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.warningIcon}>
              <Text style={styles.warningIconText}>!</Text>
            </View>

            <Text style={styles.modalTitle}>
              Delete Your Account?
            </Text>

            <Text style={styles.modalDescription}>
              Are you sure you want to request account deletion?
            </Text>

            <View style={styles.noticeBox}>
              <Text style={styles.noticeTitle}>
                30-Day Deletion Period
              </Text>

              <Text style={styles.noticeText}>
                Your account will be scheduled for permanent
                deletion within 30 days of your request.
              </Text>

              <Text style={styles.noticeText}>
                Changed your mind? Log in again within 30 days
                to cancel the pending deletion, subject to our
                account recovery policy.
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.confirmDeleteButton,
                deleting && styles.disabledButton,
              ]}
              onPress={handleLogout}
              disabled={deleting}
            >
              {deleting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.confirmDeleteText}>
                  Confirm Delete Account
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setDeleteModalVisible(false)}
              disabled={deleting}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#00503D',
  },

  container: {
    minHeight: 58,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },

  logo: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#FFFFFF',
  },

  actionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  userContainer: {
    alignItems: 'flex-end',
  },

  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  logoutText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    // textDecorationLine: 'underline',
    marginTop: 2,
  },

  guestText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
    opacity: 0.9,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 22,
  },

  modalContainer: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 22,
    alignItems: 'center',
  },

  warningIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FDECEC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  warningIconText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#B42318',
  },

  modalTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#202824',
    textAlign: 'center',
    marginBottom: 10,
  },

  modalDescription: {
    fontSize: 14,
    lineHeight: 21,
    color: '#5F6963',
    textAlign: 'center',
    marginBottom: 18,
  },

  noticeBox: {
    width: '100%',
    backgroundColor: '#FFF6E5',
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
  },

  noticeTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#854D0E',
    marginBottom: 8,
  },

  noticeText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#704214',
    marginBottom: 8,
  },

  confirmDeleteButton: {
    width: '100%',
    backgroundColor: '#B42318',
    padding: 14,
    borderRadius: 9,
    alignItems: 'center',
  },

  confirmDeleteText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  disabledButton: {
    opacity: 0.6,
  },

  cancelButton: {
    width: '100%',
    padding: 13,
    borderRadius: 9,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#D9DEDB',
  },

  cancelButtonText: {
    color: '#26332C',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default AppHeader;
