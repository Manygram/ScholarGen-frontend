import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

// Import screen components
import HomeScreen from '../screens/HomeScreen.jsx';
import VideosScreen from '../screens/VideosScreen.jsx';
import StudyScreen from '../screens/StudyScreen.jsx';
import SettingsScreen from '../screens/SettingsScreen.jsx';

const MainTabNavigator = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { name: 'Home', icon: 'home', component: HomeScreen },
    { name: 'Videos', icon: 'play-circle', component: VideosScreen },
    { name: 'Study', icon: 'book', component: StudyScreen },
    { name: 'Profile', icon: 'person-outline', component: SettingsScreen },
  ];

  const handleTabPress = (index) => {
    setActiveTab(index);
  };

  const renderContent = () => {
    const Component = tabs[activeTab].component;
    return <Component navigation={navigation} />;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.background} />

      {/* Main Content Area */}
      <View style={styles.contentContainer}>
        {renderContent()}
      </View>

      {/* Bottom Tab Navigation */}
      <View style={[styles.bottomTabContainer, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
        <View style={styles.tabBar}>
          {tabs.map((tab, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.tabItem,
                activeTab === index && styles.activeTabItem,
              ]}
              onPress={() => handleTabPress(index)}
            >
              <View style={styles.tabIconContainer}>
                <Ionicons
                  name={tab.icon}
                  size={24}
                  color={activeTab === index ? theme.primary : theme.textSecondary}
                />
                {activeTab === index && <View style={[styles.activeIndicator, { backgroundColor: theme.primary }]} />}
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === index && { color: theme.primary, fontWeight: '600' },
                ]}
              >
                {tab.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    flex: 1,
  },
  bottomTabContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingBottom: 20,
    paddingTop: 10,
    width: '100%',
    // Removed absolute positioning to ensure it sits below content in flex layout
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 60,
  },
  activeTabItem: {
    // Additional styling for active tab if needed
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 4,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#007AFF',
  },
  tabLabel: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#007AFF', // This will be overridden by inline style if needed, but let's keep it simple for now or use theme.primary in render
    fontWeight: '600',
  },
});

export default MainTabNavigator;