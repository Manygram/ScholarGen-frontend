import { ThemeProvider } from "./context/ThemeContext";
import { DatabaseProvider } from "./context/DatabaseContext";
// Check: Is your 'screens' folder inside 'app'?
// If YES (app/screens), use "./screens/SplashScreen"
// If NO (it's outside app), use "../screens/SplashScreen"
import SplashScreen from "./screens/SplashScreen"; 
import { useRouter } from "expo-router";

export default function Page() {
  const router = useRouter();

  // REAL Navigation wrapper so the app actually moves!
  const realNavigation = {
    replace: (route) => {
      // Convert "MainTabs" to the actual Expo Router path (usually '/(tabs)')
      if (route === "MainTabs") {
        router.replace("/(tabs)"); 
      } else if (route === "Welcome") {
        router.replace("/welcome");
      } else {
        console.log("Unknown route:", route);
      }
    },
    navigate: (route) => {
        router.push(route === "MainTabs" ? "/(tabs)" : route.toLowerCase());
    }
  };

  return (
    <ThemeProvider>
      <DatabaseProvider>
        <SplashScreen navigation={realNavigation} />
      </DatabaseProvider>
    </ThemeProvider>
  );
}
