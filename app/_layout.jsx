import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider } from "./context/ThemeContext";
import { DatabaseProvider } from "./context/DatabaseContext";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <DatabaseProvider>
        <StatusBar style="dark" backgroundColor="#FFFFFF" />
        {/* The Stack navigator handles all your screens automatically */}
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
        </Stack>
      </DatabaseProvider>
    </ThemeProvider>
  );
}
