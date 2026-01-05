import { Stack } from "expo-router";
import { ThemeProvider } from "./context/ThemeContext";
import { DatabaseProvider } from "./context/DatabaseContext";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <DatabaseProvider>
        {/* Remove all <Stack.Screen> tags from here. 
            A plain <Stack /> forces Expo to auto-discover the 'screens' folder. */}
        <Stack screenOptions={{ headerShown: false }} />
      </DatabaseProvider>
    </ThemeProvider>
  );
}
