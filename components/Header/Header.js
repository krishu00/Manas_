import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  TouchableWithoutFeedback,   
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {MMKV} from 'react-native-mmkv';
import {apiMiddleware} from '../../src/apiMiddleware/apiMiddleware';

const storage = new MMKV();

const Header = ({onLogoutSuccess}) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    UserDetails(controller);

    return () => {
      controller.abort(); // Clean up the fetch operation on unmount
    };
  }, []);

  const handleLogout = async () => {
    try {
      // Remove user token from MMKV
      storage.delete('userToken');
      setDropdownVisible(false); // Close dropdown after logging out
      onLogoutSuccess(); // Call the parent component function to update UI
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleToggleDropdown = () => {
    setDropdownVisible(prev => !prev);
  };

  const handleOutsidePress = () => {
    if (dropdownVisible) {
      setDropdownVisible(false);
    }
  };

  const UserDetails = async controller => {
    try {
      const storedEmployeeId = storage.getString('employee_id');
      const storedCompanyCode = storage.getString('companyCode');

      if (!storedEmployeeId || !storedCompanyCode) {
        Alert.alert('Error', 'Unable to retrieve stored data');
        return;
      }

      const headers = {
        Cookie: `employee_id=${storedEmployeeId}; companyCode=${storedCompanyCode}`,
      };

      const response = await apiMiddleware.get('/company/employee-details', {
        headers,
        signal: controller.signal,
      });

      if (response?.data?.data) {
        const employeeDetails = response.data.data.employee_details;
        const employeeId = response.data.data.employee_id;

        // Update state with name and employee ID
        setName(employeeDetails.name);
        setEmployeeId(employeeId);
      } else {
        Alert.alert(
          'Error',
          response.message || 'Failed to fetch employee details',
        );
      }
    } catch (error) {
      if (error.name !== 'CanceledError') {
        Alert.alert('Error', 'Unable to find details');
        console.error('UserDetails error:', error);
      }
    }
  };

  return (
    <TouchableWithoutFeedback onPress={handleOutsidePress}>
      <View style={styles.container}>
        <LinearGradient
          colors={['#C1DFC4', '#DEECDD']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.headerContainer}>
          <Image
            source={require('../../src/logos/daksh-logo.png')}
            style={styles.logo}
          />

          <View style={styles.userInfoContainer}>
            <TouchableOpacity onPress={handleToggleDropdown}>
              <Text style={styles.username}>{name || 'Employee Name'}</Text>
              <Text style={styles.userId}>{employeeId || 'Employee ID'}</Text>
            </TouchableOpacity>

            {dropdownVisible && (
              <View style={styles.dropdownContainer}>
                <TouchableOpacity
                  onPress={handleLogout}
                  style={styles.dropdownOption}>
                  <Text style={styles.dropdownText}>Logout</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </LinearGradient>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  headerContainer: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    width: 100,
    height: 50,
    resizeMode: 'contain',
  },
  userInfoContainer: {
    alignItems: 'flex-end',
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00503D',
  },
  userId: {
    fontSize: 14,
    color: '#00503D',
    fontWeight: '700',
  },
  dropdownContainer: {
    position: 'absolute',
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 4,
    marginTop: 17,
    padding: 8,
  },
  dropdownOption: {
    padding: 3,
  },
  dropdownText: {
    color: '#81BAA5',
    fontWeight: '600',
    width: 50,
  },
});

export default Header;
