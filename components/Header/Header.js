import React, { useState, useEffect } from 'react';
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
import { apiMiddleware } from '../../src/apiMiddleware/apiMiddleware';
import Popup from '../Popup/Popup';

const Header = ({
  onLogoutSuccess,
  closeDropdown,
  closeDropdownFlag,
  onNavigateToSalary,
  onNavigateToProfile,
  onDropdownVisibleChange,
}) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [popup, setPopup] = useState({
    visible: false,
    title: '',
    message: '',
  });

  useEffect(() => {
    const controller = new AbortController();
    UserDetails(controller);

    return () => {
      controller.abort();
    };
  }, []);

  const showPopup = (title, message) => {
    setPopup({ visible: true, title, message });
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');

      setDropdownVisible(false);
      onLogoutSuccess();

      showPopup('Success', 'You have been logged out successfully.');
    } catch (error) {
      console.error('Logout error:', error);
      showPopup('Error', 'Logout failed. Please try again.');
    }
  };

  const handleToggleDropdown = () => {
    setDropdownVisible(prev => !prev);
  };

  // Notify parent when dropdown visibility changes
  useEffect(() => {
    onDropdownVisibleChange && onDropdownVisibleChange(dropdownVisible);
  }, [dropdownVisible, onDropdownVisibleChange]);

  // Close dropdown if parent signals
  useEffect(() => {
    if (closeDropdownFlag && dropdownVisible) {
      setDropdownVisible(false);
      closeDropdown(false); // reset flag
    }
  }, [closeDropdownFlag]);

  // Call from outside to close dropdown
  useEffect(() => {
    if (!dropdownVisible && closeDropdown) closeDropdown(false);
  }, [dropdownVisible]);

  const UserDetails = async controller => {
    try {
      const storedEmployeeId = await AsyncStorage.getItem('employee_id');
      const storedCompanyCode = await AsyncStorage.getItem('company_Code');

      if (!storedEmployeeId || !storedCompanyCode) {
        showPopup('Error', 'Unable to retrieve stored data');
        return;
      }

      const response = await apiMiddleware.get('/company/employee-details', {
        companyCode: storedCompanyCode,
        employee_id: storedEmployeeId,
        signal: controller.signal,
      });

      if (response?.data?.data) {
        const employeeDetails = response.data.data.employee_details;
        const employeeId = response.data.data.employee_id;

        setName(employeeDetails.name);
        setEmployeeId(employeeId);
      } else {
        showPopup(
          'Error',
          response.message || 'Failed to fetch employee details',
        );
      }
    } catch (error) {
      if (error.name !== 'CanceledError') {
        showPopup('Error', 'Unable to find details');
        console.error('UserDetails error:', error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#C1DFC4', '#DEECDD']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerContainer}
      >
        <Image
          source={require('../../src/logos/logo-HD.png')}
          style={styles.logo}
        />

        <View style={styles.userInfoContainer}>
          <TouchableOpacity
            style={styles.userInfoRow}
            onPress={handleToggleDropdown}
            activeOpacity={0.8}
          >
            <View style={styles.userTextContainer}>
              <Text style={styles.username}>
                {name.split(' ')[0] || 'Employee Name'}
              </Text>

              <Text style={styles.userId}>
                {employeeId || 'Employee ID'}
              </Text>
            </View>

            <Icon name="user-circle" size={32} color="#00503D" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* ✅ FIX: Wrapped the dropdown in a Modal to bypass touch boundary limits */}
      <Modal
        visible={dropdownVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}
      >
        {/* Full screen overlay to detect outside clicks and close the menu */}
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setDropdownVisible(false)}
        >
          {/* The actual dropdown menu */}
          <View style={styles.dropdownContainer}>
            <TouchableOpacity
              style={styles.dropdownOption}
              activeOpacity={0.7}
              onPress={() => {
                console.log('PROFILE CLICKED');
                setDropdownVisible(false);
                onNavigateToProfile();
              }}
            >
              <Icon name="user" size={18} color="#81BAA5" />
              <Text style={styles.dropdownText}>Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dropdownOption}
              activeOpacity={0.7}
              onPress={() => {
                console.log('SALARY CLICKED');
                setDropdownVisible(false);
                onNavigateToSalary();
              }}
            >
              <Icon name="dollar" size={18} color="#81BAA5" />
              <Text style={styles.dropdownText}>Salary</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dropdownOption}
              activeOpacity={0.7}
              onPress={() => {
                console.log('LOGOUT CLICKED');
                handleLogout();
              }}
            >
              <Icon name="sign-out" size={18} color="#81BAA5" />
              <Text style={styles.dropdownText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {popup.visible && (
        <Popup
          title={popup.title}
          message={popup.message}
          onClose={() => setPopup({ ...popup, visible: false })}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  headerContainer: {
    paddingTop: 25, // Adjusted to account for iOS safe area / status bar natively
    paddingBottom: 15,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    width: 140,
    height: 50,
    resizeMode: 'contain',
  },
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
  // ✅ NEW STYLES FOR THE MODAL OVERLAY
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  dropdownContainer: {
    position: 'absolute',
    top: 100, // Matches the height of the header so it drops right below the icon
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    // Android Shadow
    elevation: 10,
    // iOS Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  dropdownOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10, // Adds clean spacing between icon and text
  },
  dropdownText: {
    color: '#81BAA5',
    fontWeight: '600',
    fontSize: 16,
    width: 80,
  },
});

export default Header;