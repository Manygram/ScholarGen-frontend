import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Image,
  FlatList,
  Alert,
  Platform,
  StatusBar,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useDatabase } from '../context/DatabaseContext';

const { width, height } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);
  const flatListRef = useRef(null);

  // Hero slider images - utilizing user provided images
  const sliderImages = [
    {
      id: 1,
      title: 'Master UTME 2025',
      subtitle: 'Your path to success starts here',
      image: require('../../assets/hero/hero1.jpg'),
    },
    {
      id: 2,
      title: 'Study Smart',
      subtitle: 'Access comprehensive study materials',
      image: require('../../assets/hero/hero2.jpg'),
    },
    {
      id: 3,
      title: 'Practice Tests',
      subtitle: 'Take unlimited practice exams',
      image: require('../../assets/hero/hero3.jpg'),
    },
  ];

  // Quick action items
  const quickActions = [
    { id: 1, title: 'UTME Practice', icon: 'document-text-outline', color: '#FFC107' },
    { id: 3, title: 'Educational Games', icon: 'game-controller-outline', color: '#FF9800' },
    { id: 4, title: 'Flashcards', icon: 'albums-outline', color: '#9C27B0' },
    { id: 5, title: 'Calculator', icon: 'calculator-outline', color: '#F44336' },
    { id: 6, title: 'Activate App', icon: 'key-outline', color: '#607D8B' },
  ];

  // Flashcard data
  const flashcardsData = [
    {
      Q: "_____ is an economic activity which is widely recognized as a source of innovation that has an impact on economic development.",
      A: "Marketing",
      B: "Entrepreneurship", 
      C: "Finance",
      D: "Human resource management",
      Ans: "B",
      Solution: "Entrepreneurship is recognized as a key economic activity that drives innovation and contributes significantly to economic development through job creation, market expansion, and technological advancement."
    },
    {
      Q: "What is the engine for economic development and an integral part of entrepreneurship?",
      A: "Financial management",
      B: "Market research",
      C: "New venture creation",
      D: "Resource allocation",
      Ans: "C",
      Solution: "New venture creation is considered the engine for economic development as it generates new jobs, introduces innovative products and services, and stimulates economic growth. It's an integral part of entrepreneurship as it represents the implementation of entrepreneurial ideas."
    },
    {
      Q: "An individual who typically has limited resources attempting to efficiently utilize it to exploit a viable business idea is?",
      A: "Manager",
      B: "Investor",
      C: "Consultant",
      D: "Entrepreneur",
      Ans: "D",
      Solution: "An entrepreneur is defined as someone who identifies opportunities, takes risks, and efficiently utilizes limited resources to exploit viable business ideas for profit. This resource optimization is a key characteristic that distinguishes entrepreneurs from other business roles."
    }
  ];

  // Flashcard states
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const [touchMoved, setTouchMoved] = useState(false);

  // Recent activities from Database
  const { activities } = useDatabase();
  const recentActivities = [...activities].sort((a, b) => new Date(b.date) - new Date(a.date));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => {
        const nextSlide = (prevSlide + 1) % sliderImages.length;
        flatListRef.current?.scrollToIndex({ index: nextSlide, animated: true });
        return nextSlide;
      });
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const handleSlideChange = (event) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentSlide(slideIndex);
  };

  const handleQuickAction = (action) => {
    if (action.title === 'Calculator') {
      navigation.navigate('Calculator');
    } else if (action.title === 'UTME Practice') {
      navigation.navigate('ExamCategory');
    } else if (action.title === 'Educational Games') {
      navigation.navigate('Games');
    } else if (action.title === 'Flashcards') {
      navigation.navigate('FlashCard');
    } else if (action.title === 'Activate App') {
      navigation.navigate('Activation');
      return;
    } else {
      Alert.alert(action.title, `${action.title} feature will be available soon!`);
    }
  };

  // Flashcard functions
  const handleCardFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleTouchStart = (event) => {
    const touch = event.nativeEvent.touches[0];
    setTouchStartX(touch.pageX);
    setTouchStartY(touch.pageY);
    setTouchMoved(false);
  };

  const handleTouchMove = (event) => {
    if (!touchMoved) {
      const touch = event.nativeEvent.touches[0];
      const deltaX = touch.pageX - touchStartX;
      const deltaY = touch.pageY - touchStartY;
      
      if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
        setTouchMoved(true);
      }
    }
  };

  const handleTouchEnd = (event) => {
    if (!touchMoved) {
      // This was a tap, flip the card
      handleCardFlip();
      return;
    }

    const touch = event.nativeEvent.changedTouches[0];
    const deltaX = touch.pageX - touchStartX;
    const deltaY = touch.pageY - touchStartY;
    
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);
    
    if (absDeltaX > 80 && absDeltaX > absDeltaY) {
      // Horizontal swipe
      if (deltaX > 0) {
        // Swipe right - previous card
        setCurrentCardIndex(prev => Math.max(0, prev - 1));
      } else {
        // Swipe left - next card
        setCurrentCardIndex(prev => Math.min(flashcardsData.length - 1, prev + 1));
      }
      setIsFlipped(false); // Reset flip state when changing cards
    }
  };

  const renderFlashcard = () => {
    const card = flashcardsData[currentCardIndex];
    if (!card) return null;

    const questionText = card.Q.replace(/^\d+\.\s+/, '');
    const answerOption = card.Ans;
    const answerText = card[answerOption] || '';

    return (
      <View style={styles.flashcardContainer}>
        <View 
          style={[
            styles.flashcard,
            isFlipped && styles.flashcardFlipped
          ]}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Front of card */}
          <View style={[styles.flashcardFace, styles.flashcardFront]}>
            <Text style={styles.cardNumber}>{currentCardIndex + 1}/{flashcardsData.length}</Text>
            <Text style={styles.questionText}>{questionText}</Text>
            <View style={styles.tapHint}>
              <Ionicons name="hand-left-outline" size={20} color="#007AFF" />
              <Text style={styles.tapHintText}>Tap to flip</Text>
            </View>
          </View>

          {/* Back of card */}
          <View style={[styles.flashcardFace, styles.flashcardBack]}>
            <Text style={styles.answerText}>{answerText}</Text>
            <TouchableOpacity style={styles.flipButton} onPress={handleCardFlip}>
              <Ionicons name="refresh-outline" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderSliderItem = ({ item }) => (
    <View style={styles.slideItem}>
      <Image source={item.image} style={styles.slideImage} resizeMode="cover" />

    </View>
  );

  const renderQuickAction = (action) => (
    <TouchableOpacity
      key={action.id}
      style={[styles.quickActionItem, { backgroundColor: theme.card, shadowColor: theme.text }]}
      onPress={() => handleQuickAction(action)}
      activeOpacity={0.7}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: action.color + '15' }]}>
        <Ionicons name={action.icon} size={24} color={action.color} />
      </View>
      <Text style={[styles.quickActionText, { color: theme.text }]}>{action.title}</Text>
    </TouchableOpacity>
  );

  const renderRecentActivity = (activity) => (
    <TouchableOpacity key={activity.id} style={[styles.activityItem, { borderBottomColor: theme.border }]} activeOpacity={0.7}>
      <View style={[styles.activityIcon, { backgroundColor: activity.color }]}>
        <Ionicons name="book-outline" size={20} color="#fff" />
      </View>
      <View style={styles.activityContent}>
        <Text style={[styles.activityTitle, { color: theme.text }]}>{activity.title}</Text>
        <Text style={[styles.activitySubtitle, { color: theme.textSecondary }]}>{activity.subtitle}</Text>
      </View>
      <View style={styles.activityScore}>
        <Text style={[styles.scoreText, { color: activity.color }]}>{activity.score}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <View style={styles.headerLeft}>
          <Image
            source={require('../../assets/splash-logo.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <View>
            <Text style={[styles.headerTitle, { color: theme.text }]}>ScholarGen</Text>
            <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>UTME Preparation</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color={theme.text} />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Image Slider */}
        <View style={styles.sliderContainer}>
          <FlatList
            ref={flatListRef}
            data={sliderImages}
            renderItem={renderSliderItem}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleSlideChange}
            keyExtractor={(item) => item.id.toString()}
          />

          {/* Slider Indicators */}
          <View style={styles.indicatorContainer}>
            {sliderImages.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  { backgroundColor: currentSlide === index ? '#fff' : 'rgba(255,255,255,0.5)' }
                ]}
              />
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map(renderQuickAction)}
          </View>
        </View>

        {/* Flashcards Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Daily Flashcards</Text>
          
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View 
              style={[
                styles.progressBar, 
                { width: `${((currentCardIndex + 1) / flashcardsData.length) * 100}%` }
              ]} 
            />
          </View>

          {/* Flashcard */}
          {renderFlashcard()}
        </View>

        {/* Stats Overview */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Your Progress</Text>
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: theme.card, shadowColor: theme.text }]}>
              <Text style={styles.statNumber}>24</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Tests Taken</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.card, shadowColor: theme.text }]}>
              <Text style={styles.statNumber}>87%</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Average Score</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.card, shadowColor: theme.text }]}>
              <Text style={styles.statNumber}>156</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Study Hours</Text>
            </View>
          </View>
        </View>

        {/* Recent Activities */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Activities</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.activitiesContainer, { backgroundColor: theme.card, shadowColor: theme.text }]}>
            {recentActivities.map(renderRecentActivity)}
          </View>
        </View>

        {/* Study Reminder */}
        <View style={styles.section}>
          <View style={[styles.reminderCard, { backgroundColor: theme.card, shadowColor: theme.text }]}>
            <View style={[styles.reminderIcon, { backgroundColor: isDarkMode ? '#333' : '#f0f8ff' }]}>
              <Ionicons name="time-outline" size={24} color="#FFC107" />
            </View>
            <View style={styles.reminderContent}>
              <Text style={[styles.reminderTitle, { color: theme.text }]}>Daily Study Reminder</Text>
              <Text style={[styles.reminderText, { color: theme.textSecondary }]}>
                You've studied for 2 hours today. Keep up the great work!
              </Text>
            </View>
          </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
  },
  scrollView: {
    flex: 1,
  },
  sliderContainer: {
    height: 300,
    position: 'relative',
  },
  slideItem: {
    width: width,
    height: 300,
    position: 'relative',
  },
  slideImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  slideOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  slideTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  },
  slideSubtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: '#FFC107',
    fontWeight: '600',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  quickActionItem: {
    width: (width - 70) / 2, // 2 columns with spacing
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFC107',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  activitiesContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  activitySubtitle: {
    fontSize: 14,
    color: '#666',
  },
  activityScore: {
    alignItems: 'flex-end',
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  reminderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
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
  reminderIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  reminderContent: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  reminderText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  // Flashcard styles
  flashcardContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  flashcard: {
    width: width * 0.85,
    height: 300,
    position: 'relative',
    transform: [{ perspective: 1000 }],
  },
  flashcardFlipped: {
    transform: [{ rotateY: '180deg' }],
  },
  flashcardFace: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    borderRadius: 15,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  flashcardFront: {
    backgroundColor: '#007AFF',
    transform: [{ rotateY: '0deg' }],
  },
  flashcardBack: {
    backgroundColor: '#E3F2FD',
    transform: [{ rotateY: '180deg' }],
  },
  cardNumber: {
    position: 'absolute',
    top: 15,
    right: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '600',
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 24,
  },
  answerText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
    textAlign: 'center',
    lineHeight: 22,
  },
  tapHint: {
    position: 'absolute',
    bottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tapHintText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginLeft: 5,
  },
  flipButton: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    height: 4,
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    borderRadius: 2,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
});

export default HomeScreen;