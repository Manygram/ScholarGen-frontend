"use client"

import { ThemeProvider } from "../context/ThemeContext"
import { DatabaseProvider } from "../context/DatabaseContext"
import SplashScreen from "../screens/SplashScreen"

export default function Page() {
  // Mock navigation object for preview purposes
  const mockNavigation = {
    navigate: (route: string) => console.log(`Navigate to: ${route}`),
    replace: (route: string) => console.log(`Replace with: ${route}`),
  }

  return (
    <ThemeProvider>
      <DatabaseProvider>
        <SplashScreen navigation={mockNavigation} />
      </DatabaseProvider>
    </ThemeProvider>
  )
}
