import AsyncStorage from '@react-native-async-storage/async-storage';

// =====================================================
// EXISTING EMPLOYEE STORAGE KEYS
// DO NOT RENAME THESE
// =====================================================

const TOKEN_KEY = 'userToken';
const EMPLOYEE_KEY = 'employeeProfile';

// =====================================================
// NEW ACCOUNT / GUEST STORAGE KEYS
// =====================================================

const ACCOUNT_TYPE_KEY = 'accountType';

const GUEST_TOKEN_KEY = 'guestToken';
const GUEST_LOGIN_TIME_KEY = 'guestLoginTime';
const GUEST_NAME_KEY = 'guest_name';
const GUEST_EMAIL_KEY = 'guest_email';

// =====================================================
// EXISTING EMPLOYEE TOKEN HELPERS
// KEEPING THESE UNCHANGED
// =====================================================

export const getToken = () => AsyncStorage.getItem(TOKEN_KEY);

export const setToken = token => AsyncStorage.setItem(TOKEN_KEY, token);

export const clearToken = () => AsyncStorage.removeItem(TOKEN_KEY);

// =====================================================
// EXISTING EMPLOYEE PROFILE HELPERS
// KEEPING THESE UNCHANGED
// =====================================================

export const getStoredEmployee = async () => {
  const raw = await AsyncStorage.getItem(EMPLOYEE_KEY);

  return raw ? JSON.parse(raw) : null;
};

export const setStoredEmployee = employee =>
  AsyncStorage.setItem(EMPLOYEE_KEY, JSON.stringify(employee));

export const clearStoredEmployee = () => AsyncStorage.removeItem(EMPLOYEE_KEY);

// =====================================================
// ACCOUNT TYPE
//
// Possible values:
// "employee"
// "guest"
// null
// =====================================================

export const getAccountType = () => AsyncStorage.getItem(ACCOUNT_TYPE_KEY);

export const setAccountType = accountType =>
  AsyncStorage.setItem(ACCOUNT_TYPE_KEY, accountType);

export const clearAccountType = () => AsyncStorage.removeItem(ACCOUNT_TYPE_KEY);

// =====================================================
// GUEST TOKEN
// =====================================================

export const getGuestToken = () => AsyncStorage.getItem(GUEST_TOKEN_KEY);

export const setGuestToken = token =>
  AsyncStorage.setItem(GUEST_TOKEN_KEY, token);

export const clearGuestToken = () => AsyncStorage.removeItem(GUEST_TOKEN_KEY);

// =====================================================
// GUEST LOGIN TIME
// =====================================================

export const getGuestLoginTime = () =>
  AsyncStorage.getItem(GUEST_LOGIN_TIME_KEY);

export const setGuestLoginTime = time =>
  AsyncStorage.setItem(GUEST_LOGIN_TIME_KEY, time.toString());

export const clearGuestLoginTime = () =>
  AsyncStorage.removeItem(GUEST_LOGIN_TIME_KEY);

// =====================================================
// GUEST NAME
// =====================================================

export const getGuestName = () => AsyncStorage.getItem(GUEST_NAME_KEY);

export const setGuestName = name => AsyncStorage.setItem(GUEST_NAME_KEY, name);

export const clearGuestName = () => AsyncStorage.removeItem(GUEST_NAME_KEY);

// =====================================================
// GUEST EMAIL
// =====================================================

export const getGuestEmail = () => AsyncStorage.getItem(GUEST_EMAIL_KEY);

export const setGuestEmail = email =>
  AsyncStorage.setItem(GUEST_EMAIL_KEY, email);

export const clearGuestEmail = () => AsyncStorage.removeItem(GUEST_EMAIL_KEY);

// =====================================================
// CLEAR COMPLETE GUEST SESSION
// =====================================================

export const clearGuestSession = async () => {
  await AsyncStorage.multiRemove([
    GUEST_TOKEN_KEY,
    GUEST_LOGIN_TIME_KEY,
    GUEST_NAME_KEY,
    GUEST_EMAIL_KEY,
  ]);
};

// =====================================================
// CLEAR COMPLETE EMPLOYEE SESSION
//
// IMPORTANT:
// Existing Employee keys are preserved.
// This helper simply centralizes their removal.
// =====================================================

export const clearEmployeeSession = async () => {
  await AsyncStorage.multiRemove([
    'userToken',
    'employee_id',
    'employee_name',
    'company_Code',
    'loginTime',
    'employeeProfile',
  ]);
};

// =====================================================
// CLEAR ACCOUNT TYPE + GUEST SESSION
// =====================================================

export const clearGuestAccount = async () => {
  await AsyncStorage.multiRemove([
    ACCOUNT_TYPE_KEY,
    GUEST_TOKEN_KEY,
    GUEST_LOGIN_TIME_KEY,
    GUEST_NAME_KEY,
    GUEST_EMAIL_KEY,
  ]);
};

// =====================================================
// CLEAR ACCOUNT TYPE + EMPLOYEE SESSION
// =====================================================

export const clearEmployeeAccount = async () => {
  await AsyncStorage.multiRemove([
    ACCOUNT_TYPE_KEY,
    'userToken',
    'employee_id',
    'employee_name',
    'company_Code',
    'loginTime',
    'employeeProfile',
  ]);
};


// import AsyncStorage from '@react-native-async-storage/async-storage';

// const TOKEN_KEY = 'userToken';
// const EMPLOYEE_KEY = 'employeeProfile';

// export const getToken = () => AsyncStorage.getItem(TOKEN_KEY);
// export const setToken = token => AsyncStorage.setItem(TOKEN_KEY, token);
// export const clearToken = () => AsyncStorage.removeItem(TOKEN_KEY);

// export const getStoredEmployee = async () => {
//   const raw = await AsyncStorage.getItem(EMPLOYEE_KEY);
//   return raw ? JSON.parse(raw) : null;
// };
// export const setStoredEmployee = employee =>
//   AsyncStorage.setItem(EMPLOYEE_KEY, JSON.stringify(employee));
// export const clearStoredEmployee = () => AsyncStorage.removeItem(EMPLOYEE_KEY);
