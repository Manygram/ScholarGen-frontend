import { useEffect } from "react";
import { View, StyleSheet, StatusBar, Image } from "react-native";
import { useRouter } from "expo-router"; // correct navigation for Expo
import { ThemeProvider } from "./context/ThemeContext"; 
import { DatabaseProvider } from "./context/DatabaseContext";

// 1. Create the Splash Screen Component
const SplashContent = () => {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      // detailed check: make sure you have a file named 'app/welcome.jsx'
      router.replace("/welcome"); 
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E88E5" />
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          {/* Ensure this filename matches EXACTLY with your GitHub assets folder */}
          <Image
            source={require("../assets/scholarx-logo-removebg-preview.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </View>
    </View>
  );
};

// 2. Export the Main Entry (Wrapped in Providers)
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
    backgroundColor: "#1E88E5",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
  },
  logo: {
    width: 250,
    height: 120,
  },
});
