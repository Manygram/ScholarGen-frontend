import { useEffect } from "react";
import { View, StyleSheet, Image, Text } from "react-native";
import { useRouter } from "expo-router"; 

const SplashContent = () => {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      // Assuming your file is in app/screens/WelcomeScreen.jsx
      router.replace("/screens/WelcomeScreen"); 
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
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
        <Text style={styles.subText}>Learn, Excel and Achieve</Text>
      </View>
    </View>
  );
};

export default function IndexScreen() {
  // Providers are now in _layout.jsx, so we don't need them here!
  return <SplashContent />;
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
    marginBottom: 40, 
  },
  logo: {
    width: 250,
    height: 120,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 50, 
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
