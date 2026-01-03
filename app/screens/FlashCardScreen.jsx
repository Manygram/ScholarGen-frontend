import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  PanResponder,
  Animated,
  ActivityIndicator,
  Alert,
  StatusBar,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// --- CONFIGURATION ---
const PRIMARY_COLOR = '#007AFF'; // Blue
const SWIPE_THRESHOLD = -100; // Distance required to swipe up

const CARD_THEMES = [
  { name: 'blue', front: '#e3f2fd', back: '#90caf9', text: '#0d47a1' },
  { name: 'red', front: '#ffebee', back: '#ef9a9a', text: '#b71c1c' },
  { name: 'purple', front: '#f3e5f5', back: '#ce93d8', text: '#4a148c' },
  { name: 'green', front: '#e8f5e9', back: '#a5d6a7', text: '#1b5e20' },
  { name: 'black', front: '#eeeeee', back: '#9e9e9e', text: '#212121' },
  { name: 'brown', front: '#efebe9', back: '#bcaaa4', text: '#3e2723' },
];

const FlashCardScreen = ({ navigation }) => {
  // --- STATE ---
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);

  // We keep state for Rendering...
  const [currentIndex, setCurrentIndex] = useState(0);

  // ...But we use REFS for the Logic/PanResponder to avoid "stale state" bugs
  const indexRef = useRef(0);
  const flashcardsRef = useRef([]); // To access data inside PanResponder
  const isFlippedRef = useRef(false); // To track flip state inside PanResponder

  // --- ANIMATION VALUES ---
  const flipAnim = useRef(new Animated.Value(0)).current;
  const position = useRef(new Animated.ValueXY()).current;

  // --- FETCH DATA ---
  useEffect(() => {
    fetchFlashcards();
  }, []);

  // Sync refs whenever state changes
  useEffect(() => {
    indexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    flashcardsRef.current = flashcards;
  }, [flashcards]);

  const fetchFlashcards = async () => {
    try {
      setLoading(true);
      setTimeout(() => {
        const mockData = {
          flashcards: [
            { _id: "1", question: "What is the capital of France?", answer: "Paris" },
            { _id: "2", question: "What is 2 + 2?", answer: "4" },
            { _id: "3", question: "Who wrote Hamlet?", answer: "William Shakespeare" },
            { _id: "4", question: "What is the boiling point of water?", answer: "100°C" },
            { _id: "5", question: "Which planet is known as the Red Planet?", answer: "Mars" },
            { _id: "6", question: "What is the largest mammal?", answer: "Blue Whale" },
            { _id: "7", question: "How many continents are there?", answer: "Seven" }
          ]
        };
        const shuffled = [...mockData.flashcards].sort(() => Math.random() - 0.5);

        setFlashcards(shuffled);
        flashcardsRef.current = shuffled; // Important: Update Ref immediately
        setLoading(false);
      }, 1000);
    } catch (error) {
      Alert.alert("Error", "Failed to load flashcards");
      setLoading(false);
    }
  };

  // --- ANIMATION LOGIC ---
  const flipCard = () => {
    // Check the REF, not the state, for the most current truth
    const isCurrentlyFlipped = isFlippedRef.current;
    const toValue = isCurrentlyFlipped ? 0 : 180;

    Animated.spring(flipAnim, {
      toValue,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();

    // Update the Ref immediately
    isFlippedRef.current = !isCurrentlyFlipped;
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      friction: 4,
      useNativeDriver: true
    }).start();
  };

  const forceSwipeUp = () => {
    Animated.timing(position, {
      toValue: { x: 0, y: -height },
      duration: 250,
      useNativeDriver: true
    }).start(() => onSwipeComplete());
  };

  const onSwipeComplete = () => {
    // 1. Reset Animation Values Instantly
    position.setValue({ x: 0, y: 0 });
    flipAnim.setValue(0);
    isFlippedRef.current = false; // Reset flip ref

    // 2. Check if we have cards left using Refs
    const currentI = indexRef.current;
    const totalCards = flashcardsRef.current.length;

    if (currentI < totalCards - 1) {
      // Move to next card
      setCurrentIndex(prev => prev + 1);
    } else {
      // Completed
      Alert.alert('Completed!', "You've finished the deck.", [
        { text: 'Restart', onPress: resetGame },
        { text: 'Go Back', onPress: () => navigation?.goBack() }
      ]);
    }
  };

  const resetGame = () => {
    // 1. Reset Logic Refs
    indexRef.current = 0;
    isFlippedRef.current = false;

    // 2. Reset Animation Values
    position.setValue({ x: 0, y: 0 });
    flipAnim.setValue(0);

    // 3. Reshuffle and Set State
    const reshuffled = [...flashcardsRef.current].sort(() => Math.random() - 0.5);
    setFlashcards(reshuffled);
    setCurrentIndex(0);
  };

  // --- GESTURE HANDLER ---
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,

      onPanResponderMove: (_, gestureState) => {
        // Use Refs to check bounds
        if (indexRef.current >= flashcardsRef.current.length) return;
        position.setValue({ x: gestureState.dx * 0.4, y: gestureState.dy });
      },

      onPanResponderRelease: (_, gestureState) => {
        // SWIPE UP
        if (gestureState.dy < SWIPE_THRESHOLD) {
          forceSwipeUp();
        }
        // TAP (Flip) - Check if movement is minimal
        else if (Math.abs(gestureState.dx) < 10 && Math.abs(gestureState.dy) < 10) {
          flipCard();
          resetPosition();
        }
        // RESET (Snap back)
        else {
          resetPosition();
        }
      }
    })
  ).current;

  // --- INTERPOLATIONS ---
  const frontInterpolate = flipAnim.interpolate({ inputRange: [0, 180], outputRange: ['0deg', '180deg'] });
  const backInterpolate = flipAnim.interpolate({ inputRange: [0, 180], outputRange: ['180deg', '360deg'] });
  const frontOpacity = flipAnim.interpolate({ inputRange: [89, 90], outputRange: [1, 0] });
  const backOpacity = flipAnim.interpolate({ inputRange: [89, 90], outputRange: [0, 1] });
  const cardRotate = position.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp'
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        <Text style={{ marginTop: 10, color: '#666' }}>Loading Deck...</Text>
      </View>
    );
  }

  // --- RENDER HELPERS ---
  const renderTopCard = () => {
    if (currentIndex >= flashcards.length) return null;

    const item = flashcards[currentIndex];
    const theme = CARD_THEMES[currentIndex % CARD_THEMES.length];

    return (
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.flashcard,
          {
            zIndex: 3,
            transform: [
              { translateY: position.y },
              { translateX: position.x },
              { rotate: cardRotate }
            ]
          }
        ]}
      >
        {/* Front Face */}
        <Animated.View style={[styles.cardFace, styles.cardFront, {
          backgroundColor: theme.front,
          transform: [{ rotateY: frontInterpolate }],
          opacity: frontOpacity
        }]}>
          <Text style={[styles.questionText, { color: theme.text }]}>{item.question}</Text>

          <View style={[styles.flipButton, { backgroundColor: PRIMARY_COLOR }]}>
            <Ionicons name="refresh" size={18} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.flipButtonText}>Flip to Answer</Text>
          </View>

          <Text style={styles.cardNumber}>{currentIndex + 1}/{flashcards.length}</Text>
        </Animated.View>

        {/* Back Face */}
        <Animated.View style={[styles.cardFace, styles.cardBack, {
          backgroundColor: theme.back,
          transform: [{ rotateY: backInterpolate }],
          opacity: backOpacity,
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0
        }]}>
          <Text style={[styles.answerText, { color: theme.text }]}>{item.answer}</Text>

          {/* Flip Back Button (Tap anywhere works too, but this guides the user) */}
          <View style={[styles.flipButton, { backgroundColor: PRIMARY_COLOR, marginTop: 30 }]}>
            <Ionicons name="refresh" size={18} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.flipButtonText}>Back to Question</Text>
          </View>

          <Text style={styles.cardNumber}>{currentIndex + 1}/{flashcards.length}</Text>
        </Animated.View>
      </Animated.View>
    );
  };

  // Stack Card 2
  const renderSecondCard = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= flashcards.length) return null;
    const item = flashcards[nextIndex];
    const theme = CARD_THEMES[nextIndex % CARD_THEMES.length];

    return (
      <View style={[styles.flashcard, { zIndex: 2, top: 15, transform: [{ scale: 0.95 }] }]}>
        <View style={[styles.cardFace, styles.cardFront, { backgroundColor: theme.front }]}>
          <Text style={[styles.questionText, { color: theme.text }]}>{item.question}</Text>
          <View style={[styles.flipButton, { backgroundColor: PRIMARY_COLOR, opacity: 0.5 }]}>
            <Text style={styles.flipButtonText}>Flip</Text>
          </View>
          <Text style={styles.cardNumber}>{nextIndex + 1}/{flashcards.length}</Text>
        </View>
      </View>
    );
  };

  // Stack Card 3
  const renderThirdCard = () => {
    const nextIndex = currentIndex + 2;
    if (nextIndex >= flashcards.length) return null;
    const item = flashcards[nextIndex];
    const theme = CARD_THEMES[nextIndex % CARD_THEMES.length];

    return (
      <View style={[styles.flashcard, { zIndex: 1, top: 30, transform: [{ scale: 0.90 }] }]}>
        <View style={[styles.cardFace, styles.cardFront, { backgroundColor: theme.front }]}>
          <Text style={[styles.questionText, { color: theme.text }]}>{item.question}</Text>
          <View style={[styles.flipButton, { backgroundColor: PRIMARY_COLOR, opacity: 0.3 }]}>
            <Text style={styles.flipButtonText}>Flip</Text>
          </View>
          <Text style={styles.cardNumber}>{nextIndex + 1}/{flashcards.length}</Text>
        </View>
      </View>
    );
  };

  const progressPercent = flashcards.length > 0 ? ((currentIndex) / flashcards.length) * 100 : 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={PRIMARY_COLOR} />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Flashcards</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.mainContent}>
        <View style={styles.cardsWrapper}>
          {renderThirdCard()}
          {renderSecondCard()}
          {renderTopCard()}
        </View>

        <View style={styles.swipeIndicator}>
          <Ionicons name="chevron-up" size={24} color={PRIMARY_COLOR} />
          <Text style={styles.swipeText}>Swipe up for next card</Text>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.track}>
            <View style={[styles.bar, { width: `${progressPercent}%` }]} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#f8fafc',
    zIndex: 100,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    color: PRIMARY_COLOR,
    fontWeight: '500',
    marginLeft: 5,
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingBottom: 50,
  },
  cardsWrapper: {
    width: width * 0.9,
    maxWidth: 350,
    height: 420,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  flashcard: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  cardFace: {
    flex: 1,
    borderRadius: 20,
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backfaceVisibility: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  cardFront: {},
  cardBack: {},
  questionText: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 32,
  },
  answerText: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  cardNumber: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    fontSize: 14,
    color: 'rgba(0,0,0,0.4)',
    fontWeight: '600',
  },
  flipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 12,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  flipButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  swipeIndicator: {
    alignItems: 'center',
    marginTop: 40,
    opacity: 0.6,
  },
  swipeText: {
    color: '#64748b',
    marginTop: 5,
    fontSize: 14,
    fontWeight: '500',
  },
  progressContainer: {
    width: '85%',
    position: 'absolute',
    bottom: 30,
  },
  track: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 4,
  },
});

export default FlashCardScreen;