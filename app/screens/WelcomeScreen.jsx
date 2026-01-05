import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native"
import { MaterialIcons as Icon } from "@expo/vector-icons"
import { useRouter } from "expo-router" // <--- NEW IMPORT
import { useTheme } from "../context/ThemeContext"
import { authService } from "../services/authService"
import LoadingOverlay from "../components/LoadingOverlay"

const API_BASE = "https://api.scholargens.com"

export default function WelcomeScreen() {
  const router = useRouter() // <--- USE THIS HOOK
  const { theme } = useTheme()
  
  const [activeTab, setActiveTab] = useState("signin")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    referralCode: "",
  })
  const [errors, setErrors] = useState({})

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    if (activeTab === "signup") {
      if (!formData.fullName) {
        newErrors.fullName = "Full name is required"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSignUp = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const { status, data } = await authService.register(
        formData.fullName,
        formData.email,
        formData.password,
        formData.referralCode,
      )

      if (status === 200 || status === 201) {
        Alert.alert("Success", "Account created! Please verify your email.")
        // FIX: Route to VerificationScreen inside 'screens' folder
        router.push({
          pathname: "/screens/VerificationScreen",
          params: { email: formData.email },
        })
      } else {
        Alert.alert("Registration Failed", data.message || "Could not create account.")
      }
    } catch (error) {
      console.error("Registration error:", error)
      let errorMessage = "Registration failed."
      if (error.data && error.data.message) {
        errorMessage = error.data.message
      } else if (error.message) {
        errorMessage = error.message
      }
      Alert.alert("Error", errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignIn = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const response = await authService.login(formData.email, formData.password)
      const { status, data } = response

      if (status === 200 || status === 201) {
        const token = data.accessToken || data.token || data.user?.token || data.data?.token || data.access_token

        if (!token) {
          throw new Error("Authenticated but no secure token received.")
        }

        const sessionData = { ...(data.user || data), token }
        await authService.saveSession(sessionData)

        Alert.alert("Success", "Login successful!")
        
        // FIX: Route to HomeScreen inside 'screens' folder
        // Even though they are neighbors, you must use the full path from 'app'
        router.replace("/screens/HomeScreen") 
      }
    } catch (error) {
      console.error("Login error:", error)
      let errorMessage = "Login failed."

      if (error.status === 401) {
        errorMessage = "Invalid email or password."
      } else if (error.message) {
        errorMessage = error.message
      }

      if (errorMessage && errorMessage.toLowerCase().includes("verified")) {
        Alert.alert("Verification Required", "Your account is not verified. Please check your email for the OTP.", [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Verify Now", 
            onPress: () => router.push({
              pathname: "/screens/VerificationScreen",
              params: { email: formData.email },
            }) 
          },
        ])
        return
      }

      Alert.alert("Login Failed", errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = () => {
    if (validateForm()) {
      if (activeTab === "signin") {
        handleSignIn()
      } else {
        handleSignUp()
      }
    }
  }

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.tabContainer, { backgroundColor: theme.border }]}>
              <TouchableOpacity
                style={[styles.tab, activeTab === "signin" && [styles.activeTab, { backgroundColor: theme.card }]]}
                onPress={() => setActiveTab("signin")}
              >
                <Text style={[styles.tabText, { color: activeTab === "signin" ? theme.text : theme.textSecondary }]}>
                  Sign In
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === "signup" && [styles.activeTab, { backgroundColor: theme.card }]]}
                onPress={() => setActiveTab("signup")}
              >
                <Text style={[styles.tabText, { color: activeTab === "signup" ? theme.text : theme.textSecondary }]}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Welcome Text */}
          <View style={styles.welcomeContainer}>
            <Text style={[styles.welcomeText, { color: theme.text }]}>
              {activeTab === "signin" ? "Welcome back." : "Welcome there,"}
            </Text>
            <Text style={[styles.subtitleText, { color: theme.textSecondary }]}>
              {activeTab === "signin" ? "Please enter your account here" : "Please enter your account here"}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {activeTab === "signup" && (
              <>
                <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <Icon name="person" size={20} color={theme.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: theme.text }, errors.fullName && styles.inputError]}
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChangeText={(text) => updateFormData("fullName", text)}
                    placeholderTextColor={theme.textSecondary}
                  />
                </View>
                {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
              </>
            )}

            <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Icon name="email" size={20} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text }, errors.email && styles.inputError]}
                placeholder="johndoe@gmail.com"
                value={formData.email}
                onChangeText={(text) => updateFormData("email", text)}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={theme.textSecondary}
              />
            </View>
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

            <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Icon name="lock" size={20} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text }, errors.password && styles.inputError]}
                placeholder="••••••••"
                value={formData.password}
                onChangeText={(text) => updateFormData("password", text)}
                secureTextEntry={!showPassword}
                placeholderTextColor={theme.textSecondary}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Icon name={showPassword ? "visibility" : "visibility-off"} size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

            {activeTab === "signup" && (
              <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Icon name="local-offer" size={20} color={theme.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Referral Code (Optional)"
                  value={formData.referralCode}
                  onChangeText={(text) => updateFormData("referralCode", text)}
                  autoCapitalize="characters"
                  placeholderTextColor={theme.textSecondary}
                />
              </View>
            )}

            {activeTab === "signin" && (
              // FIX: Route to ForgotPasswordScreen inside 'screens' folder
              <TouchableOpacity style={styles.forgotPassword} onPress={() => router.push("/screens/ForgotPasswordScreen")}>
                <Text style={[styles.forgotPasswordText, { color: theme.primary }]}>Forgot Password?</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={[styles.submitButton, { backgroundColor: theme.primary }]} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>
                {activeTab === "signin" ? "Sign In" : isLoading ? "Creating Account..." : "Sign Up"}
              </Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
              <Text style={[styles.dividerText, { color: theme.textSecondary }]}>Or continue with</Text>
              <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
            </View>

            <TouchableOpacity style={[styles.googleButton, { borderColor: theme.border }]}>
              <Text style={[styles.googleButtonText, { color: theme.text }]}>G Google</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Logo */}
          <View style={styles.bottomContainer}>
            <Text style={[styles.brandText, { color: theme.primary }]}>ScholarGen</Text>
          </View>
        </View>
      </ScrollView>
      <LoadingOverlay visible={isLoading} />
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  header: {
    paddingTop: 30,
    paddingBottom: 40,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#9E9E9E",
  },
  welcomeContainer: {
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: "#666666",
    lineHeight: 24,
  },
  formContainer: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    backgroundColor: "#FFFFFF",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#000000",
  },
  inputError: {
    borderColor: "#FF5252",
  },
  errorText: {
    color: "#FF5252",
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
  },
  eyeIcon: {
    padding: 4,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
    marginTop: 8,
  },
  forgotPasswordText: {
    color: "#FFC107",
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: "#FFC107",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 24,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  dividerText: {
    marginHorizontal: 16,
    color: "#9E9E9E",
    fontSize: 14,
  },
  googleButton: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 40,
  },
  googleButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "500",
  },
  bottomContainer: {
    alignItems: "center",
    paddingBottom: 20,
  },
  brandText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF9800",
  },
})
