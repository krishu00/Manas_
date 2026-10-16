import apiClient from './client';
import { getAuthToken } from '../utils/auth';

/**
 * Reuses the existing Manas authentication endpoint. Adjust the path/body
 * shape below to match your real backend if it differs — this mirrors the
 * common pattern (POST email+password → { token, employee }).
 */
export const login = async (email, password) => {
  const res = await apiClient.post('/auth/login', { email, password });
  return res.data; // expected: { token, employee }
};

export const logout = async () => {
  const token = await getAuthToken();

  return apiClient.post(
    '/logout',
    {},
    {
      withCredentials: true,
      headers: token
        ? { Authorization: `Bearer ${token}` }
        : undefined,
    },
  );
};
