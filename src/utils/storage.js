import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'userToken';
const EMPLOYEE_KEY = 'employeeProfile';

export const getToken = () => AsyncStorage.getItem(TOKEN_KEY);
export const setToken = token => AsyncStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => AsyncStorage.removeItem(TOKEN_KEY);

export const getStoredEmployee = async () => {
  const raw = await AsyncStorage.getItem(EMPLOYEE_KEY);
  return raw ? JSON.parse(raw) : null;
};
export const setStoredEmployee = employee =>
  AsyncStorage.setItem(EMPLOYEE_KEY, JSON.stringify(employee));
export const clearStoredEmployee = () => AsyncStorage.removeItem(EMPLOYEE_KEY);
