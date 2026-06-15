import axios from 'axios';
import { MMKV } from 'react-native-mmkv';
import { API_URL } from '@env';

// 👇 1. Create a local instance of MMKV for this file to use
const storage = new MMKV();

export const apiMiddleware = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
console.log('API Base URL:??????', API_URL);

export const getHeaders = () => {   
  // 👇 2. Change 'MMKV.getString' to 'storage.getString'
  const employeeId = storage.getString('employee_id');
  const companyCode = storage.getString('companyCode');

  if (!employeeId || !companyCode) throw new Error('Missing credentials');
  return {
    Cookie: `employee_id=${employeeId}; companyCode=${companyCode}`,
  };
};

export const punchIn = async (latitude, longitude) => {
  try {
    const response = await apiMiddleware.post(
      '/attendance/punch_in',
      { data: { latitude, longitude } },
      { headers: getHeaders() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Punch In failed';
  }
};

export const punchOut = async (latitude, longitude) => {
  try {
    const response = await apiMiddleware.put(
      '/attendance/punch_out',
      { data: { latitude, longitude } },
      { headers: getHeaders() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Punch Out failed';
  }
};

export const checkPunchStatus = async (date) => {
  try {
    const response = await apiMiddleware.get(
      `/attendance/daily_attendance?date=${date}`,
      { headers: getHeaders() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Error checking punch status';
  }
};