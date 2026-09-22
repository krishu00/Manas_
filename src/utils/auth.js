import AsyncStorage from '@react-native-async-storage/async-storage';

const EMPLOYEE_TOKEN_KEY = 'userToken';
const GUEST_TOKEN_KEY = 'guestToken';
const ACCOUNT_TYPE_KEY = 'accountType';

export const getAccountType = async () => {
  try {
    return await AsyncStorage.getItem(ACCOUNT_TYPE_KEY);
  } catch (error) {
    console.error('Get account type error:', error);
    return null;
  }
};

export const getAuthToken = async () => {
  try {
    const accountType = await AsyncStorage.getItem(ACCOUNT_TYPE_KEY);

    // Guest
    if (accountType === 'guest') {
      return await AsyncStorage.getItem(GUEST_TOKEN_KEY);
    }

    // Employee
    if (accountType === 'employee') {
      return await AsyncStorage.getItem(EMPLOYEE_TOKEN_KEY);
    }

    // Backward compatibility:
    // Existing employee sessions may not have accountType yet.
    const employeeToken = await AsyncStorage.getItem(EMPLOYEE_TOKEN_KEY);

    if (employeeToken) {
      return employeeToken;
    }

    const guestToken = await AsyncStorage.getItem(GUEST_TOKEN_KEY);

    if (guestToken) {
      return guestToken;
    }

    return null;
  } catch (error) {
    console.error('Get auth token error:', error);
    return null;
  }
};

export const getBlogAuthSession = async () => {
  try {
    const [
      accountType,
      employeeToken,
      guestToken,
      employeeId,
      employeeName,
      guestName,
      guestEmail,
    ] = await Promise.all([
      AsyncStorage.getItem(ACCOUNT_TYPE_KEY),
      AsyncStorage.getItem(EMPLOYEE_TOKEN_KEY),
      AsyncStorage.getItem(GUEST_TOKEN_KEY),
      AsyncStorage.getItem('employee_id'),
      AsyncStorage.getItem('employee_name'),
      AsyncStorage.getItem('guest_name'),
      AsyncStorage.getItem('guest_email'),
    ]);

    // Guest session
    if (accountType === 'guest' && guestToken) {
      return {
        isAuthenticated: true,
        accountType: 'guest',
        token: guestToken,
        name: guestName || '',
        email: guestEmail || '',
      };
    }

    // Employee session
    if (accountType === 'employee' && employeeToken) {
      return {
        isAuthenticated: true,
        accountType: 'employee',
        token: employeeToken,
        name: employeeName || '',
        employeeId: employeeId || '',
      };
    }

    // Backward compatibility for existing Employee sessions
    if (employeeToken) {
      return {
        isAuthenticated: true,
        accountType: 'employee',
        token: employeeToken,
        name: employeeName || '',
        employeeId: employeeId || '',
      };
    }

    return {
      isAuthenticated: false,
      accountType: null,
      token: null,
    };
  } catch (error) {
    console.error('Get blog auth session error:', error);

    return {
      isAuthenticated: false,
      accountType: null,
      token: null,
    };
  }
};

export const isUserLoggedIn = async () => {
  const token = await getAuthToken();

  return !!token;
};

export const clearAuth = async () => {
  try {
    // Existing Employee auth
    await AsyncStorage.removeItem('userToken');

    // Guest auth
    await AsyncStorage.removeItem('guestToken');

    // Account information
    await AsyncStorage.removeItem('accountType');

    // Existing Employee login time
    await AsyncStorage.removeItem('loginTime');

    // Guest login time
    await AsyncStorage.removeItem('guestLoginTime');
  } catch (error) {
    console.error('Clear auth error:', error);
  }
};
