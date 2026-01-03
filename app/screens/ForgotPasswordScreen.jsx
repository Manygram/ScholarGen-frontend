import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { authService } from '../services/authService';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      const { status, data } = await authService.forgotPassword(email);
      if (status === 200 || status === 201) {
        Alert.alert('Success', 'OTP code sent to your email.');
        setStep(2);
      } else {
        throw new Error(data?.message || 'Failed to send OTP');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otp || !newPassword) {
      Alert.alert('Error', 'Please enter both OTP and new password');
      return;
    }

    setIsLoading(true);
    try {
      const { status, data } = await authService.resetPassword(email, otp, newPassword);
      if (status === 200 || status === 201) {
        Alert.alert('Success', 'Password reset successful! Please login with your new password.');
        navigation.navigate('Welcome'); // or goBack
      } else {
        throw new Error(data?.message || 'Failed to reset password');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.titleText}>{step === 1 ? 'Forgot Password?' : 'Reset Password'}</Text>
          <Text style={styles.subtitleText}>
            {step === 1
              ? "Don't worry! It occurs. Please enter the email address linked with your account."
              : `Enter the OTP sent to ${email} and your new password.`
            }
          </Text>

          <View style={styles.formContainer}>
            {step === 1 ? (
              // STEP 1: Email Input
              <View style={styles.inputContainer}>
                <View style={styles.iconContainer}>
                  <Text style={styles.icon}>👤</Text>
                </View>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            ) : (
              // STEP 2: OTP & New Password Inputs
              <>
                <View style={styles.inputContainer}>
                  <View style={styles.iconContainer}>
                    <Text style={styles.icon}>🔢</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    value={otp}
                    onChangeText={setOtp}
                    placeholder="Enter 'Reset Password' OTP Code"
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <View style={styles.iconContainer}>
                    <Text style={styles.icon}>🔒</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="New Password"
                    secureTextEntry
                  />
                </View>
              </>
            )}

            <TouchableOpacity
              style={[styles.nextButton, { opacity: isLoading ? 0.7 : 1 }]}
              onPress={step === 1 ? handleSendOtp : handleResetPassword}
              disabled={isLoading}
            >
              <Text style={styles.nextButtonText}>
                {isLoading ? 'Processing...' : (step === 1 ? 'Send OTP' : 'Reset Password')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backToLoginButton}
              onPress={() => step === 1 ? navigation.goBack() : setStep(1)}
            >
              <Text style={styles.backToLoginText}>{step === 1 ? 'Back to Login' : 'Change Email'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.logoText}>ScholarGen</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#000000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  titleText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
  },
  subtitleText: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
    marginBottom: 40,
  },
  formContainer: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    marginBottom: 32,
    paddingHorizontal: 16,
    height: 56,
  },
  iconContainer: {
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
  },
  nextButton: {
    backgroundColor: '#1976D2',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  backToLoginButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  backToLoginText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 30,
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
  },
});