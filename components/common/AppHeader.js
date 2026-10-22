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
  const [logoutPopupTitle, setLogoutPopupTitle] = useState('Logout Successful');
  const [logoutPopupMessage, setLogoutPopupMessage] = useState('');
  const [selectedLogoutType, setSelectedLogoutType] = useState(null);
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

  const handleLogout = () => {
    setDeleteModalVisible(true);
  };

  const confirmLogout = async (type) => {
    try {
      setDeleting(true);
      setSelectedLogoutType(type);
      const response = await logoutApi(type);

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

      setDeleteModalVisible(false);
      setLogoutPopupTitle(
        type === 2 ? 'Account Deletion Requested' : 'Logout Successful',
      );
      setLogoutPopupMessage(
        typeof response?.data?.message === 'string' &&
          response.data.message.trim()
          ? response.data.message
          : type === 2
            ? 'Your account deletion request has been submitted.'
            : 'You have been logged out successfully.',
      );
      setLogoutPopupVisible(true);

    } catch (error) {
      console.error('Logout API error:', error);
      Alert.alert(
        'Request failed',
        'We could not complete your request. Please try again.',
      );
    } finally {
      setDeleting(false);
      setSelectedLogoutType(null);
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
          title={logoutPopupTitle}
          message={logoutPopupMessage}
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

            <Text style={styles.modalTitle}>Choose an account action</Text>

            <Text style={styles.modalDescription}>
              Log out of your account or request permanent account deletion.
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
              style={[styles.logoutButton, deleting && styles.disabledButton]}
              onPress={() => confirmLogout(1)}
              disabled={deleting}
            >
              {deleting && selectedLogoutType === 1 ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.confirmDeleteText}>Logout</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.confirmDeleteButton,
                deleting && styles.disabledButton,
              ]}
              onPress={() => confirmLogout(2)}
              disabled={deleting}
            >
              {deleting && selectedLogoutType === 2 ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.confirmDeleteText}>Delete My Account</Text>
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

  logoutButton: {
    width: '100%',
    backgroundColor: '#00503D',
    padding: 14,
    borderRadius: 9,
    alignItems: 'center',
    marginBottom: 8,
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
