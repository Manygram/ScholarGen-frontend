import { useEffect } from "react"
import { View, Text, StyleSheet, StatusBar, Image } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useRouter } from "expo-router" // <--- IMPORT THIS

const SplashScreen = () => {
  const router = useRouter() // <--- USE THIS HOOK

  useEffect(() => {
    const checkLogin = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000))
        const token = await AsyncStorage.getItem("userToken")
        
        if (token) {
          // Use router.replace with the path (folder/file name)
          router.replace("/(tabs)") // Assuming your main tabs are in a group named (tabs)
        } else {
          // If your Welcome screen is at app/screens/WelcomeScreen.jsx
          // You might need to move it or adjust this path. 
          // For now, try pointing to the route name:
          router.replace("/screens/WelcomeScreen") 
        }
      } catch (e) {
        console.error("Session check failed", e)
        router.replace("/screens/WelcomeScreen")
      }
    }
    checkLogin()
  }, [])

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
