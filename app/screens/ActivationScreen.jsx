import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Platform, ScrollView, Alert, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/authService';
import { subscriptionService } from '../services/subscriptionService';
import { apiClient } from '../services/apiClient'; // Import apiClient directly
import { Platform as RNPlatform } from 'react-native';

const ActivationScreen = ({ navigation }) => {
    const { theme, isDarkMode } = useTheme();
    const [showSuccess, setShowSuccess] = useState(false);

    // User State
    const [userEmail, setUserEmail] = useState('');

    // Payment State
    const [showGateway, setShowGateway] = useState(false);
    const [paymentUrl, setPaymentUrl] = useState(null);
    const [transactionRef, setTransactionRef] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Price State
    const [subscriptionPrice, setSubscriptionPrice] = useState(3000);
    const [isPriceLoading, setIsPriceLoading] = useState(true);

    // Brand Palette
    const brandPalette = {
        primary: '#007AFF',
        secondary: '#0056b3',
        accent: '#E3F2FD',
        card: isDarkMode ? '#1e1e1e' : '#fff',
        background: isDarkMode ? '#121212' : '#F5F7FA',
        text: isDarkMode ? '#fff' : '#333333',
        textSecondary: isDarkMode ? '#aaa' : '#666666',
        success: '#4CD964',
    };

    // ---------------------------------------------------------
    // 1. Setup: Get User Email & Price
    // ---------------------------------------------------------
    useEffect(() => {
        const initData = async () => {
            try {
                // Get Email from Session
                const user = await authService.getSession();
                if (user && user.email) {
                    console.log("User email found:", user.email);
                    setUserEmail(user.email);
                }

                // Get Price from API using subscriptionService
                setIsPriceLoading(true);
                try {
                    const response = await subscriptionService.getSubscriptionPrice();
                    if (response.data && response.data.price) {
                        setSubscriptionPrice(response.data.price);
                    }
                } catch (error) {
                    console.log("Price fetch error (using default):", error.message);
                } finally {
                    setIsPriceLoading(false);
                }
            } catch (error) {
                console.log("Setup Error:", error.message);
            }
        };

        initData();
    }, []);

    // ---------------------------------------------------------
    // 2. Initialize: Ask Render Server for Paystack URL
    // ---------------------------------------------------------
    const initializePayment = async () => {
        if (!userEmail) {
            Alert.alert("Error", "User email is missing. Please log out and log in again.");
            return;
        }

        setIsLoading(true);
        try {
            // Generate a proper UUID for device ID
            const generateUUID = () => {
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                    const r = Math.random() * 16 | 0;
                    const v = c === 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
            };

            const deviceId = generateUUID();
            console.log('Generated Device ID:', deviceId);

            const payload = {
                plan: 'lifetime',
                deviceId: deviceId
            };

            console.log('Sending Initialization Payload:', JSON.stringify(payload));

            // Validate payload before sending
            if (!payload.deviceId || payload.deviceId.length !== 36) {
                throw new Error('Invalid device ID generated');
            }

            // Use fetch directly like payment.html for better control
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                throw new Error('No authentication token found. Please log out and log in again.');
            }

            console.log('Using auth token (first 20 chars):', token.substring(0, 20) + '...');

            const response = await fetch('https://scholargenapi.onrender.com/api/subscriptions/initialize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            console.log('API Response status:', response.status);
            console.log('API Response headers:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                const errorText = await response.text();
                console.log('Error response body:', errorText);

                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch (e) {
                    errorData = { message: errorText };
                }

                throw new Error(errorData.message || `HTTP ${response.status}: ${errorText}`);
            }

            const serverResponse = await response.json();

            console.log('✅ Server Response Success:', JSON.stringify(serverResponse, null, 2));

            // Check structure: Backend usually returns { message: "...", data: { authorization_url: "..." } }
            // So we look for data.data.authorization_url OR data.authorization_url depending on your backend
            const paystackData = serverResponse.data || serverResponse;

            if (paystackData && paystackData.authorization_url) {
                console.log('Payment URL received:', paystackData.authorization_url);
                setPaymentUrl(paystackData.authorization_url);
                setTransactionRef(paystackData.reference || paystackData.data?.reference);
                setShowGateway(true);
            } else {
                console.log("Invalid Response Structure:", serverResponse);
                Alert.alert('Error', 'Server response did not contain payment URL. Please contact support.');
            }
        } catch (error) {
            console.error('Init Error Details:', error);

            // Handle different error types like the payment.html example
            let userFriendlyMessage = "Payment initialization failed. Please try again.";
            let statusCode = 500; // Default to server error

            // Check if it's an axios error with response
            if (error.response) {
                statusCode = error.response.status;
                const serverMsg = error.response.data?.message || error.message;

                if (statusCode === 500) {
                    userFriendlyMessage = "Server error occurred. Please try again later or contact support.";
                } else if (statusCode === 401) {
                    userFriendlyMessage = "Authentication failed. Please log out and log in again.";
                } else if (statusCode === 400) {
                    userFriendlyMessage = `Invalid request: ${serverMsg}`;
                }
            } else if (error.message && error.message.includes('Network')) {
                // Network error (no internet, timeout, etc.)
                userFriendlyMessage = "Network connection failed. Please check your internet connection.";
                statusCode = "Network";
            } else {
                // Other errors
                userFriendlyMessage = `Payment initialization failed: ${error.message || 'Unknown error'}`;
            }

            Alert.alert('Payment Initialization Failed', userFriendlyMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // ---------------------------------------------------------
    // 3. Verify: Check if payment worked
    // ---------------------------------------------------------
    const verifyPayment = async (reference) => {
        if (!reference) return;

        try {
            const response = await apiClient.get(`/subscriptions/verify/${reference}`);

            const data = response.data;

            if (data.status === 'success' || data.message === 'Payment successful' || data.user?.premium?.active) {
                setShowGateway(false);
                setShowSuccess(true);
            } else {
                Alert.alert('Status', 'Payment is still processing. Please wait.');
            }
        } catch (error) {
            console.log('Verify Error', error);
            Alert.alert('Verification Error', 'Could not verify payment yet. Please check your internet.');
        }
    };

    // ---------------------------------------------------------
    // 4. The "Inline" Modal Component
    // ---------------------------------------------------------
    const PaystackInlineModal = () => {
        return (
            <Modal
                visible={showGateway}
                onRequestClose={() => setShowGateway(false)}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <SafeAreaView style={{ flex: 1, backgroundColor: brandPalette.background }}>

                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setShowGateway(false)}>
                            <Text style={{ color: brandPalette.text, fontSize: 16 }}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={[styles.modalTitle, { color: brandPalette.text }]}>Secure Payment</Text>
                        <TouchableOpacity onPress={() => verifyPayment(transactionRef)}>
                            <Text style={{ color: brandPalette.success, fontWeight: 'bold', fontSize: 16 }}>Done</Text>
                        </TouchableOpacity>
                    </View>

                    {paymentUrl ? (
                        <WebView
                            source={{ uri: paymentUrl }}
                            style={{ flex: 1 }}
                            startInLoadingState={true}
                            renderLoading={() => (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="large" color={brandPalette.primary} />
                                </View>
                            )}
                            onNavigationStateChange={(state) => {
                                const { url } = state;
                                if (url.includes('callback') || url.includes('success') || url.includes('close')) {
                                    verifyPayment(transactionRef);
                                }
                            }}
                        />
                    ) : (
                        <View style={styles.loadingContainer}>
                            <Text style={{ color: brandPalette.text }}>Loading Payment Page...</Text>
                        </View>
                    )}
                </SafeAreaView>
            </Modal>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: brandPalette.background }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={brandPalette.background} />

            <View style={[styles.header, { backgroundColor: brandPalette.card }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={brandPalette.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: brandPalette.text }]}>Premium Access</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                <View style={styles.heroCard}>
                    <View style={styles.heroIconContainer}>
                        <Ionicons name="ribbon" size={40} color="#fff" />
                    </View>
                    <Text style={styles.heroTitle}>Unlock Unlimited Access</Text>
                    <Text style={styles.heroSubtitle}>Get complete access to all features and study materials.</Text>
                </View>

                <View style={[styles.priceContainer, { backgroundColor: brandPalette.card }]}>
                    <Text style={[styles.priceLabel, { color: brandPalette.textSecondary }]}>LIFETIME PLAN</Text>
                    {isPriceLoading ? (
                        <ActivityIndicator size="small" color={brandPalette.primary} style={{ marginVertical: 20 }} />
                    ) : (
                        <View style={styles.priceWrapper}>
                            <Text style={[styles.currency, { color: brandPalette.primary }]}>₦</Text>
                            <Text style={[styles.amount, { color: brandPalette.text }]}>
                                {subscriptionPrice.toLocaleString()}
                            </Text>
                        </View>
                    )}
                    <View style={styles.secureBadge}>
                        <Ionicons name="shield-checkmark" size={14} color={brandPalette.success} />
                        <Text style={[styles.secureText, { color: brandPalette.textSecondary }]}> Secure payment via Paystack</Text>
                    </View>
                </View>

                <View style={styles.featuresContainer}>
                    <Text style={[styles.sectionTitle, { color: brandPalette.text }]}>What's Included</Text>
                    {[
                        "Access to 1994 - 2025 Past Questions",
                        "Detailed Explanations & Solutions",
                        "Unlimited CBT Practice Mode",
                        "Performance Analytics & Tracking",
                        "Ad-Free Study Experience"
                    ].map((feature, index) => (
                        <View key={index} style={[styles.featureRow, { backgroundColor: brandPalette.card }]}>
                            <View style={styles.checkIcon}>
                                <Ionicons name="checkmark" size={16} color="#fff" />
                            </View>
                            <Text style={[styles.featureText, { color: brandPalette.text }]}>{feature}</Text>
                        </View>
                    ))}
                </View>

                <TouchableOpacity
                    style={[styles.mainButton, { backgroundColor: brandPalette.primary }]}
                    onPress={initializePayment}
                    disabled={isLoading || isPriceLoading}
                    activeOpacity={0.8}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.mainButtonText}>
                            Activate Now {isPriceLoading ? '' : `- ₦${subscriptionPrice.toLocaleString()}`}
                        </Text>
                    )}
                </TouchableOpacity>

            </ScrollView>

            <PaystackInlineModal />

            <Modal transparent={true} visible={showSuccess} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.successCard, { backgroundColor: brandPalette.card }]}>
                        <View style={styles.successIcon}>
                            <Ionicons name="checkmark" size={40} color="#fff" />
                        </View>
                        <Text style={[styles.successTitle, { color: brandPalette.text }]}>Payment Successful!</Text>
                        <Text style={[styles.successMessage, { color: brandPalette.textSecondary }]}>
                            You are now a premium member. Enjoy your learning journey!
                        </Text>
                        <TouchableOpacity
                            style={[styles.continueButton, { backgroundColor: brandPalette.primary }]}
                            onPress={() => { setShowSuccess(false); navigation.navigate('MainTabs'); }}
                        >
                            <Text style={styles.continueButtonText}>Start Learning</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingVertical: 16,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 10,
        borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    backButton: { padding: 8, marginLeft: -8 },
    headerTitle: { fontSize: 18, fontWeight: '600' },
    content: { padding: 20, paddingBottom: 40 },
    heroCard: {
        backgroundColor: '#007AFF', borderRadius: 24, padding: 30, alignItems: 'center', marginBottom: 24,
        shadowColor: "#007AFF", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 8,
    },
    heroIconContainer: {
        width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center', alignItems: 'center', marginBottom: 16,
    },
    heroTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 8 },
    heroSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.9)', textAlign: 'center', lineHeight: 20 },
    priceContainer: {
        borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 24,
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
    },
    priceLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 1, marginBottom: 8 },
    priceWrapper: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
    currency: { fontSize: 24, fontWeight: '600', marginTop: 6, marginRight: 4 },
    amount: { fontSize: 48, fontWeight: 'bold' },
    secureBadge: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(76, 217, 100, 0.1)',
        paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    },
    secureText: { fontSize: 12, fontWeight: '500' },
    featuresContainer: { marginBottom: 30 },
    sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16, marginLeft: 4 },
    featureRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 12 },
    checkIcon: {
        width: 24, height: 24, borderRadius: 12, backgroundColor: '#007AFF',
        justifyContent: 'center', alignItems: 'center', marginRight: 16,
    },
    featureText: { fontSize: 15, fontWeight: '500', flex: 1 },
    mainButton: {
        height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 20,
        shadowColor: "#007AFF", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
    },
    mainButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

    // Modal & Loading
    modalHeader: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    modalTitle: { fontSize: 18, fontWeight: '600' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    successCard: { width: '100%', borderRadius: 30, padding: 30, alignItems: 'center' },
    successIcon: {
        width: 80, height: 80, borderRadius: 40, backgroundColor: '#4CD964',
        justifyContent: 'center', alignItems: 'center', marginBottom: 20,
        shadowColor: "#4CD964", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
    },
    successTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
    successMessage: { fontSize: 16, textAlign: 'center', marginBottom: 30, lineHeight: 24 },
    continueButton: { width: '100%', height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
    continueButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default ActivationScreen;