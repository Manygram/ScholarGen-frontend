"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, StatusBar } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useTheme } from "../context/ThemeContext"
import { authService } from "../services/authService"
import CustomInput from "../components/CustomInput"

const LoginScreen = () => {
  const navigation = useNavigation()
  const { theme } = useTheme()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    setIsLoading(true)
    try {
      console.log("Attempting login...")
      const response = await authService.login(formData.email, formData.password)
      const { data } = response

      if (data) {
        const token = data.accessToken || data.token || data.user?.token || data.data?.token

        if (!token) {
          console.error("[LoginScreen] Missing token in response:", data)
          Alert.alert("Login Error", "Authenticated but no secure token received.")
          return
        }

        const sessionData = { ...(data.user || data), token, refreshToken: data.refreshToken }
        await authService.saveSession(sessionData)

        Alert.alert("Success", "Login successful!")
        navigation.navigate("MainTabs")
      }
    } catch (error) {
      console.log("Login error caught:", error)
      let errorMessage = "Login failed. Please check your network."

      if (error.message) {
        errorMessage = error.message
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }

      Alert.alert("Login Failed", errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Hello there,</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Good to see you again</Text>
        </View>

        <View style={styles.form}>
          <CustomInput
            icon="mail-outline"
            placeholder="johndoe@gmail.com"
            value={formData.email}
            onChangeText={(value) => handleInputChange("email", value)}
            keyboardType="email-address"
          />

          <CustomInput
            icon="lock-closed-outline"
            placeholder="••••••••"
            value={formData.password}
            onChangeText={(value) => handleInputChange("password", value)}
            isPassword={true}
          />

          <TouchableOpacity style={styles.forgotPassword} onPress={() => navigation.navigate("ForgotPassword")}>
            <Text style={[styles.forgotPasswordText, { color: theme.primary }]}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.signInButton, { backgroundColor: theme.primary }]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.signInButtonText}>{isLoading ? "Signing In..." : "Sign In"}</Text>
          </TouchableOpacity>

          <View style={styles.signUpContainer}>
            <Text style={[styles.signUpText, { color: theme.textSecondary }]}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
              <Text style={[styles.signUpLink, { color: theme.primary }]}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginTop: 60,
    marginBottom: 40,
    paddingHorizontal: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  form: {
    flex: 1,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: "500",
  },
  signInButton: {
    borderRadius: 8,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  signInButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signUpText: {
    fontSize: 16,
  },
  signUpLink: {
    fontSize: 16,
    fontWeight: "bold",
  },
})

export default LoginScreen
