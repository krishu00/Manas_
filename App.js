import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import Dashboard from './components/Dashboard';
import LoginScreen from './components/Login/LoginScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loginLoading, setLoginLoading] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                setIsAuthenticated(!!token);
            } catch (error) {
                console.error('Error checking auth status:', error);
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    const handleLoginSuccess = async (token) => {
        setLoginLoading(true);

        try {
            await AsyncStorage.setItem('userToken', token);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Error saving token:', error);
        } finally {
            setLoginLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('userToken');
            setIsAuthenticated(false);
        } catch (error) {
            console.error('Error removing token:', error);
        }
    };

    const renderLoading = (color = "#0000ff") => (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={color} />
        </View>
    );

    if (loading) return renderLoading();
    if (loginLoading) return renderLoading("#00503D");

    return (
        <NavigationContainer>
            {isAuthenticated ? (
                <Dashboard onLogoutSuccess={handleLogout} />
            ) : (
                <LoginScreen onLoginSuccess={handleLoginSuccess} />
            )}
        </NavigationContainer>
    );
};

export default App;
   