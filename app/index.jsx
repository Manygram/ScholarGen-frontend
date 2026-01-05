import { useEffect } from "react";
import { View, StyleSheet, StatusBar, Image, Text } from "react-native";
import { useRouter } from "expo-router"; 
import { ThemeProvider } from "./context/ThemeContext"; 
import { DatabaseProvider } from "./context/DatabaseContext";

const SplashContent = () => {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      // FIX: Ensure this matches your filename exactly (WelcomeScreen.jsx)
      // If your file is in a folder named 'screens', change this to "/screens/WelcomeScreen"
      router.replace("/WelcomeScreen"); 
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Center Content (Logo) */}
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/splash-logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Bottom Text */}
      <View style={styles.bottomContainer}>
        <Text style={styles.titleText}>ScholarGen UTME 2026</Text>
        <Text style={styles.subText}>Study anytime, anywhere.</Text>
      </View>
    </View>
  );
};

export default function IndexScreen() {
  return (
    <ThemeProvider>
      <DatabaseProvider>
        <SplashContent />
      </DatabaseProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40, // Push logo up slightly to make room
  },
  logo: {
    width: 250,
    height: 120,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 50, // Position from bottom
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20,
  },
  titleText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 8,
    textAlign: "center",
  },
  subText: {
    fontSize: 16,
    color: "#666666",
    fontWeight: "400",
    textAlign: "center",
  },
});
