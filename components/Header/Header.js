import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';

import { apiMiddleware } from '../../src/apiMiddleware/apiMiddleware';
import Popup from '../Popup/Popup';

const Header = ({
  onLogoutSuccess,
  closeDropdown,
  closeDropdownFlag,
  onNavigateToSalary,
  onNavigateToProfile,
  onDropdownVisibleChange,

  // New prop:
  // Set this to true when this header is being used on Blog screens.
  isBlogHeader = false,
  backTarget = 'Dashboard',
  showAuthButton = true,
}) => {
  const navigation = useNavigation();

  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [popup, setPopup] = useState({
    visible: false,
    title: '',
    message: '',
    onClose: null,
  });

  const popupTimerRef = useRef(null);
  const logoutTimerRef = useRef(null);

  // ---------------------------------------------------------
  // CHECK LOGIN STATE
  // ---------------------------------------------------------

  useEffect(() => {
    checkAuthentication();

    return () => {
      if (popupTimerRef.current) {
        clearTimeout(popupTimerRef.current);
      }

      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }
    };
  }, []);

  const checkAuthentication = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');

      if (token) {
        const storedEmployeeName =
          await AsyncStorage.getItem('employee_name');

        const storedEmployeeId =
          await AsyncStorage.getItem('employee_id');

        setIsAuthenticated(true);
        setName(storedEmployeeName || '');
        setEmployeeId(storedEmployeeId || '');

        console.log('========== HEADER USER ==========');
        console.log('Header employee_name:', storedEmployeeName);
        console.log('Header employee_id:', storedEmployeeId);
        console.log('=================================');

        return;
      }

      setIsAuthenticated(false);
      setName('');
      setEmployeeId('');
    } catch (error) {
      console.error('Authentication check error:', error);
      setIsAuthenticated(false);
      setName('');
      setEmployeeId('');
    }
  };
  // ---------------------------------------------------------
  // USER DETAILS
  // ---------------------------------------------------------

  // const UserDetails = async controller => {
  //   try {
  //     const storedEmployeeId = await AsyncStorage.getItem('employee_name');
  //     const storedCompanyCode = await AsyncStorage.getItem('company_Code');

  //     if (!storedEmployeeId || !storedCompanyCode) {
  //       return;
  //     }

  //     const response = await apiMiddleware.get(
  //       '/company/employee-details',
  //       {
  //         companyCode: storedCompanyCode,
  //         employee_id: storedEmployeeId,
  //         signal: controller.signal,
  //       }
  //     );

  //     if (response?.data?.data) {
  //       const employeeDetails =
  //         response.data.data.employee_details;

  //       const returnedEmployeeId =
  //         response.data.data.employee_id;

  //       setName(employeeDetails?.name || '');
  //       setEmployeeId(returnedEmployeeId || '');
  //     }
  //   } catch (error) {
  //     if (error.name !== 'CanceledError') {
  //       console.error('UserDetails error:', error);
  //     }
  //   }
  // };

  // ---------------------------------------------------------
  // POPUP
  // ---------------------------------------------------------

  const showPopup = (
    title,
    message,
    autoClose = false,
    onCloseCallback = null
  ) => {
    if (popupTimerRef.current) {
      clearTimeout(popupTimerRef.current);
      popupTimerRef.current = null;
    }

    setPopup({
      visible: true,
      title,
      message,
      onClose: onCloseCallback,
    });

    if (autoClose) {
      popupTimerRef.current = setTimeout(() => {
        closePopup();
      }, 5000);
    }
  };

  const closePopup = () => {
    if (popupTimerRef.current) {
      clearTimeout(popupTimerRef.current);
      popupTimerRef.current = null;
    }

    const callback = popup.onClose;

    setPopup({
      visible: false,
      title: '',
      message: '',
      onClose: null,
    });

    if (callback) {
      callback();
    }
  };

  // ---------------------------------------------------------
  // LOGIN
  // ---------------------------------------------------------

  const handleLogin = () => {
    setDropdownVisible(false);

    navigation.navigate('Login');
  };

  // ---------------------------------------------------------
  // LOGOUT
  // ---------------------------------------------------------

  const handleLogout = async () => {
    try {
      console.log('========== LOGOUT START ==========');

      // Clear all authentication/user data
      await AsyncStorage.multiRemove([
        'userToken',
        'employee_id',
        'employee_name',
        'company_Code',
        'loginTime',
      ]);

      // Update Header state
      setIsAuthenticated(false);
      setName('');
      setEmployeeId('');
      setDropdownVisible(false);

      console.log('Logout successful');
      console.log('Navigating after logout...');

      // Tell Dashboard/App that logout is complete
      onLogoutSuccess?.();

      console.log('========== LOGOUT COMPLETE ==========');

    } catch (error) {
      console.error('Logout error:', error);

      setDropdownVisible(false);

      showPopup(
        'Error',
        'Logout failed. Please try again.',
        true
      );
    }
  };

  // ---------------------------------------------------------
  // DROPDOWN
  // ---------------------------------------------------------

  const handleToggleDropdown = () => {
    setDropdownVisible(prev => !prev);
  };

  useEffect(() => {
    onDropdownVisibleChange &&
      onDropdownVisibleChange(dropdownVisible);
  }, [dropdownVisible, onDropdownVisibleChange]);

  useEffect(() => {
    if (closeDropdownFlag && dropdownVisible) {
      setDropdownVisible(false);

      if (closeDropdown) {
        closeDropdown(false);
      }
    }
  }, [closeDropdownFlag]);

  useEffect(() => {
    if (!dropdownVisible && closeDropdown) {
      closeDropdown(false);
    }
  }, [dropdownVisible]);

  // ---------------------------------------------------------
  // HEADER
  // ---------------------------------------------------------

  return (
    <View style={styles.container}>

      <LinearGradient
        colors={['#C1DFC4', '#DEECDD']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerContainer}
      >
        {/* BACK BUTTON - BLOG ONLY */}
        <View style={styles.leftSection}>

          {isBlogHeader && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.navigate(backTarget)}
              activeOpacity={0.7}
              hitSlop={{
                top: 10,
                bottom: 10,
                left: 10,
                right: 10,
              }}
            >
              <Icon
                name="arrow-left"
                size={22}
                color="#00503D"
              />
            </TouchableOpacity>
          )}

          <Image
            source={require('../../src/logos/logo-HD.png')}
            style={styles.logo}
          />

        </View>
        {/* LOGO */}

        {/* <Image
          source={require('../../src/logos/logo-HD.png')}
          style={styles.logo}
        /> */}

        {/* ===================================================
            GUEST USER
            =================================================== */}
        {showAuthButton && !isAuthenticated && (
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.loginText}>
              Login
            </Text>
          </TouchableOpacity>
        )}

        {/* ===================================================
            LOGGED-IN USER
            =================================================== */}

        {isAuthenticated && (
          <View style={styles.userInfoContainer}>

            <TouchableOpacity
              style={styles.userInfoRow}
              onPress={handleToggleDropdown}
              activeOpacity={0.8}
            >

              <View style={styles.userTextContainer}>

                <Text style={styles.username}>
                  {name?.split(' ')[0] || 'Employee Name'}
                </Text>

                <Text style={styles.userId}>
                  {employeeId || 'Employee ID'}
                </Text>

              </View>

              <Icon
                name="user-circle"
                size={32}
                color="#00503D"
              />

            </TouchableOpacity>

          </View>
        )}

      </LinearGradient>

      {/* =====================================================
          DROPDOWN
          ===================================================== */}

      {isAuthenticated && (
        <Modal
          visible={dropdownVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() =>
            setDropdownVisible(false)
          }
        >

          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() =>
              setDropdownVisible(false)
            }
          >

            <View style={styles.dropdownContainer}>

              {/* PROFILE */}

              <TouchableOpacity
                style={styles.dropdownOption}
                activeOpacity={0.7}
                onPress={() => {
                  setDropdownVisible(false);

                  onNavigateToProfile?.();
                }}
              >

                <Icon
                  name="user"
                  size={18}
                  color="#81BAA5"
                />

                <Text style={styles.dropdownText}>
                  Profile
                </Text>

              </TouchableOpacity>

              {/* SALARY */}

              <TouchableOpacity
                style={styles.dropdownOption}
                activeOpacity={0.7}
                onPress={() => {
                  setDropdownVisible(false);

                  onNavigateToSalary?.();
                }}
              >

                <Icon
                  name="dollar"
                  size={18}
                  color="#81BAA5"
                />

                <Text style={styles.dropdownText}>
                  Salary
                </Text>

              </TouchableOpacity>

              {/* LOGOUT */}

              <TouchableOpacity
                style={styles.dropdownOption}
                activeOpacity={0.7}
                onPress={handleLogout}
              >

                <Icon
                  name="sign-out"
                  size={18}
                  color="#81BAA5"
                />

                <Text style={styles.dropdownText}>
                  Logout
                </Text>

              </TouchableOpacity>

            </View>

          </TouchableOpacity>

        </Modal>
      )}

      {/* =====================================================
          POPUP
          ===================================================== */}

      {popup.visible && (
        <Popup
          title={popup.title}
          message={popup.message}
          onClose={closePopup}
        />
      )}

    </View>
  );
};

// ===========================================================
// STYLES
// ===========================================================

const styles = StyleSheet.create({

  container: {
    width: '100%',
  },

  headerContainer: {
    paddingTop: 25,
    paddingBottom: 15,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logo: {
    width: 140,
    height: 50,
    resizeMode: 'contain',
  },

  // =========================================================
  // LOGIN
  // =========================================================

  loginButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  loginText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00503D',
  },

  // =========================================================
  // USER
  // =========================================================

  userInfoContainer: {
    alignItems: 'flex-end',
  },

  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  userTextContainer: {
    alignItems: 'flex-end',
  },

  username: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00503D',
  },

  userId: {
    fontSize: 12,
    color: '#00503D',
    fontWeight: '700',
  },

  // =========================================================
  // DROPDOWN
  // =========================================================

  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  dropdownContainer: {
    position: 'absolute',

    top: 100,
    right: 16,

    backgroundColor: '#fff',

    borderRadius: 8,

    padding: 8,

    elevation: 10,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },

  dropdownOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 10,
  },

  dropdownText: {
    color: '#81BAA5',
    fontWeight: '600',
    fontSize: 16,
    width: 80,
  },

});

export default Header;