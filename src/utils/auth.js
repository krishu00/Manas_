import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'userToken';

export const getAuthToken = async () => {

    try {

        return await AsyncStorage.getItem(TOKEN_KEY);

    } catch (error) {

        console.error('Get auth token error:', error);

        return null;

    }

};

export const isUserLoggedIn = async () => {

    const token = await getAuthToken();

    return !!token;

};

export const clearAuth = async () => {

    try {

        await AsyncStorage.removeItem('userToken');

        await AsyncStorage.removeItem('loginTime');

    } catch (error) {

        console.error('Clear auth error:', error);

    }

};