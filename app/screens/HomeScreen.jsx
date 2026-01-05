import { useState, useRef, useEffect } from "react"
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
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router" // <--- Import Router
import { useTheme } from "../context/ThemeContext"
import { useDatabase } from "../context/DatabaseContext"

const { width } = Dimensions.get("window")

const HomeScreen = () => {
  const router = useRouter() // <--- Use Router
  const { theme, isDarkMode } = useTheme()
  const [currentSlide, setCurrentSlide] = useState(0)
  const flatListRef = useRef(null)

  // FIX: Using splash-logo.png temporarily to prevent crashes
  const sliderImages = [
    {
      id: 1,
      title: "Master UTME 2026",
      subtitle: "Your path to success starts here",
      image: require("../../assets/splash-logo.png"), 
    },
    {
      id: 2,
      title: "Study Smart",
      subtitle: "Access comprehensive study materials",
      image: require("../../assets/splash-logo.png"),
    },
    {
      id: 3,
      title: "Practice Tests",
      subtitle: "Take unlimited practice exams",
      image: require("../../assets/splash-logo.png"),
    },
  ]

  const quickActions = [
    { id: 1, title: "UTME Practice", icon: "document-text-outline", color: "#FFC107" },
    { id: 3, title: "Educational Games", icon: "game-controller-outline", color: "#FF9800" },
    { id: 4, title: "Flashcards", icon: "albums-outline", color: "#9C27B0" },
    { id: 5, title: "Calculator", icon: "calculator-outline", color: "#F44336" },
    { id: 6, title: "Activate App", icon: "key-outline", color: "#607D8B" },
  ]

  // Safe check for database (prevents crash if context is missing)
  const database = useDatabase();
  const activities = database ? database.activities : [];
  const recentActivities = [...activities].sort((a, b) => new Date(b.date) - new Date(a.date))

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => {
        const nextSlide = (prevSlide + 1) % sliderImages.length
        flatListRef.current?.scrollToIndex({ index: nextSlide, animated: true })
        return nextSlide
      })
    }, 4000)

    return () => clearInterval(timer)
  }, [sliderImages.length])

  const handleSlideChange = (event) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width)
    setCurrentSlide(slideIndex)
  }

  // FIX: Using router.push with correct paths
  const handleQuickAction = (action) => {
    if (action.title === "Calculator") {
      router.push("/screens/CalculatorScreen")
    } else if (action.title === "UTME Practice") {
      router.push("/screens/ExamCategoryScreen")
    } else if (action.title === "Educational Games") {
      router.push("/screens/GamesScreen")
    } else if (action.title === "Flashcards") {
      router.push("/screens/FlashCardScreen")
    } else if (action.title === "Activate App") {
      router.push("/screens/ActivationScreen")
    } else {
      Alert.alert(action.title, `${action.title} feature will be available soon!`)
    }
  }

  const renderSliderItem = ({ item }) => (
    <View style={styles.slideItem}>
      <Image source={item.image} style={styles.slideImage} resizeMode="contain" />
    </View>
  )

  const renderQuickAction = (action) => (
    <TouchableOpacity
      key={action.id}
      style={[styles.quickActionItem, { backgroundColor: theme.card, shadowColor: theme.text }]}
      onPress={() => handleQuickAction(action)}
      activeOpacity={0.7}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: action.color + "15" }]}>
        <Ionicons name={action.icon} size={24} color={action.color} />
      </View>
      <Text style={[styles.quickActionText, { color: theme.text }]}>{action.title}</Text>
    </TouchableOpacity>
  )

  const renderRecentActivity = (activity) => (
    <TouchableOpacity
      key={activity.id}
      style={[styles.activityItem, { borderBottomColor: theme.border }]}
      activeOpacity={0.7}
    >
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
  )

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <View style={styles.headerLeft}>
          <Image source={require("../../assets/splash-logo.png")} style={styles.headerLogo} resizeMode="contain" />
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
          <View style={styles.indicatorContainer}>
            {sliderImages.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  { backgroundColor: currentSlide === index ? "#333" : "rgba(0,0,0,0.2)" },
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>{quickActions.map(renderQuickAction)}</View>
        </View>

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

        <View style={styles.section}>
          <View style={[styles.reminderCard, { backgroundColor: theme.card, shadowColor: theme.text }]}>
            <View style={[styles.reminderIcon, { backgroundColor: isDarkMode ? "#333" : "#f0f8ff" }]}>
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
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingVertical: 16,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 16,
    borderBottomWidth: 1,
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  headerLogo: { width: 40, height: 40, marginRight: 12 },
  headerTitle: { fontSize: 20, fontWeight: "bold" },
  headerSubtitle: { fontSize: 14 },
  notificationButton: { position: "relative", padding: 8 },
  notificationBadge: { position: "absolute", top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: "#FF3B30" },
  scrollView: { flex: 1 },
  sliderContainer: { height: 250, position: "relative", marginBottom: 10 },
  slideItem: { width: width, height: 250, justifyContent: 'center', alignItems: 'center' },
  slideImage: { width: "80%", height: "80%" },
  indicatorContainer: { position: "absolute", bottom: 10, left: 0, right: 0, flexDirection: "row", justifyContent: "center" },
  indicator: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 4 },
  section: { paddingHorizontal: 20, paddingVertical: 16 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
  seeAllText: { fontSize: 14, color: "#FFC107", fontWeight: "600" },
  quickActionsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", paddingHorizontal: 10 },
  quickActionItem: { width: (width - 70) / 2, borderRadius: 16, padding: 16, alignItems: "center", marginBottom: 16, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  quickActionIcon: { width: 50, height: 50, borderRadius: 25, justifyContent: "center", alignItems: "center", marginBottom: 12 },
  quickActionText: { fontSize: 14, textAlign: "center", fontWeight: "600" },
  statsContainer: { flexDirection: "row", justifyContent: "space-between" },
  statCard: { flex: 1, borderRadius: 12, padding: 20, alignItems: "center", marginHorizontal: 4, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  statNumber: { fontSize: 24, fontWeight: "bold", color: "#FFC107", marginBottom: 4 },
  statLabel: { fontSize: 12, textAlign: "center" },
  activitiesContainer: { borderRadius: 12, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  activityItem: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1 },
  activityIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center", marginRight: 12 },
  activityContent: { flex: 1 },
  activityTitle: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  activitySubtitle: { fontSize: 14 },
  activityScore: { alignItems: "flex-end" },
  scoreText: { fontSize: 16, fontWeight: "bold" },
  reminderCard: { borderRadius: 12, padding: 16, flexDirection: "row", alignItems: "center", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  reminderIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: "center", alignItems: "center", marginRight: 16 },
  reminderContent: { flex: 1 },
  reminderTitle: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  reminderText: { fontSize: 14, lineHeight: 20 },
})

export default HomeScreen
