import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const AppHeader = () => {
  const navigation = useNavigation();

  const [accountType, setAccountType] = useState(null);
  const [userName, setUserName] = useState('');
  const [employeeId, setEmployeeId] = useState('');

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
    try {
      console.log('========== PUBLIC HEADER LOGOUT ==========');
      console.log('Account type:', accountType);

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

      navigation.reset({
        index: 0,
        routes: [{ name: 'PublicNavigator' }],
      });

      console.log('Public Header logout completed');
    } catch (error) {
      console.error('Logout error:', error);
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
});

export default AppHeader;
