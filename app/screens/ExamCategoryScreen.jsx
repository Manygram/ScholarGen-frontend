"use client"
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Platform } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"
// Filter for UTME only as per requirement
import { EXAM_CATEGORIES } from "../data/subjects"
// Reverting to JAMB/UTME focus
const CATEGORIES = EXAM_CATEGORIES.filter((c) => c.id.includes("UTME"))

const ExamCategoryScreen = ({ navigation }) => {
    const { theme, isDarkMode } = useTheme()

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.background} />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
                <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Select Exam Type</Text>
                <View style={styles.headerIcon} />
            </View>

            <View style={styles.content}>
                {CATEGORIES.map((category) => (
                    <TouchableOpacity
                        key={category.id}
                        style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
                        onPress={() =>
                            navigation.navigate("SubjectSelection", { categoryId: category.id, categoryTitle: category.title })
                        }
                    >
                        <View style={styles.iconContainer}>
                            <Ionicons name="school-outline" size={32} color={theme.primary} />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={[styles.cardTitle, { color: theme.text }]}>{category.title}</Text>
                            <Text style={[styles.cardDescription, { color: theme.textSecondary }]}>{category.description}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color={theme.textSecondary} />
                    </TouchableOpacity>
                ))}
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 20 : 20,
        borderBottomWidth: 1,
    },
    headerIcon: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
    headerTitle: { fontSize: 20, fontWeight: "700" },
    content: { padding: 20 },
    card: {
        flexDirection: "row",
        alignItems: "center",
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "rgba(255, 193, 7, 0.1)",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16,
    },
    textContainer: { flex: 1 },
    cardTitle: { fontSize: 18, fontWeight: "600", marginBottom: 4 },
    cardDescription: { fontSize: 14 },
})

export default ExamCategoryScreen
