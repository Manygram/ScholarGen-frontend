"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Alert, ScrollView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"

const ExamConfigScreen = ({ navigation, route }) => {
    const { theme, isDarkMode } = useTheme()

    const { selectedSubjects = [], subjectYears = {} } = route.params || {}

    const [selectedMode, setSelectedMode] = useState("practice")
    const [duration, setDuration] = useState(60)

    const handleStartQuiz = () => {
        if (selectedSubjects.length === 0) {
            Alert.alert("Error", "No subjects selected.")
            return
        }

        if (selectedMode === "exam" && (isNaN(duration) || duration < 10)) {
            Alert.alert("Invalid Duration", "Minimum exam time is 10 minutes.")
            return
        }

        const formattedSubjects = selectedSubjects.map((sub) => {
            const strId = (sub._id || "").toString()
            const yearVal = subjectYears[strId] || "2023"

            console.log(`[Config] Mapping Subject: ${sub.name}, ID: ${strId}, Year: ${yearVal}`)

            return {
                subjectId: strId,
                year: Number.parseInt(yearVal),
                numberOfQuestions: 2,
            }
        })

        const finalPayload = {
            mode: selectedMode,
            subjects: formattedSubjects,
            durationInMinutes: selectedMode === "exam" ? duration : 30,
        }

        console.log("PAYLOAD TO QUIZ:", JSON.stringify(finalPayload, null, 2))

        navigation.navigate("Quiz", {
            subjects: formattedSubjects,
            originalSubjects: selectedSubjects,
            mode: selectedMode,
            duration: selectedMode === "exam" ? duration : 30,
        })
    }

    const formatDuration = (mins) => {
        const hrs = Math.floor(mins / 60)
        const m = mins % 60
        return `${hrs > 0 ? `${hrs}h ` : ""}${m}m`
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

            <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Configuration</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content}>
                <View style={[styles.section, { backgroundColor: theme.card }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Selected Subjects</Text>
                    <View style={styles.subjectList}>
                        {selectedSubjects.map((sub, index) => {
                            const displayName = sub.name || `ID: ${sub._id}`
                            const year = subjectYears[sub._id] || "2023"

                            return (
                                <View key={sub._id || index} style={styles.subjectTag}>
                                    <Text style={styles.subjectText}>
                                        {displayName} ({year})
                                    </Text>
                                </View>
                            )
                        })}
                    </View>
                </View>

                <View style={[styles.section, { backgroundColor: theme.card }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Select Mode</Text>
                    {[
                        {
                            id: "exam",
                            title: "Exam Mode",
                            icon: "timer-outline",
                            desc: "Timed session. Scores are calculated over 100 for each subject. No instant corrections.",
                        },
                        {
                            id: "practice",
                            title: "Practice Mode",
                            icon: "book-outline",
                            desc: "Untimed. Correct answers and explanations are hidden until you finish or submit.",
                        },
                        {
                            id: "study",
                            title: "Study Mode",
                            icon: "library-outline",
                            desc: "Flexible learning. Toggle 'Show Answer' to see instant corrections and explanations.",
                        },
                    ].map((m) => (
                        <TouchableOpacity
                            key={m.id}
                            style={[styles.modeCard, { borderColor: selectedMode === m.id ? theme.primary : theme.border }]}
                            onPress={() => setSelectedMode(m.id)}
                        >
                            <Ionicons name={m.icon} size={24} color={theme.text} />
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: theme.text, fontWeight: "bold" }}>{m.title}</Text>
                                <Text style={{ color: theme.textSecondary, fontSize: 12 }}>{m.desc}</Text>
                            </View>
                            {selectedMode === m.id && <Ionicons name="checkmark-circle" size={24} color={theme.primary} />}
                        </TouchableOpacity>
                    ))}
                </View>

                {selectedMode === "exam" && (
                    <View style={[styles.section, { backgroundColor: theme.card }]}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
                            <Text style={{ color: theme.text, fontWeight: "bold" }}>Exam Duration</Text>
                            <Text style={{ color: theme.primary, fontWeight: "bold" }}>{formatDuration(duration)}</Text>
                        </View>

                        <View style={styles.sliderReplacementContainer}>
                            <View style={[styles.track, { backgroundColor: theme.border }]}>
                                <View
                                    style={[
                                        styles.activeTrack,
                                        {
                                            backgroundColor: theme.primary,
                                            width: `${((duration - 10) / (120 - 10)) * 100}%`,
                                        },
                                    ]}
                                />
                            </View>
                            <View style={styles.stepsContainer}>
                                {[10, 30, 60, 90, 120].map((step) => (
                                    <TouchableOpacity
                                        key={step}
                                        onPress={() => setDuration(step)}
                                        style={[
                                            styles.stepPoint,
                                            {
                                                backgroundColor: duration === step ? theme.primary : theme.card,
                                                borderColor: theme.primary,
                                            },
                                        ]}
                                    />
                                ))}
                            </View>
                        </View>

                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
                            <Text style={{ color: theme.textSecondary, fontSize: 12 }}>10m</Text>
                            <Text style={{ color: theme.textSecondary, fontSize: 12 }}>2h</Text>
                        </View>
                    </View>
                )}
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={[styles.startButton, { backgroundColor: theme.primary }]} onPress={handleStartQuiz}>
                    <Text style={styles.startButtonText}>Start Quiz</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 20,
        paddingTop: 40,
        borderBottomWidth: 1,
        alignItems: "center",
    },
    headerTitle: { fontSize: 18, fontWeight: "700" },
    content: { flex: 1, padding: 20 },
    section: { borderRadius: 12, padding: 20, marginBottom: 20, elevation: 2 },
    sectionTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 12 },
    subjectList: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    subjectTag: { backgroundColor: "rgba(255,193,7,0.1)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
    subjectText: { color: "#FFC107", fontSize: 14, fontWeight: "500" },
    modeCard: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        gap: 16,
        marginBottom: 10,
    },
    sliderReplacementContainer: {
        height: 40,
        justifyContent: "center",
        marginVertical: 10,
    },
    track: {
        height: 4,
        borderRadius: 2,
        width: "100%",
        position: "relative",
    },
    activeTrack: {
        height: "100%",
        borderRadius: 2,
        position: "absolute",
    },
    stepsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        position: "absolute",
        width: "100%",
        paddingHorizontal: -5,
    },
    stepPoint: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        marginTop: -8,
    },
    input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16 },
    footer: { padding: 20 },
    startButton: { paddingVertical: 16, borderRadius: 12, alignItems: "center" },
    startButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
})

export default ExamConfigScreen
