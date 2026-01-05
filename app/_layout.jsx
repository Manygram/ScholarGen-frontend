import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider } from "./context/ThemeContext";
import { DatabaseProvider } from "./context/DatabaseContext";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <DatabaseProvider>
        <StatusBar style="dark" backgroundColor="#FFFFFF" />
        {/* FIX: Self-closing Stack tag. 
           This tells Expo: "Find every screen in my app automatically." 
        */}
        <Stack screenOptions={{ headerShown: false }} />
      </DatabaseProvider>
    </ThemeProvider>
  );
}
