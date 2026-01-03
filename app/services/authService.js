import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from './apiClient';

export const authService = {
    // Register a new user
    register: async (name, email, password, referralCode) => {
        return apiClient.post('/auth/register', { name, email, password, referralCode });
    },

    // Verify OTP
    verify: async (email, otp) => {
        return apiClient.post('/auth/verify', { email, otp });
    },

    // Login user
    login: async (email, password) => {
        return apiClient.post('/auth/login', { email, password });
    },

    // Refresh Token
    refreshToken: async (refreshToken) => {
        return apiClient.post('/auth/refresh', { refreshToken });
    },

    // Forgot Password
    forgotPassword: async (email) => {
        return apiClient.post('/auth/forgot-password', { email });
    },

    // Reset Password
    resetPassword: async (email, otp, newPassword) => {
        return apiClient.post('/auth/reset-password', { email, otp, newPassword });
    },

    // Change Password
    changePassword: async (currentPassword, newPassword) => {
        return apiClient.post('/auth/change-password', { currentPassword, newPassword });
    },

    // Save user session
    saveSession: async (userData) => {
        try {
            await AsyncStorage.setItem('user', JSON.stringify(userData));
            if (userData.token) {
                await AsyncStorage.setItem('userToken', userData.token);
            }
            if (userData.refreshToken) {
                await AsyncStorage.setItem('refreshToken', userData.refreshToken);
            }
        } catch (e) {
            console.error('Error saving session', e);
        }
    },

    // Get user session
    getSession: async () => {
        try {
            const user = await AsyncStorage.getItem('user');
            return user ? JSON.parse(user) : null;
        } catch (e) {
            return null;
        }
    },

    // Logout
    logout: async () => {
        try {
            await AsyncStorage.multiRemove(['user', 'userToken', 'refreshToken']);
        } catch (e) {
            console.error('Error logging out', e);
        }
    }
};
