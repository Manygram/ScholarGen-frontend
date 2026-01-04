import { useEffect } from "react"
import { View, Text, StyleSheet, Dimensions, StatusBar, Image } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"

const { width, height } = Dimensions.get("window")

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    const checkLogin = async () => {
      try {
        // Minimum delay for branding
        await new Promise((resolve) => setTimeout(resolve, 2000))

        // Check for session
        const token = await AsyncStorage.getItem("userToken")
        if (token) {
          navigation.replace("MainTabs")
        } else {
          // FIX: Navigating to Welcome instead of Login
          navigation.replace("Welcome") 
        }
      } catch (e) {
        console.error("Session check failed", e)
        navigation.replace("Welcome")
      }
    }

    checkLogin()
  }, [navigation])

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/splash-logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </View>
      <View style={styles.bottomContainer}>
        <Text style={styles.brandText}>ScholarGen UTME</Text>
        <Text style={styles.taglineText}>Learn, Excel and Achieve</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF", 
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 180,
    height: 180,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 80,
    alignItems: "center",
    width: "100%",
  },
  brandText: {
    fontSize: 28,
    color: "#000000",
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: 16, 
  },
  taglineText: {
    fontSize: 16,
    color: "#666666",
    fontWeight: "400",
    letterSpacing: 1,
  },
})

export default SplashScreen
