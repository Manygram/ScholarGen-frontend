import { useEffect } from "react";
import { View, StyleSheet, StatusBar, Image, Text } from "react-native";
import { useRouter } from "expo-router"; 
import { ThemeProvider } from "./context/ThemeContext"; 
import { DatabaseProvider } from "./context/DatabaseContext";

const SplashContent = () => {
  const router = useRouter();

  useEffect(() => {
    // 3-second timer before moving to the next screen
    const timer = setTimeout(() => {
      
      // FIX: The path must include "/screens/" because your file is in that folder
      router.replace("/screens/WelcomeScreen"); 
      
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* Dark text for the status bar because the background is white */}
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
    backgroundColor: "#FFFFFF", // White background
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
    color: "#666666", // Grey text
    fontWeight: "400",
    textAlign: "center",
  },
});
