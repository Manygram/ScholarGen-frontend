import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Switch,
  Image,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { authService } from '../services/authService';

const SettingsScreen = ({ navigation }) => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoPlayVideos, setAutoPlayVideos] = useState(false);

  const handleProfilePress = () => {
    Alert.alert(
      'Profile',
      'Profile management feature will be available soon!',
      [{ text: 'OK' }]
    );
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Reset Password',
      'Password reset functionality will be available soon!',
      [{ text: 'OK' }]
    );
  };

  const handleSubscribeCBT = () => {
    Alert.alert(
      'Subscribe to CBT',
      'Get access to premium Computer Based Test practice!\n\nFeatures:\n• Unlimited practice tests\n• Detailed explanations\n• Performance analytics\n• Offline access',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Subscribe Now', style: 'default' }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await authService.logout();
            // Navigate back to welcome screen
            navigation.reset({
              index: 0,
              routes: [{ name: 'Welcome' }],
            });
          }
        }
      ]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'About ScholarGen',
      'ScholarGen UTME App v1.0\n\nYour comprehensive learning companion for UTME preparation.\n\nDeveloped with ❤️ for Nigerian students.',
      [{ text: 'OK' }]
    );
  };

  const handleSupport = () => {
    Alert.alert(
      'Support',
      'Need help? Contact our support team:\n\nEmail: support@scholargen.com\nPhone: +234 xxx xxx xxxx\n\nWe\'re here to help you succeed!',
      [{ text: 'OK' }]
    );
  };

  const SettingItem = ({ icon, title, subtitle, onPress, rightComponent, showArrow = true }) => (
    <TouchableOpacity style={[styles.settingItem, { borderBottomColor: theme.border }]} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.settingLeft}>
        <View style={[styles.settingIcon, { backgroundColor: isDarkMode ? '#333' : '#f0f0f0' }]}>
          <Ionicons name={icon} size={20} color={theme.primary} />
        </View>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: theme.text }]}>{title}</Text>
          {subtitle && <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.settingRight}>
        {rightComponent}
        {showArrow && <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />}
      </View>
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }) => (
    <Text style={[styles.sectionHeader, { color: theme.text }]}>{title}</Text>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Settings</Text>
        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>Manage your account and preferences</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={[styles.profileCard, { backgroundColor: theme.card, shadowColor: theme.text }]}>
            <View style={[styles.profileImageContainer, { backgroundColor: isDarkMode ? '#333' : '#f0f0f0' }]}>
              <Image
                source={require('../../assets/splash-logo.png')}
                style={styles.profileImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: theme.text }]}>JAMB Student</Text>
              <Text style={[styles.profileEmail, { color: theme.textSecondary }]}>student@example.com</Text>
              <TouchableOpacity style={styles.editProfileButton} onPress={handleProfilePress}>
                <Text style={[styles.editProfileText, { color: theme.primary }]}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Streak Section */}
          <View style={[styles.streakContainer, { backgroundColor: isDarkMode ? '#1F2937' : '#FFF0E6', borderColor: isDarkMode ? '#374151' : '#FFDDC1' }]}>
            <View style={styles.streakContent}>
              <Image
                source={{ uri: 'https://rztgg9jpu58dsvst.public.blob.vercel-storage.com/IMG_7565.png' }}
                style={styles.streakIcon}
                resizeMode="contain"
              />
              <View>
                <Text style={[styles.streakCount, { color: '#FF5722' }]}>12 Day Streak!</Text>
                <Text style={[styles.streakSub, { color: theme.textSecondary }]}>Keep the fire burning!</Text>
              </View>
            </View>
            <Ionicons name="flame" size={24} color="#FF5722" />
          </View>
        </View>

        {/* Account Section */}
        <SectionHeader title="Account" />
        <View style={[styles.settingsSection, { backgroundColor: theme.card }]}>
          <SettingItem
            icon="person-outline"
            title="Profile"
            subtitle="Manage your personal information"
            onPress={handleProfilePress}
          />
          <SettingItem
            icon="key-outline"
            title="Change Password"
            subtitle="Update your account password"
            onPress={handleForgotPassword}
          />
          <SettingItem
            icon="card-outline"
            title="Subscribe to CBT"
            subtitle="Get premium access to practice tests"
            onPress={handleSubscribeCBT}
          />
        </View>

        {/* Preferences Section */}
        <SectionHeader title="Preferences" />
        <View style={[styles.settingsSection, { backgroundColor: theme.card }]}>
          <SettingItem
            icon="notifications-outline"
            title="Notifications"
            subtitle="Study reminders and updates"
            rightComponent={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#E5E5EA', true: '#FFC107' }}
                thumbColor="#fff"
              />
            }
            showArrow={false}
          />
          <SettingItem
            icon="moon-outline"
            title="Dark Mode"
            subtitle="Switch to dark theme"
            rightComponent={
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{ false: '#E5E5EA', true: theme.primary }}
                thumbColor="#fff"
              />
            }
            showArrow={false}
          />
          <SettingItem
            icon="play-circle-outline"
            title="Auto-play Videos"
            subtitle="Automatically play next video"
            rightComponent={
              <Switch
                value={autoPlayVideos}
                onValueChange={setAutoPlayVideos}
                trackColor={{ false: '#E5E5EA', true: '#FFC107' }}
                thumbColor="#fff"
              />
            }
            showArrow={false}
          />
        </View>

        {/* Support Section */}
        <SectionHeader title="Support" />
        <View style={[styles.settingsSection, { backgroundColor: theme.card }]}>
          <SettingItem
            icon="help-circle-outline"
            title="Help & Support"
            subtitle="Get help and contact support"
            onPress={handleSupport}
          />
          <SettingItem
            icon="information-circle-outline"
            title="About"
            subtitle="App version and information"
            onPress={handleAbout}
          />
          <SettingItem
            icon="star-outline"
            title="Rate App"
            subtitle="Rate us on the app store"
            onPress={() => Alert.alert('Rate App', 'Thank you for your feedback!')}
          />
        </View>

        {/* Logout Section */}
        <View style={[styles.settingsSection, { backgroundColor: theme.card }]}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>ScholarGen UTME App v1.0</Text>
          <Text style={[styles.footerSubtext, { color: theme.textSecondary }]}>Made with ❤️ for Nigerian students</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 20 : 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    padding: 16,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileImage: {
    width: 40,
    height: 40,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  editProfileButton: {
    alignSelf: 'flex-start',
  },
  editProfileText: {
    fontSize: 14,
    color: '#FFC107',
    fontWeight: '600',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginTop: 24,
    marginBottom: 8,
    marginHorizontal: 16,
  },
  settingsSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#999',
  },
  streakContainer: {
    marginTop: 16,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#FF5722',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  streakContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  streakIcon: {
    width: 40,
    height: 40,
  },
  streakCount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  streakSub: {
    fontSize: 12,
  },
});

export default SettingsScreen;